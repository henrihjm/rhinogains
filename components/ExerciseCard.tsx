"use client";

import { Exercise, Set } from "@/lib/types";
import SetInput from "./SetInput";
import { useState, useEffect } from "react";
import { getLastValue } from "@/lib/input-memory";

interface ExerciseCardProps {
  exercise: Exercise & { sets: Set[] };
  onUpdate: (exercise: Exercise & { sets: Set[] }) => void;
  onDelete?: () => void;
  editable?: boolean;
}

export default function ExerciseCard({
  exercise,
  onUpdate,
  onDelete,
  editable = true,
}: ExerciseCardProps) {
  const [exerciseName, setExerciseName] = useState(exercise.name);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newName = e.target.value;
    setExerciseName(newName);
    onUpdate({ ...exercise, name: newName });
  };

  const handleSetUpdate = (updatedSet: Set) => {
    const updatedSets = exercise.sets.map((s) =>
      s.id === updatedSet.id ? updatedSet : s
    );
    onUpdate({ ...exercise, sets: updatedSets });
  };

  const handleAddSet = () => {
    // Pre-fill with last values if exercise name exists
    const lastWeight = exerciseName ? getLastValue(exerciseName, "weight") : null;
    const lastReps = exerciseName ? getLastValue(exerciseName, "reps") : null;
    
    const newSet: Set = {
      id: crypto.randomUUID(),
      exercise_id: exercise.id,
      weight: lastWeight,
      reps: lastReps,
      order: exercise.sets.length, // Set order to next position
    };
    onUpdate({ ...exercise, sets: [...exercise.sets, newSet] });
  };

  const handleDeleteSet = (setId: string) => {
    const updatedSets = exercise.sets.filter((s) => s.id !== setId);
    onUpdate({ ...exercise, sets: updatedSets });
  };

  return (
    <div className="bg-[#1a1a1a] rounded-lg p-4 mb-4 border border-gray-800">
      <div className="mb-4">
        {editable ? (
          <input
            type="text"
            value={exerciseName}
            onChange={handleNameChange}
            className="w-full text-xl font-bold px-3 py-2 bg-[#1a1a1a] text-white border-2 border-gray-700 rounded-lg placeholder:text-gray-500 focus:border-white focus:outline-none"
            placeholder="Exercise name"
          />
        ) : (
          <h3 className="text-xl font-bold text-white">{exercise.name}</h3>
        )}
      </div>

      <div className="space-y-2 mb-4">
        {[...exercise.sets]
          .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
          .map((set, index) => (
            <div key={set.id} className="flex items-center gap-2">
              <span className="text-sm font-semibold w-8 text-gray-400">Set {index + 1}</span>
              <SetInput
                set={set}
                exerciseName={exerciseName}
                onUpdate={handleSetUpdate}
                onDelete={() => handleDeleteSet(set.id)}
                editable={editable}
              />
            </div>
          ))}
      </div>

      <div className="flex gap-2">
        {editable && (
          <button
            onClick={handleAddSet}
            className="px-4 py-2 bg-white text-black border-2 border-white rounded-lg font-semibold hover:bg-gray-200 transition-colors min-h-[44px]"
          >
            Add set
          </button>
        )}
        {editable && onDelete && (
          <button
            onClick={onDelete}
            className="px-4 py-2 bg-black text-white border-2 border-white rounded-lg font-semibold hover:bg-gray-900 transition-colors min-h-[44px]"
          >
            Delete exercise
          </button>
        )}
      </div>
    </div>
  );
}

