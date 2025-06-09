// lib/services/auth_service.dart
import 'dart:async';
import 'dart:convert';
import 'package:flutter/foundation.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:eye_app/services/api_client.dart';

class AuthService {
  static final AuthService _instance = AuthService._internal();
  final ApiClient _apiClient = ApiClient();

  // Auth state change notifier
  final ValueNotifier<bool> authStateChanges = ValueNotifier<bool>(false);

  // Store user data
  Map<String, dynamic>? _userData;
  String? _token;

  // Getters
  Map<String, dynamic>? get userData => _userData;
  String? get token => _token;
  bool get isAuthenticated => _token != null;

  // Singleton factory
  factory AuthService() => _instance;

  AuthService._internal();

  // Initialize the service
  Future<void> initialize() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      _token = prefs.getString('token');

      // Parse stored user data if available
      final userDataString = prefs.getString('userData');
      if (userDataString != null) {
        _userData = jsonDecode(userDataString) as Map<String, dynamic>;
      }

      if (_token != null) {
        _apiClient.setToken(_token!);
      }

      authStateChanges.value = isAuthenticated;
    } catch (e) {
      if (kDebugMode) {
        print('Error initializing auth service: $e');
      }
      rethrow;
    }
  }

  // Patient Registration
  Future<Map<String, dynamic>> register(
    String name,
    String phone,
    String password, {
    String? gender,
    String? dateOfBirth,
  }) async {
    try {
      final Map<String, dynamic> data = {
        'name': name,
        'phone': phone,
        'password': password,
      };

      if (gender != null) data['gender'] = gender;
      if (dateOfBirth != null) data['date_of_birth'] = dateOfBirth;

      final response = await _apiClient.request(
        method: 'POST',
        path: '/auth/patient/register',
        data: data,
      );

      if (response['success'] && response['data'] != null) {
        await _handleLoginSuccess(response['data']);
      }

      return response;
    } catch (e) {
      return {
        'success': false,
        'message': 'Error during registration: $e',
      };
    }
  }

  // Patient Login
  Future<Map<String, dynamic>> login(String phone, String password) async {
    try {
      final response = await _apiClient.request(
        method: 'POST',
        path: '/auth/patient/login',
        data: {
          'phone': phone,
          'password': password,
        },
      );

      if (response['success']) {
        await _handleLoginSuccess(response['data']);
      }

      return response;
    } catch (e) {
      return {
        'success': false,
        'message': 'Error during login: $e',
      };
    }
  }

  // Handle successful login
  Future<void> _handleLoginSuccess(Map<String, dynamic> data) async {
    _token = data['token'];
    _userData = data['patient'];

    // Set token in API client
    _apiClient.setToken(_token!);

    // Save to SharedPreferences
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString('token', _token!);
    if (_userData != null) {
      await prefs.setString('userData', jsonEncode(_userData));
    }

    // Notify listeners
    authStateChanges.value = true;
  }

  // Logout
  Future<Map<String, dynamic>> logout() async {
    try {
      // Clear data
      _token = null;
      _userData = null;

      // Clear token in API client
      _apiClient.clearToken();

      // Clear SharedPreferences
      final prefs = await SharedPreferences.getInstance();
      await prefs.remove('token');
      await prefs.remove('userData');

      // Notify listeners
      authStateChanges.value = false;

      return {
        'success': true,
        'message': 'Logged out successfully',
      };
    } catch (e) {
      return {
        'success': false,
        'message': 'Error during logout: $e',
      };
    }
  }

  // Update profile
  Future<Map<String, dynamic>> updateProfile({
    required String name,
    required String phone,
    String? gender,
    String? dateOfBirth,
  }) async {
    try {
      final Map<String, dynamic> data = {
        'name': name,
        'phone': phone,
      };

      if (gender != null) data['gender'] = gender;
      if (dateOfBirth != null) data['date_of_birth'] = dateOfBirth;

      final response = await _apiClient.request(
        method: 'PUT',
        path: '/auth/patient/profile',
        data: data,
      );

      // Update local user data if successful
      if (response['success'] && response['data'] != null) {
        _userData = response['data'];
        // Save updated user data
        final prefs = await SharedPreferences.getInstance();
        await prefs.setString('userData', jsonEncode(_userData));
      }

      return response;
    } catch (e) {
      return {
        'success': false,
        'message': 'Error updating profile: $e',
      };
    }
  }
}
