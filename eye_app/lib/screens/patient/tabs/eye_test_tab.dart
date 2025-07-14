import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:eye_app/providers/eye_test_provider.dart';
import 'package:google_fonts/google_fonts.dart';

import 'eye_tests/color_blindness_test_screen.dart';
import 'eye_tests/visual_acuity_test_screen.dart';
import 'eye_tests/contrast_sensitivity_test_screen.dart';

class EyeTestTab extends StatefulWidget {
  const EyeTestTab({Key? key}) : super(key: key);

  @override
  State<EyeTestTab> createState() => _EyeTestTabState();
}

class _EyeTestTabState extends State<EyeTestTab> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      Provider.of<EyeTestProvider>(context, listen: false).fetchEyeTests();
    });
  }

  void _startTest(BuildContext context, String type) {
    Widget screen;
    switch (type) {
      case 'color_blindness':
        screen = const ColorBlindnessTestScreen();
        break;
      case 'visual_acuity':
        screen = const VisualAcuityTestScreen();
        break;
      case 'contrast_sensitivity':
        screen = const ContrastSensitivityTestScreen();
        break;
      default:
        return;
    }
    Navigator.push(
      context,
      MaterialPageRoute(builder: (context) => screen),
    );
  }

  @override
  Widget build(BuildContext context) {
    final provider = Provider.of<EyeTestProvider>(context);
    final theme = Theme.of(context);

    return Scaffold(
      backgroundColor: theme.colorScheme.background,
      appBar: AppBar(
        automaticallyImplyLeading: false,
        title: Text('Eye Tests', style: GoogleFonts.poppins()),
      ),
      body: Column(
        children: [
          Padding(
            padding: const EdgeInsets.all(16.0),
            child: Column(
              children: [
                _TestCard(
                  icon: Icons.palette,
                  label: 'Color Blindness Test',
                  onTap: () => _startTest(context, 'color_blindness'),
                ),
                const SizedBox(height: 12),
                _TestCard(
                  icon: Icons.visibility,
                  label: 'Visual Acuity Test',
                  onTap: () => _startTest(context, 'visual_acuity'),
                ),
                const SizedBox(height: 12),
                _TestCard(
                  icon: Icons.tonality,
                  label: 'Contrast Sensitivity Test',
                  onTap: () => _startTest(context, 'contrast_sensitivity'),
                ),
              ],
            ),
          ),
          const Divider(),
          Expanded(
            child: RefreshIndicator(
              onRefresh: provider.fetchEyeTests,
              child: provider.isLoading
                  ? const Center(child: CircularProgressIndicator())
                  : provider.error != null
                      ? Center(
                          child: Text(
                            provider.error!,
                            style: GoogleFonts.poppins(color: Colors.red),
                          ),
                        )
                      : provider.eyeTests.isEmpty
                          ? Center(
                              child: Text(
                                'No eye test records found.',
                                style: GoogleFonts.poppins(),
                              ),
                            )
                          : ListView.builder(
                              padding: const EdgeInsets.all(16),
                              itemCount: provider.eyeTests.length,
                              itemBuilder: (context, index) {
                                final test = provider.eyeTests[index];
                                return Card(
                                  margin: const EdgeInsets.only(bottom: 12),
                                  child: ListTile(
                                    leading:
                                        Icon(_getTestIcon(test['test_type'])),
                                    title: Text(
                                      _formatTestType(test['test_type']),
                                      style: GoogleFonts.poppins(
                                          fontWeight: FontWeight.w600),
                                    ),
                                    subtitle: Text(
                                      'Result: ${test['result'] ?? 'N/A'}\nDate: ${_formatDate(test['createdAt'])}',
                                      style: GoogleFonts.poppins(),
                                    ),
                                  ),
                                );
                              },
                            ),
            ),
          ),
        ],
      ),
    );
  }

  String _formatDate(String dateStr) {
    final date = DateTime.parse(dateStr);
    return '${date.year}-${date.month.toString().padLeft(2, '0')}-${date.day.toString().padLeft(2, '0')}';
  }

  String _formatTestType(String type) {
    switch (type) {
      case 'color_blindness':
        return 'Color Blindness';
      case 'visual_acuity':
        return 'Visual Acuity';
      case 'contrast_sensitivity':
        return 'Contrast Sensitivity';
      default:
        return type;
    }
  }

  IconData _getTestIcon(String type) {
    switch (type) {
      case 'color_blindness':
        return Icons.palette;
      case 'visual_acuity':
        return Icons.visibility;
      case 'contrast_sensitivity':
        return Icons.tonality;
      default:
        return Icons.remove_red_eye;
    }
  }
}

class _TestCard extends StatelessWidget {
  final IconData icon;
  final String label;
  final VoidCallback onTap;
  const _TestCard(
      {required this.icon, required this.label, required this.onTap});
  @override
  Widget build(BuildContext context) {
    return Card(
      elevation: 2,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      child: ListTile(
        leading: Icon(icon, size: 32),
        title: Text(label,
            style: GoogleFonts.poppins(fontWeight: FontWeight.w600)),
        trailing: const Icon(Icons.arrow_forward_ios),
        onTap: onTap,
      ),
    );
  }
}
