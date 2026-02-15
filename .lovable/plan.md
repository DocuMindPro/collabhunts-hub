

## Fix: Remove Failing CocoaPods Step (It's Already Handled)

### Problem
The "Install CocoaPods dependencies" step fails with "No Podfile found" — but the "Sync Capacitor" step (which passed successfully) already runs `pod install` internally. The workspace should already exist after sync completes.

### Root Cause
`npx cap sync ios` handles CocoaPods automatically. Adding an explicit `pod install` step after it is redundant and fails because the working directory resolution differs.

### Change

**Update `.github/workflows/build-ios.yml`**

Remove these two steps:
- "Debug iOS directory" (no longer needed)
- "Install CocoaPods dependencies" (redundant, causes failure)

Keep the "Verify workspace exists" step to confirm the workspace was created by `cap sync`.

### Updated workflow order (after sync):
1. Sync Capacitor (runs pod install internally)
2. Verify workspace exists (hard fail if missing)
3. Install Apple certificate...
4. Build archive...

### Technical Detail
Lines 59-70 will be removed. The workflow goes directly from "Sync Capacitor" to "Verify workspace exists."

### No Manual Action Required
This change will auto-trigger the workflow when pushed.

