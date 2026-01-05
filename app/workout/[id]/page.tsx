"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { WorkoutWithDetails, Exercise, Set } from "@/lib/types";
import { getWorkoutById, updateWorkout, deleteWorkout } from "@/lib/db";
import ExerciseCard from "@/components/ExerciseCard";
import WorkoutActions from "@/components/WorkoutActions";
import ConfirmDialog from "@/components/ConfirmDialog";

export default function WorkoutDetailPage() {
  const router = useRouter();
  const params = useParams();
  const workoutId = params.id as string;

  const [workout, setWorkout] = useState<WorkoutWithDetails | null>(null);
  const [editWorkout, setEditWorkout] = useState<WorkoutWithDetails | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showSaveConfirm, setShowSaveConfirm] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadWorkout();
  }, [workoutId]);

  useEffect(() => {
    // Handle navigation away - discard edits if in edit mode
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isEditMode) {
        e.preventDefault();
        e.returnValue = "";
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isEditMode]);

  const loadWorkout = async () => {
    try {
      const data = await getWorkoutById(workoutId);
      if (!data) {
        router.push("/history");
        return;
      }
      setWorkout(data);
      setEditWorkout(JSON.parse(JSON.stringify(data))); // Deep copy for editing
    } catch (error) {
      console.error("Failed to load workout:", error);
      router.push("/history");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    setIsEditMode(true);
  };

  const handleCancel = () => {
    if (editWorkout && workout) {
      setEditWorkout(JSON.parse(JSON.stringify(workout))); // Reset to original
    }
    setIsEditMode(false);
  };

  const handleExerciseUpdate = (updatedExercise: Exercise & { sets: Set[] }) => {
    if (!editWorkout) return;
    const updatedExercises = editWorkout.exercises.map((ex) =>
      ex.id === updatedExercise.id ? updatedExercise : ex
    );
    setEditWorkout({ ...editWorkout, exercises: updatedExercises });
  };

  const handleAddExercise = () => {
    if (!editWorkout) return;
    const exerciseId = crypto.randomUUID();
    const newExercise: Exercise & { sets: Set[] } = {
      id: exerciseId,
      workout_id: editWorkout.id,
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
    setEditWorkout({
      ...editWorkout,
      exercises: [...editWorkout.exercises, newExercise],
    });
  };

  const handleDeleteExercise = (exerciseId: string) => {
    if (!editWorkout) return;
    const updatedExercises = editWorkout.exercises.filter((ex) => ex.id !== exerciseId);
    setEditWorkout({ ...editWorkout, exercises: updatedExercises });
  };

  const handleSave = () => {
    setShowSaveConfirm(true);
  };

  const confirmSave = async () => {
    if (!editWorkout) return;
    try {
      // Sync to calendar if connected
      try {
        const { syncWorkoutToCalendar } = await import("@/lib/calendar/sync");
        const calendarEventId = await syncWorkoutToCalendar(editWorkout);
        if (calendarEventId) {
          editWorkout.calendar_event_id = calendarEventId;
        }
      } catch (calendarError) {
        console.error("Calendar sync failed:", calendarError);
        // Continue updating workout even if calendar sync fails
      }

      await updateWorkout(editWorkout);
      await loadWorkout(); // Reload to get updated data
      setIsEditMode(false);
      setShowSaveConfirm(false);
    } catch (error) {
      console.error("Failed to update workout:", error);
      alert("Failed to save changes. Please try again.");
    }
  };

  const handleDelete = () => {
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    if (!workout) return;
    try {
      // Delete calendar event if exists
      if (workout.calendar_event_id) {
        try {
          const { deleteWorkoutFromCalendar } = await import("@/lib/calendar/sync");
          await deleteWorkoutFromCalendar(workout.calendar_event_id);
        } catch (calendarError) {
          console.error("Calendar delete failed:", calendarError);
          // Continue deleting workout even if calendar delete fails
        }
      }

      await deleteWorkout(workout.id);
      router.push("/history");
    } catch (error) {
      console.error("Failed to delete workout:", error);
      alert("Failed to delete workout. Please try again.");
    }
  };

  const formatDate = (timestamp: number): string => {
    const date = new Date(timestamp);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-black">
        <p className="text-xl text-white">Loading...</p>
      </main>
    );
  }

  if (!workout) {
    return null;
  }

  const displayWorkout = isEditMode ? editWorkout : workout;

  if (!displayWorkout) {
    return null;
  }

  return (
    <main className="min-h-screen pb-32 p-6 bg-black">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <button
            onClick={() => router.push("/history")}
            className="text-lg underline mb-4 inline-block text-gray-400 hover:text-white"
          >
            ← Back
          </button>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-white">{displayWorkout.workout_type} Workout</h1>
              <p className="text-lg mt-2 text-gray-400">{formatDate(displayWorkout.started_at)}</p>
            </div>
            {!isEditMode && (
              <div className="flex gap-2">
                <button
                  onClick={handleEdit}
                  className="px-4 py-2 bg-white text-black rounded-lg font-semibold hover:bg-gray-200 transition-colors min-h-[44px]"
                >
                  Edit
                </button>
                <button
                  onClick={handleDelete}
                  className="px-4 py-2 bg-black text-white border-2 border-white rounded-lg font-semibold hover:bg-gray-900 transition-colors min-h-[44px]"
                >
                  Delete workout
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-4">
          {displayWorkout.exercises.map((exercise) => (
            <ExerciseCard
              key={exercise.id}
              exercise={exercise}
              onUpdate={handleExerciseUpdate}
              onDelete={isEditMode ? () => handleDeleteExercise(exercise.id) : undefined}
              editable={isEditMode}
            />
          ))}
        </div>

        {isEditMode && (
          <button
            onClick={handleAddExercise}
            className="w-full mt-6 bg-white text-black py-4 px-6 rounded-lg font-semibold text-lg hover:bg-gray-200 transition-colors min-h-[60px]"
          >
            Add exercise
          </button>
        )}

        {isEditMode && (
          <div className="mt-6 p-4 bg-[#1a1a1a] border border-gray-800 rounded-lg">
            <p className="text-sm text-gray-400">
              <strong className="text-white">Note:</strong> Workout type and date cannot be changed.
            </p>
          </div>
        )}
      </div>

      {isEditMode && (
        <WorkoutActions
          onSave={handleSave}
          onDiscard={handleCancel}
        />
      )}

      <ConfirmDialog
        isOpen={showSaveConfirm}
        title="Save Changes?"
        message="Are you sure you want to save these changes? This will overwrite the original workout."
        confirmText="Save"
        cancelText="Cancel"
        onConfirm={confirmSave}
        onCancel={() => setShowSaveConfirm(false)}
      />

      <ConfirmDialog
        isOpen={showDeleteConfirm}
        title="Delete Workout?"
        message="Are you sure you want to delete this workout? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={confirmDelete}
        onCancel={() => setShowDeleteConfirm(false)}
      />
    </main>
  );
}

