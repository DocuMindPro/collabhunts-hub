

## Fix: Auto-Increment iOS Build Number

### Problem
Apple requires every TestFlight upload to have a unique build number (`CFBundleVersion`). Your workflow always uploads with build number `1`, so the second upload fails with `ENTITY_ERROR.ATTRIBUTE.INVALID.DUPLICATE`.

### Solution
Add a step in the iOS CI workflow that sets the build number to the GitHub Actions run number (which auto-increments on every workflow run: 1, 2, 3, ...).

### Changes

**File: `.github/workflows/build-ios.yml`**

Add a new step **after** "Force app name in Info.plist" and **before** "Sync Capacitor":

```yaml
- name: Set build number
  run: |
    /usr/libexec/PlistBuddy -c "Set :CFBundleVersion ${{ github.run_number }}" ios/App/App/Info.plist
    echo "Build number set to: ${{ github.run_number }}"
```

This uses `github.run_number` (an always-incrementing integer per workflow) as the build number. Your app version stays `1.0` but the build number will be 2, 3, 4, etc. -- each uniquely accepted by Apple.

### What happens next
- Push this change to GitHub
- The workflow will trigger automatically
- This time the build number will be higher than 1, and the upload will succeed
- TestFlight will notify you of the new build on your phone
