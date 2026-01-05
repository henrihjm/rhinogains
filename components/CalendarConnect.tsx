"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { isCalendarConnected, saveRefreshToken, deleteRefreshToken } from "@/lib/auth/token-storage";

export default function CalendarConnect() {
  const router = useRouter();
  const [connected, setConnected] = useState(false);
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState(false);

  useEffect(() => {
    checkConnection();
    // Check for OAuth callback
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get("calendar_connected") === "true") {
      handleOAuthCallback();
    }
  }, []);

  const checkConnection = async () => {
    try {
      const isConnected = await isCalendarConnected();
      setConnected(isConnected);
    } catch (error) {
      console.error("Error checking calendar connection:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleOAuthCallback = async () => {
    try {
      // Retrieve token from server
      const response = await fetch("/api/auth/token");
      if (response.ok) {
        const data = await response.json();
        if (data.refresh_token) {
          await saveRefreshToken(data.refresh_token);
          setConnected(true);
          // Clean up URL
          router.replace("/");
        }
      }
    } catch (error) {
      console.error("Error handling OAuth callback:", error);
    }
  };

  const handleConnect = () => {
    setConnecting(true);
    // Redirect to OAuth flow
    window.location.href = "/api/auth/google";
  };

  const handleDisconnect = async () => {
    if (confirm("Are you sure you want to disconnect your Google Calendar? Future workouts won't be synced.")) {
      try {
        await deleteRefreshToken();
        setConnected(false);
      } catch (error) {
        console.error("Error disconnecting calendar:", error);
        alert("Failed to disconnect calendar. Please try again.");
      }
    }
  };

  if (loading) {
    return (
      <div className="px-4 py-2 text-sm text-gray-400">
        Checking calendar connection...
      </div>
    );
  }

  return (
    <div className="flex items-center gap-4">
      {connected ? (
        <>
          <span className="text-sm text-gray-400">✓ Calendar connected</span>
          <button
            onClick={handleDisconnect}
            className="px-4 py-2 bg-black text-white border-2 border-white rounded-lg font-semibold text-sm hover:bg-gray-900 transition-colors min-h-[44px]"
          >
            Disconnect
          </button>
        </>
      ) : (
        <>
          <span className="text-sm text-gray-400">Calendar not connected</span>
          <button
            onClick={handleConnect}
            disabled={connecting}
            className="px-4 py-2 bg-white text-black rounded-lg font-semibold text-sm hover:bg-gray-200 transition-colors min-h-[44px] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {connecting ? "Connecting..." : "Connect Calendar"}
          </button>
        </>
      )}
    </div>
  );
}

