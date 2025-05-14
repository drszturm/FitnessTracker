import { pgTable, text, serial, integer, timestamp, real, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User schema (from existing schema)
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

// Exercise data
export const exerciseCategories = [
  "All",
  "Chest",
  "Back",
  "Legs",
  "Shoulders",
  "Arms",
  "Core",
  "Cardio",
] as const;

export type ExerciseCategory = typeof exerciseCategories[number];

export const exercises = pgTable("exercises", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  category: text("category").notNull(),
  targetMuscles: text("target_muscles"),
  equipmentType: text("equipment_type"),
  exerciseType: text("exercise_type"),
});

export const insertExerciseSchema = createInsertSchema(exercises).omit({
  id: true,
});

// Workout routines
export const workouts = pgTable("workouts", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  userId: integer("user_id").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  lastCompletedAt: timestamp("last_completed_at"),
});

export const insertWorkoutSchema = createInsertSchema(workouts).omit({
  id: true,
  createdAt: true,
  lastCompletedAt: true,
});

// Workout exercises (join table with additional data)
export const workoutExercises = pgTable("workout_exercises", {
  id: serial("id").primaryKey(),
  workoutId: integer("workout_id").notNull(),
  exerciseId: integer("exercise_id").notNull(),
  sets: integer("sets").notNull(),
  reps: text("reps").notNull(), // Represented as a string like "8-10" or "12"
  weight: text("weight"), // Optional, represented as string like "60" or "bodyweight"
  order: integer("order").notNull(), // Exercise order in workout
});

export const insertWorkoutExerciseSchema = createInsertSchema(workoutExercises).omit({
  id: true,
});

// Workout sessions (actual performed workouts)
export const workoutSessions = pgTable("workout_sessions", {
  id: serial("id").primaryKey(),
  workoutId: integer("workout_id").notNull(),
  userId: integer("user_id").notNull(),
  date: timestamp("date").defaultNow().notNull(),
  duration: integer("duration"), // Duration in minutes
  notes: text("notes"),
  completed: integer("completed").default(0).notNull(), // 0 = incomplete, 1 = completed
});

export const insertWorkoutSessionSchema = createInsertSchema(workoutSessions).omit({
  id: true,
});

// Workout session exercises (exercises performed in a session)
export const sessionExercises = pgTable("session_exercises", {
  id: serial("id").primaryKey(),
  sessionId: integer("session_id").notNull(),
  exerciseId: integer("exercise_id").notNull(),
  completed: integer("completed").default(0).notNull(), // 0 = incomplete, 1 = completed
});

export const insertSessionExerciseSchema = createInsertSchema(sessionExercises).omit({
  id: true,
});

// Sets performed during an exercise in a session
export const exerciseSets = pgTable("exercise_sets", {
  id: serial("id").primaryKey(),
  sessionExerciseId: integer("session_exercise_id").notNull(),
  setNumber: integer("set_number").notNull(),
  weight: real("weight"), // in kg
  reps: integer("reps"),
  completed: integer("completed").default(0).notNull(), // 0 = incomplete, 1 = completed
});

export const insertExerciseSetSchema = createInsertSchema(exerciseSets).omit({
  id: true,
});

// Personal records
export const personalRecords = pgTable("personal_records", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  exerciseId: integer("exercise_id").notNull(),
  weight: real("weight").notNull(), // in kg
  reps: integer("reps").notNull(),
  date: timestamp("date").defaultNow().notNull(),
});

export const insertPersonalRecordSchema = createInsertSchema(personalRecords).omit({
  id: true,
});

// Type Exports
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Exercise = typeof exercises.$inferSelect;
export type InsertExercise = z.infer<typeof insertExerciseSchema>;

export type Workout = typeof workouts.$inferSelect;
export type InsertWorkout = z.infer<typeof insertWorkoutSchema>;

export type WorkoutExercise = typeof workoutExercises.$inferSelect;
export type InsertWorkoutExercise = z.infer<typeof insertWorkoutExerciseSchema>;

export type WorkoutSession = typeof workoutSessions.$inferSelect;
export type InsertWorkoutSession = z.infer<typeof insertWorkoutSessionSchema>;

export type SessionExercise = typeof sessionExercises.$inferSelect;
export type InsertSessionExercise = z.infer<typeof insertSessionExerciseSchema>;

export type ExerciseSet = typeof exerciseSets.$inferSelect;
export type InsertExerciseSet = z.infer<typeof insertExerciseSetSchema>;

export type PersonalRecord = typeof personalRecords.$inferSelect;
export type InsertPersonalRecord = z.infer<typeof insertPersonalRecordSchema>;

// Enhanced Types for UI
export interface WorkoutWithExercises extends Workout {
  exercises: (WorkoutExercise & { exercise: Exercise })[];
}

export interface WorkoutSessionWithDetails extends WorkoutSession {
  workout: Workout;
  sessionExercises: (SessionExercise & { 
    exercise: Exercise;
    sets: ExerciseSet[];
  })[];
}
