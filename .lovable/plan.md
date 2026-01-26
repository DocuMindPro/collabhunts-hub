
# Fix Android Build: ProGuard + Lovable Login Issues

## Problems Identified

1. **ProGuard Error**: The current build script only fixes `android/app/build.gradle`, but the Capacitor library at `node_modules/@capacitor/android/capacitor/build.gradle` also contains the deprecated `proguard-android.txt` reference
2. **Lovable Login Still Showing**: The `android` folder has old cached configuration from before we removed the `server` block

## Solution

Update the build script to:
1. Fix ProGuard in **both** locations (app AND capacitor library)
2. Force a complete fresh rebuild every time
3. Ensure proper sync after all fixes are applied

## Technical Changes

### File: `scripts/build-android.bat`

Add a new step after "npm install" to fix ProGuard in the Capacitor library:

```batch
echo Step 1.5: Fixing ProGuard in Capacitor library...
powershell -Command "(Get-Content 'node_modules/@capacitor/android/capacitor/build.gradle') -replace 'proguard-android\.txt', 'proguard-android-optimize.txt' | Set-Content 'node_modules/@capacitor/android/capacitor/build.gradle'"
echo Capacitor library ProGuard fixed.
```

This ensures the fix is applied to `node_modules/@capacitor/android/capacitor/build.gradle` every time you run the build script (since npm install can overwrite it).

---

## Complete Step-by-Step After This Change

### Step 1: Wait for GitHub Sync
Wait about 1 minute for the updated build script to sync to GitHub.

### Step 2: Delete Everything and Start Fresh
```
cd C:\Users\elias
rd /s /q collabhunts-hub
```

### Step 3: Fresh Clone
```
git clone https://github.com/eliasnau/collabhunts-hub.git
cd collabhunts-hub
```

### Step 4: Run the Updated Build Script
```
scripts\build-android.bat
```

The script will now:
- Install dependencies
- Fix ProGuard in the Capacitor library (NEW!)
- Build the web app
- Delete old android folder
- Add fresh Android platform
- Fix ProGuard in app build.gradle
- Apply Java 17 configuration
- Downgrade Gradle to 8.10
- Sync Capacitor
- Build the APK

### Step 5: Test in Android Studio
After the script completes successfully:
1. Open Android Studio
2. File → Open → Select `collabhunts-hub\android`
3. Wait for sync
4. Create/Select an emulator
5. Click the green Run button

The app should now:
- Build without ProGuard errors
- Open directly to your app (NOT the Lovable login)

---

## Why This Works

| Issue | Root Cause | Fix |
|-------|-----------|-----|
| ProGuard error | `node_modules/@capacitor/android/capacitor/build.gradle` uses deprecated file | Script fixes it after npm install |
| Lovable login showing | Old cached android folder | Script deletes android folder and rebuilds fresh |
| Java 21 errors | Capacitor generates Java 21 config | Script applies Java 17 override globally |

---

## Future Workflow

Whenever you make changes in Lovable:
```
git pull
scripts\build-android.bat
```

That's it! The script handles all the fixes automatically.
