import { test, expect } from "@playwright/test";

test.describe("Empty State Handling", () => {
  test("should show empty state when no workouts exist", async ({ page }) => {
    // Clear any existing data
    await page.goto("/");
    await page.evaluate(() => {
      indexedDB.deleteDatabase("RhinoGainsDB");
    });

    // Navigate to history
    await page.goto("/history");
    await expect(page.locator("text=Workout History")).toBeVisible();

    // Verify empty state message
    await expect(page.locator("text=No workouts logged yet")).toBeVisible();
    await expect(
      page.locator("text=Start your first workout to see it here")
    ).toBeVisible();

    // Verify "Start a workout" button is present
    await expect(page.locator("text=Start a workout")).toBeVisible();
  });
});

