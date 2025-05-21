import {
  User,
  InsertUser,
  Exercise,
  InsertExercise,
  Workout,
  InsertWorkout,
  WorkoutExercise,
  InsertWorkoutExercise,
  WorkoutSession,
  InsertWorkoutSession,
  SessionExercise,
  InsertSessionExercise,
  ExerciseSet,
  InsertExerciseSet,
  PersonalRecord,
  InsertPersonalRecord,
  WorkoutWithExercises,
  WorkoutSessionWithDetails,
  users,
  exercises,
  workouts,
  workoutExercises,
  workoutSessions,
  sessionExercises,
  exerciseSets,
  personalRecords,
  exerciseCategories,
} from "@shared/schema";
import { eq, and, gte, desc } from "drizzle-orm";
import { db } from "./db";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Exercise methods
  getExercises(): Promise<Exercise[]>;
  getExercisesByCategory(category: string): Promise<Exercise[]>;
  getExercise(id: number): Promise<Exercise | undefined>;
  createExercise(exercise: InsertExercise): Promise<Exercise>;
  updateExercise(id: number, exercise: Partial<InsertExercise>): Promise<Exercise | undefined>;
  deleteExercise(id: number): Promise<boolean>;

  // Workout methods
  getWorkouts(userId: number): Promise<WorkoutWithExercises[]>;
  getWorkout(id: number): Promise<WorkoutWithExercises | undefined>;
  createWorkout(workout: InsertWorkout): Promise<Workout>;
  updateWorkout(id: number, workout: Partial<InsertWorkout>): Promise<Workout | undefined>;
  deleteWorkout(id: number): Promise<boolean>;
  updateWorkoutLastCompleted(id: number, date: Date): Promise<Workout | undefined>;

  // Workout Exercise methods
  getWorkoutExercises(workoutId: number): Promise<(WorkoutExercise & { exercise: Exercise })[]>;
  createWorkoutExercise(workoutExercise: InsertWorkoutExercise): Promise<WorkoutExercise>;
  updateWorkoutExercise(id: number, workoutExercise: Partial<InsertWorkoutExercise>): Promise<WorkoutExercise | undefined>;
  deleteWorkoutExercise(id: number): Promise<boolean>;
  deleteWorkoutExercisesByWorkoutId(workoutId: number): Promise<boolean>;

  // Workout Session methods
  getWorkoutSessions(userId: number): Promise<WorkoutSession[]>;
  getWorkoutSessionsByWorkoutId(workoutId: number): Promise<WorkoutSession[]>;
  getWorkoutSession(id: number): Promise<WorkoutSessionWithDetails | undefined>;
  getRecentWorkoutSessions(userId: number, limit: number): Promise<(WorkoutSession & { workout: Workout })[]>;
  createWorkoutSession(session: InsertWorkoutSession): Promise<WorkoutSession>;
  updateWorkoutSession(id: number, session: Partial<InsertWorkoutSession>): Promise<WorkoutSession | undefined>;
  completeWorkoutSession(id: number): Promise<WorkoutSession | undefined>;
  deleteWorkoutSession(id: number): Promise<boolean>;

  // Session Exercise methods
  getSessionExercises(sessionId: number): Promise<(SessionExercise & { exercise: Exercise })[]>;
  createSessionExercise(sessionExercise: InsertSessionExercise): Promise<SessionExercise>;
  completeSessionExercise(id: number): Promise<SessionExercise | undefined>;
  deleteSessionExercise(id: number): Promise<boolean>;

  // Exercise Set methods
  getExerciseSets(sessionExerciseId: number): Promise<ExerciseSet[]>;
  createExerciseSet(set: InsertExerciseSet): Promise<ExerciseSet>;
  updateExerciseSet(id: number, set: Partial<InsertExerciseSet>): Promise<ExerciseSet | undefined>;
  completeExerciseSet(id: number): Promise<ExerciseSet | undefined>;
  deleteExerciseSet(id: number): Promise<boolean>;

  // Personal Record methods
  getPersonalRecords(userId: number): Promise<(PersonalRecord & { exercise: Exercise })[]>;
  getRecentPersonalRecords(userId: number, limit: number): Promise<(PersonalRecord & { exercise: Exercise })[]>;
  createPersonalRecord(record: InsertPersonalRecord): Promise<PersonalRecord>;
  deletePersonalRecord(id: number): Promise<boolean>;

  // Stats methods
  getWeeklyWorkouts(userId: number): Promise<{ count: number; goal: number; percentage: number }>;
  getTotalWeightLifted(userId: number, periodDays: number): Promise<number>;
  getWeightLiftedByDay(userId: number, days: number): Promise<{ day: string; weight: number }[]>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private exercises: Map<number, Exercise>;
  private workouts: Map<number, Workout>;
  private workoutExercises: Map<number, WorkoutExercise>;
  private workoutSessions: Map<number, WorkoutSession>;
  private sessionExercises: Map<number, SessionExercise>;
  private exerciseSets: Map<number, ExerciseSet>;
  private personalRecords: Map<number, PersonalRecord>;
  
  currentUserId: number;
  currentExerciseId: number;
  currentWorkoutId: number;
  currentWorkoutExerciseId: number;
  currentWorkoutSessionId: number;
  currentSessionExerciseId: number;
  currentExerciseSetId: number;
  currentPersonalRecordId: number;

  constructor() {
    this.users = new Map();
    this.exercises = new Map();
    this.workouts = new Map();
    this.workoutExercises = new Map();
    this.workoutSessions = new Map();
    this.sessionExercises = new Map();
    this.exerciseSets = new Map();
    this.personalRecords = new Map();
    
    this.currentUserId = 1;
    this.currentExerciseId = 1;
    this.currentWorkoutId = 1;
    this.currentWorkoutExerciseId = 1;
    this.currentWorkoutSessionId = 1;
    this.currentSessionExerciseId = 1;
    this.currentExerciseSetId = 1;
    this.currentPersonalRecordId = 1;
    
    // Initialize with sample exercises
    this.initializeExercises();
  }

  private initializeExercises() {
    const defaultExercises: InsertExercise[] = [
      {
        name: "Bench Press",
        description: "A compound exercise that targets the chest, shoulders, and triceps",
        category: "Chest",
        targetMuscles: "Chest, Triceps, Shoulders",
        equipmentType: "Barbell",
        exerciseType: "Strength",
      },
      {
        name: "Squat",
        description: "A compound lower body exercise that targets the quadriceps, hamstrings, and glutes",
        category: "Legs",
        targetMuscles: "Quadriceps, Hamstrings, Glutes",
        equipmentType: "Barbell",
        exerciseType: "Strength",
      },
      {
        name: "Deadlift",
        description: "A compound exercise that targets the lower back, glutes, and hamstrings",
        category: "Back",
        targetMuscles: "Lower Back, Glutes, Hamstrings",
        equipmentType: "Barbell",
        exerciseType: "Strength",
      },
      {
        name: "Pull-up",
        description: "A compound upper body exercise that targets the back and biceps",
        category: "Back",
        targetMuscles: "Lats, Biceps, Upper Back",
        equipmentType: "Bodyweight",
        exerciseType: "Strength",
      },
      {
        name: "Shoulder Press",
        description: "A compound upper body exercise that targets the shoulders and triceps",
        category: "Shoulders",
        targetMuscles: "Deltoids, Triceps",
        equipmentType: "Dumbbell",
        exerciseType: "Strength",
      },
      {
        name: "Leg Press",
        description: "A machine-based lower body exercise that targets the quadriceps, hamstrings, and glutes",
        category: "Legs",
        targetMuscles: "Quadriceps, Hamstrings, Glutes",
        equipmentType: "Machine",
        exerciseType: "Strength",
      },
    ];

    defaultExercises.forEach(exercise => {
      this.createExercise(exercise);
    });
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // Exercise methods
  async getExercises(): Promise<Exercise[]> {
    return Array.from(this.exercises.values());
  }

  async getExercisesByCategory(category: string): Promise<Exercise[]> {
    if (category === "All") {
      return this.getExercises();
    }
    return Array.from(this.exercises.values()).filter(
      (exercise) => exercise.category === category,
    );
  }

  async getExercise(id: number): Promise<Exercise | undefined> {
    return this.exercises.get(id);
  }

  async createExercise(insertExercise: InsertExercise): Promise<Exercise> {
    const id = this.currentExerciseId++;
    const exercise: Exercise = { ...insertExercise, id };
    this.exercises.set(id, exercise);
    return exercise;
  }

  async updateExercise(id: number, exercise: Partial<InsertExercise>): Promise<Exercise | undefined> {
    const existingExercise = this.exercises.get(id);
    if (!existingExercise) return undefined;
    
    const updatedExercise = { ...existingExercise, ...exercise };
    this.exercises.set(id, updatedExercise);
    return updatedExercise;
  }

  async deleteExercise(id: number): Promise<boolean> {
    return this.exercises.delete(id);
  }

  // Workout methods
  async getWorkouts(userId: number): Promise<WorkoutWithExercises[]> {
    const workouts = Array.from(this.workouts.values()).filter(
      (workout) => workout.userId === userId,
    );

    return Promise.all(
      workouts.map(async (workout) => {
        const exercises = await this.getWorkoutExercises(workout.id);
        return {
          ...workout,
          exercises,
        };
      }),
    );
  }

  async getWorkout(id: number): Promise<WorkoutWithExercises | undefined> {
    const workout = this.workouts.get(id);
    if (!workout) return undefined;
    
    const exercises = await this.getWorkoutExercises(id);
    return {
      ...workout,
      exercises,
    };
  }

  async createWorkout(insertWorkout: InsertWorkout): Promise<Workout> {
    const id = this.currentWorkoutId++;
    const workout: Workout = { 
      ...insertWorkout, 
      id, 
      createdAt: new Date(),
    };
    this.workouts.set(id, workout);
    return workout;
  }

  async updateWorkout(id: number, workout: Partial<InsertWorkout>): Promise<Workout | undefined> {
    const existingWorkout = this.workouts.get(id);
    if (!existingWorkout) return undefined;
    
    const updatedWorkout = { ...existingWorkout, ...workout };
    this.workouts.set(id, updatedWorkout);
    return updatedWorkout;
  }

  async deleteWorkout(id: number): Promise<boolean> {
    // Delete all associated workout exercises first
    await this.deleteWorkoutExercisesByWorkoutId(id);
    return this.workouts.delete(id);
  }

  async updateWorkoutLastCompleted(id: number, date: Date): Promise<Workout | undefined> {
    const workout = this.workouts.get(id);
    if (!workout) return undefined;
    
    const updatedWorkout = { ...workout, lastCompletedAt: date };
    this.workouts.set(id, updatedWorkout);
    return updatedWorkout;
  }

  // Workout Exercise methods
  async getWorkoutExercises(workoutId: number): Promise<(WorkoutExercise & { exercise: Exercise })[]> {
    const workoutExercises = Array.from(this.workoutExercises.values())
      .filter((we) => we.workoutId === workoutId)
      .sort((a, b) => a.order - b.order);
    
    return Promise.all(
      workoutExercises.map(async (we) => {
        const exercise = await this.getExercise(we.exerciseId);
        return {
          ...we,
          exercise: exercise!,
        };
      }),
    );
  }

  async createWorkoutExercise(insertWorkoutExercise: InsertWorkoutExercise): Promise<WorkoutExercise> {
    const id = this.currentWorkoutExerciseId++;
    const workoutExercise: WorkoutExercise = { ...insertWorkoutExercise, id };
    this.workoutExercises.set(id, workoutExercise);
    return workoutExercise;
  }

  async updateWorkoutExercise(id: number, workoutExercise: Partial<InsertWorkoutExercise>): Promise<WorkoutExercise | undefined> {
    const existingWorkoutExercise = this.workoutExercises.get(id);
    if (!existingWorkoutExercise) return undefined;
    
    const updatedWorkoutExercise = { ...existingWorkoutExercise, ...workoutExercise };
    this.workoutExercises.set(id, updatedWorkoutExercise);
    return updatedWorkoutExercise;
  }

  async deleteWorkoutExercise(id: number): Promise<boolean> {
    return this.workoutExercises.delete(id);
  }

  async deleteWorkoutExercisesByWorkoutId(workoutId: number): Promise<boolean> {
    const workoutExercisesToDelete = Array.from(this.workoutExercises.values())
      .filter((we) => we.workoutId === workoutId);
    
    workoutExercisesToDelete.forEach((we) => {
      this.workoutExercises.delete(we.id);
    });
    
    return true;
  }

  // Workout Session methods
  async getWorkoutSessions(userId: number): Promise<WorkoutSession[]> {
    return Array.from(this.workoutSessions.values())
      .filter((session) => session.userId === userId)
      .sort((a, b) => b.date.getTime() - a.date.getTime());
  }

  async getWorkoutSessionsByWorkoutId(workoutId: number): Promise<WorkoutSession[]> {
    return Array.from(this.workoutSessions.values())
      .filter((session) => session.workoutId === workoutId)
      .sort((a, b) => b.date.getTime() - a.date.getTime());
  }

  async getWorkoutSession(id: number): Promise<WorkoutSessionWithDetails | undefined> {
    const session = this.workoutSessions.get(id);
    if (!session) return undefined;
    
    const workout = this.workouts.get(session.workoutId);
    if (!workout) return undefined;
    
    const sessionExercises = await this.getSessionExercises(id);
    
    const sessionExercisesWithSets = await Promise.all(
      sessionExercises.map(async (se) => {
        const sets = await this.getExerciseSets(se.id);
        return {
          ...se,
          sets,
        };
      }),
    );
    
    return {
      ...session,
      workout,
      sessionExercises: sessionExercisesWithSets,
    };
  }

  async getRecentWorkoutSessions(userId: number, limit: number): Promise<(WorkoutSession & { workout: Workout })[]> {
    const sessions = Array.from(this.workoutSessions.values())
      .filter((session) => session.userId === userId)
      .sort((a, b) => b.date.getTime() - a.date.getTime())
      .slice(0, limit);
    
    return Promise.all(
      sessions.map(async (session) => {
        const workout = this.workouts.get(session.workoutId);
        return {
          ...session,
          workout: workout!,
        };
      }),
    );
  }

  async createWorkoutSession(insertSession: InsertWorkoutSession): Promise<WorkoutSession> {
    const id = this.currentWorkoutSessionId++;
    const session: WorkoutSession = { ...insertSession, id };
    this.workoutSessions.set(id, session);
    
    // Update the last completed date for the workout
    if (session.completed) {
      await this.updateWorkoutLastCompleted(session.workoutId, session.date);
    }
    
    return session;
  }

  async updateWorkoutSession(id: number, session: Partial<InsertWorkoutSession>): Promise<WorkoutSession | undefined> {
    const existingSession = this.workoutSessions.get(id);
    if (!existingSession) return undefined;
    
    const updatedSession = { ...existingSession, ...session };
    this.workoutSessions.set(id, updatedSession);
    return updatedSession;
  }

  async completeWorkoutSession(id: number): Promise<WorkoutSession | undefined> {
    const session = this.workoutSessions.get(id);
    if (!session) return undefined;
    
    const updatedSession = { ...session, completed: 1 };
    this.workoutSessions.set(id, updatedSession);
    
    // Update the last completed date for the workout
    await this.updateWorkoutLastCompleted(session.workoutId, session.date);
    
    return updatedSession;
  }

  async deleteWorkoutSession(id: number): Promise<boolean> {
    return this.workoutSessions.delete(id);
  }

  // Session Exercise methods
  async getSessionExercises(sessionId: number): Promise<(SessionExercise & { exercise: Exercise })[]> {
    const sessionExercises = Array.from(this.sessionExercises.values())
      .filter((se) => se.sessionId === sessionId);
    
    return Promise.all(
      sessionExercises.map(async (se) => {
        const exercise = await this.getExercise(se.exerciseId);
        return {
          ...se,
          exercise: exercise!,
        };
      }),
    );
  }

  async createSessionExercise(insertSessionExercise: InsertSessionExercise): Promise<SessionExercise> {
    const id = this.currentSessionExerciseId++;
    const sessionExercise: SessionExercise = { ...insertSessionExercise, id };
    this.sessionExercises.set(id, sessionExercise);
    return sessionExercise;
  }

  async completeSessionExercise(id: number): Promise<SessionExercise | undefined> {
    const sessionExercise = this.sessionExercises.get(id);
    if (!sessionExercise) return undefined;
    
    const updatedSessionExercise = { ...sessionExercise, completed: 1 };
    this.sessionExercises.set(id, updatedSessionExercise);
    return updatedSessionExercise;
  }

  async deleteSessionExercise(id: number): Promise<boolean> {
    return this.sessionExercises.delete(id);
  }

  // Exercise Set methods
  async getExerciseSets(sessionExerciseId: number): Promise<ExerciseSet[]> {
    return Array.from(this.exerciseSets.values())
      .filter((set) => set.sessionExerciseId === sessionExerciseId)
      .sort((a, b) => a.setNumber - b.setNumber);
  }

  async createExerciseSet(insertSet: InsertExerciseSet): Promise<ExerciseSet> {
    const id = this.currentExerciseSetId++;
    const set: ExerciseSet = { ...insertSet, id };
    this.exerciseSets.set(id, set);
    return set;
  }

  async updateExerciseSet(id: number, set: Partial<InsertExerciseSet>): Promise<ExerciseSet | undefined> {
    const existingSet = this.exerciseSets.get(id);
    if (!existingSet) return undefined;
    
    const updatedSet = { ...existingSet, ...set };
    this.exerciseSets.set(id, updatedSet);
    return updatedSet;
  }

  async completeExerciseSet(id: number): Promise<ExerciseSet | undefined> {
    const set = this.exerciseSets.get(id);
    if (!set) return undefined;
    
    const updatedSet = { ...set, completed: 1 };
    this.exerciseSets.set(id, updatedSet);
    
    // Check if this is a personal record
    const sessionExercise = this.sessionExercises.get(set.sessionExerciseId);
    if (sessionExercise && set.weight && set.reps) {
      const existingRecords = Array.from(this.personalRecords.values()).filter(
        (record) => 
          record.exerciseId === sessionExercise.exerciseId && 
          record.weight <= set.weight! && 
          record.reps <= set.reps!
      );
      
      if (existingRecords.length === 0) {
        // Get the session to get the user ID
        const sessions = Array.from(this.workoutSessions.values()).filter(
          (session) => Array.from(this.sessionExercises.values()).some(
            (se) => se.id === set.sessionExerciseId && se.sessionId === session.id
          )
        );
        
        if (sessions.length > 0) {
          await this.createPersonalRecord({
            userId: sessions[0].userId,
            exerciseId: sessionExercise.exerciseId,
            weight: set.weight,
            reps: set.reps,
            date: new Date(),
          });
        }
      }
    }
    
    return updatedSet;
  }

  async deleteExerciseSet(id: number): Promise<boolean> {
    return this.exerciseSets.delete(id);
  }

  // Personal Record methods
  async getPersonalRecords(userId: number): Promise<(PersonalRecord & { exercise: Exercise })[]> {
    const records = Array.from(this.personalRecords.values())
      .filter((record) => record.userId === userId)
      .sort((a, b) => b.date.getTime() - a.date.getTime());
    
    return Promise.all(
      records.map(async (record) => {
        const exercise = await this.getExercise(record.exerciseId);
        return {
          ...record,
          exercise: exercise!,
        };
      }),
    );
  }

  async getRecentPersonalRecords(userId: number, limit: number): Promise<(PersonalRecord & { exercise: Exercise })[]> {
    const records = Array.from(this.personalRecords.values())
      .filter((record) => record.userId === userId)
      .sort((a, b) => b.date.getTime() - a.date.getTime())
      .slice(0, limit);
    
    return Promise.all(
      records.map(async (record) => {
        const exercise = await this.getExercise(record.exerciseId);
        return {
          ...record,
          exercise: exercise!,
        };
      }),
    );
  }

  async createPersonalRecord(insertRecord: InsertPersonalRecord): Promise<PersonalRecord> {
    const id = this.currentPersonalRecordId++;
    const record: PersonalRecord = { ...insertRecord, id };
    this.personalRecords.set(id, record);
    return record;
  }

  async deletePersonalRecord(id: number): Promise<boolean> {
    return this.personalRecords.delete(id);
  }

  // Stats methods
  async getWeeklyWorkouts(userId: number): Promise<{ count: number; goal: number; percentage: number }> {
    const now = new Date();
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - now.getDay());
    weekStart.setHours(0, 0, 0, 0);
    
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 7);
    
    const weekSessions = Array.from(this.workoutSessions.values()).filter(
      (session) => 
        session.userId === userId && 
        session.date >= weekStart && 
        session.date < weekEnd &&
        session.completed === 1
    );
    
    const count = weekSessions.length;
    const goal = 5; // Default goal is 5 workouts per week
    const percentage = Math.min(Math.round((count / goal) * 100), 100);
    
    return { count, goal, percentage };
  }

  async getTotalWeightLifted(userId: number, periodDays: number): Promise<number> {
    const now = new Date();
    const startDate = new Date(now);
    startDate.setDate(now.getDate() - periodDays);
    
    // Get all completed workout sessions in the period
    const sessions = Array.from(this.workoutSessions.values()).filter(
      (session) => 
        session.userId === userId && 
        session.date >= startDate && 
        session.date <= now &&
        session.completed === 1
    );
    
    let totalWeight = 0;
    
    for (const session of sessions) {
      const sessionExercises = Array.from(this.sessionExercises.values()).filter(
        (se) => se.sessionId === session.id && se.completed === 1
      );
      
      for (const se of sessionExercises) {
        const sets = Array.from(this.exerciseSets.values()).filter(
          (set) => set.sessionExerciseId === se.id && set.completed === 1
        );
        
        for (const set of sets) {
          if (set.weight && set.reps) {
            totalWeight += set.weight * set.reps;
          }
        }
      }
    }
    
    return totalWeight;
  }

  async getWeightLiftedByDay(userId: number, days: number): Promise<{ day: string; weight: number }[]> {
    const result: { day: string; weight: number }[] = [];
    const now = new Date();
    
    // Initialize with zero values for all days
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(now.getDate() - i);
      const dayLetter = ['S', 'M', 'T', 'W', 'T', 'F', 'S'][date.getDay()];
      result.push({ day: dayLetter, weight: 0 });
    }
    
    // Get all completed workout sessions in the period
    const startDate = new Date(now);
    startDate.setDate(now.getDate() - (days - 1));
    startDate.setHours(0, 0, 0, 0);
    
    const sessions = Array.from(this.workoutSessions.values()).filter(
      (session) => 
        session.userId === userId && 
        session.date >= startDate && 
        session.date <= now &&
        session.completed === 1
    );
    
    for (const session of sessions) {
      const dayIndex = Math.floor((now.getTime() - session.date.getTime()) / (1000 * 60 * 60 * 24));
      if (dayIndex >= 0 && dayIndex < days) {
        const sessionExercises = Array.from(this.sessionExercises.values()).filter(
          (se) => se.sessionId === session.id && se.completed === 1
        );
        
        for (const se of sessionExercises) {
          const sets = Array.from(this.exerciseSets.values()).filter(
            (set) => set.sessionExerciseId === se.id && set.completed === 1
          );
          
          for (const set of sets) {
            if (set.weight && set.reps) {
              result[days - 1 - dayIndex].weight += set.weight * set.reps;
            }
          }
        }
      }
    }
    
    return result;
  }
}

