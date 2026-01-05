"use client";

import { Set } from "@/lib/types";
import { saveLastValue, getLastValue } from "@/lib/input-memory";
import { useEffect, useState } from "react";

interface SetInputProps {
  set: Set;
  exerciseName: string;
  onUpdate: (set: Set) => void;
  onDelete: () => void;
  editable?: boolean;
}

export default function SetInput({ set, exerciseName, onUpdate, onDelete, editable = true }: SetInputProps) {
  const [initialized, setInitialized] = useState(false);

  // Pre-fill with last values on mount if set is empty and exercise name exists
  useEffect(() => {
    if (!initialized && editable && exerciseName && set.weight === null && set.reps === null) {
      const lastWeight = getLastValue(exerciseName, "weight");
      const lastReps = getLastValue(exerciseName, "reps");
      
      if (lastWeight !== null || lastReps !== null) {
        onUpdate({
          ...set,
          weight: lastWeight ?? set.weight,
          reps: lastReps ?? set.reps,
        });
      }
      setInitialized(true);
    }
  }, [editable, exerciseName, set.id, initialized, onUpdate]);

  const handleWeightChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.value === "") {
      onUpdate({ ...set, weight: null });
      return;
    }
    const value = parseFloat(e.target.value);
    // Prevent negative values
    const clampedValue = value < 0 ? 0 : value;
    const updatedSet = { ...set, weight: isNaN(clampedValue) ? null : clampedValue };
    onUpdate(updatedSet);
    
    // Save to memory if exercise name exists
    if (exerciseName && !isNaN(clampedValue)) {
      saveLastValue(exerciseName, "weight", clampedValue);
    }
  };

  const handleRepsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.value === "") {
      onUpdate({ ...set, reps: null });
      return;
    }
    const value = parseInt(e.target.value, 10);
    // Prevent negative values
    const clampedValue = value < 0 ? 0 : value;
    const updatedSet = { ...set, reps: isNaN(clampedValue) ? null : clampedValue };
    onUpdate(updatedSet);
    
    // Save to memory if exercise name exists
    if (exerciseName && !isNaN(clampedValue)) {
      saveLastValue(exerciseName, "reps", clampedValue);
    }
  };

  return (
    <div className="flex items-center gap-2 py-2 border-b border-gray-700">
      <div className="flex-1 grid grid-cols-2 gap-2">
        <div>
          <label className="block text-sm font-semibold mb-1 text-gray-400">Weight (kg)</label>
          <input
            type="number"
            inputMode="decimal"
            min="0"
            step="0.01"
            value={set.weight ?? ""}
            onChange={handleWeightChange}
            placeholder="0"
            disabled={!editable}
            className="w-full px-3 py-2 bg-[#1a1a1a] text-white border-2 border-gray-700 rounded-lg disabled:bg-gray-900 disabled:text-gray-500 disabled:cursor-not-allowed focus:border-white focus:outline-none placeholder:text-gray-600"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold mb-1 text-gray-400">Reps</label>
          <input
            type="number"
            inputMode="numeric"
            min="0"
            step="1"
            value={set.reps ?? ""}
            onChange={handleRepsChange}
            placeholder="0"
            disabled={!editable}
            className="w-full px-3 py-2 bg-[#1a1a1a] text-white border-2 border-gray-700 rounded-lg disabled:bg-gray-900 disabled:text-gray-500 disabled:cursor-not-allowed focus:border-white focus:outline-none placeholder:text-gray-600"
          />
        </div>
      </div>
      {editable && (
        <button
          onClick={onDelete}
          className="px-4 py-2 bg-black text-white border-2 border-white rounded-lg font-semibold hover:bg-gray-900 transition-colors min-h-[44px] min-w-[44px]"
          aria-label="Delete set"
        >
          ×
        </button>
      )}
    </div>
  );
}

