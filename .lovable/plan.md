
# Fix: Kotlin Plugin Check in Java 17 Override

## Problem
The error `Could not get unknown property 'org' for project ':app'` occurs because line 12 references `org.jetbrains.kotlin.gradle.tasks.KotlinCompile` unconditionally. Projects without the Kotlin plugin can't resolve this class.

## Solution
Wrap the Kotlin configuration in a `plugins.withId` check that only runs when the Kotlin plugin is actually applied to the project.

## Technical Change

**File**: `scripts/java17-override.gradle`

**Replace entire contents with**:

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
        
        // Only configure Kotlin if the plugin is applied
        project.plugins.withId('org.jetbrains.kotlin.android') {
            tasks.withType(org.jetbrains.kotlin.gradle.tasks.KotlinCompile).configureEach {
                kotlinOptions {
                    jvmTarget = "17"
                }
            }
        }
    }
}
```

## What Changed

| Before | After |
|--------|-------|
| Kotlin task config runs for ALL projects | Only runs if `kotlin-android` plugin is applied |
| Fails on projects without Kotlin | Safely skips non-Kotlin projects |

## After This Fix

1. Delete your local folder
2. Re-clone: `git clone https://github.com/eliasnau/collabhunts-hub.git`
3. Run: `cd collabhunts-hub && scripts\build-android.bat`