export class DatabaseStorage implements IStorage {
  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  // Exercise methods
  async getExercises(): Promise<Exercise[]> {
    return await db.select().from(exercises);
  }

  async getExercisesByCategory(category: string): Promise<Exercise[]> {
    if (category === "All") {
      return this.getExercises();
    }
    return await db.select().from(exercises).where(eq(exercises.category, category));
  }

  async getExercise(id: number): Promise<Exercise | undefined> {
    const [exercise] = await db.select().from(exercises).where(eq(exercises.id, id));
    return exercise || undefined;
  }

  async createExercise(insertExercise: InsertExercise): Promise<Exercise> {
    const exerciseToInsert = {
      ...insertExercise,
      description: insertExercise.description || null,
      targetMuscles: insertExercise.targetMuscles || null,
      equipmentType: insertExercise.equipmentType || null,
      exerciseType: insertExercise.exerciseType || null
    };
    
    const [exercise] = await db
      .insert(exercises)
      .values(exerciseToInsert)
      .returning();
    return exercise;
  }

  async updateExercise(id: number, exercise: Partial<InsertExercise>): Promise<Exercise | undefined> {
    const [updatedExercise] = await db
      .update(exercises)
      .set(exercise)
      .where(eq(exercises.id, id))
      .returning();
    return updatedExercise || undefined;
  }

