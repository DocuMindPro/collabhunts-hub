

## Fix: Explicitly Run `pod install` After Capacitor Sync

### Problem
CocoaPods is now installed (green check), and `cap sync` passes (green check), but the `.xcworkspace` is still not generated. `cap sync` is not triggering `pod install` on CI even though CocoaPods is available.

### Solution
Add an explicit `pod install` step **after** `cap sync` and **before** workspace verification. This time it will work because:
1. CocoaPods is already installed (step passes)
2. `cap sync` has already created the `ios/App/Podfile` (step passes)
3. We run `pod install` in the correct directory: `ios/App/`

### Change to `.github/workflows/build-ios.yml`

Insert a new step between "Sync Capacitor" and "Verify workspace exists":

```yaml
- name: Install CocoaPods dependencies
  run: |
    cd ios/App
    pod install
```

### Updated workflow order:
1. Install CocoaPods (gem install)
2. Sync Capacitor (creates Podfile but skips pod install)
3. **Install CocoaPods dependencies** (runs pod install in ios/App -- NEW)
4. Verify workspace exists
5. Install Apple certificate...

### Why this is different from before
Our earlier attempt at `pod install` failed because CocoaPods wasn't installed yet. Now it is (step 1), and the Podfile exists after sync (step 2), so the explicit `pod install` in step 3 will succeed and generate the workspace.
