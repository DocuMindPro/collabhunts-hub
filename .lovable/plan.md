

## Fix: iOS Build Number Conflict

### Problem
The `github.run_number` for the iOS workflow is currently `41`, but build version `41` was already uploaded to App Store Connect. Apple rejects any upload with a build number that's not strictly higher than the previous one.

### Solution
Add an offset to the build number calculation so it always exceeds any previously uploaded version. Using an offset of `100` will set the next build to `142` (41 + 100 + 1), safely above the existing `41`.

### Changes

**File: `.github/workflows/build-ios.yml`**

Update the "Set build number" step from:
```yaml
/usr/libexec/PlistBuddy -c "Set :CFBundleVersion ${{ github.run_number }}" ios/App/App/Info.plist
```

To:
```yaml
BUILD_NUM=$((  ${{ github.run_number }} + 100 ))
/usr/libexec/PlistBuddy -c "Set :CFBundleVersion $BUILD_NUM" ios/App/App/Info.plist
echo "Build number set to: $BUILD_NUM"
```

This ensures every future build number is well above `41` and will keep incrementing automatically.

