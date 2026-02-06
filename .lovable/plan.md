

# Fix: Feature Toggles Not Working (RLS Policy Issue)

## Root Cause

The `creator_featuring` table is missing RLS policies for admin access:
- **No admin INSERT policy** -- admins can't create featuring records
- **No UPDATE policy at all** -- nobody can deactivate featuring records
- The existing INSERT policy only allows creators to insert their own records

This is why VIP Badge works (it updates `creator_profiles`, which has an admin UPDATE policy) but all other features fail silently -- the database rejects the writes due to RLS, the code doesn't properly catch the error, and the UI shows "Feature activated" even though nothing changed.

## Fix

### 1. Database Migration -- Add missing RLS policies

Add three policies to `creator_featuring`:

```sql
-- Allow admins to insert featuring records
CREATE POLICY "Admins can insert featuring"
ON public.creator_featuring FOR INSERT
WITH CHECK (
  EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
);

-- Allow admins to update featuring records
CREATE POLICY "Admins can update featuring"
ON public.creator_featuring FOR UPDATE
USING (
  EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
);

-- Allow admins to view all featuring records
CREATE POLICY "Admins can view all featuring"
ON public.creator_featuring FOR SELECT
USING (
  EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
);
```

### 2. Code Fix -- Add error handling in `AdminFeatureOverridesTab.tsx`

Update the `toggleCreatorFeature` function to properly check for errors on each database operation (insert/update) so failures are reported instead of showing a false success toast.

### Files to Modify
- Database migration (new) -- add admin RLS policies to `creator_featuring`
- `src/components/admin/AdminFeatureOverridesTab.tsx` -- add error checking after each Supabase call

