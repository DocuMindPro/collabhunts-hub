

## Fix: "exportArchive Failed to Use Accounts" in Export IPA

### Problem
The `xcodebuild -exportArchive` command with method `app-store-connect` attempts to communicate with Apple servers to validate the export. Since there are no Xcode accounts registered on the GitHub Actions runner, this fails with "Failed to Use Accounts".

### Solution
Add `-allowProvisioningUpdates` to the `xcodebuild -exportArchive` command. This tells Xcode to use the locally installed provisioning profiles and certificates without requiring an authenticated Xcode account.

### Changes to `.github/workflows/build-ios.yml`

Update the `xcodebuild -exportArchive` command (around line 147) to include `-allowProvisioningUpdates`:

```yaml
          xcodebuild -exportArchive \
            -archivePath $RUNNER_TEMP/App.xcarchive \
            -exportOptionsPlist $RUNNER_TEMP/ExportOptions.plist \
            -exportPath $RUNNER_TEMP/export \
            -allowProvisioningUpdates
```

### Why this fixes it
- The archive step already has `-allowProvisioningUpdates` and succeeds
- The export step was missing this flag, causing Xcode to attempt account-based verification
- With this flag, Xcode uses the locally installed certificate and provisioning profile without needing a registered account

### No new secrets or dependencies needed
This is a single flag addition to the existing command.

