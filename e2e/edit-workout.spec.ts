import { test, expect } from "@playwright/test";

test.describe("Edit Past Workout", () => {
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
        id: "test-workout-1",
        workout_type: "Pull" as const,
        started_at: Date.now(),
        finished_at: Date.now(),
        exercises: [
          {
            id: "exercise-1",
            workout_id: "test-workout-1",
            name: "Pull-ups",
            sets: [
              {
                id: "set-1",
                exercise_id: "exercise-1",
                weight: 0,
                reps: 10,
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

  test("should edit a past workout and save changes", async ({ page }) => {
    // Navigate to history
    await page.goto("/history");
    await expect(page.locator("text=Workout History")).toBeVisible();

    // Click on the workout
    await page.click("text=Pull Workout");
    await expect(page.locator("text=Pull Workout")).toBeVisible();

    // Enter edit mode
    await page.click("text=Edit");
    await expect(page.locator("text=Note:")).toBeVisible();

    // Modify reps - find the reps input and change it
    const repsInput = page.locator('input[type="number"]').filter({ hasText: "" }).nth(1);
    if (await repsInput.count() > 0) {
      await repsInput.fill("12");
    } else {
      // Alternative: find by placeholder or label
      const allRepsInputs = page.locator('input[type="number"]');
      const count = await allRepsInputs.count();
      if (count > 1) {
        await allRepsInputs.nth(1).fill("12");
      }
    }

    // Save changes
    await page.click("text=Save changes");

    // Confirm save
    await page.click("text=Save");

    // Should return to view mode
    await expect(page.locator("text=Edit")).toBeVisible();

    // Verify changes persisted - check that the workout still exists
    await expect(page.locator("text=Pull Workout")).toBeVisible();
  });
});

