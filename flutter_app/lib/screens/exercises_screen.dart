import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/exercise_provider.dart';
import '../widgets/bottom_navigation.dart';

class ExercisesScreen extends StatefulWidget {
  const ExercisesScreen({super.key});

  @override
  State<ExercisesScreen> createState() => _ExercisesScreenState();
}

class _ExercisesScreenState extends State<ExercisesScreen> {
  @override
  void initState() {
    super.initState();
    final exerciseProvider = Provider.of<ExerciseProvider>(context, listen: false);
    exerciseProvider.loadExercises();
    exerciseProvider.loadCategories();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.grey[50],
      appBar: AppBar(
        title: const Text('Exercises'),
      ),
      body: Consumer<ExerciseProvider>(
        builder: (context, exerciseProvider, child) {
          if (exerciseProvider.isLoading) {
            return const Center(child: CircularProgressIndicator());
          }

          return Column(
            children: [
              _buildCategoryFilter(exerciseProvider),
              Expanded(
                child: _buildExercisesList(exerciseProvider),
              ),
            ],
          );
        },
      ),
      bottomNavigationBar: const BottomNavigation(currentIndex: 2),
    );
  }

  Widget _buildCategoryFilter(ExerciseProvider exerciseProvider) {
    return Container(
      padding: const EdgeInsets.all(16),
      color: Colors.white,
      child: SizedBox(
        height: 40,
        child: ListView.builder(
          scrollDirection: Axis.horizontal,
          itemCount: exerciseProvider.categories.length,
          itemBuilder: (context, index) {
            final category = exerciseProvider.categories[index];
            final isSelected = category == exerciseProvider.selectedCategory;
            
            return Container(
              margin: const EdgeInsets.only(right: 8),
              child: FilterChip(
                label: Text(category),
                selected: isSelected,
                onSelected: (selected) {
                  exerciseProvider.setSelectedCategory(category);
                },
                backgroundColor: Colors.grey[100],
                selectedColor: const Color(0xFF2563EB).withOpacity(0.2),
                labelStyle: TextStyle(
                  color: isSelected ? const Color(0xFF2563EB) : Colors.grey[700],
                  fontWeight: isSelected ? FontWeight.w600 : FontWeight.normal,
                ),
              ),
            );
          },
        ),
      ),
    );
  }

  Widget _buildExercisesList(ExerciseProvider exerciseProvider) {
    final exercises = exerciseProvider.exercises;

    if (exercises.isEmpty) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              Icons.search_off,
              size: 80,
              color: Colors.grey[400],
            ),
            const SizedBox(height: 16),
            Text(
              'No exercises found',
              style: TextStyle(
                fontSize: 20,
                fontWeight: FontWeight.w600,
                color: Colors.grey[600],
              ),
            ),
            const SizedBox(height: 8),
            Text(
              'Try selecting a different category',
              style: TextStyle(
                fontSize: 16,
                color: Colors.grey[500],
              ),
            ),
          ],
        ),
      );
    }

    return RefreshIndicator(
      onRefresh: () => exerciseProvider.loadExercises(),
      child: ListView.builder(
        padding: const EdgeInsets.all(16),
        itemCount: exercises.length,
        itemBuilder: (context, index) {
          final exercise = exercises[index];
          return Container(
            margin: const EdgeInsets.only(bottom: 12),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(12),
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withOpacity(0.05),
                  blurRadius: 10,
                  offset: const Offset(0, 2),
                ),
              ],
            ),
            child: ExpansionTile(
              leading: Container(
                width: 48,
                height: 48,
                decoration: BoxDecoration(
                  color: _getCategoryColor(exercise.category).withOpacity(0.1),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Icon(
                  _getCategoryIcon(exercise.category),
                  color: _getCategoryColor(exercise.category),
                  size: 24,
                ),
              ),
              title: Text(
                exercise.name,
                style: const TextStyle(
                  fontWeight: FontWeight.w600,
                  fontSize: 16,
                ),
              ),
              subtitle: Text(
                exercise.category,
                style: TextStyle(
                  color: Colors.grey[600],
                  fontSize: 14,
                ),
              ),
              children: [
                Padding(
                  padding: const EdgeInsets.all(16),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      if (exercise.description != null) ...[
                        const Text(
                          'Description',
                          style: TextStyle(
                            fontWeight: FontWeight.w600,
                            fontSize: 14,
                          ),
                        ),
                        const SizedBox(height: 8),
                        Text(
                          exercise.description!,
                          style: TextStyle(
                            color: Colors.grey[700],
                            fontSize: 14,
                            height: 1.4,
                          ),
                        ),
                        const SizedBox(height: 16),
                      ],
                      Row(
                        children: [
                          if (exercise.targetMuscles != null) ...[
                            Expanded(
                              child: _buildInfoChip(
                                'Target Muscles',
                                exercise.targetMuscles!,
                                Icons.accessibility,
                              ),
                            ),
                            const SizedBox(width: 8),
                          ],
                          if (exercise.equipmentType != null) ...[
                            Expanded(
                              child: _buildInfoChip(
                                'Equipment',
                                exercise.equipmentType!,
                                Icons.fitness_center,
                              ),
                            ),
                          ],
                        ],
                      ),
                      if (exercise.exerciseType != null) ...[
                        const SizedBox(height: 8),
                        _buildInfoChip(
                          'Type',
                          exercise.exerciseType!,
                          Icons.category,
                        ),
                      ],
                    ],
                  ),
                ),
              ],
            ),
          );
        },
      ),
    );
  }

  Widget _buildInfoChip(String label, String value, IconData icon) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
      decoration: BoxDecoration(
        color: Colors.grey[100],
        borderRadius: BorderRadius.circular(8),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 16, color: Colors.grey[600]),
          const SizedBox(width: 8),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisSize: MainAxisSize.min,
              children: [
                Text(
                  label,
                  style: TextStyle(
                    fontSize: 10,
                    color: Colors.grey[600],
                    fontWeight: FontWeight.w500,
                  ),
                ),
                Text(
                  value,
                  style: const TextStyle(
                    fontSize: 12,
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Color _getCategoryColor(String category) {
    switch (category.toLowerCase()) {
      case 'chest':
        return const Color(0xFFEF4444);
      case 'back':
        return const Color(0xFF10B981);
      case 'legs':
        return const Color(0xFF3B82F6);
      case 'shoulders':
        return const Color(0xFFF59E0B);
      case 'arms':
        return const Color(0xFF8B5CF6);
      case 'core':
        return const Color(0xFFEC4899);
      case 'cardio':
        return const Color(0xFF06B6D4);
      default:
        return const Color(0xFF6B7280);
    }
  }

  IconData _getCategoryIcon(String category) {
    switch (category.toLowerCase()) {
      case 'chest':
        return Icons.fitness_center;
      case 'back':
        return Icons.accessibility;
      case 'legs':
        return Icons.directions_run;
      case 'shoulders':
        return Icons.airline_seat_recline_normal;
      case 'arms':
        return Icons.sports_martial_arts;
      case 'core':
        return Icons.motion_photos_on;
      case 'cardio':
        return Icons.favorite;
      default:
        return Icons.category;
    }
  }
}