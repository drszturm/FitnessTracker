import 'exercise_model.dart';

class Workout {
  final int id;
  final String name;
  final int userId;
  final DateTime createdAt;
  final DateTime? lastCompletedAt;
  final List<WorkoutExercise>? exercises;

  Workout({
    required this.id,
    required this.name,
    required this.userId,
    required this.createdAt,
    this.lastCompletedAt,
    this.exercises,
  });

  factory Workout.fromJson(Map<String, dynamic> json) {
    return Workout(
      id: json['id'] as int,
      name: json['name'] as String,
      userId: json['userId'] as int,
      createdAt: DateTime.parse(json['createdAt'] as String),
      lastCompletedAt: json['lastCompletedAt'] != null 
          ? DateTime.parse(json['lastCompletedAt'] as String)
          : null,
      exercises: json['exercises'] != null
          ? (json['exercises'] as List)
              .map((e) => WorkoutExercise.fromJson(e as Map<String, dynamic>))
              .toList()
          : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'userId': userId,
      'createdAt': createdAt.toIso8601String(),
      'lastCompletedAt': lastCompletedAt?.toIso8601String(),
      'exercises': exercises?.map((e) => e.toJson()).toList(),
    };
  }
}

class WorkoutSession {
  final int id;
  final int workoutId;
  final int userId;
  final DateTime date;
  final int? duration;
  final String? notes;
  final int completed;
  final Workout? workout;

  WorkoutSession({
    required this.id,
    required this.workoutId,
    required this.userId,
    required this.date,
    this.duration,
    this.notes,
    required this.completed,
    this.workout,
  });

  factory WorkoutSession.fromJson(Map<String, dynamic> json) {
    return WorkoutSession(
      id: json['id'] as int,
      workoutId: json['workoutId'] as int,
      userId: json['userId'] as int,
      date: DateTime.parse(json['date'] as String),
      duration: json['duration'] as int?,
      notes: json['notes'] as String?,
      completed: json['completed'] as int,
      workout: json['workout'] != null
          ? Workout.fromJson(json['workout'] as Map<String, dynamic>)
          : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'workoutId': workoutId,
      'userId': userId,
      'date': date.toIso8601String(),
      'duration': duration,
      'notes': notes,
      'completed': completed,
      'workout': workout?.toJson(),
    };
  }
}

class PersonalRecord {
  final int id;
  final int userId;
  final int exerciseId;
  final double weight;
  final int reps;
  final DateTime date;
  final Exercise? exercise;

  PersonalRecord({
    required this.id,
    required this.userId,
    required this.exerciseId,
    required this.weight,
    required this.reps,
    required this.date,
    this.exercise,
  });

  factory PersonalRecord.fromJson(Map<String, dynamic> json) {
    return PersonalRecord(
      id: json['id'] as int,
      userId: json['userId'] as int,
      exerciseId: json['exerciseId'] as int,
      weight: (json['weight'] as num).toDouble(),
      reps: json['reps'] as int,
      date: DateTime.parse(json['date'] as String),
      exercise: json['exercise'] != null
          ? Exercise.fromJson(json['exercise'] as Map<String, dynamic>)
          : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'userId': userId,
      'exerciseId': exerciseId,
      'weight': weight,
      'reps': reps,
      'date': date.toIso8601String(),
      'exercise': exercise?.toJson(),
    };
  }
}