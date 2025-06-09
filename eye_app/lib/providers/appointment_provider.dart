import 'package:flutter/material.dart';
import 'package:eye_app/services/appointment_service.dart';

class AppointmentProvider with ChangeNotifier {
  final AppointmentService _appointmentService = AppointmentService();
  bool _isLoading = false;
  String? _error;
  List<Map<String, dynamic>> _appointments = [];

  // Getters
  bool get isLoading => _isLoading;
  String? get error => _error;
  List<Map<String, dynamic>> get appointments => _appointments;

  // Fetch patient's appointments
  Future<void> fetchPatientAppointments() async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      final response = await _appointmentService.getPatientAppointments();
      if (response['success']) {
        _appointments = List<Map<String, dynamic>>.from(response['data']);
      } else {
        _error = response['message'];
      }
    } catch (e) {
      _error = e.toString();
    }

    _isLoading = false;
    notifyListeners();
  }

  // Book appointment
  Future<bool> bookAppointment({
    required String doctorId,
    required String timeSlotId,
    required String appointmentDate,
  }) async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      final response = await _appointmentService.createAppointment(
        doctorId: doctorId,
        timeSlotId: timeSlotId,
        appointmentDate: appointmentDate,
      );

      _isLoading = false;
      notifyListeners();

      if (!response['success']) {
        _error = response['message'];
        notifyListeners();
        return false;
      }

      return true;
    } catch (e) {
      _error = e.toString();
      _isLoading = false;
      notifyListeners();
      return false;
    }
  }

  // Cancel appointment
  Future<bool> cancelAppointment(String appointmentId) async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      final response =
          await _appointmentService.cancelAppointment(appointmentId);
      if (response['success']) {
        // Remove the cancelled appointment from the list
        _appointments.removeWhere((apt) => apt['id'] == appointmentId);
      } else {
        _error = response['message'];
      }
      _isLoading = false;
      notifyListeners();
      return response['success'];
    } catch (e) {
      _error = e.toString();
      _isLoading = false;
      notifyListeners();
      return false;
    }
  }

  // Clear error
  void clearError() {
    _error = null;
    notifyListeners();
  }
}
