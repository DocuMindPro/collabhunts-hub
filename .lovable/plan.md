

# Add Global ProGuard Fix to Gradle Configuration

## What This Does

The Android Studio AI suggested adding a `subprojects` block to the root `build.gradle` that applies the correct ProGuard file to all Android library subprojects. This is a "belt and suspenders" approach that catches any library using the deprecated ProGuard file.

## Technical Changes

### File: `scripts/java17-override.gradle`

Add the ProGuard fix to this file (which already handles global configurations):

```gradle
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
    
    // Fix ProGuard for ALL Android library subprojects
    project.plugins.whenPluginAdded { plugin ->
        if (plugin.class.name.equals("com.android.build.gradle.LibraryPlugin")) {
            android {
                buildTypes {
                    release {
                        proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'
                    }
                }
            }
        }
    }
}
```

---

## Why This Helps

| Approach | Location | Purpose |
|----------|----------|---------|
| Step 4.5 | `node_modules/.../build.gradle` | Direct file replacement - fixes the source |
| Step 5 | `android/app/build.gradle` | Fixes the app module specifically |
| **NEW** | `java17-override.gradle` | Global fix for ALL library subprojects |

With all three approaches in place, the ProGuard issue should be completely eliminated regardless of where it originates.

---

## After This Update

1. Wait for GitHub sync (~1 minute)
2. Delete your local `collabhunts-hub` folder
3. Fresh clone: `git clone https://github.com/eliasnau/collabhunts-hub.git`
4. Run: `scripts\build-android.bat`
5. The build should now succeed with multiple layers of ProGuard protection

