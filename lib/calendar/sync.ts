import { WorkoutWithDetails } from "../types";
import { isCalendarConnected } from "../auth/token-storage";

export async function syncWorkoutToCalendar(
  workout: WorkoutWithDetails
): Promise<string | null> {
  const connected = await isCalendarConnected();
  if (!connected) {
    return null; // Calendar not connected, skip sync
  }

  try {
    // Get refresh token to send to server
    const { getRefreshToken } = await import("../auth/token-storage");
    const refreshToken = await getRefreshToken();
    
    if (!refreshToken) {
      throw new Error("Not authenticated with Google Calendar");
    }

    const response = await fetch("/api/calendar/sync", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ workout, refresh_token: refreshToken }),
    });

    if (!response.ok) {
      const error = await response.json();
      const errorMessage = error.error || "Failed to sync to calendar";
      
      // If authentication error, clear token
      if (errorMessage.includes("expired") || errorMessage.includes("reconnect")) {
        const { deleteRefreshToken } = await import("../auth/token-storage");
        await deleteRefreshToken();
      }
      
      throw new Error(errorMessage);
    }

    const data = await response.json();
    return data.eventId;
  } catch (error: any) {
    console.error("Error syncing workout to calendar:", error);
    
    // Re-throw with user-friendly message
    if (error.message) {
      throw error;
    }
    
    throw new Error("Failed to sync to calendar. Please check your connection.");
  }
}

export async function deleteWorkoutFromCalendar(
  eventId: string
): Promise<void> {
  const connected = await isCalendarConnected();
  if (!connected) {
    return; // Calendar not connected, skip
  }

  try {
    // Get refresh token to send to server
    const { getRefreshToken } = await import("../auth/token-storage");
    const refreshToken = await getRefreshToken();
    
    if (!refreshToken) {
      throw new Error("Not authenticated with Google Calendar");
    }

    const response = await fetch(`/api/calendar/events/${eventId}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ refresh_token: refreshToken }),
    });

    if (!response.ok) {
      const error = await response.json();
      const errorMessage = error.error || "Failed to delete calendar event";
      
      // If authentication error, clear token
      if (errorMessage.includes("expired") || errorMessage.includes("reconnect")) {
        const { deleteRefreshToken } = await import("../auth/token-storage");
        await deleteRefreshToken();
      }
      
      // Don't throw if event not found (might already be deleted)
      if (errorMessage.includes("not found")) {
        console.warn("Calendar event not found, continuing with delete");
        return;
      }
      
      throw new Error(errorMessage);
    }
  } catch (error: any) {
    console.error("Error deleting calendar event:", error);
    
    // Re-throw with user-friendly message
    if (error.message) {
      throw error;
    }
    
    throw new Error("Failed to delete calendar event. Please check your connection.");
  }
}

