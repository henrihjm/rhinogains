import { WorkoutWithDetails } from "../types";
import { refreshAccessToken } from "../auth/google";
import { google } from "googleapis";

async function getAccessTokenFromRefresh(refreshToken: string): Promise<string> {
  try {
    const accessToken = await refreshAccessToken(refreshToken);
    return accessToken;
  } catch (error: any) {
    console.error("Error refreshing access token:", error);
    
    // If refresh token is invalid/expired
    if (error.message?.includes("invalid_grant") || error.message?.includes("invalid_token")) {
      throw new Error("Calendar connection expired. Please reconnect.");
    }
    
    throw error;
  }
}

function formatWorkoutDescription(workout: WorkoutWithDetails): string {
  const exercises = workout.exercises
    .filter((exercise) => {
      // Only include exercises with at least one set with data
      return exercise.sets.some(
        (set) => set.weight !== null || set.reps !== null
      );
    })
    .map((exercise) => {
      const sets = exercise.sets
        .filter((set) => set.weight !== null || set.reps !== null)
        .map((set) => {
          const weight = set.weight !== null ? `${set.weight} kg` : "";
          const reps = set.reps !== null ? `${set.reps} reps` : "";
          return weight && reps ? `${weight} x ${reps}` : weight || reps;
        })
        .join(", ");

      return sets ? `- ${exercise.name}: ${sets}` : `- ${exercise.name}`;
    })
    .join("\n");

  return exercises || "No exercises logged";
}

export async function createCalendarEvent(
  workout: WorkoutWithDetails,
  refreshToken: string
): Promise<string> {
  const accessToken = await getAccessTokenFromRefresh(refreshToken);

  const oauth2Client = new google.auth.OAuth2();
  oauth2Client.setCredentials({ access_token: accessToken });

  const calendar = google.calendar({ version: "v3", auth: oauth2Client });

  // Calculate end time (use finished_at if available, otherwise estimate 1 hour)
  const startTime = new Date(workout.started_at);
  const endTime = workout.finished_at
    ? new Date(workout.finished_at)
    : new Date(workout.started_at + 60 * 60 * 1000); // Default 1 hour

  const event = {
    summary: `GYM ${workout.workout_type} Workout`,
    description: formatWorkoutDescription(workout),
    start: {
      dateTime: startTime.toISOString(),
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    },
    end: {
      dateTime: endTime.toISOString(),
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    },
  };

  try {
    const response = await calendar.events.insert({
      calendarId: "primary",
      requestBody: event,
    });

    if (!response.data.id) {
      throw new Error("Failed to create calendar event");
    }

    return response.data.id;
  } catch (error: any) {
    console.error("Error creating calendar event:", error);
    
    // Handle specific Google API errors
    if (error.code === 401) {
      throw new Error("Calendar authentication expired. Please reconnect.");
    } else if (error.code === 403) {
      throw new Error("Calendar access denied. Please check permissions.");
    } else if (error.code === 404) {
      throw new Error("Calendar not found.");
    } else if (error.message) {
      throw new Error(`Calendar error: ${error.message}`);
    }
    
    throw new Error("Failed to create calendar event. Please try again.");
  }
}

export async function updateCalendarEvent(
  eventId: string,
  workout: WorkoutWithDetails,
  refreshToken: string
): Promise<void> {
  const accessToken = await getAccessTokenFromRefresh(refreshToken);

  const oauth2Client = new google.auth.OAuth2();
  oauth2Client.setCredentials({ access_token: accessToken });

  const calendar = google.calendar({ version: "v3", auth: oauth2Client });

  // Only update summary and description, preserve existing start/end times
  const event = {
    summary: `GYM ${workout.workout_type} Workout`,
    description: formatWorkoutDescription(workout),
    // DO NOT include start/end - they remain unchanged
  };

  try {
    await calendar.events.update({
      calendarId: "primary",
      eventId: eventId,
      requestBody: event,
    });
  } catch (error: any) {
    console.error("Error updating calendar event:", error);
    
    // Handle specific Google API errors
    if (error.code === 401) {
      throw new Error("Calendar authentication expired. Please reconnect.");
    } else if (error.code === 403) {
      throw new Error("Calendar access denied. Please check permissions.");
    } else if (error.code === 404) {
      throw new Error("Calendar event not found. It may have been deleted.");
    } else if (error.message) {
      throw new Error(`Calendar error: ${error.message}`);
    }
    
    throw new Error("Failed to update calendar event. Please try again.");
  }
}

export async function deleteCalendarEvent(
  eventId: string,
  refreshToken: string
): Promise<void> {
  const accessToken = await getAccessTokenFromRefresh(refreshToken);

  const oauth2Client = new google.auth.OAuth2();
  oauth2Client.setCredentials({ access_token: accessToken });

  const calendar = google.calendar({ version: "v3", auth: oauth2Client });

  try {
    await calendar.events.delete({
      calendarId: "primary",
      eventId: eventId,
    });
  } catch (error: any) {
    console.error("Error deleting calendar event:", error);
    
    // Handle specific Google API errors
    // 404 is OK - event might already be deleted
    if (error.code === 404) {
      console.warn("Calendar event not found (may already be deleted)");
      return; // Don't throw error if event is already gone
    } else if (error.code === 401) {
      throw new Error("Calendar authentication expired. Please reconnect.");
    } else if (error.code === 403) {
      throw new Error("Calendar access denied. Please check permissions.");
    } else if (error.message) {
      throw new Error(`Calendar error: ${error.message}`);
    }
    
    throw new Error("Failed to delete calendar event. Please try again.");
  }
}

