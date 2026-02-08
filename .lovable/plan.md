

## Separate Brand Subscriptions Tab + Custom Duration

### Overview

Move brand subscription management out of Feature Overrides into its own dedicated admin tab ("Subscriptions") placed next to Careers. Add date pickers for custom start/end dates when activating a plan.

### Changes

**1. Create new `AdminSubscriptionsTab.tsx` component**

A dedicated tab for managing brand subscriptions with:
- Search bar (by brand name, email, or ID -- same flexible search as Feature Overrides)
- When a brand is selected, show:
  - Current plan status (Free/Basic/Pro) with period dates
  - Plan selector dropdown (None/Basic/Pro)
  - **Start date** and **End date** date inputs so you control the exact subscription duration
  - A "Save" button to apply the change
- On save: cancel existing active subscriptions, insert new `brand_subscriptions` record with the chosen dates, update `brand_plan` on the profile, log to `admin_feature_overrides`

**2. Remove subscription management from Feature Overrides**

Remove the "Subscription Plan" section from `AdminFeatureOverridesTab.tsx` (the brand features card). Keep only the Verified Business Badge toggle there. Also remove the `ActiveSubscription` interface and `toggleBrandSubscription` function, and the subscription state from `selectBrand`.

**3. Add the new tab to Admin.tsx**

- Import `AdminSubscriptionsTab`
- Add a new `TabsTrigger` with value `"subscriptions"` next to Careers (after the Careers tab trigger)
- Add corresponding `TabsContent` rendering the new component
- Use the `DollarSign` icon (already imported)

### Technical Details

**New file:** `src/components/admin/AdminSubscriptionsTab.tsx`
- Search logic: reuses the same `isUUID` / `isHexFragment` pattern for flexible ID search
- Brand search queries `brand_profiles` + `profiles` (for email lookup)
- Date inputs use standard `<Input type="date" />` -- no extra dependencies needed
- Fetches current active subscription from `brand_subscriptions` on brand select
- Shows subscription history (last 5 records) for audit visibility

**Modified files:**
- `src/components/admin/AdminFeatureOverridesTab.tsx` -- remove subscription plan section, `toggleBrandSubscription`, `ActiveSubscription` interface, and subscription state from `selectBrand`/`SelectedProfile`
- `src/pages/Admin.tsx` -- add `subscriptions` tab trigger + content, import new component
