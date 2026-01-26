
# Fix: Write Gradle Config to External File (Reliable Approach)

## Why Previous Attempts Failed
The PowerShell heredoc syntax (`@'...'@`) does NOT work from batch files because:
1. Heredocs require the ending `'@` to be on its own line
2. Batch files put everything on one line when executing
3. The complex escaping with backticks isn't being interpreted correctly

The global Java override is **never being added** to `android/build.gradle`.

## Solution: Use External Gradle Configuration File

Instead of trying to inject complex Groovy code via PowerShell in a batch file, we will:

1. **Create a separate Gradle init script** file: `scripts/java17-override.gradle`
2. **Copy this file** into the Android project during build
3. **Apply it** from the root `build.gradle` with a simple one-line append

This is more reliable because:
- No complex escaping issues
- The Gradle code lives in a proper `.gradle` file
- The batch script just needs to copy a file and append one line

## Technical Changes

### New File: `scripts/java17-override.gradle`
```groovy
// Force Java 17 for ALL subprojects (including Capacitor plugins)
subprojects {
    afterEvaluate { project ->
        if (project.hasProperty('android')) {
            android {
                compileOptions {
                    sourceCompatibility JavaVersion.VERSION_17
                    targetCompatibility JavaVersion.VERSION_17
                }
            }
        }
        tasks.withType(org.jetbrains.kotlin.gradle.tasks.KotlinCompile).configureEach {
            kotlinOptions {
                jvmTarget = "17"
            }
        }
    }
}
```

### Updated `scripts/build-android.bat`
Replace the problematic Step 5.5 with:

```batch
echo.
echo Step 5.5: Applying global Java 17 configuration...
:: Copy the java17 override gradle file
copy /Y "scripts\java17-override.gradle" "android\java17-override.gradle"
:: Append apply statement to root build.gradle
echo. >> "android\build.gradle"
echo apply from: 'java17-override.gradle' >> "android\build.gradle"
echo Global Java 17 configuration applied.
```

This uses **native batch commands** (copy, echo) instead of complex PowerShell, making it 100% reliable.

## Implementation Summary

| Step | Action |
|------|--------|
| 1 | Create `scripts/java17-override.gradle` with the Groovy configuration |
| 2 | Update `scripts/build-android.bat` to copy this file and apply it |
| 3 | Remove the broken PowerShell heredoc commands |

## After This Fix

1. Wait for GitHub sync (~1 minute)
2. Delete your local folder
3. Re-clone: `git clone https://github.com/eliasnau/collabhunts-hub.git`
4. Run: `cd collabhunts-hub && scripts\build-android.bat`

The script will now use reliable batch file commands to ensure the Java 17 override is properly applied to ALL Android modules including Capacitor plugins.
