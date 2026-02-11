

## Fix: Add Icon Generation to GitHub Actions Build

### Problem
The GitHub Actions workflow runs `npx cap add android` fresh every build, which creates default Capacitor icons. Your new logo (`public/app-icon.png`) is used in the splash/loading screens but NOT as the Android launcher icon because `capacitor-assets generate` is never run in CI.

### Solution
Update the GitHub Actions workflow to:
1. Install `@capacitor/assets` 
2. Create the required source icon files from your existing `public/app-icon.png`
3. Run `npx capacitor-assets generate` to produce all Android icon sizes

### Technical Details

**File: `.github/workflows/build-android.yml`**

Add these steps after "Add Android platform" and before "Sync Capacitor":

```yaml
- name: Setup icon assets
  run: |
    mkdir -p assets
    cp public/app-icon.png assets/icon-only.png
    cp public/app-icon.png assets/icon-foreground.png
    cp public/app-icon.png assets/icon-background.png
    cp public/app-icon.png assets/splash.png
    cp public/app-icon.png assets/splash-dark.png

- name: Install capacitor-assets
  run: npm install @capacitor/assets --save-dev --legacy-peer-deps

- name: Generate native assets
  run: npx capacitor-assets generate --android
```

This will generate all the properly sized Android icons (mdpi through xxxhdpi) and splash screens from your logo automatically during every build. No manual steps needed on your end -- just let GitHub Actions rebuild and download the new APK.

### Changes Summary
| File | Change |
|------|--------|
| `.github/workflows/build-android.yml` | Add 3 new steps for icon/splash generation |

