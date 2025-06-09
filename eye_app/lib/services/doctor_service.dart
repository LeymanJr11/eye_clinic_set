import 'package:eye_app/services/api_client.dart';

class DoctorService {
  final ApiClient _apiClient = ApiClient();

  // Get all doctors
  Future<Map<String, dynamic>> getDoctors() async {
    try {
      final response = await _apiClient.request(
        method: 'GET',
        path: '/doctors',
      );
      return response;
    } catch (e) {
      return {
        'success': false,
        'message': 'Error fetching doctors: $e',
      };
    }
  }

  // Get doctor by ID
  Future<Map<String, dynamic>> getDoctorById(String id) async {
    try {
      final response = await _apiClient.request(
        method: 'GET',
        path: '/doctors/$id',
      );
      return response;
    } catch (e) {
      return {
        'success': false,
        'message': 'Error fetching doctor: $e',
      };
    }
  }

  // Get time slots for a doctor
  Future<Map<String, dynamic>> getTimeSlots(
      String doctorId, String date) async {
    try {
      final response = await _apiClient.request(
        method: 'GET',
        path: '/time-slots/available/$doctorId/$date',
      );
      return response;
    } catch (e) {
      return {
        'success': false,
        'message': 'Error fetching time slots: $e',
      };
    }
  }
}
