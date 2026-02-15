

## Fix: Remove Redundant CocoaPods Step

### Problem
The "Install CocoaPods dependencies" step fails with "No Podfile found in the project directory." This is because `npx cap sync ios` (which runs before it) already runs `pod install` internally and generates the workspace file.

### Change

**Update `.github/workflows/build-ios.yml`**

Remove the separate "Install CocoaPods dependencies" step (lines 59-62). The "Verify workspace exists" step will remain to confirm the workspace was created by `npx cap sync`.

The workflow order will be:
1. Sync Capacitor (`npx cap sync ios` — this already runs pod install)
2. Verify workspace exists (debug check)
3. Install Apple certificate...

### Manual Action
After this change pushes to GitHub, the workflow will auto-trigger. Also make sure you've set the **APPLE_TEAM_ID** secret as discussed earlier.

