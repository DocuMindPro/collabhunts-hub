

# Fix Announcement Banner Save (Persistent Issue)

## Root Cause

The UPDATE RLS policy on `site_settings` has `USING(has_role(auth.uid(), 'admin'))` but **no `WITH CHECK` clause**. When PostgREST processes an upsert (`INSERT ... ON CONFLICT DO UPDATE`), it needs both the INSERT and UPDATE policies to fully pass. The missing `WITH CHECK` on UPDATE can cause the upsert to silently succeed with 0 rows affected -- no error is thrown, but nothing is written.

The code also lacks verification that the save actually persisted.

## Changes

### 1. Database Migration: Fix the UPDATE RLS policy

Drop and recreate the UPDATE policy with an explicit `WITH CHECK`:

```sql
DROP POLICY IF EXISTS "Admins can update site settings" ON public.site_settings;

CREATE POLICY "Admins can update site settings"
  ON public.site_settings
  FOR UPDATE
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
```

### 2. Code Change: `src/components/admin/AdminAnnouncementsTab.tsx`

Update `saveBannerSettings` to:
- Add `.select()` after upsert to get returned rows
- Verify rows were actually affected
- Add `updated_at` to the upsert payload so the timestamp updates

```typescript
for (const { key, value } of updates) {
  const { data, error } = await supabase
    .from("site_settings")
    .upsert(
      { key, value, category: "announcement", updated_at: new Date().toISOString() },
      { onConflict: "key" }
    )
    .select();
  if (error) throw error;
  if (!data || data.length === 0) {
    throw new Error("Save failed - you may not have admin permissions");
  }
}
```

## Expected Result
After these changes, saving banner settings will reliably persist to the database. The banner will appear on the website when enabled, and the admin UI will show the correct state on refresh.

