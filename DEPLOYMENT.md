# Deployment Guide - Vercel + PWA

## Prerequisites

1. GitHub account
2. Vercel account (free tier is sufficient)
3. App icons generated (see `public/ICON_GENERATION.md`)

## Step 1: Generate App Icons

Before deploying, you need to create app icons. See `public/ICON_GENERATION.md` for instructions.

Required icon files:
- `public/icon-192x192.png`
- `public/icon-512x512.png`
- `public/icon-180x180.png`
- `public/icon-152x152.png`
- `public/icon-120x120.png`

## Step 2: Push to GitHub

1. Initialize git repository (if not already done):
   ```bash
   git init
   git add .
   git commit -m "Initial commit with PWA support"
   ```

2. Create a new repository on GitHub

3. Push code to GitHub:
   ```bash
   git remote add origin <your-github-repo-url>
   git branch -M main
   git push -u origin main
   ```

## Step 3: Deploy to Vercel

1. Go to [vercel.com](https://vercel.com) and sign in (or create account)

2. Click "Add New Project"

3. Import your GitHub repository

4. Vercel will auto-detect Next.js settings:
   - Framework Preset: Next.js
   - Build Command: `npm run build` (auto-detected)
   - Output Directory: `.next` (auto-detected)
   - Install Command: `npm install` (auto-detected)

5. **Configure Environment Variables** (if using Google Calendar):
   - Go to Project Settings → Environment Variables
   - Add the following variables:
     - `GOOGLE_CLIENT_ID`
     - `GOOGLE_CLIENT_SECRET`
     - `GOOGLE_REDIRECT_URI` (use your Vercel URL: `https://your-app.vercel.app/api/auth/google/callback`)
     - `NEXTAUTH_SECRET` (generate a random string)

6. Click "Deploy"

7. Wait for deployment to complete (usually 1-2 minutes)

## Step 4: Test PWA Installation

### On Android (Chrome):

1. Open the deployed URL on your phone
2. Tap the menu (three dots) → "Add to Home screen" or "Install app"
3. Confirm installation
4. Open the app from home screen
5. Test offline functionality (enable airplane mode)

### On iOS (Safari):

1. Open the deployed URL on your phone
2. Tap the Share button (square with arrow)
3. Scroll down and tap "Add to Home Screen"
4. Customize the name if desired
5. Tap "Add"
6. Open the app from home screen
7. Test offline functionality (enable airplane mode)

## Step 5: Verify PWA Features

- [ ] App opens in standalone mode (no browser UI)
- [ ] App icon appears on home screen
- [ ] App works offline (can navigate, view workouts)
- [ ] Service worker is registered (check browser DevTools → Application → Service Workers)
- [ ] Manifest is loaded (check browser DevTools → Application → Manifest)

## Troubleshooting

### Service Worker Not Registering

- Check browser console for errors
- Ensure you're accessing via HTTPS (Vercel provides this automatically)
- Clear browser cache and try again

### Icons Not Showing

- Verify icon files exist in `public/` directory
- Check that icon paths in `manifest.json` are correct
- Clear browser cache

### Offline Not Working

- Check service worker registration in DevTools
- Verify caching strategy in `next.config.js`
- Test with browser DevTools → Network → Offline mode

### Build Errors on Vercel

- Check build logs in Vercel dashboard
- Ensure all dependencies are in `package.json`
- Verify `next.config.js` syntax is correct

## Updating the App

1. Make changes locally
2. Commit and push to GitHub
3. Vercel automatically deploys on push
4. Users will get the update on next app launch (service worker handles updates)

## Notes

- Service worker is disabled in development mode (see `next.config.js`)
- Icons must be generated before deployment
- Environment variables must be set in Vercel dashboard
- First deployment may take longer (2-3 minutes)