  async deleteExercise(id: number): Promise<boolean> {
    const result = await db
      .delete(exercises)
      .where(eq(exercises.id, id));
    return !!result;
  }

  // Workout methods
  async getWorkouts(userId: number): Promise<WorkoutWithExercises[]> {
    const userWorkouts = await db
      .select()
      .from(workouts)
      .where(eq(workouts.userId, userId));
    
    return Promise.all(
      userWorkouts.map(async (workout) => {
        const exercises = await this.getWorkoutExercises(workout.id);
        return {
          ...workout,
          exercises,
        };
      }),
    );
  }

  async getWorkout(id: number): Promise<WorkoutWithExercises | undefined> {
    const [workout] = await db
      .select()
      .from(workouts)
      .where(eq(workouts.id, id));
    
    if (!workout) return undefined;
    
    const exercises = await this.getWorkoutExercises(id);
    return {
      ...workout,
      exercises,
    };
  }

  async createWorkout(insertWorkout: InsertWorkout): Promise<Workout> {
    const [workout] = await db
      .insert(workouts)
      .values({
        ...insertWorkout,
        createdAt: new Date(),
        lastCompletedAt: null
      })
      .returning();
    return workout;
  }

  async updateWorkout(id: number, workout: Partial<InsertWorkout>): Promise<Workout | undefined> {
    const [updatedWorkout] = await db
      .update(workouts)
      .set(workout)
      .where(eq(workouts.id, id))
      .returning();
    return updatedWorkout || undefined;
  }

