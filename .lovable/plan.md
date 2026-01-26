

# Fix ProGuard Replacement with Robust PowerShell Encoding

## Problem Analysis

The build script's PowerShell command to replace `proguard-android.txt` with `proguard-android-optimize.txt` is failing silently due to:

1. **Encoding corruption**: Windows PowerShell 5.1 (default on Windows) adds a UTF-8 BOM (Byte Order Mark) when using `Set-Content`. Gradle cannot parse files with a BOM, causing errors or the file appearing unchanged
2. **No `-Raw` flag**: Without `-Raw`, the file is read line-by-line which can cause issues with multi-line matching
3. **Silent failure**: The verification step might pass even if the file is corrupted

## Technical Solution

### File: `scripts/build-android.bat`

Replace the PowerShell commands in Step 4.5 with BOM-free file writing using .NET APIs:

**Current (broken):**
```batch
powershell -Command "(Get-Content 'node_modules/@capacitor/android/capacitor/build.gradle') -replace 'proguard-android\.txt', 'proguard-android-optimize.txt' | Set-Content 'node_modules/@capacitor/android/capacitor/build.gradle'"
```

**Fixed (using .NET for BOM-less UTF-8):**
```batch
powershell -NoProfile -Command "$file = 'node_modules/@capacitor/android/capacitor/build.gradle'; $content = [IO.File]::ReadAllText($file); $content = $content -replace 'proguard-android\.txt', 'proguard-android-optimize.txt'; $utf8NoBom = New-Object System.Text.UTF8Encoding $false; [IO.File]::WriteAllText($file, $content, $utf8NoBom)"
```

This approach:
- Reads the entire file as raw text
- Performs the replacement
- Writes back without UTF-8 BOM using .NET's `UTF8Encoding($false)`

### Updated Step 4.5 in build script:

```batch
echo.
echo Step 4.5: Fixing ProGuard in Capacitor library (node_modules)...
powershell -NoProfile -Command "$file = 'node_modules/@capacitor/android/capacitor/build.gradle'; $content = [IO.File]::ReadAllText($file); $content = $content -replace 'proguard-android\.txt', 'proguard-android-optimize.txt'; $utf8NoBom = New-Object System.Text.UTF8Encoding $false; [IO.File]::WriteAllText($file, $content, $utf8NoBom); Write-Host 'ProGuard replacement applied'"
echo Verifying fix was applied...
powershell -NoProfile -Command "$content = [IO.File]::ReadAllText('node_modules/@capacitor/android/capacitor/build.gradle'); if ($content -match 'proguard-android-optimize\.txt') { Write-Host 'SUCCESS: ProGuard fix verified!' } else { Write-Host 'ERROR: Fix did not apply!'; exit 1 }"
echo Capacitor library ProGuard fixed.
```

---

## Why This Fix Works

| Issue | Old Approach | New Approach |
|-------|--------------|--------------|
| BOM | `Set-Content` adds BOM in PS 5.1 | `UTF8Encoding($false)` = no BOM |
| Reading | Line-by-line with potential issues | `ReadAllText` - raw single string |
| Reliability | Silent failures | Explicit error handling with `exit 1` |
| Encoding | May corrupt special chars | Clean UTF-8 throughout |

---

## After Implementation

1. Wait for GitHub sync (~1 minute)
2. Delete your local project folder: `rd /s /q collabhunts-hub`
3. Fresh clone: `git clone https://github.com/eliasnau/collabhunts-hub.git`
4. Run: `scripts\build-android.bat`
5. Watch for:
   - "ProGuard replacement applied"
   - "SUCCESS: ProGuard fix verified!"
   - "BUILD SUCCESSFUL!"

If the verification shows "ERROR: Fix did not apply!", the script will now stop immediately so you can investigate.

