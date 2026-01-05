# Google Calendar Integration Setup Guide

## Overview

Rhino Gains can sync your workouts to Google Calendar, creating calendar events when you save, update, or delete workouts.

## Prerequisites

- Google account
- Google Cloud Project (free tier is sufficient)

## Setup Steps

### 1. Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click "Create Project" or select an existing project
3. Give it a name (e.g., "Rhino Gains")
4. Click "Create"

### 2. Enable Google Calendar API

1. In your Google Cloud Project, go to "APIs & Services" > "Library"
2. Search for "Google Calendar API"
3. Click on it and press "Enable"

### 3. Create OAuth 2.0 Credentials

1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "OAuth client ID"
3. If prompted, configure the OAuth consent screen:
   - User Type: External (unless you have a Google Workspace)
   - App name: "Rhino Gains"
   - User support email: Your email
   - Developer contact: Your email
   - Click "Save and Continue"
   - Scopes: Add `https://www.googleapis.com/auth/calendar`
   - Click "Save and Continue"
   - Add test users (your email) if in testing mode
   - Click "Save and Continue"
4. Back to Credentials, create OAuth client ID:
   - Application type: "Web application"
   - Name: "Rhino Gains Web Client"
   - Authorized redirect URIs:
     - `http://localhost:3000/api/auth/google/callback` (for development)
     - `https://yourdomain.com/api/auth/google/callback` (for production)
   - Click "Create"
5. Copy the **Client ID** and **Client Secret**

### 4. Configure Environment Variables

1. Create a `.env.local` file in the project root (if it doesn't exist)
2. Add the following:

```env
GOOGLE_CLIENT_ID=your-client-id-here
GOOGLE_CLIENT_SECRET=your-client-secret-here
GOOGLE_REDIRECT_URI=http://localhost:3000/api/auth/google/callback
NEXTAUTH_SECRET=generate-a-random-secret-here
```

3. Generate `NEXTAUTH_SECRET`:
   ```bash
   openssl rand -base64 32
   ```

### 5. Install Dependencies

```bash
npm install
```

This will install the `googleapis` package needed for Calendar API integration.

### 6. Test the Integration

1. Start the development server:
   ```bash
   npm run dev
   ```

2. Open the app in your browser
3. Click "Connect Calendar" on the home page
4. Sign in with your Google account
5. Grant calendar permissions
6. You should see "✓ Calendar connected"

## How It Works

### Workout Sync

- **On Save**: When you save a workout, a calendar event is created with:
  - Title: "{WorkoutType} Workout" (e.g., "Push Workout")
  - Start time: When you started the workout
  - End time: When you finished (or 1 hour default)
  - Description: List of exercises with sets

- **On Update**: When you edit a workout, the calendar event is updated with new information

- **On Delete**: When you delete a workout, the calendar event is also deleted

### Authentication

- Uses OAuth 2.0 with refresh tokens
- Refresh token is stored securely in IndexedDB (browser storage)
- Access tokens are refreshed automatically when needed
- If authentication expires, you'll be prompted to reconnect

## Troubleshooting

### "Calendar not connected" error

- Make sure you've completed the OAuth flow
- Check that environment variables are set correctly
- Verify the redirect URI matches in Google Cloud Console

### "Calendar authentication expired" error

- Click "Disconnect" and then "Connect Calendar" again
- This will refresh your authentication

### Events not appearing in calendar

- Check that you granted calendar permissions during OAuth
- Verify the Google Calendar API is enabled in your project
- Check browser console for errors

### Development vs Production

- For production, update `GOOGLE_REDIRECT_URI` to your production domain
- Add the production redirect URI to Google Cloud Console
- Make sure `NEXTAUTH_SECRET` is set in your production environment

## Security Notes

- Never commit `.env.local` to version control
- The refresh token is stored locally in your browser
- Access tokens are short-lived and refreshed automatically
- All API calls are made server-side for security

## Disconnecting

To disconnect your calendar:

1. Click "Disconnect" in the app
2. This removes the stored refresh token
3. Future workouts won't sync to calendar
4. Existing calendar events remain (they're not deleted)

To revoke access completely:

1. Go to [Google Account Settings](https://myaccount.google.com/permissions)
2. Find "Rhino Gains" in the list
3. Click "Remove Access"

