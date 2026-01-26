

# Fix: Auto-Configure Java 17 in Build Script

## Problem Identified
The build fails with "invalid source release: 21" because:
- Capacitor generates `android/app/build.gradle` with Java 21 settings
- Your system has JDK 17 installed
- The build script doesn't fix this automatically

## Solution
Update the `scripts/build-android.bat` file to automatically change Java version from 21 to 17 after Capacitor creates the Android project.

## Changes to Make

### File: `scripts/build-android.bat`

Add a new **Step 5.5** right after the ProGuard fix (after line 51) to fix the Java version:

```text
echo.
echo Step 5.5: Fixing Java version to 17...
:: Fix Java version from 21 to 17 in build.gradle
powershell -Command "(Get-Content 'android/app/build.gradle') -replace 'VERSION_21', 'VERSION_17' | Set-Content 'android/app/build.gradle'"
powershell -Command "(Get-Content 'android/app/build.gradle') -replace 'jvmTarget = ''21''', 'jvmTarget = ''17''' | Set-Content 'android/app/build.gradle'"
echo Java version set to 17.
```

## What This Does

| Line | Purpose |
|------|---------|
| First PowerShell command | Changes `JavaVersion.VERSION_21` to `JavaVersion.VERSION_17` (fixes `sourceCompatibility` and `targetCompatibility`) |
| Second PowerShell command | Changes `jvmTarget = '21'` to `jvmTarget = '17'` (fixes Kotlin settings) |

## After Implementation

Once I make this change and it syncs to GitHub:

1. Delete your local project folder
2. Clone fresh: `git clone https://github.com/eliasnau/collabhunts-hub.git`
3. Run: `cd collabhunts-hub && scripts\build-android.bat`
4. The script will automatically fix Java 17, ProGuard, and Gradle - no manual edits needed!

## Updated Script Flow

| Step | Action |
|------|--------|
| 1 | npm install |
| 2 | npm run build |
| 3 | Remove old android folder |
| 4 | npx cap add android |
| 5 | Fix ProGuard configuration |
| **5.5** | **Fix Java version to 17** (NEW) |
| 6 | Downgrade Gradle to 8.10 |
| 7 | npx cap sync android |
| 8 | gradlew assembleDebug |

