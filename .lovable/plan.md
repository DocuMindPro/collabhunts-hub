

## Add "Stats Inactive" Filter and Indicator to Admin Creators Tab

### Overview
The admin panel's Creators tab will show which creators have inactive accounts due to not updating their social media stats, with a new filter and visual indicator.

### Changes to `src/components/admin/AdminCreatorsTab.tsx`

1. **Add `stats_update_required` to CreatorData interface** -- include the boolean field from the database.

2. **New filter: "Stats Status"** -- A dropdown filter added to the filters section with options:
   - All
   - Stats Outdated (shows only creators with `stats_update_required = true`)
   - Stats Current (shows only creators with `stats_update_required = false`)

3. **Status column enhancement** -- When a creator has `stats_update_required = true`, show an additional orange "Stats Inactive" badge next to their existing status badge so admins can spot them at a glance.

4. **Detail modal** -- In the creator detail dialog, show "Stats Inactive" status with the `stats_last_confirmed_at` date so admins know how long it's been.

5. **Clear Filters** -- Reset the new stats filter when clearing all filters.

6. **CSV Export** -- Add a "Stats Status" column to the export.

### Quick Actions Integration
Add a count of stats-inactive creators to `AdminQuickActions.tsx` so it appears in the "Requires Attention" section (optional, low priority).

### Technical Details

**File: `src/components/admin/AdminCreatorsTab.tsx`**
- Add `stats_update_required` and `stats_last_confirmed_at` to the `CreatorData` interface
- Add `statsFilter` state (`"all" | "outdated" | "current"`)
- Add filter logic in the `useEffect` that filters creators
- Add orange "Stats Inactive" badge in the Status column when `stats_update_required === true`
- Add stats filter dropdown in filters row
- Reset `statsFilter` in Clear Filters handler
- Add stats column to CSV export

