import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:eye_app/providers/eye_test_provider.dart';
import 'package:google_fonts/google_fonts.dart';

class ColorBlindnessTestScreen extends StatefulWidget {
  const ColorBlindnessTestScreen({Key? key}) : super(key: key);

  @override
  State<ColorBlindnessTestScreen> createState() =>
      _ColorBlindnessTestScreenState();
}

class _ColorBlindnessTestScreenState extends State<ColorBlindnessTestScreen> {
  int _currentStep = 0;
  final List<_Plate> _plates = [
    _Plate(
        image:
            'https://upload.wikimedia.org/wikipedia/commons/8/86/Ishihara_9.png',
        answer: '9'),
    _Plate(
        image:
            'https://upload.wikimedia.org/wikipedia/commons/4/4c/Ishihara_12.png',
        answer: '12'),
    _Plate(
        image:
            'https://upload.wikimedia.org/wikipedia/commons/2/2b/Ishihara_74.png',
        answer: '74'),
  ];
  final List<String?> _responses = [null, null, null];
  bool _submitting = false;

  void _submitTest(BuildContext context) async {
    setState(() => _submitting = true);
    final correct =
        List.generate(_plates.length, (i) => _responses[i] == _plates[i].answer)
            .where((v) => v)
            .length;
    final result = 'Correct: $correct/${_plates.length}';
    final provider = Provider.of<EyeTestProvider>(context, listen: false);
    await provider.addEyeTest(testType: 'color_blindness', result: result);
    if (mounted) Navigator.pop(context);
  }

  @override
  Widget build(BuildContext context) {
    final plate = _plates[_currentStep];
    return Scaffold(
      appBar: AppBar(title: const Text('Color Blindness Test')),
      body: Padding(
        padding: const EdgeInsets.all(24.0),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Text('Plate ${_currentStep + 1} of ${_plates.length}',
                style: GoogleFonts.poppins(fontSize: 18)),
            const SizedBox(height: 16),
            Image.network(plate.image,
                height: 180, width: 180, fit: BoxFit.cover),
            const SizedBox(height: 24),
            TextFormField(
              keyboardType: TextInputType.number,
              decoration:
                  const InputDecoration(labelText: 'What number do you see?'),
              onChanged: (val) => _responses[_currentStep] = val,
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
                if (_currentStep < _plates.length - 1)
                  ElevatedButton(
                    onPressed: () => setState(() => _currentStep++),
                    child: const Text('Next'),
                  ),
                if (_currentStep == _plates.length - 1)
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

class _Plate {
  final String image;
  final String answer;
  const _Plate({required this.image, required this.answer});
}
