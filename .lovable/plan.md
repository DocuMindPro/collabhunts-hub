

# Fix Android Build Configuration

## Summary
Since the `android/` folder is generated locally and not stored in GitHub, I'll add **custom Capacitor configuration files** that will be used when you regenerate the Android project. This ensures the correct Gradle settings are applied from the start.

## What I'll Do

### 1. Update `capacitor.config.ts` with Android-specific settings
Add Android configuration to handle the ProGuard file correctly.

### 2. Add a `.gitignore` update (if needed)
Ensure the android folder is properly ignored to avoid future conflicts.

## After My Changes - Your Steps

Once I push the changes to GitHub:

### Step 1: Delete your local project folder
```cmd
cd C:\Users\elias\Desktop
rd /s /q collabhunts-hub
```

### Step 2: Clone fresh from GitHub
```cmd
git clone https://github.com/YOUR-USERNAME/collabhunts-hub.git
cd collabhunts-hub
```

### Step 3: Install dependencies
```cmd
npm install
```

### Step 4: Build the web app
```cmd
npm run build
```

### Step 5: Add Android platform (this regenerates the android folder)
```cmd
npx cap add android
```

### Step 6: Apply a manual fix BEFORE building
Open `android/app/build.gradle` and use Find & Replace:
- Find: `proguard-android.txt`
- Replace with: `proguard-android-optimize.txt`
- Replace ALL occurrences

### Step 7: Downgrade Gradle version
Open `android/gradle/wrapper/gradle-wrapper.properties` and change:
```properties
distributionUrl=https\://services.gradle.org/distributions/gradle-8.10-bin.zip
```

### Step 8: Build the APK
```cmd
cd android
.\gradlew assembleDebug --no-daemon
```

### Step 9: Find your APK
```cmd
dir app\build\outputs\apk\debug\
```
Your APK will be at: `app-debug.apk`

---

## Technical Notes

- **Why Gradle 8.10?**: Gradle 9.1.0 deprecated `proguard-android.txt` which causes the build error
- **Why regenerate android/?**: Ensures a clean slate without corrupted cache files
- **The android folder is local-only**: This is standard practice - it's regenerated per developer

## Alternative: Create a Build Script
I can also create a helper script (`build-android.bat`) that automates Steps 5-8 for you, making future builds easier.

