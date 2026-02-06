
# Fix Announcement Banner Save and Display

## Problem
Two issues identified:
1. **Save not persisting**: When the admin toggles "Banner Enabled" on and clicks "Save Banner Settings", the update does not persist to the database. The `updated_at` timestamp confirms the row was never modified after initial creation.
2. **Banner not showing**: Since the database value remains `"false"`, the `AnnouncementBanner` component correctly hides itself.

## Root Cause
The `saveBannerSettings` function uses `.update({ value }).eq("key", key)` which can silently fail (0 rows updated, no error returned by Supabase) if the RLS policy evaluation doesn't match at runtime. This happens because Supabase's `.update()` does not throw an error when no rows are affected.

## Fix

### 1. Switch from `.update()` to `.upsert()` in `AdminAnnouncementsTab.tsx`
Replace the update loop with upsert calls that match on the `key` column, ensuring the row is always written. Also add proper error detection by checking the returned data count.

```typescript
// Before (silently fails):
const { error } = await supabase
  .from("site_settings")
  .update({ value })
  .eq("key", key);

// After (reliable):
const { error } = await supabase
  .from("site_settings")
  .upsert(
    { key, value, category: "announcement" },
    { onConflict: "key" }
  );
```

### 2. Add a unique constraint on `site_settings.key` (if not already present)
A database migration to add a unique constraint on the `key` column so upsert's `onConflict` works correctly.

### 3. Verify `AnnouncementBanner` placement
The banner is already rendered in `App.tsx` outside the Router, which is correct. Once the database value is properly saved, it will display automatically on page load.

## Files to Modify
- **`src/components/admin/AdminAnnouncementsTab.tsx`** -- Change `.update()` to `.upsert()` with `onConflict: "key"` and add success verification
- **Database migration** -- Add unique constraint on `site_settings.key` if missing

## Expected Result
After the fix, toggling the banner on and clicking Save will reliably persist the setting, and the announcement banner will appear at the top of the website on next page load.
