

# Update GitHub Repository Path

A simple one-line code change to connect your download page to your actual GitHub repository.

## What Needs to Change

Update line 10 in `src/pages/Download.tsx`:

| Current Value | New Value |
|---------------|-----------|
| `"your-username/collabhunts-hub"` | `"DocuMindPro/collabhunts-hub"` |

## What Happens After This Change

1. **Push to GitHub** - When you push this change to your `main` branch, GitHub Actions will automatically start building the APK
2. **Build Time** - Wait about 5-10 minutes for the build to complete
3. **Check Progress** - Go to https://github.com/DocuMindPro/collabhunts-hub/actions to see the build status
4. **APK Ready** - Once complete, a new Release will appear at https://github.com/DocuMindPro/collabhunts-hub/releases
5. **Download Page Works** - Your `/download` page will automatically show the QR code linking to the APK

## Files to Modify

| File | Change |
|------|--------|
| `src/pages/Download.tsx` | Update line 10: change `"your-username/collabhunts-hub"` to `"DocuMindPro/collabhunts-hub"` |

