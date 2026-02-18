
# App Crash Investigation: Profile Image Upload & Other Crash Points

## Root Cause Analysis

After examining all relevant files, edge function code, storage buckets, and RLS policies, I have identified **4 distinct crash causes** — one primary crash and three secondary ones that will cause silent failures or white screens.

---

## Crash #1 (PRIMARY — Your Reported Crash): Missing `creator-images` Storage Bucket

**Where it crashes:** `NativeCreatorOnboarding.tsx`, lines 238–243

```typescript
const { error: uploadError } = await supabase.storage
  .from('creator-images')   // ← THIS BUCKET DOES NOT EXIST
  .upload(fileName, profileImage, { upsert: true });
if (uploadError) throw uploadError;  // ← THROWS, crashes the safeNativeAsync wrapper
```

**The evidence:** The storage buckets in the database are:
- `brand-logos`
- `career-cvs`
- `portfolio-media`
- `profile-images` ← correct bucket for images

There is **no `creator-images` bucket**. When the user tries to upload a photo during onboarding Step 1 (or when submitting with a photo selected), the upload call throws an error, which propagates out of `safeNativeAsync`, and since the entire submit is wrapped inside it with a 15-second timeout that resolves `false` on error, the app shows "Failed to create profile" — but if the React state or toast rendering itself panics (on Android WebView), it can white-screen.

**The second issue:** Even if the bucket existed, there is NO RLS INSERT policy for `creator-images`. The `profile-images` bucket does have all 4 correct policies (INSERT, SELECT, UPDATE, DELETE).

**Fix:** Change the onboarding image upload to use the existing `profile-images` bucket instead of the non-existent `creator-images` bucket.

---

## Crash #2 (SECONDARY): `upload-profile-image` Edge Function Called Without R2 Secrets Being Fully Configured

**Where it crashes:** `ProfileTab.tsx` (post-onboarding profile editing), lines 155 and 182

The `ProfileTab.tsx` uses a different upload path than onboarding — it calls the `upload-profile-image` **edge function** which uploads to Cloudflare R2. While R2 secrets ARE configured (`R2_ACCOUNT_ID`, `R2_BUCKET_NAME`, etc.), the edge function has **no logs** appearing in the analytics, meaning it is either timing out or the R2 endpoint itself is returning an error that crashes the function execution.

**The real crash risk:** In `ProfileTab.tsx`, line 155–157:
```typescript
const response = await supabase.functions.invoke('upload-profile-image', { body: formData });
if (response.error) throw new Error(response.error.message);
if (!response.data.success) throw new Error(response.data.error || 'Upload failed');
```

On Android native, `supabase.functions.invoke()` with a `FormData` body can fail silently or throw a `TypeError` when the native WebView's `fetch` implementation doesn't support multipart form data in the same way. This `TypeError` is **not** caught by the try/catch if it happens at the network transport layer — it propagates up to React's render cycle and triggers the `NativeErrorBoundary`. This is the "crashed, shows error screen" scenario.

**Fix:** Wrap the `supabase.functions.invoke()` with `FormData` in a safety net; also migrate both image upload paths (onboarding + profile tab) to use Supabase Storage `profile-images` bucket directly — bypassing the R2 edge function entirely for the native app. This is simpler, faster, and already has proper RLS policies.

---

## Crash #3 (SECONDARY): Unhandled `response.data` Access When Edge Function Returns 401/500

**Where it crashes:** `ProfileTab.tsx`, line 157:
```typescript
if (!response.data.success) throw new Error(response.data.error || 'Upload failed');
```

If the edge function returns a non-2xx response (e.g., 401 unauthorized, 500 R2 failure), `response.data` may be `null`. Accessing `.success` on `null` throws:
```
TypeError: Cannot read properties of null (reading 'success')
```

This is an **unguarded null access** — it bypasses the `catch` block because it throws synchronously inside the `try`, but on some Android WebView versions, unhandled type errors during async resolution cause a native crash rather than a caught JS error.

**Fix:** Add a null guard: `if (!response.data?.success)`.

---

## Crash #4 (SECONDARY): `PortfolioUploadSection` Uses Raw `XMLHttpRequest` Without Timeout

**Where it crashes:** `PortfolioUploadSection.tsx`, lines 65–106

The `uploadWithProgress` function creates a raw `XMLHttpRequest` with **no timeout set**. On Android native, if the network request to the edge function hangs (common in Capacitor WebView), the XHR will hang indefinitely — no timeout, no rejection, no resolution. The component stays in `uploading: true` state forever, and in some cases the pending Promise prevents React from unmounting the component cleanly, causing a freeze or crash on navigation.

**Fix:** Add `xhr.timeout = 30000` and an `xhr.addEventListener('timeout', ...)` handler.

---

## Summary of All Fixes

| # | Location | Bug | Fix |
|---|---|---|---|
| 1 | `NativeCreatorOnboarding.tsx` | Wrong bucket name `creator-images` (doesn't exist) | Change to `profile-images` |
| 2 | `ProfileTab.tsx` | `FormData` with `supabase.functions.invoke` can silently fail on Android | Migrate to direct Supabase Storage upload |
| 3 | `ProfileTab.tsx` | `response.data.success` crashes when `data` is null | Add `response.data?.success` null guard |
| 4 | `PortfolioUploadSection.tsx` | XHR has no timeout, hangs indefinitely on native | Add 30s XHR timeout with error handler |

---

## Technical Implementation Plan

### Step 1 — Fix `NativeCreatorOnboarding.tsx` (Critical Crash Fix)

Change lines 238–243 from `creator-images` to `profile-images`:

```typescript
// BEFORE (broken):
await supabase.storage.from('creator-images').upload(fileName, profileImage, { upsert: true });

// AFTER (correct):
await supabase.storage.from('profile-images').upload(fileName, profileImage, { upsert: true });
const { data: urlData } = supabase.storage.from('profile-images').getPublicUrl(fileName);
```

The `profile-images` bucket is public and already has the correct INSERT RLS policy (`Users can upload their own profile image`).

### Step 2 — Fix `ProfileTab.tsx` (Null Guard + Native-Safe Upload)

Two changes:

**2a.** Add null guard on `response.data` access:
```typescript
if (response.error) throw new Error(response.error.message || 'Upload error');
if (!response.data?.success) throw new Error(response.data?.error || 'Upload failed');
```

**2b.** Add a fallback path for native: if `supabase.functions.invoke` fails on native, fall back to direct Supabase Storage upload into `profile-images` bucket. This prevents the Android-specific `FormData` hang.

### Step 3 — Fix `PortfolioUploadSection.tsx` (XHR Timeout)

Add timeout handling to prevent silent hangs on native:
```typescript
xhr.timeout = 30000; // 30 seconds
xhr.addEventListener('timeout', () => reject(new Error('Upload timed out. Please try again.')));
```

### Files to Modify

| File | Change |
|---|---|
| `src/pages/NativeCreatorOnboarding.tsx` | Line ~239: `creator-images` → `profile-images` |
| `src/components/creator-dashboard/ProfileTab.tsx` | Null guard on `response.data`, add native fallback |
| `src/components/creator-dashboard/PortfolioUploadSection.tsx` | Add XHR timeout (30s) |

**No database migrations needed.** The `profile-images` bucket already exists with correct public access and RLS policies for authenticated uploads.
