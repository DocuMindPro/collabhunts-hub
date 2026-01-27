
# Fix GitHub Release Permissions

The APK build completed successfully, but the release step failed because the workflow doesn't have permission to create releases.

## The Problem

The `softprops/action-gh-release` action needs explicit `contents: write` permission to create GitHub releases. Without it, you get a 403 (Forbidden) error.

## The Fix

Add a `permissions` block to the job that grants write access to repository contents.

## Changes Required

| File | Change |
|------|--------|
| `.github/workflows/build-android.yml` | Add `permissions: contents: write` after line 10 |

## Updated Workflow Section

```yaml
jobs:
  build:
    runs-on: ubuntu-latest
    permissions:
      contents: write
    
    steps:
      ...
```

## What Happens After This Fix

1. Push the updated workflow to GitHub
2. GitHub Actions will automatically start a new build
3. This time, the release step will have permission to create the release
4. Your APK will appear in the Releases section
5. The `/download` page will show the working QR code

## Technical Note

The `GITHUB_TOKEN` is already being passed correctly. The issue is that GitHub Actions now requires explicit permission declarations for write operations. Adding `permissions: contents: write` grants the token the ability to create tags and releases.
