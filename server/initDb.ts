import { db } from './db';
import { exercises } from '@shared/schema';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the directory name in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function initializeExercises() {
  console.log('Initializing exercises database...');
  
  try {
    // Check if exercises already exist in the database
    const existingExercises = await db.select().from(exercises);
    
    if (existingExercises.length > 0) {
      console.log(`Found ${existingExercises.length} exercises in the database, skipping initialization.`);
      return;
    }
    
    // Load the exercises from the JSON file
    const exercisesFilePath = path.join(__dirname, 'data', 'exercises.json');
    const exercisesData = JSON.parse(fs.readFileSync(exercisesFilePath, 'utf8'));
    
    if (!exercisesData.exercises || !Array.isArray(exercisesData.exercises)) {
      throw new Error('Invalid exercises data structure');
    }
    
    console.log(`Found ${exercisesData.exercises.length} exercises in JSON file.`);
    
    // Insert exercises into the database
    for (const exercise of exercisesData.exercises) {
      await db.insert(exercises).values({
        name: exercise.name,
        description: exercise.description || null,
        category: exercise.category,
        targetMuscles: exercise.targetMuscles || null,
        equipmentType: exercise.equipmentType || null,
        exerciseType: exercise.exerciseType || null
      });
    }
    
    console.log('Exercises initialized successfully!');
  } catch (error) {
    console.error('Error initializing exercises:', error);
  }
}

// Export the function to be called from the main server startup
export { initializeExercises };

// If this script is run directly, execute the initialization
if (import.meta.url.endsWith(process.argv[1])) {
  initializeExercises()
    .then(() => {
      console.log('Database initialization completed.');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Database initialization failed:', error);
      process.exit(1);
    });
}