

## Fix: "exportArchive Failed to Use Accounts" — Use Local Export Method

### Problem
The `app-store-connect` export method forces Xcode to authenticate with Apple's servers during the export step itself. No amount of flags (`-allowProvisioningUpdates`) can bypass this — it's built into how that method works. Since the workflow already has a dedicated "Upload to TestFlight" step using `altool`, the export should just produce the IPA file locally.

### Solution
Two changes in the ExportOptions.plist within `.github/workflows/build-ios.yml`:

1. **Change `method` from `app-store-connect` back to `app-store`** — This exports the IPA locally without trying to connect to Apple's servers. Yes, Apple shows a deprecation warning for this name, but it works correctly on CI and the separate `altool` upload handles the actual submission.

2. **Remove the `destination: upload` key** — This key tells Xcode to upload during export, which also requires account authentication. Since upload is handled separately, this key should be removed entirely.

### What stays the same
- All signing configuration (`signingStyle`, `signingCertificate`, `provisioningProfiles`) remains unchanged
- The separate "Upload to TestFlight" step using `altool` continues to handle the actual upload
- No new secrets needed

### Technical details

In the "Export IPA" step, the plist changes from:
```
method: app-store-connect
destination: upload        <-- remove this
```
To:
```
method: app-store          <-- local export only
(destination key removed)
```

The deprecation warning ("app-store" is deprecated, use "app-store-connect") will appear in logs but does not cause failure. This is the standard approach used by CI pipelines that separate export from upload.

