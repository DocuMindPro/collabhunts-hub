

## Admin Brand Registration Filter + Fix "View Plans" Button

### Issue 1: Admin Panel -- Registration Status Filter

The `AdminBrandsTab` currently has no visibility into the `registration_completed` field. We need to:

**A. Update the `BrandData` interface** to include `registration_completed`.

**B. Add a "Registration" filter dropdown** alongside the existing filters (Phone, Tier, Industry, etc.) with options:
- All
- Signed Up Only (registration_completed = false)
- Fully Registered (registration_completed = true)

**C. Add a "Registration" column** to the table showing a badge:
- "Registered" (green) for `registration_completed = true`
- "Signed Up" (yellow/secondary) for `registration_completed = false`

**D. Update the Brand Detail Modal** to show registration status.

**E. Update CSV export** to include the registration status column.

### Issue 2: "View Plans" Button Not Working

The "View Plans" button in `TeamAccessCard` links to `/brand#pricing`, but logged-in brands get auto-redirected away from that page. Instead, it should trigger the `UpgradePlanDialog` that already exists in the Account tab.

**Fix:** Change `TeamAccessCard` to accept an optional `onUpgrade` callback prop. In `BrandAccountTab`, pass `() => setUpgradeOpen(true)` so the "View Plans" button opens the upgrade dialog directly instead of navigating away.

### Files to Edit

1. **`src/components/admin/AdminBrandsTab.tsx`**
   - Add `registration_completed` to `BrandData` interface
   - Add registration filter state and dropdown
   - Add filter logic in the useEffect
   - Add "Registration" column to table header and rows
   - Add registration status to detail modal
   - Add to CSV export

2. **`src/components/team/TeamAccessCard.tsx`**
   - Add optional `onUpgrade?: () => void` prop
   - When `onUpgrade` is provided, use it on the "View Plans" button instead of linking to `/brand#pricing`

3. **`src/components/brand-dashboard/BrandAccountTab.tsx`**
   - Pass `onUpgrade={() => setUpgradeOpen(true)}` to `TeamAccessCard`

