

# GitHub Actions Cloud APK Build

This plan sets up an automated cloud build pipeline that will compile your Android APK on GitHub's servers and provide a direct download link with QR code.

## What You'll Get

1. **Automatic APK builds** - Every time you push changes, a new APK is built in the cloud
2. **Download page with QR code** - Scan to download the actual APK file directly to your phone
3. **No local Android Studio needed** - All builds happen on GitHub's servers with a clean environment
4. **Version history** - All APK builds are stored as GitHub releases

---

## How It Will Work

1. Push code changes to GitHub
2. GitHub Actions automatically builds the APK (takes ~5-10 minutes)
3. APK is uploaded to GitHub Releases
4. Visit the `/download` page and scan the QR code
5. APK downloads directly to your phone
6. Tap the downloaded file to install

---

## Technical Implementation

### Step 1: Create GitHub Actions Workflow

Create `.github/workflows/build-android.yml` that:
- Runs on Ubuntu with JDK 17
- Installs Node.js and dependencies
- Builds the web app (`npm run build`)
- Adds Android platform (`npx cap add android`)
- Patches ProGuard configuration (same fixes from your local script)
- Applies Java 17 override for all subprojects
- Downgrades Gradle to 8.10
- Builds the debug APK
- Uploads APK as a GitHub Release artifact

### Step 2: Create Build Script for CI

Create `scripts/build-android-ci.sh` (Linux version of your Windows script):
- Bash script that works on GitHub's Ubuntu runners
- Applies all the same ProGuard and Java 17 fixes
- Generates the debug APK

### Step 3: Update Download Page

Modify `src/pages/Download.tsx` to:
- Add a section for "Direct APK Download"
- Generate QR code pointing to the latest GitHub Release APK
- Include instructions for enabling "Install from Unknown Sources" on Android
- Keep the PWA option as a fallback

### Step 4: Add Release Configuration

Create a simple versioning system:
- APK will be named `collabhunts-v{version}.apk`
- Each build creates a new GitHub Release
- Download page fetches the latest release URL

---

## Files to Create/Modify

| File | Action | Purpose |
|------|--------|---------|
| `.github/workflows/build-android.yml` | Create | GitHub Actions workflow for cloud builds |
| `scripts/build-android-ci.sh` | Create | Linux build script for CI environment |
| `src/pages/Download.tsx` | Modify | Add APK download section with QR code |

---

## GitHub Actions Workflow Overview

```text
+------------------+     +------------------+     +------------------+
|   Push to main   | --> |  GitHub Actions  | --> |  GitHub Release  |
|   branch         |     |  builds APK      |     |  hosts APK file  |
+------------------+     +------------------+     +------------------+
                                                          |
                                                          v
                              +------------------------------------------+
                              |  /download page shows QR code linking   |
                              |  to latest APK for direct phone install |
                              +------------------------------------------+
```

---

## Build Pipeline Steps

1. **Checkout code** - Get latest source from repository
2. **Setup JDK 17** - Install Java Development Kit
3. **Setup Node.js** - Install Node.js 20.x
4. **Install dependencies** - Run `npm install`
5. **Build web app** - Run `npm run build`
6. **Add Android platform** - Run `npx cap add android`
7. **Apply ProGuard fix** - Replace `proguard-android.txt` with `proguard-android-optimize.txt`
8. **Apply Java 17 override** - Copy and apply the gradle override file
9. **Downgrade Gradle** - Set Gradle version to 8.10
10. **Sync Capacitor** - Run `npx cap sync android`
11. **Build APK** - Run `./gradlew assembleDebug`
12. **Create Release** - Upload APK to GitHub Releases

---

## Android Installation Instructions

When users download the APK, they'll need to:

1. **Enable Unknown Sources**:
   - Go to Settings > Security (or Privacy)
   - Enable "Install unknown apps" for your browser
   
2. **Download the APK**:
   - Scan the QR code
   - Tap "Download" when prompted
   
3. **Install**:
   - Open the downloaded APK file
   - Tap "Install"
   - Wait for installation to complete

---

## Requirements

To make this work, you'll need to:

1. **Export to GitHub** - Your project must be connected to a GitHub repository
2. **Enable GitHub Actions** - Actions should be enabled by default on new repos
3. **No secrets needed** - Debug APKs don't require signing keys

---

## After Implementation

1. Export your project to GitHub (if not already done)
2. The first build will trigger automatically
3. Wait ~5-10 minutes for the build to complete
4. Visit `/download` on your published site
5. Scan the QR code to download the APK
6. Install and test on your Android phone!

---

## Notes

- **Debug APK only**: This builds an unsigned debug APK, suitable for testing
- **For production**: You'd need to add signing keys as GitHub Secrets for a release APK
- **iOS not included**: iOS builds require a Mac and Apple Developer account
- **Build time**: Expect 5-10 minutes per build on GitHub's free tier

