/**
 * Utility functions for remembering last input values per exercise
 */

type InputType = "weight" | "reps";

/**
 * Save the last input value for an exercise
 */
export function saveLastValue(
  exerciseName: string,
  type: InputType,
  value: number | null
): void {
  if (value === null) return;
  
  const key = `last${type.charAt(0).toUpperCase() + type.slice(1)}_${exerciseName}`;
  try {
    localStorage.setItem(key, value.toString());
  } catch (error) {
    console.error("Failed to save last value:", error);
  }
}

/**
 * Get the last input value for an exercise
 */
export function getLastValue(
  exerciseName: string,
  type: InputType
): number | null {
  if (!exerciseName) return null;
  
  const key = `last${type.charAt(0).toUpperCase() + type.slice(1)}_${exerciseName}`;
  try {
    const value = localStorage.getItem(key);
    return value ? parseFloat(value) : null;
  } catch (error) {
    console.error("Failed to get last value:", error);
    return null;
  }
}

/**
 * Clear all stored input values (useful for testing or reset)
 */
export function clearAllValues(): void {
  try {
    const keys = Object.keys(localStorage);
    keys.forEach((key) => {
      if (key.startsWith("lastWeight_") || key.startsWith("lastReps_")) {
        localStorage.removeItem(key);
      }
    });
  } catch (error) {
    console.error("Failed to clear values:", error);
  }
}

