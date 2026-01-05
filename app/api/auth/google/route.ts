import { NextRequest, NextResponse } from "next/server";
import { getGoogleAuthUrl } from "@/lib/auth/google";

export async function GET(request: NextRequest) {
  try {
    const redirectUri =
      process.env.GOOGLE_REDIRECT_URI ||
      `${request.nextUrl.origin}/api/auth/google/callback`;

    const authUrl = getGoogleAuthUrl(redirectUri);

    return NextResponse.redirect(authUrl);
  } catch (error) {
    console.error("Error initiating Google OAuth:", error);
    return NextResponse.json(
      { error: "Failed to initiate Google OAuth" },
      { status: 500 }
    );
  }
}

