"use client";

interface WorkoutActionsProps {
  onSave: () => void;
  onDiscard: () => void;
  isActiveWorkout?: boolean;
}

export default function WorkoutActions({
  onSave,
  onDiscard,
  isActiveWorkout = false,
}: WorkoutActionsProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-black border-t-2 border-gray-800 p-4">
      <div className="grid grid-cols-2 gap-4">
        <button
          onClick={onDiscard}
          className="bg-black text-white border-2 border-white py-4 px-6 rounded-lg font-semibold text-lg hover:bg-gray-900 transition-colors min-h-[60px]"
        >
          {isActiveWorkout ? "Discard workout" : "Cancel"}
        </button>
        <button
          onClick={onSave}
          className="bg-white text-black py-4 px-6 rounded-lg font-semibold text-lg hover:bg-gray-200 transition-colors min-h-[60px]"
        >
          {isActiveWorkout ? "Save workout" : "Save changes"}
        </button>
      </div>
    </div>
  );
}

