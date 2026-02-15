

## Fix: Force CocoaPods Package Manager for Capacitor 8

### Root Cause
Capacitor 8 defaults to **Swift Package Manager (SPM)** instead of CocoaPods. SPM does not create a `Podfile` or `App.xcworkspace`, which is why every attempt to run `pod install` fails with "No Podfile found" and the workspace verification also fails.

### Solution
Force Capacitor to use CocoaPods by passing `--packagemanager CocoaPods` when adding the iOS platform. This ensures a `Podfile` and `App.xcworkspace` are generated as expected.

### Changes to `.github/workflows/build-ios.yml`

1. **Change "Add iOS platform" step** (line 34):
   - From: `npx cap add ios`
   - To: `npx cap add ios --packagemanager CocoaPods`

2. **Keep "Install CocoaPods"** step (before sync) -- still needed

3. **Keep "Install CocoaPods dependencies"** step (after sync) -- will now work because a Podfile exists

4. **Keep "Verify workspace exists"** -- will now pass because CocoaPods creates the workspace

### Updated workflow order:
1. Build web app
2. Add iOS platform **with CocoaPods flag**
3. Setup icons and assets
4. Force app name in Info.plist
5. Install CocoaPods (gem)
6. Sync Capacitor
7. Install CocoaPods dependencies (pod install)
8. Verify workspace exists
9. Install certificate, build, export, upload

### Why this fixes everything
- CocoaPods mode creates a `Podfile` during `cap add ios`
- `pod install` finds the Podfile and generates `App.xcworkspace`
- `xcodebuild -workspace App.xcworkspace` works as expected

