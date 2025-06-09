import 'package:eye_app/services/api_client.dart';

class AppointmentService {
  final ApiClient _apiClient = ApiClient();

  // Get patient's appointments
  Future<Map<String, dynamic>> getPatientAppointments() async {
    try {
      final response = await _apiClient.request(
        method: 'GET',
        path: '/appointments/patient/me',
      );
      return response;
    } catch (e) {
      return {
        'success': false,
        'message': 'Error fetching appointments: $e',
      };
    }
  }

  // Create appointment
  Future<Map<String, dynamic>> createAppointment({
    required String doctorId,
    required String timeSlotId,
    required String appointmentDate,
  }) async {
    try {
      final response = await _apiClient.request(
        method: 'POST',
        path: '/appointments',
        data: {
          'doctor_id': int.parse(doctorId),
          'time_slot_id': int.parse(timeSlotId),
          'appointment_date': appointmentDate,
          'status': 'scheduled',
        },
      );
      return response;
    } catch (e) {
      if (e is Map<String, dynamic> && e.containsKey('errors')) {
        return {
          'success': false,
          'message': e['errors'].toString(),
        };
      }
      return {
        'success': false,
        'message': 'Error creating appointment: $e',
      };
    }
  }

  // Cancel appointment
  Future<Map<String, dynamic>> cancelAppointment(String appointmentId) async {
    try {
      final response = await _apiClient.request(
        method: 'PUT',
        path: '/appointments/$appointmentId',
        data: {
          'status': 'cancelled',
        },
      );
      return response;
    } catch (e) {
      return {
        'success': false,
        'message': 'Error cancelling appointment: $e',
      };
    }
  }
}
