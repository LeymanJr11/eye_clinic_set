import 'package:flutter/material.dart';
import 'package:eye_app/services/eye_test_service.dart';

class EyeTestProvider with ChangeNotifier {
  final EyeTestService _eyeTestService = EyeTestService();
  bool _isLoading = false;
  String? _error;
  List<Map<String, dynamic>> _eyeTests = [];

  bool get isLoading => _isLoading;
  String? get error => _error;
  List<Map<String, dynamic>> get eyeTests => _eyeTests;

  Future<void> fetchEyeTests() async {
    _isLoading = true;
    _error = null;
    notifyListeners();
    try {
      final response = await _eyeTestService.getPatientEyeTests();
      if (response['success']) {
        _eyeTests = List<Map<String, dynamic>>.from(response['data']);
      } else {
        _error = response['message'];
      }
    } catch (e) {
      _error = e.toString();
    }
    _isLoading = false;
    notifyListeners();
  }

  Future<bool> addEyeTest({
    required String testType,
    required String result,
  }) async {
    _isLoading = true;
    _error = null;
    notifyListeners();
    try {
      final response = await _eyeTestService.addEyeTest(
        testType: testType,
        result: result,
      );
      if (response['success']) {
        await fetchEyeTests();
        return true;
      } else {
        _error = response['message'];
        notifyListeners();
        return false;
      }
    } catch (e) {
      _error = e.toString();
      notifyListeners();
      return false;
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  void clearError() {
    _error = null;
    notifyListeners();
  }
}
