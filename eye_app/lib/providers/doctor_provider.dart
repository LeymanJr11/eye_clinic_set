import 'package:flutter/material.dart';
import 'package:eye_app/services/doctor_service.dart';

class DoctorProvider with ChangeNotifier {
  final DoctorService _doctorService = DoctorService();
  bool _isLoading = false;
  String? _error;
  List<Map<String, dynamic>> _doctors = [];
  Map<String, dynamic>? _selectedDoctor;
  List<Map<String, dynamic>> _timeSlots = [];

  // Getters
  bool get isLoading => _isLoading;
  String? get error => _error;
  List<Map<String, dynamic>> get doctors => _doctors;
  Map<String, dynamic>? get selectedDoctor => _selectedDoctor;
  List<Map<String, dynamic>> get timeSlots => _timeSlots;

  // Fetch all doctors
  Future<void> fetchDoctors() async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      final response = await _doctorService.getDoctors();
      if (response['success']) {
        _doctors = List<Map<String, dynamic>>.from(response['data']);
      } else {
        _error = response['message'];
      }
    } catch (e) {
      _error = e.toString();
    }

    _isLoading = false;
    notifyListeners();
  }

  // Fetch doctor by ID
  Future<void> fetchDoctorById(String id) async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      final response = await _doctorService.getDoctorById(id);
      if (response['success']) {
        _selectedDoctor = response['data'];
      } else {
        _error = response['message'];
      }
    } catch (e) {
      _error = e.toString();
    }

    _isLoading = false;
    notifyListeners();
  }

  // Fetch time slots for a doctor
  Future<void> fetchTimeSlots(String doctorId, String date) async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      final response = await _doctorService.getTimeSlots(doctorId, date);
      if (response['success']) {
        _timeSlots = List<Map<String, dynamic>>.from(response['data']);
      } else {
        _error = response['message'];
      }
    } catch (e) {
      _error = e.toString();
    }

    _isLoading = false;
    notifyListeners();
  }

  // Clear selected doctor
  void clearSelectedDoctor() {
    _selectedDoctor = null;
    _timeSlots = [];
    notifyListeners();
  }
}
