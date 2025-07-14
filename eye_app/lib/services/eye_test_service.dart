import 'package:eye_app/services/api_client.dart';

class EyeTestService {
  final ApiClient _apiClient = ApiClient();

  // Get current patient's eye tests
  Future<Map<String, dynamic>> getPatientEyeTests() async {
    try {
      final response = await _apiClient.request(
        method: 'GET',
        path: '/eye-tests/patient/me',
      );
      return response;
    } catch (e) {
      return {
        'success': false,
        'message': 'Error fetching eye tests: $e',
      };
    }
  }

  // Add a new eye test
  Future<Map<String, dynamic>> addEyeTest({
    required String testType,
    required String result,
  }) async {
    try {
      final response = await _apiClient.request(
        method: 'POST',
        path: '/eye-tests',
        data: {
          'test_type': testType,
          'result': result,
        },
      );
      return response;
    } catch (e) {
      return {
        'success': false,
        'message': 'Error adding eye test: $e',
      };
    }
  }
}
