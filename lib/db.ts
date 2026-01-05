import Dexie, { Table } from "dexie";
import { Workout, Exercise, Set, WorkoutType, WorkoutWithDetails, DEFAULT_EXERCISES } from "./types";

interface GoogleToken {
  id: string;
  refresh_token: string;
  created_at: number;
}

class RhinoGainsDB extends Dexie {
  workouts!: Table<Workout>;
  exercises!: Table<Exercise>;
  sets!: Table<Set>;
  googleTokens!: Table<GoogleToken>;

  constructor() {
    super("RhinoGainsDB");
    this.version(1).stores({
      workouts: "id, workout_type, started_at, finished_at",
      exercises: "id, workout_id, name",
      sets: "id, exercise_id, weight, reps",
    });
    this.version(2).stores({
      workouts: "id, workout_type, started_at, finished_at, calendar_event_id",
      exercises: "id, workout_id, name",
      sets: "id, exercise_id, weight, reps",
      googleTokens: "id, refresh_token, created_at",
    });
    this.version(3).stores({
      workouts: "id, workout_type, started_at, finished_at, calendar_event_id",
      exercises: "id, workout_id, name",
      sets: "id, exercise_id, weight, reps, order",
      googleTokens: "id, refresh_token, created_at",
    }).upgrade(async (tx) => {
      // Migration: Add order field to existing sets
      // Group sets by exercise_id and assign sequential order
      const allSets = await tx.table("sets").toCollection().toArray();
      const setsByExercise = new Map<string, Set[]>();
      
      // Group sets by exercise_id
      for (const set of allSets) {
        if (!setsByExercise.has(set.exercise_id)) {
          setsByExercise.set(set.exercise_id, []);
        }
        setsByExercise.get(set.exercise_id)!.push(set);
      }
      
      // Assign order to each set within its exercise
      for (const [exerciseId, sets] of setsByExercise.entries()) {
        for (let i = 0; i < sets.length; i++) {
          const set = sets[i];
          if (set.order === undefined) {
            await tx.table("sets").update(set.id, { order: i });
          }
        }
      }
    });
  }
}

const db = new RhinoGainsDB();

export function createWorkout(workoutType: WorkoutType, startedAt?: number): WorkoutWithDetails {
  const workoutId = crypto.randomUUID();
  const now = startedAt || Date.now();

  const workout: Workout = {
    id: workoutId,
    workout_type: workoutType,
    started_at: now,
    finished_at: null,
  };

  const exercises = DEFAULT_EXERCISES[workoutType].map((name, index) => {
    const exerciseId = crypto.randomUUID();
    const sets: Set[] = Array.from({ length: 3 }, (_, i) => ({
      id: crypto.randomUUID(),
      exercise_id: exerciseId,
      weight: null,
      reps: null,
      order: i, // Set order: 0, 1, 2
    }));

    return {
      id: exerciseId,
      workout_id: workoutId,
      name,
      sets,
    };
  });

  return {
    ...workout,
    exercises,
  };
}

export async function saveWorkout(workout: WorkoutWithDetails): Promise<void> {
  const { exercises, ...workoutData } = workout;
  
  // Calculate end time with 30-minute minimum logic
  const saveTime = Date.now();
  const duration = saveTime - workout.started_at;
  const thirtyMinutes = 30 * 60 * 1000; // 30 minutes in milliseconds
  
  const finished_at = duration < thirtyMinutes
    ? workout.started_at + thirtyMinutes
    : saveTime;
  
  const finishedWorkout: Workout = {
    ...workoutData,
    finished_at: finished_at,
  };

  await db.transaction("rw", db.workouts, db.exercises, db.sets, async () => {
    await db.workouts.add(finishedWorkout);

    for (const exercise of exercises) {
      const { sets, ...exerciseData } = exercise;
      await db.exercises.add(exerciseData);

      for (const set of sets) {
        await db.sets.add(set);
      }
    }
  });
}

export async function getWorkouts(): Promise<WorkoutWithDetails[]> {
  const workouts = await db.workouts.orderBy("started_at").reverse().toArray();

  const workoutsWithDetails: WorkoutWithDetails[] = await Promise.all(
    workouts.map(async (workout) => {
      const exercises = await db.exercises
        .where("workout_id")
        .equals(workout.id)
        .toArray();

      const exercisesWithSets = await Promise.all(
        exercises.map(async (exercise) => {
          const sets = await db.sets
            .where("exercise_id")
            .equals(exercise.id)
            .toArray();
          // Sort sets by order field to preserve input order
          sets.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
          return { ...exercise, sets };
        })
      );

      return {
        ...workout,
        exercises: exercisesWithSets,
      };
    })
  );

  return workoutsWithDetails;
}

export async function getWorkoutById(id: string): Promise<WorkoutWithDetails | null> {
  const workout = await db.workouts.get(id);
  if (!workout) return null;

  const exercises = await db.exercises
    .where("workout_id")
    .equals(workout.id)
    .toArray();

  const exercisesWithSets = await Promise.all(
    exercises.map(async (exercise) => {
      const sets = await db.sets
        .where("exercise_id")
        .equals(exercise.id)
        .toArray();
      // Sort sets by order field to preserve input order
      sets.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
      return { ...exercise, sets };
    })
  );

  return {
    ...workout,
    exercises: exercisesWithSets,
  };
}

export async function updateWorkout(workout: WorkoutWithDetails): Promise<void> {
  const { exercises, ...workoutData } = workout;

  await db.transaction("rw", db.workouts, db.exercises, db.sets, async () => {
    await db.workouts.update(workout.id, workoutData);

    // Delete existing exercises and sets
    const existingExercises = await db.exercises
      .where("workout_id")
      .equals(workout.id)
      .toArray();

    for (const exercise of existingExercises) {
      await db.sets.where("exercise_id").equals(exercise.id).delete();
    }
    await db.exercises.where("workout_id").equals(workout.id).delete();

    // Add new exercises and sets
    for (const exercise of exercises) {
      const { sets, ...exerciseData } = exercise;
      await db.exercises.add(exerciseData);

      for (const set of sets) {
        await db.sets.add(set);
      }
    }
  });
}

export async function deleteWorkout(id: string): Promise<void> {
  await db.transaction("rw", db.workouts, db.exercises, db.sets, async () => {
    const exercises = await db.exercises.where("workout_id").equals(id).toArray();

    for (const exercise of exercises) {
      await db.sets.where("exercise_id").equals(exercise.id).delete();
    }
    await db.exercises.where("workout_id").equals(id).delete();
    await db.workouts.delete(id);
  });
}

export { db };

