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
  bool _isInitialized = false;

  // Getters
  Map<String, dynamic>? get userData => _userData;
  String? get token => _token;
  bool get isAuthenticated => _token != null && _token!.isNotEmpty;
  bool get isInitialized => _isInitialized;

  // Singleton factory
  factory AuthService() => _instance;

  AuthService._internal();

  // Initialize the service
  Future<void> initialize() async {
    if (_isInitialized) return;

    try {
      final prefs = await SharedPreferences.getInstance();
      _token = prefs.getString('token');

      // Parse stored user data if available
      final userDataString = prefs.getString('userData');
      if (userDataString != null) {
        try {
          _userData = jsonDecode(userDataString) as Map<String, dynamic>;
        } catch (e) {
          if (kDebugMode) {
            print('Error parsing stored user data: $e');
          }
          // Clear corrupted data
          await prefs.remove('userData');
          _userData = null;
        }
      }

      if (_token != null && _token!.isNotEmpty) {
        _apiClient.setToken(_token!);
        if (kDebugMode) {
          print('Token restored from storage: ${_token!.substring(0, 10)}...');
        }
      }

      _isInitialized = true;
      authStateChanges.value = isAuthenticated;

      if (kDebugMode) {
        print('AuthService initialized. Authenticated: $isAuthenticated');
      }
    } catch (e) {
      if (kDebugMode) {
        print('Error initializing auth service: $e');
      }
      _isInitialized = true;
      authStateChanges.value = false;
    }
  }

  // Refresh token from storage
  Future<void> refreshTokenFromStorage() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final storedToken = prefs.getString('token');

      if (storedToken != null && storedToken.isNotEmpty) {
        _token = storedToken;
        _apiClient.setToken(_token!);
        authStateChanges.value = true;

        if (kDebugMode) {
          print('Token refreshed from storage: ${_token!.substring(0, 10)}...');
        }
      } else {
        _token = null;
        authStateChanges.value = false;

        if (kDebugMode) {
          print('No token found in storage');
        }
      }
    } catch (e) {
      if (kDebugMode) {
        print('Error refreshing token: $e');
      }
      _token = null;
      authStateChanges.value = false;
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

    if (kDebugMode) {
      print('Login successful. Token saved: ${_token!.substring(0, 10)}...');
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

      if (kDebugMode) {
        print('Logout successful. Token cleared.');
      }

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
