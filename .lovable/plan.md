
# Fix Android Build: Correct Order of ProGuard Fix + Global Override

## Root Cause Analysis

The current build script has a timing issue:
- **Step 1.5** applies ProGuard fix to `node_modules/@capacitor/android/capacitor/build.gradle`
- **Step 4** runs `npx cap add android` which regenerates/copies files
- The fix might be getting overwritten or not properly picked up

Additionally, the `:capacitor-android` module itself needs the ProGuard fix, and this module reads from `node_modules`.

## Solution

Update `scripts/build-android.bat` with these changes:

### 1. Move ProGuard Fix to After `npx cap add android`

Apply the fix **after** the Android platform is added, ensuring it sticks.

### 2. Add Verification Step

Add an echo to verify the fix was applied correctly.

### 3. Apply ProGuard Fix to BOTH Locations

Fix in:
- `node_modules/@capacitor/android/capacitor/build.gradle` (source)
- After cap add, verify the android project picks it up

## Technical Changes

### File: `scripts/build-android.bat`

**Remove** the current Step 1.5 (lines 22-25) from after npm install.

**Add** the ProGuard fix as a new Step 4.5, immediately AFTER `npx cap add android` (after line 50):

```batch
echo.
echo Step 4.5: Fixing ProGuard in Capacitor library (node_modules)...
powershell -Command "(Get-Content 'node_modules/@capacitor/android/capacitor/build.gradle') -replace 'proguard-android\.txt', 'proguard-android-optimize.txt' | Set-Content 'node_modules/@capacitor/android/capacitor/build.gradle'"
echo Verifying fix was applied...
powershell -Command "if ((Get-Content 'node_modules/@capacitor/android/capacitor/build.gradle') -match 'proguard-android-optimize.txt') { Write-Host 'SUCCESS: ProGuard fix verified!' } else { Write-Host 'WARNING: Fix may not have applied correctly' }"
echo Capacitor library ProGuard fixed.
```

Also add the Java 17 override to the Capacitor library's gradle file by updating `scripts/java17-override.gradle` to handle the capacitor-android subproject specifically.

---

## Updated Build Script Flow

| Step | Action | Why |
|------|--------|-----|
| 1 | npm install | Install dependencies |
| 2 | npm run build | Build web app |
| 3 | Delete android folder | Fresh start |
| 4 | npx cap add android | Add Android platform |
| **4.5 (NEW)** | Fix ProGuard in node_modules | After cap add, so it's not overwritten |
| 5 | Fix ProGuard in app/build.gradle | Belt and suspenders |
| 5.5 | Apply Java 17 global override | Force Java 17 everywhere |
| 5.6 | Fix Java version in app/build.gradle | Direct fix |
| 6 | Downgrade Gradle to 8.10 | Compatibility |
| 7 | npx cap sync | Sync native project |
| 8 | Build APK | Final build |

---

## After Implementation

1. Wait for GitHub sync (~1 minute)
2. Delete your local `collabhunts-hub` folder completely
3. Fresh clone: `git clone https://github.com/eliasnau/collabhunts-hub.git`
4. Run: `scripts\build-android.bat`
5. Look for "SUCCESS: ProGuard fix verified!" in the output
6. After "BUILD SUCCESSFUL!", open Android Studio

---

## Important: Do NOT Open Android Studio Separately

The build script now builds the APK directly (Step 8). You only need Android Studio to:
- Run on emulator (after the APK is already built)
- Debug issues

If the script says "BUILD SUCCESSFUL!", the APK is ready and you can install it directly without Android Studio sync issues.
