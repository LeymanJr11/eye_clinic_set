import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:eye_app/providers/eye_test_provider.dart';
import 'package:google_fonts/google_fonts.dart';

class VisualAcuityTestScreen extends StatefulWidget {
  const VisualAcuityTestScreen({Key? key}) : super(key: key);

  @override
  State<VisualAcuityTestScreen> createState() => _VisualAcuityTestScreenState();
}

class _VisualAcuityTestScreenState extends State<VisualAcuityTestScreen> {
  final List<String> _letters = [
    'E',
    'F',
    'P',
    'T',
    'O',
    'Z',
    'L',
    'P',
    'E',
    'D',
    'P',
    'E',
    'C',
    'F',
    'D'
  ];
  int _currentStep = 0;
  final List<String?> _responses = List.filled(5, null);
  bool _submitting = false;

  void _submitTest(BuildContext context) async {
    setState(() => _submitting = true);
    final correct =
        List.generate(5, (i) => _responses[i]?.toUpperCase() == _letters[i])
            .where((v) => v)
            .length;
    final result = 'Correct: $correct/5';
    final provider = Provider.of<EyeTestProvider>(context, listen: false);
    await provider.addEyeTest(testType: 'visual_acuity', result: result);
    if (mounted) Navigator.pop(context);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Visual Acuity Test')),
      body: Padding(
        padding: const EdgeInsets.all(24.0),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Text('Line ${_currentStep + 1} of 5',
                style: GoogleFonts.poppins(fontSize: 18)),
            const SizedBox(height: 32),
            Text(
              _letters[_currentStep],
              style: TextStyle(
                  fontSize: 64 - _currentStep * 8,
                  fontWeight: FontWeight.bold,
                  letterSpacing: 8),
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
                if (_currentStep < 4)
                  ElevatedButton(
                    onPressed: () => setState(() => _currentStep++),
                    child: const Text('Next'),
                  ),
                if (_currentStep == 4)
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
