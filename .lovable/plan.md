

# Fix: Correct Java Version Replacement in Build Script

## Problem Identified
The build still fails because the PowerShell command on line 57 uses the wrong quote type:
- **Current (wrong)**: Looking for `jvmTarget = '21'` (single quotes)
- **Actual Gradle format**: `jvmTarget = "21"` (double quotes)

## Solution
Update `scripts/build-android.bat` line 57 to escape double quotes correctly in PowerShell.

## Technical Change

**File**: `scripts/build-android.bat`

**Line 57 - Current (broken)**:
```batch
powershell -Command "(Get-Content 'android/app/build.gradle') -replace 'jvmTarget = ''21''', 'jvmTarget = ''17''' | Set-Content 'android/app/build.gradle'"
```

**Line 57 - Fixed**:
```batch
powershell -Command "(Get-Content 'android/app/build.gradle') -replace 'jvmTarget = \"21\"', 'jvmTarget = \"17\"' | Set-Content 'android/app/build.gradle'"
```

## What This Fixes

| Pattern | Before (Wrong) | After (Correct) |
|---------|---------------|-----------------|
| Looking for | `jvmTarget = '21'` | `jvmTarget = "21"` |
| Replacing with | `jvmTarget = '17'` | `jvmTarget = "17"` |

## After I Apply This Fix

1. Wait for the changes to sync to GitHub (about 1 minute)
2. Delete your local `collabhunts-hub` folder
3. Re-clone: `git clone https://github.com/eliasnau/collabhunts-hub.git`
4. Run: `cd collabhunts-hub && scripts\build-android.bat`

The script will now correctly find and replace both:
- `JavaVersion.VERSION_21` → `JavaVersion.VERSION_17` ✓ (already working)
- `jvmTarget = "21"` → `jvmTarget = "17"` ✓ (now fixed)

