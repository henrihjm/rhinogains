"use client";

import { useState } from "react";
import { WorkoutWithDetails } from "@/lib/types";

interface CalendarViewProps {
  workouts: WorkoutWithDetails[];
  onDayClick: (date: Date) => void;
}

export default function CalendarView({ workouts, onDayClick }: CalendarViewProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();

  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);
  const daysInMonth = lastDayOfMonth.getDate();
  const startingDayOfWeek = firstDayOfMonth.getDay();

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const hasWorkoutOnDate = (date: Date): boolean => {
    const dateStr = date.toDateString();
    return workouts.some((workout) => {
      const workoutDate = new Date(workout.started_at);
      return workoutDate.toDateString() === dateStr;
    });
  };

  const handlePrevMonth = () => {
    setCurrentMonth(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(new Date(year, month + 1, 1));
  };

  const handleDayClick = (date: Date) => {
    onDayClick(date);
  };

  // Calculate days from previous month
  const prevMonth = month === 0 ? 11 : month - 1;
  const prevYear = month === 0 ? year - 1 : year;
  const daysInPrevMonth = new Date(prevYear, prevMonth + 1, 0).getDate();
  const prevMonthDays: number[] = [];
  for (let i = startingDayOfWeek - 1; i >= 0; i--) {
    prevMonthDays.push(daysInPrevMonth - i);
  }

  // Calculate days from next month to fill the grid (always 42 cells = 6 weeks)
  const totalCells = 42; // 6 weeks * 7 days
  const currentMonthCells = startingDayOfWeek + daysInMonth;
  const nextMonthDaysCount = totalCells - currentMonthCells;
  const nextMonthDays: number[] = [];
  for (let i = 1; i <= nextMonthDaysCount; i++) {
    nextMonthDays.push(i);
  }

  const renderDayButton = (
    day: number,
    date: Date,
    isCurrentMonth: boolean
  ) => {
    const hasWorkout = hasWorkoutOnDate(date);
    const isToday = date.toDateString() === new Date().toDateString();

    return (
      <button
        key={`${date.getTime()}-${day}`}
        onClick={() => handleDayClick(date)}
        className={`aspect-square border-2 rounded-lg font-semibold transition-colors min-h-[44px] ${
          isCurrentMonth
            ? hasWorkout
              ? "bg-white text-black border-white hover:bg-gray-200"
              : "bg-[#1a1a1a] text-white border-gray-800 hover:bg-gray-800"
            : "bg-black text-gray-500 border-gray-800 hover:bg-gray-900"
        } ${isToday ? "ring-2 ring-white" : ""}`}
      >
        {day}
      </button>
    );
  };

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={handlePrevMonth}
          className="px-4 py-2 bg-white text-black rounded-lg font-semibold hover:bg-gray-200 transition-colors min-h-[44px]"
        >
          ←
        </button>
        <h3 className="text-2xl font-bold text-white">
          {monthNames[month]} {year}
        </h3>
        <button
          onClick={handleNextMonth}
          className="px-4 py-2 bg-white text-black rounded-lg font-semibold hover:bg-gray-200 transition-colors min-h-[44px]"
        >
          →
        </button>
      </div>

      <div className="grid grid-cols-7 gap-2 mb-2">
        {dayNames.map((day) => (
          <div key={day} className="text-center font-semibold text-sm py-2 text-gray-400">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-2">
        {/* Previous month days */}
        {prevMonthDays.map((day) => {
          const date = new Date(prevYear, prevMonth, day);
          return renderDayButton(day, date, false);
        })}

        {/* Current month days */}
        {Array.from({ length: daysInMonth }).map((_, index) => {
          const day = index + 1;
          const date = new Date(year, month, day);
          return renderDayButton(day, date, true);
        })}

        {/* Next month days */}
        {nextMonthDays.map((day) => {
          const nextMonth = month === 11 ? 0 : month + 1;
          const nextYear = month === 11 ? year + 1 : year;
          const date = new Date(nextYear, nextMonth, day);
          return renderDayButton(day, date, false);
        })}
      </div>
    </div>
  );
}

