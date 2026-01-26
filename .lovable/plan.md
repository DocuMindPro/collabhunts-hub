
# Complete Android Build Guide for CollabHunts

## Prerequisites - What You Need Before Starting

### Required Software

| Software | Purpose | Download Link |
|----------|---------|---------------|
| **Git** | Clone the project from GitHub | Already installed on your PC |
| **Node.js** | Run JavaScript/npm commands | Already installed on your PC |
| **Android Studio** | Provides SDK, emulator, and build tools | [developer.android.com/studio](https://developer.android.com/studio) |
| **Java JDK 17+** | Required by Android build system | Included with Android Studio |

---

## Phase 1: Install Android Studio (If Not Already Installed)

### Step 1.1: Download Android Studio

**Action**: Go to [developer.android.com/studio](https://developer.android.com/studio) and download the Windows installer.

**Why**: Android Studio includes the Android SDK (Software Development Kit) which contains all the tools needed to compile Android apps.

**Success Indicator**: You have a file like `android-studio-2024.x.x.x-windows.exe` in your Downloads folder.

**Failure Indicator**: Download fails or website is unavailable.

---

### Step 1.2: Install Android Studio

**Action**: Run the installer and follow the wizard. Accept all defaults.

**Why**: The installer sets up Android Studio, the SDK, and creates necessary folders.

**Success Indicator**: Android Studio opens successfully after installation.

**Failure Indicator**: Installer crashes or shows errors.

---

### Step 1.3: Complete First-Time Setup

**Action**: When Android Studio opens for the first time:
1. Choose "Standard" installation type
2. Select your UI theme
3. Wait for component downloads to complete (this downloads SDK components)

**Why**: This downloads essential SDK components including `platform-tools`, `build-tools`, and the Android platform.

**Success Indicator**: You see the "Welcome to Android Studio" screen with options to create a new project.

**Failure Indicator**: Setup wizard shows download errors.

---

### Step 1.4: Verify SDK Installation Location

**Action**: 
1. In Android Studio, go to **File > Settings** (or Android Studio > Preferences on Mac)
2. Navigate to **Languages & Frameworks > Android SDK**
3. Note the **Android SDK Location** path (usually `C:\Users\elias\AppData\Local\Android\Sdk`)

**Why**: You need this exact path to set the `ANDROID_HOME` environment variable.

**Success Indicator**: You see a valid path and SDK components listed.

**Failure Indicator**: Path is empty or shows errors.

---

## Phase 2: Set Up Environment Variables

### Step 2.1: Open Environment Variables Settings

**Action**:
1. Press `Windows + R` to open Run dialog
2. Type `sysdm.cpl` and press Enter
3. Click the **Advanced** tab
4. Click **Environment Variables** button

**Why**: Environment variables tell your computer where to find the Android SDK from any command prompt.

**Success Indicator**: You see a dialog with "User variables" and "System variables" sections.

**Failure Indicator**: Dialog doesn't open.

---

### Step 2.2: Create ANDROID_HOME Variable

**Action**:
1. In the **User variables** section (top), click **New**
2. Variable name: `ANDROID_HOME`
3. Variable value: `C:\Users\elias\AppData\Local\Android\Sdk` (use YOUR path from Step 1.4)
4. Click **OK**

**Why**: The Gradle build system uses `ANDROID_HOME` to locate the SDK.

**Success Indicator**: You see `ANDROID_HOME` listed in User variables.

**Failure Indicator**: Variable not saved.

---

### Step 2.3: Add SDK Tools to PATH

**Action**:
1. In **User variables**, find and select **Path**, then click **Edit**
2. Click **New** and add: `%ANDROID_HOME%\platform-tools`
3. Click **New** again and add: `%ANDROID_HOME%\tools`
4. Click **OK** on all dialogs

**Why**: This lets you run Android commands like `adb` from any location.

**Success Indicator**: You see both paths added to the list.

**Failure Indicator**: Paths not appearing in list.

---

### Step 2.4: Verify Environment Variables

**Action**:
1. **Close all open Command Prompt windows** (important!)
2. Open a **new** Command Prompt
3. Run: `echo %ANDROID_HOME%`
4. Run: `adb --version`

**Why**: Verifies the variables are set correctly and accessible.

**Success Indicator**: 
- First command shows: `C:\Users\elias\AppData\Local\Android\Sdk`
- Second command shows: `Android Debug Bridge version 35.x.x` (or similar)

**Failure Indicator**: 
- First command shows: `%ANDROID_HOME%` (variable not set)
- Second command shows: `'adb' is not recognized` (PATH not set correctly)

---

## Phase 3: Clone and Prepare the Project

### Step 3.1: Navigate to Desktop

**Action**: Open Command Prompt and run:
```cmd
cd C:\Users\elias\Desktop
```

**Why**: We want to clone the project to an easy-to-find location.

**Success Indicator**: Prompt shows `C:\Users\elias\Desktop>`

**Failure Indicator**: Path doesn't exist.

---

### Step 3.2: Remove Old Project Folder (If Exists)

**Action**: Run:
```cmd
rd /s /q collabhunts-hub
```

**Why**: Ensures a clean start without any cached or corrupted files from previous attempts.

**Success Indicator**: Command completes silently (no output = success).

**Failure Indicator**: "Access denied" or "folder in use" errors. Close any apps using the folder and try again.

---

### Step 3.3: Clone from GitHub

**Action**: Run:
```cmd
git clone https://github.com/eliasnau/collabhunts-hub.git
```

**Why**: Downloads the latest code from your GitHub repository.

**Success Indicator**: 
```
Cloning into 'collabhunts-hub'...
remote: Enumerating objects: xxx, done.
...
Resolving deltas: 100% (xxx/xxx), done.
```

**Failure Indicator**: 
- "Repository not found" - check the URL
- "Authentication failed" - need to set up GitHub credentials

---

### Step 3.4: Navigate into Project

**Action**: Run:
```cmd
cd collabhunts-hub
```

**Why**: All subsequent commands must run from inside the project folder.

**Success Indicator**: Prompt shows `C:\Users\elias\Desktop\collabhunts-hub>`

**Failure Indicator**: "Directory not found" - clone failed in previous step.

---

## Phase 4: Build the Android App

### Step 4.1: Run the Build Script

**Action**: Run:
```cmd
scripts\build-android.bat
```

**Why**: This automated script handles all the complex build steps for you.

**What the Script Does**:

| Step | What It Does | Why |
|------|--------------|-----|
| 1 | `npm install` | Downloads all JavaScript dependencies |
| 2 | `npm run build` | Compiles the web app into the `dist` folder |
| 3 | Removes old `android` folder | Ensures clean setup |
| 4 | `npx cap add android` | Creates the Android project structure |
| 5 | Fixes ProGuard config | Replaces deprecated file reference |
| 6 | Downgrades Gradle to 8.10 | Avoids compatibility issues |
| 7 | `npx cap sync android` | Copies web files to Android project |
| 8 | `gradlew assembleDebug` | Compiles the APK file |

**Success Indicator**: 
```
========================================
BUILD SUCCESSFUL!
========================================

Your APK is located at:
android\app\build\outputs\apk\debug\app-debug.apk
```

**Failure Indicators by Step**:

| Error Message | Cause | Solution |
|---------------|-------|----------|
| "npm install failed" | Dependency conflict | date-fns is already fixed to v3.6.0 |
| "Build failed" | TypeScript/React errors | Check console for specific file errors |
| "Failed to add Android platform" | Capacitor issue | Delete node_modules and try again |
| "SDK location not found" | ANDROID_HOME not set | Go back to Phase 2 and verify |
| "Gradle build failed" | Various | See next section |

---

## Phase 5: Troubleshooting Common Gradle Errors

### Error: "SDK location not found"

**Solution**:
1. Open a **new** Command Prompt (important - old ones don't see new variables)
2. Verify with: `echo %ANDROID_HOME%`
3. If empty, go back to Phase 2

---

### Error: "Could not find proguard-android.txt"

**Solution**: The script should fix this automatically. If not:
1. Open `android\app\build.gradle` in Notepad
2. Find: `proguard-android.txt`
3. Replace with: `proguard-android-optimize.txt`
4. Save and rebuild: `cd android && .\gradlew assembleDebug --no-daemon`

---

### Error: "Unsupported class file major version"

**Solution**: Wrong Java version.
1. Open Android Studio > File > Settings > Build, Execution, Deployment > Build Tools > Gradle
2. Set Gradle JDK to **17** or **21**
3. Rebuild

---

### Error: "License for package not accepted"

**Solution**:
1. Open Android Studio
2. Go to File > Settings > Languages & Frameworks > Android SDK
3. Click "SDK Tools" tab
4. Check any unchecked items and click Apply
5. Accept licenses when prompted

---

## Phase 6: Locate and Install the APK

### Step 6.1: Find the APK File

**Action**: After successful build, your APK is at:
```
C:\Users\elias\Desktop\collabhunts-hub\android\app\build\outputs\apk\debug\app-debug.apk
```

**Why**: This is the installable file for Android devices.

**Success Indicator**: File exists and is about 5-20 MB in size.

**Failure Indicator**: File doesn't exist - build didn't complete.

---

### Step 6.2: Install on Physical Device

**Option A - USB Cable**:
1. Enable "Developer Options" on your phone (Settings > About Phone > tap "Build Number" 7 times)
2. Enable "USB Debugging" in Developer Options
3. Connect phone via USB
4. Run: `adb install android\app\build\outputs\apk\debug\app-debug.apk`

**Option B - Direct Transfer**:
1. Copy the `app-debug.apk` file to your phone (via USB, email, or cloud drive)
2. Open the file on your phone
3. Allow "Install from unknown sources" if prompted
4. Tap Install

**Success Indicator**: App appears on your phone's home screen as "CollabHunts Creators"

---

## Quick Reference Commands

Once everything is set up, future builds only need:

```cmd
cd C:\Users\elias\Desktop\collabhunts-hub
git pull
scripts\build-android.bat
```

---

## Summary Checklist

- [ ] Android Studio installed
- [ ] SDK Location noted (usually `C:\Users\elias\AppData\Local\Android\Sdk`)
- [ ] ANDROID_HOME environment variable set
- [ ] SDK tools added to PATH
- [ ] Verified with `echo %ANDROID_HOME%` and `adb --version`
- [ ] Project cloned fresh from GitHub
- [ ] Build script completed successfully
- [ ] APK file found and ready to install
