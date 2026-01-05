"use client";

interface BottomNavProps {
  activeTab: "workout" | "profile";
  onTabChange: (tab: "workout" | "profile") => void;
}

export default function BottomNav({ activeTab, onTabChange }: BottomNavProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-black border-t border-gray-800 z-50">
      <div className="grid grid-cols-2 gap-0">
        <button
          onClick={() => onTabChange("workout")}
          className={`py-4 px-6 font-semibold text-lg transition-colors min-h-[60px] bg-black ${
            activeTab === "workout"
              ? "text-white"
              : "text-gray-400 hover:text-white"
          }`}
        >
          Workout
        </button>
        <button
          onClick={() => onTabChange("profile")}
          className={`py-4 px-6 font-semibold text-lg transition-colors min-h-[60px] bg-black ${
            activeTab === "profile"
              ? "text-white"
              : "text-gray-400 hover:text-white"
          }`}
        >
          Profile
        </button>
      </div>
    </nav>
  );
}

