"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { WorkoutWithDetails, Exercise, Set } from "@/lib/types";
import { saveWorkout } from "@/lib/db";
import ExerciseCard from "@/components/ExerciseCard";
import WorkoutActions from "@/components/WorkoutActions";
import ConfirmDialog from "@/components/ConfirmDialog";

export default function ActiveWorkoutPage() {
  const router = useRouter();
  const [workout, setWorkout] = useState<WorkoutWithDetails | null>(null);
  const [showDiscardConfirm, setShowDiscardConfirm] = useState(false);

  useEffect(() => {
    const stored = sessionStorage.getItem("activeWorkout");
    if (stored) {
      setWorkout(JSON.parse(stored));
    } else {
      router.push("/");
    }
  }, [router]);

  const handleExerciseUpdate = (updatedExercise: Exercise & { sets: Set[] }) => {
    if (!workout) return;
    const updatedExercises = workout.exercises.map((ex) =>
      ex.id === updatedExercise.id ? updatedExercise : ex
    );
    const updatedWorkout = { ...workout, exercises: updatedExercises };
    setWorkout(updatedWorkout);
    sessionStorage.setItem("activeWorkout", JSON.stringify(updatedWorkout));
  };

  const handleAddExercise = () => {
    if (!workout) return;
    const exerciseId = crypto.randomUUID();
    const newExercise: Exercise & { sets: Set[] } = {
      id: exerciseId,
      workout_id: workout.id,
      name: "",
      sets: [
        {
          id: crypto.randomUUID(),
          exercise_id: exerciseId,
          weight: null,
          reps: null,
          order: 0, // First set has order 0
        },
      ],
    };
    const updatedWorkout = {
      ...workout,
      exercises: [...workout.exercises, newExercise],
    };
    setWorkout(updatedWorkout);
    sessionStorage.setItem("activeWorkout", JSON.stringify(updatedWorkout));
  };

  const handleDeleteExercise = (exerciseId: string) => {
    if (!workout) return;
    const updatedExercises = workout.exercises.filter((ex) => ex.id !== exerciseId);
    const updatedWorkout = { ...workout, exercises: updatedExercises };
    setWorkout(updatedWorkout);
    sessionStorage.setItem("activeWorkout", JSON.stringify(updatedWorkout));
  };

  const handleSave = async () => {
    if (!workout) return;
    try {
      // Sync to calendar if connected
      let calendarEventId: string | null = null;
      try {
        const { syncWorkoutToCalendar } = await import("@/lib/calendar/sync");
        calendarEventId = await syncWorkoutToCalendar(workout);
        if (calendarEventId) {
          workout.calendar_event_id = calendarEventId;
        }
      } catch (calendarError) {
        console.error("Calendar sync failed:", calendarError);
        // Continue saving workout even if calendar sync fails
      }

      await saveWorkout(workout);
      sessionStorage.removeItem("activeWorkout");
      router.push("/");
    } catch (error) {
      console.error("Failed to save workout:", error);
      alert("Failed to save workout. Please try again.");
    }
  };

  const handleDiscard = () => {
    setShowDiscardConfirm(true);
  };

  const confirmDiscard = () => {
    sessionStorage.removeItem("activeWorkout");
    router.push("/");
  };

  if (!workout) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-black">
        <p className="text-xl text-white">Loading...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen pb-44 p-6 bg-black">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-white">{workout.workout_type} Workout</h1>

        <div className="space-y-4">
          {workout.exercises.map((exercise) => (
            <ExerciseCard
              key={exercise.id}
              exercise={exercise}
              onUpdate={handleExerciseUpdate}
              onDelete={() => handleDeleteExercise(exercise.id)}
              editable={true}
            />
          ))}
        </div>

        <button
          onClick={handleAddExercise}
          className="w-full mt-6 bg-white text-black py-4 px-6 rounded-lg font-semibold text-lg hover:bg-gray-200 transition-colors min-h-[60px]"
        >
          Add exercise
        </button>
      </div>

      <WorkoutActions
        onSave={handleSave}
        onDiscard={handleDiscard}
        isActiveWorkout={true}
      />

      <ConfirmDialog
        isOpen={showDiscardConfirm}
        title="Discard Workout?"
        message="Are you sure you want to discard this workout? All progress will be lost."
        confirmText="Discard"
        cancelText="Cancel"
        onConfirm={confirmDiscard}
        onCancel={() => setShowDiscardConfirm(false)}
      />
    </main>
  );
}

