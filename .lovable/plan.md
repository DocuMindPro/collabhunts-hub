

## Fix: Android App Icon and Name Not Changing

### Root Cause

Two issues found:

1. **You may have an old APK installed.** The name "CollabHunts Creators" doesn't match any current config -- it's from an older build. Make sure you download the APK from **build #459** ("Add icon generation to CI"), not an earlier one. Also, **uninstall the old app first** from BlueStacks before installing the new one, because Android caches the old app name and icon.

2. **The workflow has gaps that could prevent changes from applying:**
   - `capacitor-assets generate` may silently skip icon generation if the source image is too small (needs 1024x1024)
   - There's no fallback to force the app name into Android's `strings.xml`
   - The GitHub release name (line 105) still says "CollabHunts" instead of "Collab Hunts"

### What Will Change

**File: `.github/workflows/build-android.yml`**

| Change | Why |
|--------|-----|
| Add a step to force-write `app_name` in Android `strings.xml` after `cap add android` | Guarantees the name "Collab Hunts" even if Capacitor config isn't picked up |
| Add a debug step to verify icon generation worked | Helps diagnose if `capacitor-assets` silently failed |
| Update release name from "CollabHunts APK" to "Collab Hunts APK" | Consistent branding |

### Technical Details

After `npx cap add android`, add:

```yaml
- name: Force app name in strings.xml
  run: |
    sed -i 's|<string name="app_name">.*</string>|<string name="app_name">Collab Hunts</string>|g' android/app/src/main/res/values/strings.xml
    sed -i 's|<string name="title_activity_main">.*</string>|<string name="title_activity_main">Collab Hunts</string>|g' android/app/src/main/res/values/strings.xml
```

After `capacitor-assets generate`, add:

```yaml
- name: Verify icon generation
  run: |
    echo "=== Checking generated icons ==="
    ls -la android/app/src/main/res/mipmap-*/
    echo "=== Checking app name ==="
    cat android/app/src/main/res/values/strings.xml
```

Update release name on line 105:

```yaml
name: Collab Hunts APK v${{ steps.version.outputs.version }}
```

### After Deploying

1. Wait for the new GitHub Actions build to complete
2. **Uninstall** the old app from BlueStacks completely
3. Download and install the new APK from the latest GitHub Release
4. The app should now show "Collab Hunts" with your logo as the launcher icon
