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
echo Step 4.5: Fixing ProGuard in Capacitor library (node_modules)...
set "CAPACITOR_GRADLE=node_modules\@capacitor\android\capacitor\build.gradle"
echo Target file: %CAPACITOR_GRADLE%
if not exist "%CAPACITOR_GRADLE%" (
    echo ERROR: Capacitor build.gradle not found at %CAPACITOR_GRADLE%
    pause
    exit /b 1
)
echo File exists, applying fix...
powershell -NoProfile -ExecutionPolicy Bypass -Command "$file = '%CAPACITOR_GRADLE%'; Write-Host 'Reading file...'; $content = [System.IO.File]::ReadAllText($file); Write-Host 'Original contains proguard-android.txt:' ($content -match 'proguard-android\.txt'); $content = $content -replace 'proguard-android\.txt', 'proguard-android-optimize.txt'; $utf8NoBom = New-Object System.Text.UTF8Encoding $false; [System.IO.File]::WriteAllText($file, $content, $utf8NoBom); Write-Host 'File written successfully'"
echo Verifying fix was applied...
powershell -NoProfile -ExecutionPolicy Bypass -Command "$file = '%CAPACITOR_GRADLE%'; $content = [System.IO.File]::ReadAllText($file); $hasOptimize = $content -match 'proguard-android-optimize\.txt'; $hasOld = $content -match 'proguard-android\.txt' -and -not ($content -match 'proguard-android-optimize\.txt'); Write-Host 'Has optimize version:' $hasOptimize; Write-Host 'Still has old version:' $hasOld; if (-not $hasOptimize) { Write-Host 'ERROR: Fix did not apply!'; exit 1 } else { Write-Host 'SUCCESS: ProGuard fix verified!' }"
if errorlevel 1 (
    echo ERROR: ProGuard fix verification failed
    pause
    exit /b 1
)
echo Capacitor library ProGuard fixed.

echo.
echo Step 5: Fixing ProGuard configuration...
:: Fix the proguard-android.txt issue in build.gradle
powershell -Command "(Get-Content 'android/app/build.gradle') -replace 'proguard-android\.txt', 'proguard-android-optimize.txt' | Set-Content 'android/app/build.gradle'"
echo ProGuard configuration fixed.

echo.
echo Step 5.5: Applying global Java 17 configuration...
:: Copy the java17 override gradle file
copy /Y "scripts\java17-override.gradle" "android\java17-override.gradle"
:: Append apply statement to root build.gradle
echo. >> "android\build.gradle"
echo apply from: 'java17-override.gradle' >> "android\build.gradle"
echo Global Java 17 configuration applied.

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
