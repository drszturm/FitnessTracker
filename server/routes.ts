import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import {
  insertExerciseSchema,
  insertWorkoutSchema,
  insertWorkoutExerciseSchema,
  insertWorkoutSessionSchema,
  insertSessionExerciseSchema,
  insertExerciseSetSchema,
  insertPersonalRecordSchema,
  exerciseCategories,
  type WorkoutWithExercises,
} from "@shared/schema";
import { z } from "zod";
import { fromZodError } from "zod-validation-error";

export async function registerRoutes(app: Express): Promise<Server> {
  // Helper function for error handling
  const handleError = (res: Response, error: unknown) => {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        message: "Validation error", 
        errors: fromZodError(error).message 
      });
    }
    
    console.error("API error:", error);
    return res.status(500).json({ message: "Internal server error" });
  };

  // Exercise Routes
  app.get("/api/exercises", async (req, res) => {
    try {
      const category = req.query.category as string;
      let exercises;
      
      if (category && exerciseCategories.includes(category as any)) {
        exercises = await storage.getExercisesByCategory(category);
      } else {
        exercises = await storage.getExercises();
      }
      
      res.json(exercises);
    } catch (error) {
      handleError(res, error);
    }
  });

  app.get("/api/exercises/categories", (_req, res) => {
    res.json(exerciseCategories);
  });

  app.get("/api/exercises/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const exercise = await storage.getExercise(id);
      
      if (!exercise) {
        return res.status(404).json({ message: "Exercise not found" });
      }
      
      res.json(exercise);
    } catch (error) {
      handleError(res, error);
    }
  });

  app.post("/api/exercises", async (req, res) => {
    try {
      const exerciseData = insertExerciseSchema.parse(req.body);
      const exercise = await storage.createExercise(exerciseData);
      res.status(201).json(exercise);
    } catch (error) {
      handleError(res, error);
    }
  });

  app.put("/api/exercises/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const exerciseData = insertExerciseSchema.partial().parse(req.body);
      const updatedExercise = await storage.updateExercise(id, exerciseData);
      
      if (!updatedExercise) {
        return res.status(404).json({ message: "Exercise not found" });
      }
      
      res.json(updatedExercise);
    } catch (error) {
      handleError(res, error);
    }
  });

  app.delete("/api/exercises/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteExercise(id);
      
      if (!success) {
        return res.status(404).json({ message: "Exercise not found" });
      }
      
      res.status(204).end();
    } catch (error) {
      handleError(res, error);
    }
  });

  // Workout Routes
  app.get("/api/workouts", async (req, res) => {
    try {
      // For simplicity, using a default user ID
      const userId = parseInt(req.query.userId as string) || 1;
      const workouts = await storage.getWorkouts(userId);
      res.json(workouts);
    } catch (error) {
      handleError(res, error);
    }
  });

  app.get("/api/workouts/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const workout = await storage.getWorkout(id);
      
      if (!workout) {
        return res.status(404).json({ message: "Workout not found" });
      }
      
      res.json(workout);
    } catch (error) {
      handleError(res, error);
    }
  });

  app.post("/api/workouts", async (req, res) => {
    try {
      // Validate the workout data
      const workoutData = insertWorkoutSchema.parse(req.body);
      const workout = await storage.createWorkout(workoutData);
      
      // Check if exercises are included
      const exercisesData = req.body.exercises;
      if (Array.isArray(exercisesData) && exercisesData.length > 0) {
        // Add exercises to the workout
        for (let i = 0; i < exercisesData.length; i++) {
          const exerciseData = insertWorkoutExerciseSchema.parse({
            ...exercisesData[i],
            workoutId: workout.id,
            order: i + 1,
          });
          await storage.createWorkoutExercise(exerciseData);
        }
      }
      
      // Return the complete workout with exercises
      const completeWorkout = await storage.getWorkout(workout.id);
      res.status(201).json(completeWorkout);
    } catch (error) {
      handleError(res, error);
    }
  });

  app.put("/api/workouts/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const workoutData = insertWorkoutSchema.partial().parse(req.body);
      
      // Update the workout
      const updatedWorkout = await storage.updateWorkout(id, workoutData);
      if (!updatedWorkout) {
        return res.status(404).json({ message: "Workout not found" });
      }
      
      // If exercises are included, update them
      const exercisesData = req.body.exercises;
      if (Array.isArray(exercisesData)) {
        // First delete all existing workout exercises
        await storage.deleteWorkoutExercisesByWorkoutId(id);
        
        // Then add the new ones
        for (let i = 0; i < exercisesData.length; i++) {
          const exerciseData = insertWorkoutExerciseSchema.parse({
            ...exercisesData[i],
            workoutId: id,
            order: i + 1,
          });
          await storage.createWorkoutExercise(exerciseData);
        }
      }
      
      // Return the complete workout with exercises
      const completeWorkout = await storage.getWorkout(id);
      res.json(completeWorkout);
    } catch (error) {
      handleError(res, error);
    }
  });

  app.delete("/api/workouts/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteWorkout(id);
      
      if (!success) {
        return res.status(404).json({ message: "Workout not found" });
      }
      
      res.status(204).end();
    } catch (error) {
      handleError(res, error);
    }
  });

  // Workout Session Routes
  app.get("/api/workout-sessions", async (req, res) => {
    try {
      // For simplicity, using a default user ID
      const userId = parseInt(req.query.userId as string) || 1;
      const sessions = await storage.getWorkoutSessions(userId);
      res.json(sessions);
    } catch (error) {
      handleError(res, error);
    }
  });

  app.get("/api/workout-sessions/recent", async (req, res) => {
    try {
      const userId = parseInt(req.query.userId as string) || 1;
      const limit = parseInt(req.query.limit as string) || 5;
      const sessions = await storage.getRecentWorkoutSessions(userId, limit);
      res.json(sessions);
    } catch (error) {
      handleError(res, error);
    }
  });

  app.get("/api/workout-sessions/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const session = await storage.getWorkoutSession(id);
      
      if (!session) {
        return res.status(404).json({ message: "Workout session not found" });
      }
      
      res.json(session);
    } catch (error) {
      handleError(res, error);
    }
  });

  app.post("/api/workout-sessions", async (req, res) => {
    try {
      // Create the workout session
      const sessionData = insertWorkoutSessionSchema.parse(req.body);
      const session = await storage.createWorkoutSession(sessionData);
      
      // If this is a start of an existing workout, create session exercises
      if (req.body.addExercises) {
        const workout = await storage.getWorkout(session.workoutId);
        if (workout) {
          for (const exercise of workout.exercises) {
            const sessionExercise = await storage.createSessionExercise({
              sessionId: session.id,
              exerciseId: exercise.exerciseId,
              completed: 0,
            });
            
            // Create empty sets for each exercise
            for (let i = 0; i < exercise.sets; i++) {
              await storage.createExerciseSet({
                sessionExerciseId: sessionExercise.id,
                setNumber: i + 1,
                completed: 0,
              });
            }
          }
        }
      }
      
      // Return the complete session with details
      const completeSession = await storage.getWorkoutSession(session.id);
      res.status(201).json(completeSession);
    } catch (error) {
      handleError(res, error);
    }
  });

  app.put("/api/workout-sessions/:id/complete", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const session = await storage.completeWorkoutSession(id);
      
      if (!session) {
        return res.status(404).json({ message: "Workout session not found" });
      }
      
      res.json(session);
    } catch (error) {
      handleError(res, error);
    }
  });

  app.put("/api/workout-sessions/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const sessionData = insertWorkoutSessionSchema.partial().parse(req.body);
      const session = await storage.updateWorkoutSession(id, sessionData);
      
      if (!session) {
        return res.status(404).json({ message: "Workout session not found" });
      }
      
      res.json(session);
    } catch (error) {
      handleError(res, error);
    }
  });

  app.delete("/api/workout-sessions/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteWorkoutSession(id);
      
      if (!success) {
        return res.status(404).json({ message: "Workout session not found" });
      }
      
      res.status(204).end();
    } catch (error) {
      handleError(res, error);
    }
  });

  // Session Exercise Routes
  app.put("/api/session-exercises/:id/complete", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const sessionExercise = await storage.completeSessionExercise(id);
      
      if (!sessionExercise) {
        return res.status(404).json({ message: "Session exercise not found" });
      }
      
      res.json(sessionExercise);
    } catch (error) {
      handleError(res, error);
    }
  });

  // Exercise Set Routes
  app.post("/api/exercise-sets", async (req, res) => {
    try {
      const setData = insertExerciseSetSchema.parse(req.body);
      const set = await storage.createExerciseSet(setData);
      res.status(201).json(set);
    } catch (error) {
      handleError(res, error);
    }
  });

  app.put("/api/exercise-sets/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const setData = insertExerciseSetSchema.partial().parse(req.body);
      const set = await storage.updateExerciseSet(id, setData);
      
      if (!set) {
        return res.status(404).json({ message: "Exercise set not found" });
      }
      
      res.json(set);
    } catch (error) {
      handleError(res, error);
    }
  });

  app.put("/api/exercise-sets/:id/complete", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const set = await storage.completeExerciseSet(id);
      
      if (!set) {
        return res.status(404).json({ message: "Exercise set not found" });
      }
      
      res.json(set);
    } catch (error) {
      handleError(res, error);
    }
  });

  // Stats Routes
  app.get("/api/stats/weekly-workouts", async (req, res) => {
    try {
      const userId = parseInt(req.query.userId as string) || 1;
      const stats = await storage.getWeeklyWorkouts(userId);
      res.json(stats);
    } catch (error) {
      handleError(res, error);
    }
  });

  app.get("/api/stats/total-weight", async (req, res) => {
    try {
      const userId = parseInt(req.query.userId as string) || 1;
      const days = parseInt(req.query.days as string) || 30;
      const weight = await storage.getTotalWeightLifted(userId, days);
      res.json({ weight });
    } catch (error) {
      handleError(res, error);
    }
  });

  app.get("/api/stats/weight-by-day", async (req, res) => {
    try {
      const userId = parseInt(req.query.userId as string) || 1;
      const days = parseInt(req.query.days as string) || 7;
      const data = await storage.getWeightLiftedByDay(userId, days);
      res.json(data);
    } catch (error) {
      handleError(res, error);
    }
  });

  app.get("/api/stats/personal-records", async (req, res) => {
    try {
      const userId = parseInt(req.query.userId as string) || 1;
      const limit = parseInt(req.query.limit as string) || 5;
      const records = await storage.getRecentPersonalRecords(userId, limit);
      res.json(records);
    } catch (error) {
      handleError(res, error);
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
