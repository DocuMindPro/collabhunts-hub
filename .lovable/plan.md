

## Update App Icon

Replace `public/app-icon.png` with your new Collab Hunts logo. This single file change will automatically update:

- The loading/splash screens in the web app
- The Android launcher icon (via the GitHub Actions build pipeline already configured)
- The PWA icon references

### What Will Change

| File | Action |
|------|--------|
| `public/app-icon.png` | Replace with your new orange Collab Hunts logo |

### After This Change

- The web app loading screens will show the new logo immediately
- For the Android APK: push to GitHub, wait for the build to finish, then uninstall the old app from BlueStacks and install the new APK

