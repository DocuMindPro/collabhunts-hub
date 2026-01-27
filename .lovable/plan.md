
# Fix Android APK Crash - Missing Environment Variables

## Root Cause Analysis

Your APK crashes on startup because **environment variables are missing during the GitHub Actions build**. Here's what's happening:

| What the app needs | What the APK has |
|--------------------|------------------|
| `VITE_SUPABASE_URL` = `https://olcygpkghmaqkezmunyu.supabase.co` | `undefined` |
| `VITE_SUPABASE_PUBLISHABLE_KEY` = `eyJhbG...` | `undefined` |

When the Supabase client initializes with `undefined` values, the app crashes immediately (white screen, then closes).

## Solution

Add the environment variables to GitHub Secrets and inject them during the build process.

---

## Implementation Steps

### Step 1: Add GitHub Secrets

Go to your GitHub repository and add these secrets:

1. Navigate to: **Settings → Secrets and variables → Actions → New repository secret**
2. Add these secrets:

| Secret Name | Value |
|-------------|-------|
| `VITE_SUPABASE_URL` | `https://olcygpkghmaqkezmunyu.supabase.co` |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9sY3lncGtnaG1hcWtlem11bnl1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQzNTMxNjgsImV4cCI6MjA3OTkyOTE2OH0.dbMWOlUbPArcarzcaL_qr_PIlFKJfOogcAeUgBGkclw` |

### Step 2: Update GitHub Actions Workflow

Modify `.github/workflows/build-android.yml` to create the `.env` file before building:

**Changes to make:**

Add a new step after "Install dependencies" and before "Build web app" to create the `.env` file:

```yaml
- name: Create .env file
  run: |
    echo "VITE_SUPABASE_URL=${{ secrets.VITE_SUPABASE_URL }}" >> .env
    echo "VITE_SUPABASE_PUBLISHABLE_KEY=${{ secrets.VITE_SUPABASE_PUBLISHABLE_KEY }}" >> .env
```

---

## Technical Details

### File Changes Summary

| File | Action | Purpose |
|------|--------|---------|
| `.github/workflows/build-android.yml` | Modify | Add step to create `.env` from GitHub Secrets |

### Updated Workflow (Relevant Section)

```text
Steps Flow:
1. Checkout code
2. Setup JDK 17
3. Setup Node.js
4. Install dependencies
5. [NEW] Create .env file from secrets  ← ADD THIS
6. Build web app
7. Add Android platform
... (rest unchanged)
```

### Why This Works

- Vite reads environment variables from `.env` at **build time**
- The values get "baked into" the JavaScript bundle
- When the APK runs, it has the actual URLs embedded in the code
- Supabase client initializes successfully, app works!

---

## After Implementation

1. Add the GitHub Secrets (manual step in GitHub UI)
2. I'll update the workflow file
3. Push changes to trigger a new build
4. Download the new APK and test

The new APK will have the backend URLs properly embedded and should work correctly on your Android phone.
