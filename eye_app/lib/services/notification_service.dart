import 'package:eye_app/services/api_client.dart';

class NotificationService {
  final ApiClient _apiClient = ApiClient();

  // Get patient's notifications
  Future<Map<String, dynamic>> getPatientNotifications() async {
    try {
      final response = await _apiClient.request(
        method: 'GET',
        path: '/notifications/patient/me',
      );
      return response;
    } catch (e) {
      return {
        'success': false,
        'message': 'Error fetching notifications: $e',
      };
    }
  }

  // Get unread notifications
  Future<Map<String, dynamic>> getUnreadNotifications() async {
    try {
      final response = await _apiClient.request(
        method: 'GET',
        path: '/notifications/patient/me/unread',
      );
      return response;
    } catch (e) {
      return {
        'success': false,
        'message': 'Error fetching unread notifications: $e',
      };
    }
  }

  // Mark notification as read
  Future<Map<String, dynamic>> markNotificationAsRead(
      String notificationId) async {
    try {
      final response = await _apiClient.request(
        method: 'PATCH',
        path: '/notifications/$notificationId/read',
      );
      return response;
    } catch (e) {
      return {
        'success': false,
        'message': 'Error marking notification as read: $e',
      };
    }
  }

  // Mark all notifications as read
  Future<Map<String, dynamic>> markAllNotificationsAsRead() async {
    try {
      final response = await _apiClient.request(
        method: 'PATCH',
        path: '/notifications/patient/me/read-all',
      );
      return response;
    } catch (e) {
      return {
        'success': false,
        'message': 'Error marking all notifications as read: $e',
      };
    }
  }
}
