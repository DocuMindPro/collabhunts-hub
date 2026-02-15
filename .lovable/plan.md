

## Fix: Workspace Not Generated — Explicit CocoaPods Setup

### Problem
`npx cap sync ios` is supposed to run `pod install` internally, but the `.xcworkspace` file is never created. The "Verify workspace exists" step passes only because it uses `|| echo` (never fails). The actual `xcodebuild` step then can't find the workspace.

### Root Cause
On GitHub's `macos-latest` runners, CocoaPods may not be pre-installed or may fail silently during `cap sync`. We need to explicitly ensure CocoaPods is installed and run `pod install` manually.

### Changes to `.github/workflows/build-ios.yml`

1. **Make "Verify workspace exists" actually fail** if the workspace is missing (remove the `|| echo` fallback so the build stops early with a clear error).

2. **Add explicit CocoaPods install step** after "Sync Capacitor":
   - Install CocoaPods via `gem install cocoapods`  
   - Run `pod install` inside `ios/App`

3. **Add debug logging** after `cap add ios` and `cap sync ios` to list the directory contents so we can see exactly what files are created.

### Updated workflow order:
1. `npx cap add ios`
2. Setup icon assets and generate native assets
3. Force app name in Info.plist
4. `npx cap sync ios`
5. **NEW**: Debug — list `ios/App/` directory contents
6. **NEW**: Install CocoaPods and run `pod install` in `ios/App/`
7. **UPDATED**: Verify workspace exists (now fails the build if missing)
8. Install Apple certificate...
9. Build archive...

### Technical Detail
```yaml
- name: Debug iOS directory
  run: |
    echo "=== ios/App contents ==="
    ls -la ios/App/
    echo "=== Podfile check ==="
    cat ios/App/Podfile || echo "No Podfile found"

- name: Install CocoaPods dependencies
  run: |
    sudo gem install cocoapods
    cd ios/App
    pod install

- name: Verify workspace exists
  run: |
    ls ios/App/App.xcworkspace || (echo "ERROR: xcworkspace not found!" && exit 1)
```

### No Manual Action Required
This is a workflow-only change. It will auto-trigger when pushed.

