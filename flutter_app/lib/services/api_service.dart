import 'dart:convert';
import 'package:http/http.dart' as http;
import '../models/user_model.dart';
import '../models/exercise_model.dart';
import '../models/workout_model.dart';

class ApiService {
  // Use your actual API base URL - you can configure this for development/production
  static const String baseUrl = 'http://localhost:5000/api';
  
  // Singleton pattern
  static final ApiService _instance = ApiService._internal();
  factory ApiService() => _instance;
  ApiService._internal();

  String? _authToken;

  void setAuthToken(String? token) {
    _authToken = token;
  }

  Map<String, String> get _headers {
    final headers = {
      'Content-Type': 'application/json',
    };
    if (_authToken != null) {
      headers['Authorization'] = 'Bearer $_authToken';
    }
    return headers;
  }

  // Authentication endpoints
  Future<Map<String, dynamic>> getAuthStatus() async {
    final response = await http.get(
      Uri.parse('$baseUrl/auth/status'),
      headers: _headers,
    );
    
    if (response.statusCode == 200) {
      return json.decode(response.body);
    }
    throw Exception('Failed to get auth status');
  }

  Future<void> logout() async {
    final response = await http.get(
      Uri.parse('$baseUrl/auth/logout'),
      headers: _headers,
    );
    
    if (response.statusCode != 200) {
      throw Exception('Failed to logout');
    }
    _authToken = null;
  }

  // Exercise endpoints
  Future<List<Exercise>> getExercises() async {
    final response = await http.get(
      Uri.parse('$baseUrl/exercises'),
      headers: _headers,
    );
    
    if (response.statusCode == 200) {
      final List<dynamic> data = json.decode(response.body);
      return data.map((json) => Exercise.fromJson(json)).toList();
    }
    throw Exception('Failed to load exercises');
  }

  Future<List<String>> getExerciseCategories() async {
    final response = await http.get(
      Uri.parse('$baseUrl/exercises/categories'),
      headers: _headers,
    );
    
    if (response.statusCode == 200) {
      final List<dynamic> data = json.decode(response.body);
      return data.cast<String>();
    }
    throw Exception('Failed to load exercise categories');
  }

  // Workout endpoints
  Future<List<Workout>> getWorkouts() async {
    final response = await http.get(
      Uri.parse('$baseUrl/workouts'),
      headers: _headers,
    );
    
    if (response.statusCode == 200) {
      final List<dynamic> data = json.decode(response.body);
      return data.map((json) => Workout.fromJson(json)).toList();
    }
    throw Exception('Failed to load workouts');
  }

  Future<Workout> createWorkout(Map<String, dynamic> workoutData) async {
    final response = await http.post(
      Uri.parse('$baseUrl/workouts'),
      headers: _headers,
      body: json.encode(workoutData),
    );
    
    if (response.statusCode == 201) {
      return Workout.fromJson(json.decode(response.body));
    }
    throw Exception('Failed to create workout');
  }

  Future<Workout> updateWorkout(int id, Map<String, dynamic> workoutData) async {
    final response = await http.put(
      Uri.parse('$baseUrl/workouts/$id'),
      headers: _headers,
      body: json.encode(workoutData),
    );
    
    if (response.statusCode == 200) {
      return Workout.fromJson(json.decode(response.body));
    }
    throw Exception('Failed to update workout');
  }

  Future<void> deleteWorkout(int id) async {
    final response = await http.delete(
      Uri.parse('$baseUrl/workouts/$id'),
      headers: _headers,
    );
    
    if (response.statusCode != 200) {
      throw Exception('Failed to delete workout');
    }
  }

  // Workout session endpoints
  Future<List<WorkoutSession>> getRecentWorkoutSessions() async {
    final response = await http.get(
      Uri.parse('$baseUrl/workout-sessions/recent'),
      headers: _headers,
    );
    
    if (response.statusCode == 200) {
      final List<dynamic> data = json.decode(response.body);
      return data.map((json) => WorkoutSession.fromJson(json)).toList();
    }
    throw Exception('Failed to load recent workout sessions');
  }

  Future<WorkoutSession> startWorkoutSession(int workoutId) async {
    final response = await http.post(
      Uri.parse('$baseUrl/workout-sessions'),
      headers: _headers,
      body: json.encode({'workoutId': workoutId}),
    );
    
    if (response.statusCode == 201) {
      return WorkoutSession.fromJson(json.decode(response.body));
    }
    throw Exception('Failed to start workout session');
  }

  // Personal records endpoints
  Future<List<PersonalRecord>> getPersonalRecords() async {
    final response = await http.get(
      Uri.parse('$baseUrl/stats/personal-records'),
      headers: _headers,
    );
    
    if (response.statusCode == 200) {
      final List<dynamic> data = json.decode(response.body);
      return data.map((json) => PersonalRecord.fromJson(json)).toList();
    }
    throw Exception('Failed to load personal records');
  }

  // Stats endpoints
  Future<Map<String, dynamic>> getWeeklyWorkouts() async {
    final response = await http.get(
      Uri.parse('$baseUrl/stats/weekly-workouts'),
      headers: _headers,
    );
    
    if (response.statusCode == 200) {
      return json.decode(response.body);
    }
    throw Exception('Failed to load weekly workout stats');
  }

  Future<Map<String, dynamic>> getTotalWeight() async {
    final response = await http.get(
      Uri.parse('$baseUrl/stats/total-weight'),
      headers: _headers,
    );
    
    if (response.statusCode == 200) {
      return json.decode(response.body);
    }
    throw Exception('Failed to load total weight stats');
  }

  Future<List<Map<String, dynamic>>> getWeightByDay() async {
    final response = await http.get(
      Uri.parse('$baseUrl/stats/weight-by-day'),
      headers: _headers,
    );
    
    if (response.statusCode == 200) {
      final List<dynamic> data = json.decode(response.body);
      return data.cast<Map<String, dynamic>>();
    }
    throw Exception('Failed to load weight by day stats');
  }
}