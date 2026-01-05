# Mobile Testing Guide

## Method 1: Test on Physical Mobile Device (Recommended)

### Step 1: Start Dev Server for Mobile Access

Stop your current dev server (Ctrl+C) and run:

```bash
npm run dev:mobile
```

This starts the server bound to `0.0.0.0`, allowing connections from other devices on your network.

### Step 2: Find Your Computer's IP Address

**On macOS:**
```bash
ifconfig | grep "inet " | grep -v 127.0.0.1
```

Or check System Settings → Network → Wi-Fi/Ethernet → Details

**On Linux:**
```bash
hostname -I
```

**On Windows:**
```bash
ipconfig
```
Look for "IPv4 Address" under your active network adapter.

You should see something like: `192.168.1.xxx` or `10.0.0.xxx`

### Step 3: Connect Your Mobile Device

1. **Ensure both devices are on the same Wi-Fi network**
   - Your computer and mobile device must be on the same network
   - Mobile hotspot won't work (different network)

2. **Open browser on your mobile device**
   - Chrome, Safari, Firefox all work
   - **Important:** Use a modern browser (IndexedDB support required)

3. **Navigate to:**
   ```
   http://YOUR_IP_ADDRESS:3000
   ```
   Example: `http://192.168.1.100:3000`

### Step 4: Test the App

- Test all core flows:
  - Start a workout
  - Log exercises with sets
  - Save workout
  - View history
  - Edit past workout
  - Calendar view

### Troubleshooting

**Can't connect:**
- Check firewall settings (allow port 3000)
- Verify both devices on same network
- Try disabling VPN if active
- Check that dev server shows "Ready" message

**IndexedDB not working:**
- Some browsers restrict IndexedDB in certain modes
- Try a different browser
- Check browser console for errors

**Slow connection:**
- Normal for first load (dev mode is slower)
- Subsequent navigation should be faster

---

## Method 2: Browser Dev Tools (Quick Testing)

For quick mobile UI testing without a physical device:

### Chrome DevTools

1. Open Chrome DevTools (F12 or Cmd+Option+I)
2. Click the device toggle icon (or Cmd+Shift+M)
3. Select a device preset (iPhone, iPad, etc.)
4. Or set custom dimensions
5. Test the app in the responsive view

### Firefox DevTools

1. Open DevTools (F12)
2. Click Responsive Design Mode (Cmd+Shift+M)
3. Select device or set custom size
4. Test the app

### Limitations

- **Not a real mobile device** (touch events may differ)
- **Performance may differ** (desktop hardware)
- **Some mobile-specific features** may not work correctly
- **IndexedDB works** but behavior may differ

**Best for:** UI/layout testing, quick checks
**Not ideal for:** Touch interaction testing, real performance testing

---

## Method 3: Playwright Mobile Emulation

For automated mobile testing:

### Update Playwright Config

Add mobile device emulation to `playwright.config.ts`:

```typescript
projects: [
  {
    name: 'chromium',
    use: { ...devices['Desktop Chrome'] },
  },
  {
    name: 'Mobile Chrome',
    use: { ...devices['Pixel 5'] },
  },
  {
    name: 'Mobile Safari',
    use: { ...devices['iPhone 12'] },
  },
],
```

Then run:
```bash
npm run test:e2e
```

---

## Recommended Testing Checklist

When testing on mobile, verify:

- [ ] **Touch targets are large enough** (60px minimum)
- [ ] **Text is readable** (high contrast, good size)
- [ ] **Navigation works smoothly** (no lag)
- [ ] **Forms are easy to fill** (keyboard appears correctly)
- [ ] **Bottom action bar is accessible** (not hidden by browser UI)
- [ ] **Calendar view is usable** (days are tappable)
- [ ] **IndexedDB works** (data persists after refresh)
- [ ] **No horizontal scrolling** (responsive design)
- [ ] **Works in portrait and landscape** (if applicable)

---

## Common Mobile Issues

### Bottom Action Bar Hidden
- Some mobile browsers have bottom UI that overlaps
- Test with different browsers
- Consider adding padding-bottom on mobile

### Keyboard Covers Inputs
- When keyboard appears, inputs may be hidden
- Test form filling on real device
- May need scroll-into-view behavior

### Touch Events
- Test actual tapping (not just hover)
- Verify buttons respond to touch
- Check for accidental double-taps

### Performance
- Dev mode is slower than production
- Test production build for real performance:
  ```bash
  npm run build
  npm run start
  ```

---

## Production Mobile Testing

For production-like testing:

1. Build the app:
   ```bash
   npm run build
   ```

2. Start production server:
   ```bash
   npm run start
   ```

3. Access from mobile (same IP:3000)

Production build is optimized and faster than dev mode.


