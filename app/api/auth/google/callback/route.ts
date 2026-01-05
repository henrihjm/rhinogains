import { NextRequest, NextResponse } from "next/server";
import { exchangeCodeForTokens } from "@/lib/auth/google";
import { cookies } from "next/headers";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get("code");
  const error = searchParams.get("error");

  if (error) {
    return NextResponse.redirect(
      new URL(`/?error=${encodeURIComponent(error)}`, request.url)
    );
  }

  if (!code) {
    return NextResponse.redirect(
      new URL("/?error=missing_code", request.url)
    );
  }

  try {
    const redirectUri =
      process.env.GOOGLE_REDIRECT_URI ||
      `${request.nextUrl.origin}/api/auth/google/callback`;

    const { refresh_token } = await exchangeCodeForTokens(code, redirectUri);

    // Store refresh token temporarily in a secure httpOnly cookie
    // The client will retrieve it and store in IndexedDB
    const cookieStore = await cookies();
    cookieStore.set("google_refresh_token_temp", refresh_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60, // 1 minute - just long enough for client to retrieve
      path: "/",
    });

    // Redirect to success page that will retrieve token and store in IndexedDB
    return NextResponse.redirect(
      new URL("/?calendar_connected=true", request.url)
    );
  } catch (error) {
    console.error("Error exchanging code for tokens:", error);
    return NextResponse.redirect(
      new URL(
        `/?error=${encodeURIComponent("Failed to connect calendar")}`,
        request.url
      )
    );
  }
}

