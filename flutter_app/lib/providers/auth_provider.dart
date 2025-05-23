import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../models/user_model.dart';
import '../services/api_service.dart';

class AuthProvider with ChangeNotifier {
  final ApiService _apiService = ApiService();
  
  User? _user;
  bool _isAuthenticated = false;
  bool _isLoading = false;

  User? get user => _user;
  bool get isAuthenticated => _isAuthenticated;
  bool get isLoading => _isLoading;

  AuthProvider() {
    _checkAuthStatus();
  }

  Future<void> _checkAuthStatus() async {
    _isLoading = true;
    notifyListeners();

    try {
      final prefs = await SharedPreferences.getInstance();
      final token = prefs.getString('auth_token');
      
      if (token != null) {
        _apiService.setAuthToken(token);
        final authData = await _apiService.getAuthStatus();
        
        if (authData['authenticated'] == true && authData['user'] != null) {
          _user = User.fromJson(authData['user']);
          _isAuthenticated = true;
        } else {
          await _clearAuth();
        }
      }
    } catch (e) {
      await _clearAuth();
    }

    _isLoading = false;
    notifyListeners();
  }

  Future<void> loginWithSocial(String provider) async {
    // This would typically open a webview or handle deep linking
    // For now, we'll simulate the flow
    _isLoading = true;
    notifyListeners();

    try {
      // In a real app, you'd handle OAuth flow here
      // For demo purposes, we'll simulate a successful login
      await Future.delayed(const Duration(seconds: 2));
      
      // This would come from your OAuth callback
      const mockToken = 'mock_jwt_token';
      await _storeAuthToken(mockToken);
      
      _user = User(
        id: 1,
        username: 'demo_user',
        email: 'demo@example.com',
        provider: provider,
        createdAt: DateTime.now(),
      );
      _isAuthenticated = true;
    } catch (e) {
      throw Exception('Login failed: $e');
    }

    _isLoading = false;
    notifyListeners();
  }

  Future<void> logout() async {
    _isLoading = true;
    notifyListeners();

    try {
      await _apiService.logout();
      await _clearAuth();
    } catch (e) {
      // Even if API call fails, clear local auth
      await _clearAuth();
    }

    _isLoading = false;
    notifyListeners();
  }

  Future<void> _storeAuthToken(String token) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString('auth_token', token);
    _apiService.setAuthToken(token);
  }

  Future<void> _clearAuth() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove('auth_token');
    _apiService.setAuthToken(null);
    _user = null;
    _isAuthenticated = false;
  }
}