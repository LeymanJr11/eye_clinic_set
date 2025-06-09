// lib/providers/auth_provider.dart
import 'package:flutter/material.dart';
import 'package:eye_app/services/auth_service.dart';

class AuthProvider with ChangeNotifier {
  final AuthService _authService = AuthService();
  bool _isLoading = false;
  String? _error;
  bool _isAuthenticated = false;
  Map<String, dynamic>? _userData;

  // Getters
  bool get isLoading => _isLoading;
  String? get error => _error;
  bool get isAuthenticated => _isAuthenticated;
  Map<String, dynamic>? get userData => _userData;

  AuthProvider() {
    _authService.authStateChanges.addListener(_onAuthStateChanged);
  }

  void _onAuthStateChanged() {
    _isAuthenticated = _authService.isAuthenticated;
    _userData = _authService.userData;
    notifyListeners();
  }

  // Login
  Future<bool> login(String phone, String password) async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      final response = await _authService.login(phone, password);
      _isLoading = false;
      if (!response['success']) {
        _error = response['message'];
      }
      notifyListeners();
      return response['success'];
    } catch (e) {
      _error = e.toString();
      _isLoading = false;
      notifyListeners();
      return false;
    }
  }

  // Register
  Future<bool> register(
    String name,
    String phone,
    String password, {
    String? gender,
    String? dateOfBirth,
  }) async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      final response = await _authService.register(
        name,
        phone,
        password,
        gender: gender,
        dateOfBirth: dateOfBirth,
      );
      _isLoading = false;
      if (!response['success']) {
        _error = response['message'];
      }
      notifyListeners();
      return response['success'];
    } catch (e) {
      _error = e.toString();
      _isLoading = false;
      notifyListeners();
      return false;
    }
  }

  // Update Profile
  Future<bool> updateProfile({
    required String name,
    required String phone,
    String? gender,
    String? dateOfBirth,
  }) async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      final response = await _authService.updateProfile(
        name: name,
        phone: phone,
        gender: gender,
        dateOfBirth: dateOfBirth,
      );
      _isLoading = false;
      if (!response['success']) {
        _error = response['message'];
      }
      notifyListeners();
      return response['success'];
    } catch (e) {
      _error = e.toString();
      _isLoading = false;
      notifyListeners();
      return false;
    }
  }

  // Check Authentication
  Future<void> checkAuth() async {
    _isLoading = true;
    notifyListeners();

    try {
      await _authService.initialize();
    } catch (e) {
      _isAuthenticated = false;
      _userData = null;
    }

    _isLoading = false;
    notifyListeners();
  }

  // Logout
  Future<void> logout() async {
    _isLoading = true;
    notifyListeners();

    try {
      await _authService.logout();
    } catch (e) {
      // Ignore errors during logout
    }

    _isAuthenticated = false;
    _userData = null;
    _isLoading = false;
    notifyListeners();
  }

  @override
  void dispose() {
    _authService.authStateChanges.removeListener(_onAuthStateChanged);
    super.dispose();
  }
}
