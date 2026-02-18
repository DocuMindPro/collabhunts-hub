
# Root Cause: Apple TestFlight Upload Rate Limit (HTTP 409)

## What Is Actually Wrong (Not a Code Bug)

The error from screenshot 4 is unambiguous:

```
Validation failed (409) Upload limit reached.
The upload limit for your application has been reached.
Please wait 1 day and try again.
```

**This is Apple's TestFlight upload rate limit — not a code error.** Apple enforces a hard cap on how many builds you can upload per app per day via `altool`. Every single Lovable code commit (including plan file updates, safe area tweaks, badge additions) has been triggering a full iOS build and upload to TestFlight. Looking at the Actions list in screenshot 2, builds #72, #73, #74, #75 all fired within 31 minutes — Apple's limit was hit fast.

The previous screenshot 1 shows a separate older error: a `502 Bad Gateway` from Apple servers — that was a transient Apple outage, unrelated to code.

---

## The Real Problem: Wrong Trigger Strategy

Currently the iOS workflow triggers on **every push to `main`**:
```yaml
on:
  push:
    branches: [main]
  workflow_dispatch:
```

This means **every Lovable edit** — including plan file saves, README tweaks, minor CSS fixes — burns one TestFlight upload slot. Apple's limit is typically **25 builds per day per app**. With Lovable pushing multiple commits per session, this is exhausted in minutes.

Android APK builds have no such limit (they just create GitHub Releases), so Android can safely keep the `push` trigger. iOS cannot.

---

## The Fix: Two Changes to the iOS Workflow

### Change 1 — Remove the automatic `push` trigger from iOS

Change the iOS workflow to **only run manually** (`workflow_dispatch`) or on **version tags**. This gives you full control over when a TestFlight build is sent — you trigger it once when you're happy with a batch of changes, not on every single commit.

```yaml
# BEFORE
on:
  push:
    branches: [main]
  workflow_dispatch:

# AFTER — manual trigger only + optional version tag trigger
on:
  workflow_dispatch:
  push:
    tags:
      - 'v*'  # Only trigger on version tags like v1.0.1, v1.1.0
```

This way:
- Android still auto-builds on every push (no rate limit)
- iOS only builds when YOU decide to release (manual trigger or git tag)

### Change 2 — Modernize `altool` to `xcrun notarytool` / `xcrun altool` with API key

The `xcrun altool --upload-app` command used with username + password (App-Specific Password) is **deprecated** by Apple as of Xcode 14. While it still works, Apple increasingly rate-limits and rejects it under load. The modern replacement is using **App Store Connect API Key** with `xcrun altool` using `--apiKey` and `--apiIssuer` flags, or using `xcrun notarytool`.

However, this requires new secrets (`APPSTORE_CONNECT_API_KEY_ID`, `APPSTORE_CONNECT_API_ISSUER`, `APPSTORE_CONNECT_API_KEY_BASE64`) — so this is optional and only if the user wants to add the API key. **The primary fix is Change 1 alone.**

---

## Files to Change

| File | Change |
|---|---|
| `.github/workflows/build-ios.yml` | Remove `push: branches: [main]` trigger; keep only `workflow_dispatch` + optional `push: tags: v*` |

That's the only file that needs changing. The rate limit will reset after 24 hours automatically — no other action needed.

---

## After This Fix

- **iOS builds will no longer auto-trigger** on every Lovable commit
- **To release a new TestFlight build**: Go to GitHub → Actions → "Build iOS & Upload to TestFlight" → click "Run workflow" button → Done
- **Android APK** continues to auto-build on every push as before
- **The 409 rate limit resets after 24 hours** from when it was hit — so the next manual trigger will succeed

---

## Optional: Version Tag Releases

If you want iOS builds to trigger automatically but only on deliberate releases, we can also support version tags. Running `git tag v1.2.0 && git push --tags` from your GitHub repo would trigger the iOS build. The `push: tags: v*` line in the trigger handles this. We'll include this in the workflow so you have both options.