  async deleteWorkout(id: number): Promise<boolean> {
    // Delete all associated workout exercises first
    await this.deleteWorkoutExercisesByWorkoutId(id);
    
    const result = await db
      .delete(workouts)
      .where(eq(workouts.id, id));
    return !!result;
  }

  async updateWorkoutLastCompleted(id: number, date: Date): Promise<Workout | undefined> {
    const [updatedWorkout] = await db
      .update(workouts)
      .set({ lastCompletedAt: date })
      .where(eq(workouts.id, id))
      .returning();
    return updatedWorkout || undefined;
  }

  // Workout Exercise methods
  async getWorkoutExercises(workoutId: number): Promise<(WorkoutExercise & { exercise: Exercise })[]> {
    const workoutExercisesData = await db
      .select()
      .from(workoutExercises)
      .where(eq(workoutExercises.workoutId, workoutId))
      .orderBy(workoutExercises.order);
    
    return Promise.all(
      workoutExercisesData.map(async (we) => {
        const exercise = await this.getExercise(we.exerciseId);
        return {
          ...we,
          exercise: exercise!,
        };
      }),
    );
  }

  async createWorkoutExercise(insertWorkoutExercise: InsertWorkoutExercise): Promise<WorkoutExercise> {
    const workoutExerciseToInsert = {
      ...insertWorkoutExercise,
      weight: insertWorkoutExercise.weight || null
    };
    
    const [workoutExercise] = await db
      .insert(workoutExercises)
      .values(workoutExerciseToInsert)
      .returning();
    return workoutExercise;
  }

