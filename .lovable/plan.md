

## Trigger iOS Build

A small, harmless change to push to `main` and trigger the GitHub Actions iOS workflow.

### What will change

Add a build timestamp comment to the `index.html` file. This is a zero-impact change that simply triggers a new commit.

### Technical details

**File:** `index.html`
- Add an HTML comment with today's date near the top: `<!-- iOS build trigger: 2026-02-14 -->`

This will:
1. Create a new commit on `main`
2. Automatically trigger the `build-ios.yml` workflow
3. Build, sign, and upload to TestFlight

After approving, go to your GitHub repo → **Actions** tab to watch the build progress. Once it succeeds, you'll receive an email from Apple, and the build will appear in the **TestFlight** app on your iPhone.

