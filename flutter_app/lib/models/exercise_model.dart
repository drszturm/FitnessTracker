class Exercise {
  final int id;
  final String name;
  final String? description;
  final String category;
  final String? targetMuscles;
  final String? equipmentType;
  final String? exerciseType;

  Exercise({
    required this.id,
    required this.name,
    this.description,
    required this.category,
    this.targetMuscles,
    this.equipmentType,
    this.exerciseType,
  });

  factory Exercise.fromJson(Map<String, dynamic> json) {
    return Exercise(
      id: json['id'] as int,
      name: json['name'] as String,
      description: json['description'] as String?,
      category: json['category'] as String,
      targetMuscles: json['targetMuscles'] as String?,
      equipmentType: json['equipmentType'] as String?,
      exerciseType: json['exerciseType'] as String?,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'description': description,
      'category': category,
      'targetMuscles': targetMuscles,
      'equipmentType': equipmentType,
      'exerciseType': exerciseType,
    };
  }
}

class WorkoutExercise {
  final int id;
  final int workoutId;
  final int exerciseId;
  final int sets;
  final String reps;
  final String? weight;
  final int order;
  final Exercise? exercise;

  WorkoutExercise({
    required this.id,
    required this.workoutId,
    required this.exerciseId,
    required this.sets,
    required this.reps,
    this.weight,
    required this.order,
    this.exercise,
  });

  factory WorkoutExercise.fromJson(Map<String, dynamic> json) {
    return WorkoutExercise(
      id: json['id'] as int,
      workoutId: json['workoutId'] as int,
      exerciseId: json['exerciseId'] as int,
      sets: json['sets'] as int,
      reps: json['reps'] as String,
      weight: json['weight'] as String?,
      order: json['order'] as int,
      exercise: json['exercise'] != null 
          ? Exercise.fromJson(json['exercise'] as Map<String, dynamic>)
          : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'workoutId': workoutId,
      'exerciseId': exerciseId,
      'sets': sets,
      'reps': reps,
      'weight': weight,
      'order': order,
      'exercise': exercise?.toJson(),
    };
  }
}