import { test, expect } from "@playwright/test";

test.describe("Discard Edits Safely", () => {
  test.beforeEach(async ({ page }) => {
    // Clear any existing data and create a test workout
    await page.goto("/");
    await page.evaluate(() => {
      indexedDB.deleteDatabase("RhinoGainsDB");
    });

    // Create a workout programmatically
    await page.evaluate(async () => {
      const { db } = await import("../lib/db");
      const workout = {
        id: "test-workout-2",
        workout_type: "Legs" as const,
        started_at: Date.now(),
        finished_at: Date.now(),
        exercises: [
          {
            id: "exercise-2",
            workout_id: "test-workout-2",
            name: "Squats",
            sets: [
              {
                id: "set-2",
                exercise_id: "exercise-2",
                weight: 225,
                reps: 5,
              },
            ],
          },
        ],
      };
      await db.workouts.add(workout);
      await db.exercises.add(workout.exercises[0]);
      await db.sets.add(workout.exercises[0].sets[0]);
    });
  });

  test("should discard edits and preserve original data", async ({ page }) => {
    // Navigate to history
    await page.goto("/history");
    await expect(page.locator("text=Workout History")).toBeVisible();

    // Click on the workout
    await page.click("text=Legs Workout");
    await expect(page.locator("text=Legs Workout")).toBeVisible();

    // Enter edit mode
    await page.click("text=Edit");
    await expect(page.locator("text=Note:")).toBeVisible();

    // Make changes - modify reps
    const allNumberInputs = page.locator('input[type="number"]');
    const count = await allNumberInputs.count();
    if (count > 1) {
      await allNumberInputs.nth(1).fill("999"); // Change reps to 999
    }

    // Cancel edits
    await page.click("text=Cancel");

    // Should return to view mode
    await expect(page.locator("text=Edit")).toBeVisible();

    // Verify original data is unchanged - reload the page to check
    await page.reload();
    await expect(page.locator("text=Legs Workout")).toBeVisible();

    // The original value should still be there (we can't easily check the exact value in view mode,
    // but if we enter edit mode again, it should show the original)
    await page.click("text=Edit");
    const repsInput = page.locator('input[type="number"]').nth(1);
    const value = await repsInput.inputValue();
    // Should not be 999 (our test change)
    expect(value).not.toBe("999");
  });
});