  async updateWorkoutExercise(id: number, workoutExercise: Partial<InsertWorkoutExercise>): Promise<WorkoutExercise | undefined> {
    const [updatedWorkoutExercise] = await db
      .update(workoutExercises)
      .set(workoutExercise)
      .where(eq(workoutExercises.id, id))
      .returning();
    return updatedWorkoutExercise || undefined;
  }

  async deleteWorkoutExercise(id: number): Promise<boolean> {
    const result = await db
      .delete(workoutExercises)
      .where(eq(workoutExercises.id, id));
    return !!result;
  }

  async deleteWorkoutExercisesByWorkoutId(workoutId: number): Promise<boolean> {
    const result = await db
      .delete(workoutExercises)
      .where(eq(workoutExercises.workoutId, workoutId));
    return true;
  }

  // Workout Session methods
  async getWorkoutSessions(userId: number): Promise<WorkoutSession[]> {
    return await db
      .select()
      .from(workoutSessions)
      .where(eq(workoutSessions.userId, userId))
      .orderBy(desc(workoutSessions.date));
  }

  async getWorkoutSessionsByWorkoutId(workoutId: number): Promise<WorkoutSession[]> {
    return await db
      .select()
      .from(workoutSessions)
      .where(eq(workoutSessions.workoutId, workoutId))
      .orderBy(desc(workoutSessions.date));
  }

