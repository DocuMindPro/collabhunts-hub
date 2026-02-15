

## Fix: Add Provisioning Profile Specifier to xcodebuild

### What happened
The SPM switch was successful -- the project was found and the build started. However, `xcodebuild` fails because it cannot find the provisioning profile to sign the app. Even though the profile is installed to `~/Library/MobileDevice/Provisioning Profiles/`, `xcodebuild` needs to be explicitly told which profile to use when `CODE_SIGN_STYLE=Manual`.

### Root Cause
The `xcodebuild` command sets `CODE_SIGN_STYLE=Manual` but does not provide `PROVISIONING_PROFILE_SPECIFIER`. Without it, Xcode does not know which profile to apply to the "App" target.

### Changes to `.github/workflows/build-ios.yml`

1. **Extract the provisioning profile name** after installing it (add to the existing certificate step):
   ```yaml
   PP_NAME=$(/usr/libexec/PlistBuddy -c "Print Name" /dev/stdin <<< $(/usr/bin/security cms -D -i $PP_PATH))
   echo "PP_UUID=$PP_UUID" >> $GITHUB_ENV
   echo "PP_NAME=$PP_NAME" >> $GITHUB_ENV
   ```

2. **Add `PROVISIONING_PROFILE_SPECIFIER` to the build command**:
   ```yaml
   xcodebuild -project App.xcodeproj \
     -scheme App \
     -sdk iphoneos \
     -configuration Release \
     -archivePath $RUNNER_TEMP/App.xcarchive \
     archive \
     DEVELOPMENT_TEAM="$APPLE_TEAM_ID" \
     CODE_SIGN_STYLE=Manual \
     CODE_SIGN_IDENTITY="Apple Distribution" \
     PROVISIONING_PROFILE_SPECIFIER="$PP_NAME" \
     -allowProvisioningUpdates
   ```

### Why this fixes the error
- `CODE_SIGN_STYLE=Manual` requires explicitly specifying the provisioning profile
- By extracting the profile name during installation and passing it via `PROVISIONING_PROFILE_SPECIFIER`, Xcode can locate and apply the correct profile
- No new secrets are needed -- the profile name is extracted from the already-configured `IOS_PROVISION_PROFILE_BASE64` secret

