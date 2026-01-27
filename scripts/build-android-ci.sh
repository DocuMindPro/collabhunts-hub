#!/bin/bash
set -e

echo "========================================"
echo "CollabHunts Android Build Script (CI)"
echo "========================================"
echo

# Check if we're in the project root
if [ ! -f "package.json" ]; then
    echo "ERROR: Please run this script from the project root directory"
    exit 1
fi

echo "Step 1: Installing dependencies..."
npm ci

echo
echo "Step 2: Building web app..."
npm run build

echo
echo "Step 3: Removing existing Android folder if present..."
rm -rf android

echo
echo "Step 4: Adding Android platform..."
npx cap add android

echo
echo "Step 5: Fixing ProGuard in Capacitor library..."
sed -i 's/proguard-android\.txt/proguard-android-optimize.txt/g' node_modules/@capacitor/android/capacitor/build.gradle
echo "ProGuard fix applied to Capacitor library."

echo
echo "Step 6: Fixing ProGuard in app build.gradle..."
sed -i 's/proguard-android\.txt/proguard-android-optimize.txt/g' android/app/build.gradle
echo "ProGuard fix applied to app build.gradle."

echo
echo "Step 7: Applying Java 17 global configuration..."
cp scripts/java17-override.gradle android/java17-override.gradle
echo "" >> android/build.gradle
echo "apply from: 'java17-override.gradle'" >> android/build.gradle
echo "Java 17 override applied."

echo
echo "Step 8: Fixing Java version in app build.gradle..."
sed -i 's/VERSION_21/VERSION_17/g' android/app/build.gradle
sed -i 's/jvmTarget = "21"/jvmTarget = "17"/g' android/app/build.gradle
echo "Java version set to 17."

echo
echo "Step 9: Downgrading Gradle to 8.10..."
sed -i 's/gradle-.*-bin\.zip/gradle-8.10-bin.zip/g' android/gradle/wrapper/gradle-wrapper.properties
echo "Gradle version set to 8.10."

echo
echo "Step 10: Syncing Capacitor..."
npx cap sync android

echo
echo "Step 11: Building debug APK..."
cd android
chmod +x gradlew
./gradlew assembleDebug --no-daemon

echo
echo "========================================"
echo "BUILD SUCCESSFUL!"
echo "========================================"
echo
echo "Your APK is located at:"
echo "android/app/build/outputs/apk/debug/app-debug.apk"
echo