  async getWorkoutSession(id: number): Promise<WorkoutSessionWithDetails | undefined> {
    const [session] = await db
      .select()
      .from(workoutSessions)
      .where(eq(workoutSessions.id, id));
    
    if (!session) return undefined;
    
    const [workout] = await db
      .select()
      .from(workouts)
      .where(eq(workouts.id, session.workoutId));
    
    if (!workout) return undefined;
    
    const sessionExercises = await this.getSessionExercises(id);
    
    const sessionExercisesWithSets = await Promise.all(
      sessionExercises.map(async (se) => {
        const sets = await this.getExerciseSets(se.id);
        return {
          ...se,
          sets,
        };
      }),
    );
    
    return {
      ...session,
      workout,
      sessionExercises: sessionExercisesWithSets,
    };
  }

  async getRecentWorkoutSessions(userId: number, limit: number): Promise<(WorkoutSession & { workout: Workout })[]> {
    const sessions = await db
      .select()
      .from(workoutSessions)
      .where(eq(workoutSessions.userId, userId))
      .orderBy(desc(workoutSessions.date))
      .limit(limit);
    
    return Promise.all(
      sessions.map(async (session) => {
        const [workout] = await db
          .select()
          .from(workouts)
          .where(eq(workouts.id, session.workoutId));
        
        return {
          ...session,
          workout: workout!,
        };
      }),
    );
  }

  async createWorkoutSession(insertSession: InsertWorkoutSession): Promise<WorkoutSession> {
    // Ensure all required fields are present
    const sessionToInsert = {
      ...insertSession,
      date: insertSession.date || new Date(),
      duration: insertSession.duration || null,
      notes: insertSession.notes || null,
      completed: insertSession.completed || 0
    };
    
    const [session] = await db
      .insert(workoutSessions)
      .values(sessionToInsert)
      .returning();
    
    // Update the last completed date for the workout
    if (session.completed) {
      await this.updateWorkoutLastCompleted(session.workoutId, session.date);
    }
    
    return session;
  }

  async updateWorkoutSession(id: number, session: Partial<InsertWorkoutSession>): Promise<WorkoutSession | undefined> {
    const [updatedSession] = await db
      .update(workoutSessions)
      .set(session)
      .where(eq(workoutSessions.id, id))
      .returning();
    return updatedSession || undefined;
  }

  async completeWorkoutSession(id: number): Promise<WorkoutSession | undefined> {
    const [session] = await db
      .update(workoutSessions)
      .set({ completed: 1 })
      .where(eq(workoutSessions.id, id))
      .returning();
    
    if (!session) return undefined;
    
    // Update the last completed date for the workout
    await this.updateWorkoutLastCompleted(session.workoutId, session.date);
    
    return session;
  }

  async deleteWorkoutSession(id: number): Promise<boolean> {
    const result = await db
      .delete(workoutSessions)
      .where(eq(workoutSessions.id, id));
    return !!result;
  }

  // Session Exercise methods
  async getSessionExercises(sessionId: number): Promise<(SessionExercise & { exercise: Exercise })[]> {
    const sessionExercisesData = await db
      .select()
      .from(sessionExercises)
      .where(eq(sessionExercises.sessionId, sessionId));
    
    return Promise.all(
      sessionExercisesData.map(async (se) => {
        const exercise = await this.getExercise(se.exerciseId);
        return {
          ...se,
          exercise: exercise!,
        };
      }),
    );
  }

