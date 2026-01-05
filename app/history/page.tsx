"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { WorkoutWithDetails } from "@/lib/types";
import { getWorkouts } from "@/lib/db";
import CalendarView from "@/components/CalendarView";

type ViewMode = "list" | "calendar";

export default function HistoryPage() {
  const router = useRouter();
  const [workouts, setWorkouts] = useState<WorkoutWithDetails[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load view mode preference from localStorage
    const savedViewMode = localStorage.getItem("workoutHistoryViewMode") as ViewMode | null;
    if (savedViewMode === "list" || savedViewMode === "calendar") {
      setViewMode(savedViewMode);
    }
    loadWorkouts();
  }, []);

  useEffect(() => {
    // Save view mode preference to localStorage
    localStorage.setItem("workoutHistoryViewMode", viewMode);
  }, [viewMode]);

  const loadWorkouts = async () => {
    try {
      const data = await getWorkouts();
      setWorkouts(data);
    } catch (error) {
      console.error("Failed to load workouts:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDayClick = (date: Date) => {
    setSelectedDate(date);
    setViewMode("list");
  };

  const getWorkoutsForDate = (date: Date): WorkoutWithDetails[] => {
    const dateStr = date.toDateString();
    return workouts.filter((workout) => {
      const workoutDate = new Date(workout.started_at);
      return workoutDate.toDateString() === dateStr;
    });
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

  const getExercisesWithData = (workout: WorkoutWithDetails): number => {
    return workout.exercises.filter((exercise) => {
      // Count exercise only if it has at least one set with weight OR reps filled in
      return exercise.sets.some(
        (set) => set.weight !== null || set.reps !== null
      );
    }).length;
  };

  const getExerciseNamesWithData = (workout: WorkoutWithDetails): string[] => {
    return workout.exercises
      .filter((exercise) => {
        // Include exercise only if it has at least one set with weight OR reps filled in
        return exercise.sets.some(
          (set) => set.weight !== null || set.reps !== null
        );
      })
      .map((exercise) => exercise.name);
  };

  const displayWorkouts = selectedDate
    ? getWorkoutsForDate(selectedDate)
    : workouts;

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-black">
        <p className="text-xl text-white">Loading...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen p-6 bg-black">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-white">Workout History</h1>
          <Link
            href="/"
            className="px-4 py-2 bg-white text-black rounded-lg font-semibold hover:bg-gray-200 transition-colors min-h-[44px]"
          >
            Back to home
          </Link>
        </div>

        {workouts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-xl mb-4 text-white">No workouts logged yet</p>
            <p className="text-gray-400 mb-6">
              Start your first workout to see it here
            </p>
            <Link
              href="/"
              className="inline-block bg-white text-black py-4 px-8 rounded-lg font-semibold text-lg hover:bg-gray-200 transition-colors min-h-[60px]"
            >
              Start a workout
            </Link>
          </div>
        ) : (
          <>
            <div className="flex gap-4 mb-6">
              <button
                onClick={() => {
                  setViewMode("list");
                  setSelectedDate(null);
                }}
                className={`px-6 py-3 rounded-lg font-semibold min-h-[44px] ${
                  viewMode === "list"
                    ? "bg-white text-black"
                    : "bg-black text-white border-2 border-white"
                }`}
              >
                List View
              </button>
              <button
                onClick={() => setViewMode("calendar")}
                className={`px-6 py-3 rounded-lg font-semibold min-h-[44px] ${
                  viewMode === "calendar"
                    ? "bg-white text-black"
                    : "bg-black text-white border-2 border-white"
                }`}
              >
                Calendar View
              </button>
            </div>

            {viewMode === "calendar" ? (
              <CalendarView workouts={workouts} onDayClick={handleDayClick} />
            ) : (
              <div className="space-y-4">
                {selectedDate && (
                  <div className="mb-4">
                    <button
                      onClick={() => {
                        setSelectedDate(null);
                      }}
                      className="text-lg underline text-gray-400 hover:text-white"
                    >
                      ← Show all workouts
                    </button>
                    <p className="text-xl font-semibold mt-2 text-white">
                      {selectedDate.toLocaleDateString("en-US", {
                        month: "long",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                )}

                {displayWorkouts.length === 0 ? (
                  <p className="text-center py-8 text-lg text-gray-400">
                    No workouts found for this date
                  </p>
                ) : (
                  displayWorkouts.map((workout) => {
                    const exerciseNames = getExerciseNamesWithData(workout);
                    const visibleTags = exerciseNames.slice(0, 3);
                    const remainingCount = exerciseNames.length - 3;

                    return (
                      <Link
                        key={workout.id}
                        href={`/workout/${workout.id}`}
                        className="block bg-[#1a1a1a] border border-gray-800 rounded-lg p-6 hover:bg-gray-900 transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <h2 className="text-2xl font-bold mb-2 text-white">
                              {workout.workout_type} Workout
                            </h2>
                            <p className="text-lg text-gray-400 mb-2">{formatDate(workout.started_at)}</p>
                            {exerciseNames.length > 0 && (
                              <div className="flex flex-wrap items-center gap-2 mt-2">
                                {visibleTags.map((name, index) => (
                                  <span
                                    key={index}
                                    className="px-2 py-1 bg-gray-800 text-gray-300 text-xs font-medium rounded"
                                  >
                                    {name}
                                  </span>
                                ))}
                                {remainingCount > 0 && (
                                  <span className="px-2 py-1 text-gray-400 text-xs font-medium">
                                    +{remainingCount} more
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                          <div className="text-right ml-4">
                            <p className="text-lg font-semibold text-white">
                              {getExercisesWithData(workout)} exercises
                            </p>
                          </div>
                        </div>
                      </Link>
                    );
                  })
                )}
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
}

