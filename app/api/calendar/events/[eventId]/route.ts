import { NextRequest, NextResponse } from "next/server";
import { deleteCalendarEvent, updateCalendarEvent } from "@/lib/calendar/google-calendar";
import { WorkoutWithDetails } from "@/lib/types";

export async function PUT(
  request: NextRequest,
  { params }: { params: { eventId: string } }
) {
  try {
    const body = await request.json();
    const { workout, refresh_token } = body as { workout: WorkoutWithDetails; refresh_token: string };
    const { eventId } = params;

    if (!refresh_token) {
      return NextResponse.json(
        { error: "Not authenticated with Google Calendar" },
        { status: 401 }
      );
    }

    await updateCalendarEvent(eventId, workout, refresh_token);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error updating calendar event:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update calendar event" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { eventId: string } }
) {
  try {
    const body = await request.json();
    const { refresh_token } = body as { refresh_token: string };
    const { eventId } = params;

    if (!refresh_token) {
      return NextResponse.json(
        { error: "Not authenticated with Google Calendar" },
        { status: 401 }
      );
    }

    await deleteCalendarEvent(eventId, refresh_token);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error deleting calendar event:", error);
    return NextResponse.json(
      { error: error.message || "Failed to delete calendar event" },
      { status: 500 }
    );
  }
}

