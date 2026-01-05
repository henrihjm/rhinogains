"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { WorkoutType, DEFAULT_EXERCISES, WORKOUT_DESCRIPTIONS, WorkoutWithDetails } from "@/lib/types";
import { createWorkout, getWorkouts } from "@/lib/db";
import CalendarConnect from "@/components/CalendarConnect";
import BottomNav from "@/components/BottomNav";

export default function Home() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"workout" | "profile">("workout");
  const [workouts, setWorkouts] = useState<WorkoutWithDetails[]>([]);
  const [loadingWorkouts, setLoadingWorkouts] = useState(false);

  const handleSelectWorkoutType = (workoutType: WorkoutType) => {
    // Capture start time when user clicks workout type
    const startTime = Date.now();
    const workout = createWorkout(workoutType, startTime);
    // Store in sessionStorage temporarily
    sessionStorage.setItem("activeWorkout", JSON.stringify(workout));
    router.push("/workout/active");
  };

  useEffect(() => {
    if (activeTab === "profile") {
      loadWorkouts();
    }
  }, [activeTab]);

  const loadWorkouts = async () => {
    setLoadingWorkouts(true);
    try {
      const data = await getWorkouts();
      setWorkouts(data);
    } catch (error) {
      console.error("Failed to load workouts:", error);
    } finally {
      setLoadingWorkouts(false);
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

  const getExercisesWithData = (workout: WorkoutWithDetails): number => {
    return workout.exercises.filter((exercise) => {
      return exercise.sets.some(
        (set) => set.weight !== null || set.reps !== null
      );
    }).length;
  };

  const getExerciseNamesWithData = (workout: WorkoutWithDetails): string[] => {
    return workout.exercises
      .filter((exercise) => {
        return exercise.sets.some(
          (set) => set.weight !== null || set.reps !== null
        );
      })
      .map((exercise) => exercise.name);
  };

  return (
    <main className="min-h-screen flex flex-col bg-black pb-20">
      {activeTab === "workout" ? (
        <div className="flex-1 flex flex-col p-6">
          <div className="mb-8 text-left">
            <h1 className="text-3xl font-bold mb-2 text-white uppercase text-left">SELECT WORKOUT</h1>
            <p className="text-gray-400 text-left">Choose your split</p>
          </div>

          <div className="w-full max-w-2xl space-y-4">
            <button
              onClick={() => handleSelectWorkoutType("Push")}
              className="w-full bg-[#1a1a1a] text-white rounded-lg py-6 px-6 hover:bg-gray-900 transition-colors flex items-center justify-between"
            >
              <div className="flex-1 text-left">
                <h3 className="text-2xl font-bold mb-1 uppercase text-left">Push</h3>
                <p className="text-gray-400 text-sm mb-3 text-left">{WORKOUT_DESCRIPTIONS.Push}</p>
                <div className="flex flex-wrap items-center gap-2 justify-start">
                  {DEFAULT_EXERCISES.Push.slice(0, 3).map((exercise, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-gray-800 text-gray-300 text-xs font-medium rounded"
                    >
                      {exercise}
                    </span>
                  ))}
                  {DEFAULT_EXERCISES.Push.length > 3 && (
                    <span className="px-2 py-1 text-gray-400 text-xs font-medium">
                      +{DEFAULT_EXERCISES.Push.length - 3} more
                    </span>
                  )}
                </div>
              </div>
              <svg
                className="w-6 h-6 text-white ml-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>

            <button
              onClick={() => handleSelectWorkoutType("Pull")}
              className="w-full bg-[#1a1a1a] text-white rounded-lg py-6 px-6 hover:bg-gray-900 transition-colors flex items-center justify-between"
            >
              <div className="flex-1 text-left">
                <h3 className="text-2xl font-bold mb-1 uppercase text-left">Pull</h3>
                <p className="text-gray-400 text-sm mb-3 text-left">{WORKOUT_DESCRIPTIONS.Pull}</p>
                <div className="flex flex-wrap items-center gap-2 justify-start">
                  {DEFAULT_EXERCISES.Pull.slice(0, 3).map((exercise, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-gray-800 text-gray-300 text-xs font-medium rounded"
                    >
                      {exercise}
                    </span>
                  ))}
                  {DEFAULT_EXERCISES.Pull.length > 3 && (
                    <span className="px-2 py-1 text-gray-400 text-xs font-medium">
                      +{DEFAULT_EXERCISES.Pull.length - 3} more
                    </span>
                  )}
                </div>
              </div>
              <svg
                className="w-6 h-6 text-white ml-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>

            <button
              onClick={() => handleSelectWorkoutType("Legs")}
              className="w-full bg-[#1a1a1a] text-white rounded-lg py-6 px-6 hover:bg-gray-900 transition-colors flex items-center justify-between"
            >
              <div className="flex-1 text-left">
                <h3 className="text-2xl font-bold mb-1 uppercase text-left">Legs</h3>
                <p className="text-gray-400 text-sm mb-3 text-left">{WORKOUT_DESCRIPTIONS.Legs}</p>
                <div className="flex flex-wrap items-center gap-2 justify-start">
                  {DEFAULT_EXERCISES.Legs.slice(0, 3).map((exercise, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-gray-800 text-gray-300 text-xs font-medium rounded"
                    >
                      {exercise}
                    </span>
                  ))}
                  {DEFAULT_EXERCISES.Legs.length > 3 && (
                    <span className="px-2 py-1 text-gray-400 text-xs font-medium">
                      +{DEFAULT_EXERCISES.Legs.length - 3} more
                    </span>
                  )}
                </div>
              </div>
              <svg
                className="w-6 h-6 text-white ml-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col p-6">
          <div className="text-left mb-8">
            <h1 className="text-3xl font-bold mb-2 text-white">Profile</h1>
          </div>

          <div className="w-full max-w-2xl space-y-6">
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-white mb-4">Calendar</h3>
              <CalendarConnect />
            </div>

            <div className="pt-4 border-t border-gray-800">
              <h3 className="text-xl font-semibold text-white mb-4">History</h3>
              {loadingWorkouts ? (
                <p className="text-gray-400">Loading workouts...</p>
              ) : workouts.length === 0 ? (
                <p className="text-gray-400">No workouts logged yet</p>
              ) : (
                <div className="space-y-4">
                  {workouts.map((workout) => {
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
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
    </main>
  );
}

