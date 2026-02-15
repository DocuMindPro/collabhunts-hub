

## Fix: Install CocoaPods BEFORE Capacitor Sync

### Problem
`npx cap sync ios` internally tries to run `pod install`, but CocoaPods isn't available on the GitHub runner. It silently skips the pod step, so no `App.xcworkspace` is ever created.

### Root Cause
We've been trying to run CocoaPods **after** sync (wrong directory) or removing it entirely (no pods at all). The solution is to install CocoaPods **before** sync so that `cap sync` can use it.

### Change

**Update `.github/workflows/build-ios.yml`**

Add a CocoaPods installation step **before** the "Sync Capacitor" step:

```yaml
- name: Install CocoaPods
  run: sudo gem install cocoapods

- name: Sync Capacitor
  run: npx cap sync ios
```

`cap sync` will then detect CocoaPods on the PATH, run `pod install` in the correct directory (`ios/App`), and generate the workspace.

### Updated workflow order:
1. Force app name in Info.plist
2. **Install CocoaPods** (new -- ensures `cap sync` can find it)
3. Sync Capacitor (now successfully runs pod install internally)
4. Verify workspace exists (hard fail if missing)
5. Install Apple certificate...

### No Manual Action Required
This change will auto-trigger the workflow when pushed.

