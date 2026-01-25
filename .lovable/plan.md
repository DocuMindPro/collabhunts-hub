
## Fix Android App Crash - Local Build Configuration

The app is crashing because the Android WebView still has cached configuration or there's a runtime error. Here's the fix:

---

### Root Cause Analysis

1. The app installed successfully (as shown in screenshot)
2. It opened for 1 second, then crashed
3. The Android WebView then shows an external URL (lovable.dev/login)

This happens because:
- The `android` folder was created BEFORE we removed the server URL
- The old `capacitor.config.ts` with the server URL was synced to the Android project
- The Android project still has the old configuration cached

---

### Solution: Clean Rebuild of Android Project

You need to delete and recreate the Android folder to pick up the new configuration.

**Step 1: Delete the Android folder**
In your Command Prompt:
```bash
cd Desktop\collabhunts-hub
rmdir /s /q android
```

**Step 2: Pull the latest changes**
```bash
git pull
```

**Step 3: Rebuild the project**
```bash
npm run build
```

**Step 4: Re-add the Android platform**
```bash
npx cap add android
```

**Step 5: Sync the project**
```bash
npx cap sync android
```

**Step 6: Re-open in Android Studio**
```bash
npx cap open android
```

**Step 7: Run the app**
Wait for Gradle sync to finish, then click the green play button.

---

### Complete Command Sequence (copy/paste friendly)

```bash
cd Desktop\collabhunts-hub
rmdir /s /q android
git pull
npm run build
npx cap add android
npx cap sync android
npx cap open android
```

---

### What This Fixes

- Removes the old Android configuration that had the server URL
- Creates a fresh Android project from the updated `capacitor.config.ts`
- Ensures the app loads from local `dist` files instead of a remote URL

---

### Expected Result

After running these commands:
1. Android Studio will open with the fresh project
2. Wait for Gradle sync (may take a few minutes)
3. Click the green play button
4. The app should now show your **CollabHunts login page** instead of the Lovable platform login

---

### Troubleshooting

If it still crashes, run Android Studio with **Logcat** open to see the error:
1. In Android Studio, click **View → Tool Windows → Logcat**
2. Run the app
3. Look for red error messages when it crashes
4. Share those error messages with me so I can help debug further
