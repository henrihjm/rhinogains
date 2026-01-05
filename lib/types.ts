export type WorkoutType = "Push" | "Pull" | "Legs";

export interface Set {
  id: string;
  exercise_id: string;
  weight: number | null;
  reps: number | null;
  order: number; // Position of set within exercise (0, 1, 2, ...)
}

export interface Exercise {
  id: string;
  workout_id: string;
  name: string;
}

export interface Workout {
  id: string;
  workout_type: WorkoutType;
  started_at: number;
  finished_at: number | null;
  calendar_event_id?: string; // Google Calendar event ID
}

export interface WorkoutWithDetails extends Workout {
  exercises: (Exercise & { sets: Set[] })[];
}

export const DEFAULT_EXERCISES: Record<WorkoutType, string[]> = {
  Push: ["Bench Press", "Overhead Press", "Tricep Dips", "Lateral Raises"],
  Pull: ["Pull-ups", "Barbell Rows", "Bicep Curls", "Face Pulls"],
  Legs: ["Squats", "Deadlifts", "Leg Press", "Leg Curls"],
};

export const WORKOUT_DESCRIPTIONS: Record<WorkoutType, string> = {
  Push: "Chest, Shoulders, Triceps",
  Pull: "Back, Biceps",
  Legs: "Quads, Hamstrings, Glutes",
};

