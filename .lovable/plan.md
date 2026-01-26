

# Switch Android App to Local Build Mode

## What This Fix Does
Removes the `server` block from `capacitor.config.ts` so the Android app loads from local files (`dist` folder) instead of the Lovable preview URL. This eliminates the login requirement and makes the app work offline.

## Technical Change

**File**: `capacitor.config.ts`

Remove lines 7-10 (the entire `server` block):

```typescript
import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.f0d3858ae7f2489288d232504acaef78',
  appName: 'CollabHunts Creators',
  webDir: 'dist',
  plugins: {
    PushNotifications: {
      presentationOptions: ['badge', 'sound', 'alert'],
    },
    SplashScreen: {
      launchShowDuration: 0,
      launchAutoHide: true,
    },
    StatusBar: {
      backgroundColor: '#F97316',
      style: 'LIGHT',
    },
    Keyboard: {
      resize: 'body',
      resizeOnFullScreen: true,
    },
  },
};

export default config;
```

---

## Complete Step-by-Step After This Change

### Step 1: Wait for GitHub Sync
After I make this change, wait about 1 minute for the code to sync to GitHub.

### Step 2: Delete Your Current Local Folder
Delete the entire `collabhunts-hub` folder on your computer.

### Step 3: Fresh Clone
Open Command Prompt and run:
```
git clone https://github.com/eliasnau/collabhunts-hub.git
cd collabhunts-hub
```

### Step 4: Build the APK
Run the build script:
```
scripts\build-android.bat
```

### Step 5: Install the APK
Your APK will be at:
```
android\app\build\outputs\apk\debug\app-debug.apk
```

Transfer to phone and install, OR run:
```
adb install android\app\build\outputs\apk\debug\app-debug.apk
```

### Step 6: Open in Android Studio (Optional)
If you want to run directly on device:
1. Open Android Studio
2. File → Open → Select the `android` folder
3. Wait for sync
4. Click the green Run button

---

## Future Development Workflow

When you make changes in Lovable and want to update the app:

```text
1. Make changes in Lovable (as you normally do)
2. Open Command Prompt
3. cd collabhunts-hub
4. git pull
5. npm run build
6. npx cap sync android
7. Either: run scripts\build-android.bat for new APK
   Or: Press Run in Android Studio
```

---

## Summary

| Before | After |
|--------|-------|
| App loads Lovable preview URL | App loads from local `dist` files |
| Requires Lovable login | Works without login |
| Needs internet | Works offline |
| Changes appear instantly | Need to rebuild after changes |