  async createSessionExercise(insertSessionExercise: InsertSessionExercise): Promise<SessionExercise> {
    // Ensure required fields
    const sessionExerciseToInsert = {
      ...insertSessionExercise,
      completed: insertSessionExercise.completed || 0
    };
    
    const [sessionExercise] = await db
      .insert(sessionExercises)
      .values(sessionExerciseToInsert)
      .returning();
    return sessionExercise;
  }

  async completeSessionExercise(id: number): Promise<SessionExercise | undefined> {
    const [sessionExercise] = await db
      .update(sessionExercises)
      .set({ completed: 1 })
      .where(eq(sessionExercises.id, id))
      .returning();
    return sessionExercise || undefined;
  }

  async deleteSessionExercise(id: number): Promise<boolean> {
    const result = await db
      .delete(sessionExercises)
      .where(eq(sessionExercises.id, id));
    return !!result;
  }

  // Exercise Set methods
  async getExerciseSets(sessionExerciseId: number): Promise<ExerciseSet[]> {
    return await db
      .select()
      .from(exerciseSets)
      .where(eq(exerciseSets.sessionExerciseId, sessionExerciseId))
      .orderBy(exerciseSets.setNumber);
  }

  async createExerciseSet(insertSet: InsertExerciseSet): Promise<ExerciseSet> {
    // Ensure required fields
    const setToInsert = {
      ...insertSet,
      weight: insertSet.weight || null,
      reps: insertSet.reps || null,
      completed: insertSet.completed || 0
    };
    
    const [set] = await db
      .insert(exerciseSets)
      .values(setToInsert)
      .returning();
    return set;
  }

  async updateExerciseSet(id: number, set: Partial<InsertExerciseSet>): Promise<ExerciseSet | undefined> {
    const [updatedSet] = await db
      .update(exerciseSets)
      .set(set)
      .where(eq(exerciseSets.id, id))
      .returning();
    return updatedSet || undefined;
  }

  async completeExerciseSet(id: number): Promise<ExerciseSet | undefined> {
    const [set] = await db
      .update(exerciseSets)
      .set({ completed: 1 })
      .where(eq(exerciseSets.id, id))
      .returning();
    
    if (!set) return undefined;
    
    // Check if this set is a new personal record
    if (set.weight && set.reps) {
      const [sessionExercise] = await db
        .select()
        .from(sessionExercises)
        .where(eq(sessionExercises.id, set.sessionExerciseId));
      
      if (sessionExercise) {
        // Get the workout session to determine the user ID
        const [session] = await db
          .select()
          .from(workoutSessions)
          .where(eq(workoutSessions.id, sessionExercise.sessionId));
        
        if (session) {
          // Check existing personal records for this user and exercise
          const existingRecords = await db
            .select()
            .from(personalRecords)
            .where(
              and(
                eq(personalRecords.userId, session.userId),
                eq(personalRecords.exerciseId, sessionExercise.exerciseId)
              )
            );
          
          // Check if this is a new record (higher weight or same weight with more reps)
          const isNewRecord = !existingRecords.some((record) => 
            (record.weight > set.weight!) || 
            (record.weight === set.weight! && record.reps >= set.reps!)
          );
          
          if (isNewRecord) {
            await this.createPersonalRecord({
              userId: session.userId,
              exerciseId: sessionExercise.exerciseId,
              weight: set.weight,
              reps: set.reps,
              date: new Date(),
            });
          }
        }
      }
    }
    
    return set;
  }

  async deleteExerciseSet(id: number): Promise<boolean> {
    const result = await db
      .delete(exerciseSets)
      .where(eq(exerciseSets.id, id));
    return !!result;
  }

  // Personal Record methods
  async getPersonalRecords(userId: number): Promise<(PersonalRecord & { exercise: Exercise })[]> {
    const records = await db
      .select()
      .from(personalRecords)
      .where(eq(personalRecords.userId, userId))
      .orderBy(desc(personalRecords.date));
    
    return Promise.all(
      records.map(async (record) => {
        const exercise = await this.getExercise(record.exerciseId);
        return {
          ...record,
          exercise: exercise!,
        };
      }),
    );
  }

  async getRecentPersonalRecords(userId: number, limit: number): Promise<(PersonalRecord & { exercise: Exercise })[]> {
    const records = await db
      .select()
      .from(personalRecords)
      .where(eq(personalRecords.userId, userId))
      .orderBy(desc(personalRecords.date))
      .limit(limit);
    
    return Promise.all(
      records.map(async (record) => {
        const exercise = await this.getExercise(record.exerciseId);
        return {
          ...record,
          exercise: exercise!,
        };
      }),
    );
  }

  async createPersonalRecord(insertRecord: InsertPersonalRecord): Promise<PersonalRecord> {
    // Ensure date is present
    const recordToInsert = {
      ...insertRecord,
      date: insertRecord.date || new Date()
    };
    
    const [record] = await db
      .insert(personalRecords)
      .values(recordToInsert)
      .returning();
    return record;
  }

  async deletePersonalRecord(id: number): Promise<boolean> {
    const result = await db
      .delete(personalRecords)
      .where(eq(personalRecords.id, id));
    return !!result;
  }

  // Stats methods
  async getWeeklyWorkouts(userId: number): Promise<{ count: number; goal: number; percentage: number }> {
    const now = new Date();
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - now.getDay()); // Start of the week (Sunday)
    weekStart.setHours(0, 0, 0, 0);
    
