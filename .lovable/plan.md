

## Fix: Auto-Skip Export Compliance for iOS Builds

### Problem
Every new TestFlight build gets stuck at "Missing Compliance" because Apple requires an export compliance declaration. You have to manually click "Manage" each time to proceed.

### Solution
Add `ITSAppUsesNonExemptEncryption = false` to the Info.plist during the CI build. This tells Apple your app does not use non-exempt encryption, so builds will automatically be approved for TestFlight without manual intervention.

### Immediate Action (do this now)
Click **"Manage"** next to build 143 in App Store Connect, answer **"No"** to the encryption question, and save. Build 143 will then appear in TestFlight.

### CI Change (prevents this in the future)

**File: `.github/workflows/build-ios.yml`**

Add a new step after "Force app name in Info.plist" and before "Set build number":

```yaml
- name: Set export compliance
  run: |
    /usr/libexec/PlistBuddy -c "Add :ITSAppUsesNonExemptEncryption bool false" ios/App/App/Info.plist
```

This single line ensures every future build skips the compliance hold automatically.

