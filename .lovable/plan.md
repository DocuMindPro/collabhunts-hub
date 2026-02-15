

## Fix: Upload to TestFlight — IPA File Not Found

### What's happening now
The Export IPA step is now **succeeding** (confirmed in your screenshot). The new failure is in "Upload to TestFlight" — it looks for `$RUNNER_TEMP/export/App.ipa` but the actual file has a different name (Xcode names it based on the scheme or display name, e.g., `Collab Hunts.ipa`).

### Solution
Replace the hardcoded `App.ipa` path with a dynamic lookup that finds the actual `.ipa` file in the export directory.

### Changes to `.github/workflows/build-ios.yml`

Update the "Upload to TestFlight" step (lines 151-160) to:

```yaml
      - name: Upload to TestFlight
        env:
          APPSTORE_CONNECT_USERNAME: ${{ secrets.APPSTORE_CONNECT_USERNAME }}
          APPSTORE_CONNECT_PASSWORD: ${{ secrets.APPSTORE_CONNECT_PASSWORD }}
        run: |
          IPA_PATH=$(find $RUNNER_TEMP/export -name "*.ipa" | head -1)
          echo "Found IPA at: $IPA_PATH"
          if [ -z "$IPA_PATH" ]; then
            echo "ERROR: No .ipa file found in $RUNNER_TEMP/export"
            ls -la $RUNNER_TEMP/export/
            exit 1
          fi
          xcrun altool --upload-app \
            -f "$IPA_PATH" \
            -t ios \
            -u "$APPSTORE_CONNECT_USERNAME" \
            -p "$APPSTORE_CONNECT_PASSWORD"
```

### What this does
1. Searches the export directory for any `.ipa` file
2. Prints the found path for debugging
3. If no IPA is found, lists the directory contents (for debugging) and exits with an error
4. Uses the discovered path for the upload

### No new secrets or dependencies needed
This is a single step update to handle the dynamic IPA filename.
