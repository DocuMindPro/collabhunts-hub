

## Fix: Switch iOS Build to Swift Package Manager (SPM)

### Root Cause
Capacitor 8 defaults to Swift Package Manager (SPM), not CocoaPods. SPM does not create a Podfile or .xcworkspace -- it uses .xcodeproj directly. The `--packagemanager CocoaPods` flag appears to be silently failing (possibly due to casing: the official docs show `Cocoapods` with lowercase 'p').

Rather than continuing to fight CocoaPods compatibility, this plan switches the build to work with SPM, which is the default and officially supported approach for Capacitor 8.

### Changes to `.github/workflows/build-ios.yml`

1. **Revert "Add iOS platform"** back to the default (no flag):
   - `npx cap add ios` (SPM is the default in Cap 8)

2. **Remove CocoaPods steps entirely**:
   - Remove "Install CocoaPods" (`sudo gem install cocoapods`)
   - Remove "Install CocoaPods dependencies" (`cd ios/App && pod install`)

3. **Update "Verify workspace exists"** to check for `.xcodeproj` instead:
   - `ls ios/App/App.xcodeproj || (echo "ERROR: xcodeproj not found!" && exit 1)`

4. **Update "Build archive"** to use `-project` instead of `-workspace`:
   - From: `xcodebuild -workspace App.xcworkspace`
   - To: `xcodebuild -project App.xcodeproj`

### Updated workflow order (simplified):
1. Checkout, setup Node, install deps, create .env
2. Build web app
3. Add iOS platform (SPM default)
4. Setup icons and generate native assets
5. Force app name in Info.plist
6. Sync Capacitor
7. Verify xcodeproj exists
8. Install certificate and provisioning profile
9. Build archive (using -project App.xcodeproj)
10. Export IPA and upload to TestFlight
11. Cleanup

### Why this will work
- Capacitor 8 creates the .xcodeproj by default with SPM
- No dependency on CocoaPods at all
- All Capacitor plugins (@capacitor/push-notifications, splash-screen, etc.) support SPM in v8
- Fewer steps = fewer failure points

