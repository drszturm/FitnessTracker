import 'package:flutter/material.dart';
import '../models/workout_model.dart';
import '../services/api_service.dart';

class WorkoutProvider with ChangeNotifier {
  final ApiService _apiService = ApiService();
  
  List<Workout> _workouts = [];
  List<WorkoutSession> _recentSessions = [];
  List<PersonalRecord> _personalRecords = [];
  Map<String, dynamic> _weeklyStats = {};
  Map<String, dynamic> _totalWeightStats = {};
  List<Map<String, dynamic>> _weightByDay = [];
  
  bool _isLoading = false;
  String? _error;

  List<Workout> get workouts => _workouts;
  List<WorkoutSession> get recentSessions => _recentSessions;
  List<PersonalRecord> get personalRecords => _personalRecords;
  Map<String, dynamic> get weeklyStats => _weeklyStats;
  Map<String, dynamic> get totalWeightStats => _totalWeightStats;
  List<Map<String, dynamic>> get weightByDay => _weightByDay;
  bool get isLoading => _isLoading;
  String? get error => _error;

  Future<void> loadWorkouts() async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      _workouts = await _apiService.getWorkouts();
    } catch (e) {
      _error = e.toString();
    }

    _isLoading = false;
    notifyListeners();
  }

  Future<void> loadRecentSessions() async {
    try {
      _recentSessions = await _apiService.getRecentWorkoutSessions();
      notifyListeners();
    } catch (e) {
      _error = e.toString();
      notifyListeners();
    }
  }

  Future<void> loadPersonalRecords() async {
    try {
      _personalRecords = await _apiService.getPersonalRecords();
      notifyListeners();
    } catch (e) {
      _error = e.toString();
      notifyListeners();
    }
  }

  Future<void> loadStats() async {
    try {
      final futures = await Future.wait([
        _apiService.getWeeklyWorkouts(),
        _apiService.getTotalWeight(),
        _apiService.getWeightByDay(),
      ]);
      
      _weeklyStats = futures[0];
      _totalWeightStats = futures[1];
      _weightByDay = futures[2];
      notifyListeners();
    } catch (e) {
      _error = e.toString();
      notifyListeners();
    }
  }

  Future<void> createWorkout(Map<String, dynamic> workoutData) async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      final newWorkout = await _apiService.createWorkout(workoutData);
      _workouts.add(newWorkout);
    } catch (e) {
      _error = e.toString();
    }

    _isLoading = false;
    notifyListeners();
  }

  Future<void> updateWorkout(int id, Map<String, dynamic> workoutData) async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      final updatedWorkout = await _apiService.updateWorkout(id, workoutData);
      final index = _workouts.indexWhere((w) => w.id == id);
      if (index != -1) {
        _workouts[index] = updatedWorkout;
      }
    } catch (e) {
      _error = e.toString();
    }

    _isLoading = false;
    notifyListeners();
  }

  Future<void> deleteWorkout(int id) async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      await _apiService.deleteWorkout(id);
      _workouts.removeWhere((w) => w.id == id);
    } catch (e) {
      _error = e.toString();
    }

    _isLoading = false;
    notifyListeners();
  }

  Future<void> startWorkoutSession(int workoutId) async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      final session = await _apiService.startWorkoutSession(workoutId);
      _recentSessions.insert(0, session);
    } catch (e) {
      _error = e.toString();
    }

    _isLoading = false;
    notifyListeners();
  }
}