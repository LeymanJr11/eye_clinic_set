import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:eye_app/providers/eye_test_provider.dart';
import 'package:google_fonts/google_fonts.dart';

class ContrastSensitivityTestScreen extends StatefulWidget {
  const ContrastSensitivityTestScreen({Key? key}) : super(key: key);

  @override
  State<ContrastSensitivityTestScreen> createState() =>
      _ContrastSensitivityTestScreenState();
}

class _ContrastSensitivityTestScreenState
    extends State<ContrastSensitivityTestScreen> {
  final List<_ContrastItem> _items = [
    _ContrastItem(text: 'A', color: Colors.black, bg: Colors.white),
    _ContrastItem(text: 'B', color: Colors.grey[800]!, bg: Colors.grey[200]!),
    _ContrastItem(text: 'C', color: Colors.grey[600]!, bg: Colors.grey[300]!),
    _ContrastItem(text: 'D', color: Colors.grey[400]!, bg: Colors.grey[350]!),
  ];
  int _currentStep = 0;
  final List<String?> _responses = List.filled(4, null);
  bool _submitting = false;

  void _submitTest(BuildContext context) async {
    setState(() => _submitting = true);
    final correct = List.generate(_items.length,
            (i) => _responses[i]?.toUpperCase() == _items[i].text)
        .where((v) => v)
        .length;
    final result = 'Correct: $correct/${_items.length}';
    final provider = Provider.of<EyeTestProvider>(context, listen: false);
    await provider.addEyeTest(testType: 'contrast_sensitivity', result: result);
    if (mounted) Navigator.pop(context);
  }

  @override
  Widget build(BuildContext context) {
    final item = _items[_currentStep];
    return Scaffold(
      appBar: AppBar(title: const Text('Contrast Sensitivity Test')),
      body: Padding(
        padding: const EdgeInsets.all(24.0),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Text('Step ${_currentStep + 1} of ${_items.length}',
                style: GoogleFonts.poppins(fontSize: 18)),
            const SizedBox(height: 32),
            Container(
              width: 100,
              height: 100,
              alignment: Alignment.center,
              color: item.bg,
              child: Text(
                item.text,
                style: TextStyle(
                  color: item.color,
                  fontSize: 48,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ),
            const SizedBox(height: 32),
            TextFormField(
              decoration:
                  const InputDecoration(labelText: 'What letter do you see?'),
              onChanged: (val) => _responses[_currentStep] = val,
              textCapitalization: TextCapitalization.characters,
              maxLength: 1,
            ),
            const SizedBox(height: 24),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                if (_currentStep > 0)
                  ElevatedButton(
                    onPressed: () => setState(() => _currentStep--),
                    child: const Text('Back'),
                  ),
                if (_currentStep < _items.length - 1)
                  ElevatedButton(
                    onPressed: () => setState(() => _currentStep++),
                    child: const Text('Next'),
                  ),
                if (_currentStep == _items.length - 1)
                  ElevatedButton(
                    onPressed: _submitting ? null : () => _submitTest(context),
                    child: _submitting
                        ? const SizedBox(
                            width: 20,
                            height: 20,
                            child: CircularProgressIndicator(strokeWidth: 2))
                        : const Text('Submit'),
                  ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}

class _ContrastItem {
  final String text;
  final Color color;
  final Color bg;
  const _ContrastItem(
      {required this.text, required this.color, required this.bg});
}
