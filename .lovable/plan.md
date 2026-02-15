

## Fix: Export IPA Step — Update Method and Add Signing Info

### What happened
The build archive step now succeeds! The failure moved to "Export IPA" with two errors:
- `Command line name "app-store" is deprecated. Use "app-store-connect" instead.`
- `exportArchive Failed to Use Accounts`

### Root Causes

1. **Deprecated export method**: Apple renamed the export method from `app-store` to `app-store-connect` in recent Xcode versions.
2. **Missing signing configuration in ExportOptions.plist**: When using `CODE_SIGN_STYLE=Manual`, the export plist must also specify the provisioning profile and signing certificate for the target.
3. **Invalid XML**: The plist content has leading whitespace/indentation from the YAML heredoc, which can cause XML parsing issues.

### Changes to `.github/workflows/build-ios.yml`

**Update the "Export IPA" step** with the following fixes:

1. Fix the heredoc indentation so the plist is valid XML (no leading spaces).
2. Change `app-store` to `app-store-connect`.
3. Add `signingStyle`, `signingCertificate`, and `provisioningProfiles` entries so Xcode knows how to sign the exported IPA.

The updated ExportOptions.plist will look like:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN"
  "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>method</key>
  <string>app-store-connect</string>
  <key>teamID</key>
  <string>${APPLE_TEAM_ID}</string>
  <key>signingStyle</key>
  <string>manual</string>
  <key>signingCertificate</key>
  <string>Apple Distribution</string>
  <key>provisioningProfiles</key>
  <dict>
    <key>app.lovable.f0d3858ae7f2489288d232504acaef78</key>
    <string>${PP_NAME}</string>
  </dict>
  <key>uploadSymbols</key>
  <true/>
  <key>destination</key>
  <string>upload</string>
</dict>
</plist>
```

Key additions:
- `method` changed from `app-store` to `app-store-connect`
- `signingStyle` set to `manual` to match the build
- `signingCertificate` set to `Apple Distribution`
- `provisioningProfiles` maps the app bundle ID to the profile name (extracted earlier as `$PP_NAME`)

### No new secrets required
All values are derived from existing secrets and environment variables already in the workflow.

### Technical details
- The bundle ID `app.lovable.f0d3858ae7f2489288d232504acaef78` comes from the Capacitor config
- `PP_NAME` is already extracted and stored in `$GITHUB_ENV` from the certificate installation step
- The heredoc will use unindented content to produce valid XML

