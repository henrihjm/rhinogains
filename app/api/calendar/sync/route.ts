import { NextRequest, NextResponse } from "next/server";
import { WorkoutWithDetails } from "@/lib/types";
import { getRefreshToken } from "@/lib/auth/token-storage";
import { refreshAccessToken } from "@/lib/auth/google";
import { createCalendarEvent, updateCalendarEvent } from "@/lib/calendar/google-calendar";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { workout, refresh_token } = body as {
      workout: WorkoutWithDetails;
      refresh_token: string;
    };

    if (!workout?.id) {
      return NextResponse.json(
        { error: "Workout ID is required" },
        { status: 400 }
      );
    }

    if (!refresh_token) {
      return NextResponse.json(
        { error: "Not authenticated with Google Calendar" },
        { status: 401 }
      );
    }

    let eventId: string;

    if (workout.calendar_event_id) {
      // Update existing event
      await updateCalendarEvent(workout.calendar_event_id, workout, refresh_token);
      eventId = workout.calendar_event_id;
    } else {
      // Create new event
      eventId = await createCalendarEvent(workout, refresh_token);
    }

    return NextResponse.json({ eventId });
  } catch (error: any) {
    console.error("Error syncing to calendar:", error);
    return NextResponse.json(
      { error: error.message || "Failed to sync to calendar" },
      { status: 500 }
    );
  }
}

