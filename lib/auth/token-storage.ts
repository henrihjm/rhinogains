import { db } from "../db";

const TOKEN_ID = "google_refresh_token";

export async function saveRefreshToken(refreshToken: string): Promise<void> {
  await db.googleTokens.put({
    id: TOKEN_ID,
    refresh_token: refreshToken,
    created_at: Date.now(),
  });
}

export async function getRefreshToken(): Promise<string | null> {
  const token = await db.googleTokens.get(TOKEN_ID);
  return token?.refresh_token || null;
}

export async function deleteRefreshToken(): Promise<void> {
  await db.googleTokens.delete(TOKEN_ID);
}

export async function isCalendarConnected(): Promise<boolean> {
  const token = await getRefreshToken();
  return token !== null;
}

