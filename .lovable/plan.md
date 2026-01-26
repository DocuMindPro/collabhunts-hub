
# Fix: Reliable Java 17 Configuration for Android Build

## Problem Analysis

The build keeps failing with `invalid source release: 21` despite multiple fix attempts. After investigation:

1. **Root Cause**: The PowerShell commands in the batch file are not correctly replacing `jvmTarget = "21"` because of how batch files handle quote escaping when calling PowerShell
2. **Why Previous Fixes Failed**: 
   - Backslash-escaped quotes (`\"`) inside batch files don't always work reliably with PowerShell
   - Running multiple separate PowerShell commands can cause file locking issues
3. **The replacement for `VERSION_21` → `VERSION_17` appears to work**, but the `jvmTarget` replacement fails

## Solution

Rewrite the Java version fix step to use a **single, robust PowerShell command** that:
1. Combines all replacements into one command (avoids file locking)
2. Uses a different escaping approach that works reliably in batch files
3. Uses regex patterns that handle any quote style and spacing

## Technical Changes

**File**: `scripts/build-android.bat`

**Replace lines 53-58 with**:

```batch
echo.
echo Step 5.5: Fixing Java version to 17...
:: Fix Java version from 21 to 17 in build.gradle (all in one command)
powershell -NoProfile -Command "$file = 'android/app/build.gradle'; $content = Get-Content $file -Raw; $content = $content -replace 'VERSION_21', 'VERSION_17'; $content = $content -replace 'jvmTarget\s*=\s*[''\""]21[''\""]', 'jvmTarget = \"17\"'; Set-Content -Path $file -Value $content -NoNewline"
echo Java version set to 17.
```

## Why This Works

| Issue | Previous Approach | New Approach |
|-------|-------------------|--------------|
| File locking | Multiple separate commands | Single atomic operation |
| Quote escaping | `\"` (unreliable in batch) | Uses single quotes in regex `[''\""]` to match any quote type |
| Pattern matching | Exact string match | Regex with `\s*` for flexible spacing |
| Content handling | Line-by-line | Uses `-Raw` for entire file as single string |

## What Changes

The script will now:
1. Read the entire `build.gradle` file as a single string
2. Replace ALL occurrences of `VERSION_21` with `VERSION_17`
3. Replace `jvmTarget = "21"` OR `jvmTarget = '21'` (any quote style, any spacing) with `jvmTarget = "17"`
4. Write the file back in one atomic operation

## After This Fix

1. Wait for changes to sync to GitHub (~1 minute)
2. Delete your local `collabhunts-hub` folder
3. Re-clone: `git clone https://github.com/eliasnau/collabhunts-hub.git`
4. Run: `cd collabhunts-hub && scripts\build-android.bat`
