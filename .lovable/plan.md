
# Fix: Set Java Version GLOBALLY for ALL Android Modules

## Actual Problem
The error `:capacitor-android:compileDebugJavaWithJavac` shows the failure is in the **capacitor-android subproject** (in node_modules), NOT just android/app. We've been fixing only `android/app/build.gradle` but the capacitor plugins have their own compile settings.

## Solution
Add a **global Java version override** to `android/build.gradle` (the ROOT build.gradle) that applies Java 17 to ALL subprojects including capacitor plugins.

## Technical Changes

**File**: `scripts/build-android.bat`

Add a new step AFTER ProGuard fix that patches `android/build.gradle` (root) to add:

```groovy
subprojects {
    afterEvaluate { project ->
        if (project.hasProperty('android')) {
            android {
                compileOptions {
                    sourceCompatibility JavaVersion.VERSION_17
                    targetCompatibility JavaVersion.VERSION_17
                }
            }
            if (project.hasProperty('kotlin')) {
                tasks.withType(org.jetbrains.kotlin.gradle.tasks.KotlinCompile) {
                    kotlinOptions {
                        jvmTarget = "17"
                    }
                }
            }
        }
    }
}
```

This forces ALL Android subprojects (including capacitor-android, capacitor-cordova-android-plugins) to use Java 17.
