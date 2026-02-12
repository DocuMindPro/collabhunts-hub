

## Add Android Permissions for Camera, Storage, and Media

### Problem
The app crashes with "Camera error" when users try to upload profile photos because the Android manifest lacks the required permissions.

### Change

**File: `.github/workflows/build-android.yml`**

Add a new step after "Sync Capacitor" (line 89) and before "Verify icon generation" that injects all necessary permissions into the AndroidManifest.xml:

```yaml
- name: Add Android permissions
  run: |
    sed -i '/<uses-permission android:name="android.permission.INTERNET" \/>/a \
        <uses-permission android:name="android.permission.CAMERA" \/>\n    <uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" \/>\n    <uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" \/>\n    <uses-permission android:name="android.permission.READ_MEDIA_IMAGES" \/>\n    <uses-permission android:name="android.permission.READ_MEDIA_VIDEO" \/>\n    <uses-permission android:name="android.permission.VIBRATE" \/>\n    <uses-permission android:name="android.permission.RECEIVE_BOOT_COMPLETED" \/>\n    <uses-feature android:name="android.hardware.camera" android:required="false" \/>' android/app/src/main/AndroidManifest.xml
```

### Permissions being added

| Permission | Purpose |
|---|---|
| CAMERA | Take profile photos directly |
| READ_EXTERNAL_STORAGE | Pick photos from gallery (Android 12 and below) |
| WRITE_EXTERNAL_STORAGE | Save captured photos temporarily |
| READ_MEDIA_IMAGES | Pick photos from gallery (Android 13+) |
| READ_MEDIA_VIDEO | Pick videos from gallery (Android 13+) |
| VIBRATE | Haptic feedback for notifications |
| RECEIVE_BOOT_COMPLETED | Resume push notification listener after reboot |
| camera hardware feature (required=false) | Declares camera usage without blocking install on devices without cameras |

### Files Modified
- `.github/workflows/build-android.yml` -- one new step added

Once merged, the next GitHub Actions build will produce an APK that automatically prompts users for camera/storage permissions when needed.

