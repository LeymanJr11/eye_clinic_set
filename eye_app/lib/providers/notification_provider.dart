import 'package:flutter/material.dart';
import 'package:eye_app/services/notification_service.dart';

class NotificationProvider with ChangeNotifier {
  final NotificationService _notificationService = NotificationService();
  bool _isLoading = false;
  String? _error;
  List<Map<String, dynamic>> _notifications = [];
  int _unreadCount = 0;

  // Getters
  bool get isLoading => _isLoading;
  String? get error => _error;
  List<Map<String, dynamic>> get notifications => _notifications;
  int get unreadCount => _unreadCount;

  NotificationProvider() {
    // Initialize by fetching notifications
    _initializeNotifications();
  }

  // Initialize notifications
  Future<void> _initializeNotifications() async {
    await fetchNotifications();
    await fetchUnreadCount();
  }

  // Fetch patient's notifications
  Future<void> fetchNotifications() async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      final response = await _notificationService.getPatientNotifications();
      if (response['success']) {
        _notifications = List<Map<String, dynamic>>.from(response['data']);
        _updateUnreadCount();
      } else {
        _error = response['message'];
      }
    } catch (e) {
      _error = e.toString();
    }

    _isLoading = false;
    notifyListeners();
  }

  // Fetch unread notifications count
  Future<void> fetchUnreadCount() async {
    try {
      final response = await _notificationService.getUnreadNotifications();
      if (response['success']) {
        _unreadCount = response['data'].length;
        notifyListeners();
      }
    } catch (e) {
      // Silently handle error for unread count
    }
  }

  // Mark notification as read
  Future<bool> markAsRead(String notificationId) async {
    try {
      final response =
          await _notificationService.markNotificationAsRead(notificationId);
      if (response['success']) {
        // Update the notification in the list
        final index = _notifications
            .indexWhere((n) => n['id'].toString() == notificationId);
        if (index != -1) {
          _notifications[index]['is_read'] = true;
          _updateUnreadCount();
          notifyListeners();
        }
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
    }
  }

  // Mark all notifications as read
  Future<bool> markAllAsRead() async {
    try {
      final response = await _notificationService.markAllNotificationsAsRead();
      if (response['success']) {
        // Update all notifications in the list
        for (var notification in _notifications) {
          notification['is_read'] = true;
        }
        _unreadCount = 0;
        notifyListeners();
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
    }
  }

  // Update unread count
  void _updateUnreadCount() {
    _unreadCount = _notifications.where((n) => n['is_read'] == false).length;
  }

  // Clear error
  void clearError() {
    _error = null;
    notifyListeners();
  }

  // Refresh notifications (for pull-to-refresh)
  Future<void> refresh() async {
    await fetchNotifications();
    await fetchUnreadCount();
  }
}
