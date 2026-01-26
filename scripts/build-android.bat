@echo off
echo ========================================
echo CollabHunts Android Build Script
echo ========================================
echo.

:: Check if we're in the project root
if not exist "package.json" (
    echo ERROR: Please run this script from the project root directory
    pause
    exit /b 1
)

echo Step 1: Installing dependencies...
call npm install
if errorlevel 1 (
    echo ERROR: npm install failed
    pause
    exit /b 1
)

echo.
echo Step 2: Building web app...
call npm run build
if errorlevel 1 (
    echo ERROR: Build failed
    pause
    exit /b 1
)

echo.
echo Step 3: Checking if Android platform exists...
if exist "android" (
    echo Android folder exists. Removing for fresh setup...
    rd /s /q android
)

echo.
echo Step 4: Adding Android platform...
call npx cap add android
if errorlevel 1 (
    echo ERROR: Failed to add Android platform
    pause
    exit /b 1
)

echo.
echo Step 5: Fixing ProGuard configuration...
:: Fix the proguard-android.txt issue in build.gradle
powershell -Command "(Get-Content 'android/app/build.gradle') -replace 'proguard-android\.txt', 'proguard-android-optimize.txt' | Set-Content 'android/app/build.gradle'"
echo ProGuard configuration fixed.

echo.
echo Step 5.5: Fixing Java version GLOBALLY for all modules...
:: Add global Java 17 override to root build.gradle for ALL subprojects (including capacitor plugins)
powershell -NoProfile -Command "$rootGradle = 'android/build.gradle'; $content = Get-Content $rootGradle -Raw; $javaFix = @'`n`nsubprojects {`n    afterEvaluate { project ->`n        if (project.hasProperty('android')) {`n            android {`n                compileOptions {`n                    sourceCompatibility JavaVersion.VERSION_17`n                    targetCompatibility JavaVersion.VERSION_17`n                }`n            }`n        }`n        tasks.withType(org.jetbrains.kotlin.gradle.tasks.KotlinCompile).configureEach {`n            kotlinOptions {`n                jvmTarget = '17'`n            }`n        }`n    }`n}`n'@; if ($content -notmatch 'VERSION_17') { Add-Content -Path $rootGradle -Value $javaFix }; Write-Host 'Global Java 17 override added to root build.gradle'"
echo Global Java 17 configuration applied to all subprojects.

echo.
echo Step 5.6: Fixing Java version in app build.gradle...
:: Fix Java version from 21 to 17 in build.gradle (all in one command)
powershell -NoProfile -Command "$file = 'android/app/build.gradle'; $content = Get-Content $file -Raw; $content = $content -replace 'VERSION_21', 'VERSION_17'; $content = $content -replace 'jvmTarget\s*=\s*[''\""]21[''\""]', 'jvmTarget = \"17\"'; Set-Content -Path $file -Value $content -NoNewline"
echo Java version set to 17.

echo.
echo Step 6: Downgrading Gradle to 8.10...
:: Fix the Gradle version
powershell -Command "(Get-Content 'android/gradle/wrapper/gradle-wrapper.properties') -replace 'gradle-.*-bin\.zip', 'gradle-8.10-bin.zip' | Set-Content 'android/gradle/wrapper/gradle-wrapper.properties'"
echo Gradle version set to 8.10.

echo.
echo Step 7: Syncing Capacitor...
call npx cap sync android
if errorlevel 1 (
    echo WARNING: Cap sync had issues, continuing anyway...
)

echo.
echo Step 8: Building debug APK...
cd android
call .\gradlew assembleDebug --no-daemon
if errorlevel 1 (
    echo ERROR: Gradle build failed
    cd ..
    pause
    exit /b 1
)

echo.
echo ========================================
echo BUILD SUCCESSFUL!
echo ========================================
echo.
echo Your APK is located at:
echo android\app\build\outputs\apk\debug\app-debug.apk
echo.

cd ..
pause
