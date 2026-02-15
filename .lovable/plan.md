

## Fix iOS Build — Missing Workspace and Empty Team ID

### Problem
The certificate step now passes. The build fails at the "Build archive" step with two issues:
- `xcodebuild: error: 'App.xcworkspace' does not exist` — CocoaPods needs to run after `npx cap add ios` to generate the workspace file.
- `DEVELOPMENT_TEAM =` is empty — the `APPLE_TEAM_ID` GitHub secret appears to be missing or empty.

### Changes

**1. Update `.github/workflows/build-ios.yml`**

Add a CocoaPods install step after "Sync Capacitor" and before "Install Apple certificate":

```yaml
- name: Install CocoaPods dependencies
  run: |
    cd ios/App
    pod install
```

Also add a debug step to verify the workspace exists:

```yaml
- name: Verify workspace exists
  run: |
    ls -la ios/App/*.xcworkspace || echo "ERROR: xcworkspace not found!"
```

**2. Verify GitHub Secret**

You need to confirm that the **`APPLE_TEAM_ID`** secret is set in your GitHub repo (Settings > Secrets and variables > Actions). It should contain your 10-character Apple Developer Team ID (e.g., `ABC1234DEF`). You can find it at [developer.apple.com](https://developer.apple.com) under Membership.

### Summary
- One file change: `.github/workflows/build-ios.yml` (add CocoaPods step + debug step)
- One manual action: Verify `APPLE_TEAM_ID` secret is set in GitHub

