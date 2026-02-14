

## Fix: Re-upload iOS Certificate Without Copy-Paste

### The Root Cause
The `tr -d '[:space:]'` workflow fix is in place and working, but the **IOS_CERTIFICATE_BASE64** secret stored in GitHub already contains corrupted data from the original copy-paste. No amount of cleaning in the workflow can recover corrupted base64.

### The Fix (Two Parts)

#### Part 1: Add diagnostic logging to the workflow
Add a step that prints the **byte size** of the decoded certificate file so we can verify the data decoded correctly. A valid .p12 file is typically 2,000-10,000 bytes. If it shows 0 or a tiny number, the secret data is bad.

**File:** `.github/workflows/build-ios.yml`

Add after the certificate decode line:
```bash
echo "Certificate file size: $(wc -c < $CERTIFICATE_PATH) bytes"
```

And after the provisioning profile decode:
```bash
echo "Provisioning profile size: $(wc -c < $PP_PATH) bytes"
```

#### Part 2: Re-upload the secret (instructions for the user)

The user must re-set the `IOS_CERTIFICATE_BASE64` secret using one of these **no-copy-paste** methods:

**Method 1 -- GitHub CLI (recommended, zero copy-paste):**
```bash
# Install GitHub CLI if not already installed
# Then from the folder containing your .p12 file:
gh secret set IOS_CERTIFICATE_BASE64 --body "$(base64 -i YourCertificate.p12 | tr -d '\n')"
```

**Method 2 -- Python script (if gh CLI not available):**
```bash
python3 -c "import base64; print(base64.b64encode(open('YourCertificate.p12','rb').read()).decode())" | pbcopy
```
Then paste directly into GitHub Settings > Secrets > IOS_CERTIFICATE_BASE64 > Update.

**Method 3 -- Use a file upload approach:**
1. Run: `base64 -i YourCertificate.p12 | tr -d '\n' > cert_clean.txt`
2. Open `cert_clean.txt` in a **plain text editor** (not terminal)
3. Select All > Copy > Paste into GitHub Secret

### Files to change
- `.github/workflows/build-ios.yml` -- Add file size diagnostic echo statements after decode lines

### After approving
1. The workflow will be updated with diagnostic logging
2. You **must** re-upload your `IOS_CERTIFICATE_BASE64` secret using one of the methods above
3. Re-run the workflow -- the diagnostic will confirm the certificate decoded properly