    const completedWorkouts = await db
      .select()
      .from(workoutSessions)
      .where(
        and(
          eq(workoutSessions.userId, userId),
          eq(workoutSessions.completed, 1),
          gte(workoutSessions.date, weekStart)
        )
      );
    
    const count = completedWorkouts.length;
    const goal = 5; // Default goal is 5 workouts per week
    const percentage = Math.min(Math.round((count / goal) * 100), 100);
    
    return { count, goal, percentage };
  }

  async getTotalWeightLifted(userId: number, periodDays: number): Promise<number> {
    const now = new Date();
    const periodStart = new Date(now);
    periodStart.setDate(now.getDate() - periodDays);
    
    // Get all workout sessions for the user in the period
    const sessions = await db
      .select()
      .from(workoutSessions)
      .where(
        and(
          eq(workoutSessions.userId, userId),
          gte(workoutSessions.date, periodStart)
        )
      );
    
    let totalWeight = 0;
    
    for (const session of sessions) {
      // Get all session exercises
      const sessionExercisesData = await db
        .select()
        .from(sessionExercises)
        .where(eq(sessionExercises.sessionId, session.id));
      
      for (const sessionExercise of sessionExercisesData) {
        // Get all completed sets for this exercise
        const sets = await db
          .select()
          .from(exerciseSets)
          .where(
            and(
              eq(exerciseSets.sessionExerciseId, sessionExercise.id),
              eq(exerciseSets.completed, 1)
            )
          );
        
        // Sum up weight × reps for each completed set
        for (const set of sets) {
          if (set.weight && set.reps) {
            totalWeight += set.weight * set.reps;
          }
        }
      }
    }
    
    return totalWeight;
  }

  async getWeightLiftedByDay(userId: number, days: number): Promise<{ day: string; weight: number }[]> {
    const now = new Date();
    const result: { day: string; weight: number }[] = [];
    
    // Initialize the results array with zero weights for each day
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(now.getDate() - i);
      const day = date.toLocaleDateString('en-US', { weekday: 'short' }).charAt(0);
      
      result.push({
        day,
        weight: 0,
      });
    }
    
    // Get all workout sessions for the user in the period
    const periodStart = new Date(now);
    periodStart.setDate(now.getDate() - (days - 1));
    periodStart.setHours(0, 0, 0, 0);
    
    const sessions = await db
      .select()
      .from(workoutSessions)
      .where(
        and(
          eq(workoutSessions.userId, userId),
          gte(workoutSessions.date, periodStart)
        )
      );
    
    for (const session of sessions) {
      const sessionDate = new Date(session.date);
      const dayDiff = Math.floor((now.getTime() - sessionDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (dayDiff < days) {
        // Get all session exercises
        const sessionExercisesData = await db
          .select()
          .from(sessionExercises)
          .where(eq(sessionExercises.sessionId, session.id));
        
        let dailyWeight = 0;
        
        for (const sessionExercise of sessionExercisesData) {
          // Get all completed sets for this exercise
          const sets = await db
            .select()
            .from(exerciseSets)
            .where(
              and(
                eq(exerciseSets.sessionExerciseId, sessionExercise.id),
                eq(exerciseSets.completed, 1)
              )
            );
          
          // Sum up weight × reps for each completed set
          for (const set of sets) {
            if (set.weight && set.reps) {
              dailyWeight += set.weight * set.reps;
            }
          }
        }
        
        // Add this weight to the appropriate day
        result[days - 1 - dayDiff].weight += dailyWeight;
      }
    }
    
    return result;
  }
}

// Initialize with default exercises if needed
async function initializeDefaultExercises() {
  const existingExercises = await db.select().from(exercises);
  
  if (existingExercises.length === 0) {
    const defaultExercises: InsertExercise[] = [
      {
        name: "Bench Press",
        description: "A compound exercise that targets the chest, shoulders, and triceps",
        category: "Chest",
        targetMuscles: "Chest, Triceps, Shoulders",
        equipmentType: "Barbell",
        exerciseType: "Strength",
      },
      {
        name: "Squat",
        description: "A compound lower body exercise that targets the quadriceps, hamstrings, and glutes",
        category: "Legs",
        targetMuscles: "Quadriceps, Hamstrings, Glutes",
        equipmentType: "Barbell",
        exerciseType: "Strength",
      },
      {
        name: "Deadlift",
        description: "A compound exercise that targets the lower back, glutes, and hamstrings",
        category: "Back",
        targetMuscles: "Lower Back, Glutes, Hamstrings",
        equipmentType: "Barbell",
        exerciseType: "Strength",
      },
      {
        name: "Pull-up",
        description: "A compound upper body exercise that targets the back and biceps",
        category: "Back",
        targetMuscles: "Lats, Biceps, Upper Back",
        equipmentType: "Bodyweight",
        exerciseType: "Strength",
      },
      {
        name: "Shoulder Press",
        description: "A compound upper body exercise that targets the shoulders and triceps",
        category: "Shoulders",
        targetMuscles: "Deltoids, Triceps",
        equipmentType: "Dumbbell",
        exerciseType: "Strength",
      },
      {
        name: "Leg Press",
        description: "A machine-based lower body exercise that targets the quadriceps, hamstrings, and glutes",
        category: "Legs",
        targetMuscles: "Quadriceps, Hamstrings, Glutes",
        equipmentType: "Machine",
        exerciseType: "Strength",
      },
    ];

    for (const exercise of defaultExercises) {
      await db.insert(exercises).values(exercise);
    }
  }
}

// Create the database storage instance
export const storage = new DatabaseStorage();

// Initialize default exercises
initializeDefaultExercises().catch(console.error);
