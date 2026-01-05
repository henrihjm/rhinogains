import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

// This endpoint allows the client to retrieve the refresh token
// from the secure cookie and store it in IndexedDB
export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("google_refresh_token_temp")?.value;

    if (!token) {
      return NextResponse.json(
        { error: "No token found" },
        { status: 404 }
      );
    }

    // Delete the cookie after retrieving
    cookieStore.delete("google_refresh_token_temp");

    return NextResponse.json({ refresh_token: token });
  } catch (error) {
    console.error("Error retrieving token:", error);
    return NextResponse.json(
      { error: "Failed to retrieve token" },
      { status: 500 }
    );
  }
}

