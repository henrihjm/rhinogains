import { test, expect } from "@playwright/test";

test.describe("Start and Save Workout", () => {
  test("should start a workout, log exercises, and save it", async ({ page }) => {
    // Clear any existing data
    await page.goto("/");
    await page.evaluate(() => {
      indexedDB.deleteDatabase("RhinoGainsDB");
    });

    // Navigate to home
    await page.goto("/");
    await expect(page.locator("text=Rhino Gains")).toBeVisible();

    // Click "Start a workout"
    await page.click("text=Start a workout");
    await expect(page.locator("text=Select Workout Type")).toBeVisible();

    // Select workout type
    await page.click("text=Push");
    await expect(page.locator("text=Push Workout")).toBeVisible();

    // Log exercise data - find first exercise and fill in sets
    const firstExercise = page.locator('[placeholder="Exercise name"]').first();
    await expect(firstExercise).toBeVisible();

    // Fill in weight and reps for first set of first exercise
    const weightInputs = page.locator('input[type="number"]').filter({ hasText: "" });
    const repsInputs = page.locator('input[type="number"]').filter({ hasText: "" });

    // Get all number inputs and fill them
    const allNumberInputs = page.locator('input[type="number"]');
    const count = await allNumberInputs.count();

    // Fill first weight input (index 0)
    if (count > 0) {
      await allNumberInputs.nth(0).fill("135");
    }
    // Fill first reps input (index 1)
    if (count > 1) {
      await allNumberInputs.nth(1).fill("10");
    }

    // Save workout
    await page.click("text=Save workout");

    // Should navigate back to home
    await expect(page.locator("text=Rhino Gains")).toBeVisible();

    // Navigate to history
    await page.click("text=Workout history");
    await expect(page.locator("text=Workout History")).toBeVisible();

    // Verify workout appears in history
    await expect(page.locator("text=Push Workout")).toBeVisible();
  });
});

