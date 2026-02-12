

## Fix /download Page to Always Show the Latest APK

### Problem
The `/download` page uses GitHub's `/releases/latest` API endpoint, which can sometimes lag behind or skip releases due to how GitHub determines the "latest" release (it uses semantic versioning rules, not creation date). This means your newest APK build might not show up even though the GitHub Action completed successfully.

### Solution
Two changes to make this bulletproof:

### 1. Update `/download` page to fetch all releases and pick the newest one

**File: `src/pages/Download.tsx`**
- Change the API call from `/releases/latest` (single release) to `/releases?per_page=5` (list of releases sorted by date)
- Pick the first release that contains an `.apk` asset
- This ensures the page always finds the most recent successful build regardless of GitHub's "latest" designation

### 2. Add a fallback link to GitHub Releases page

- Add a small "View all releases" link below the download button that opens `https://github.com/DocuMindPro/collabhunts-hub/releases` directly
- This gives you a manual fallback if anything ever goes wrong with the API fetch

### Technical Details

The key code change in the `useEffect` fetch:
- **Before**: `GET /repos/{owner}/{repo}/releases/latest` -- returns a single release object based on GitHub's "latest" logic
- **After**: `GET /repos/{owner}/{repo}/releases?per_page=5` -- returns an array of the 5 most recent releases sorted by creation date, then we find the first one with an APK asset

This is a small, targeted change to one file (`src/pages/Download.tsx`) that will ensure new builds are always available for download immediately after the GitHub Action completes.

