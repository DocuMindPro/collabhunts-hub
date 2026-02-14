

## Fix iOS Certificate Import (No More Copy-Paste Issues)

### The Problem
Copying base64 from terminal to GitHub Secrets often introduces invisible characters (newlines, spaces, carriage returns) that corrupt the certificate data.

### Two-Part Fix

#### Part 1: Update the workflow to clean the base64 automatically

Modify `.github/workflows/build-ios.yml` to strip any whitespace/newlines from the secret before decoding. This makes the pipeline tolerant of messy base64 input.

**Change in the "Install Apple certificate and provisioning profile" step:**

Replace:
```bash
echo -n "$IOS_CERTIFICATE_BASE64" | base64 --decode -o $CERTIFICATE_PATH
```

With:
```bash
echo -n "$IOS_CERTIFICATE_BASE64" | tr -d '[:space:]' | base64 --decode -o $CERTIFICATE_PATH
```

Also apply the same fix to the provisioning profile line:
```bash
echo -n "$IOS_PROVISION_PROFILE_BASE64" | tr -d '[:space:]' | base64 --decode -o $PP_PATH
```

The `tr -d '[:space:]'` strips ALL whitespace (spaces, tabs, newlines) from the base64 string before decoding, so even if copy-paste added junk characters, it will still work.

#### Part 2: Foolproof way to set the GitHub secret (no terminal needed)

Instead of using the terminal, use this method:

**Option A -- Use a Python one-liner (cleaner output):**
```bash
python3 -c "import base64; print(base64.b64encode(open('YourCertificate.p12','rb').read()).decode())" > cert_base64.txt
```
Then open `cert_base64.txt` in a text editor and copy the contents.

**Option B -- Use GitHub CLI (skip copy-paste entirely):**
```bash
gh secret set IOS_CERTIFICATE_BASE64 < <(base64 -i YourCertificate.p12 | tr -d '\n')
```
This pipes the base64 directly into the secret with zero copy-pasting.

### Files to change
- `.github/workflows/build-ios.yml` -- Add `tr -d '[:space:]'` to both base64 decode lines

### After approving
1. The workflow file will be updated automatically
2. Re-run the failed workflow from GitHub Actions (no need to update the secret if you use the workflow fix)
3. If it still fails, use Option B above to re-set the secret without copy-paste
