

## Compact and Clean Up Backup History Page

### Issues Found

1. **Outdated failed records**: 19 failed backup records (mostly `InvalidAccessKeyId` errors from old AWS credentials) are cluttering the table. These are no longer relevant since the keys were just updated and backups are working.

2. **Too much vertical space**: The page has 4 separate sections stacked vertically (Cron Status, 4 Stat Cards, 3 Storage Cards + Total Card, Backup Table) requiring excessive scrolling.

3. **Redundant stat cards**: The "Backup Storage (S3)" stat card duplicates info already shown in the StorageMonitorCard's "AWS S3 Backups" card below it.

4. **Header buttons are bulky**: 4 action buttons with long labels wrap on smaller screens and take up significant header space.

5. **Table shows all 50+ records** with no filtering or pagination.

### Plan

**1. Clean up old failed records from the database**
- Delete the 19 failed backup records that have `InvalidAccessKeyId` errors -- they're historical noise from the old credentials and serve no purpose.

**2. Make the stat cards inline and smaller**
- Merge the 4 stat cards (Total, Successful, Failed, S3 Size) into a single compact horizontal bar instead of 4 separate cards. Display as inline badges/chips in one row.

**3. Consolidate the Storage Overview**
- Collapse the 3 StorageMonitorCard cards + Total card into a single collapsible card (collapsed by default) since this info is secondary to the backup table.

**4. Compact the header action buttons**
- Move the testing/debug buttons (Test R2 Upload, Test Failure Email) into a dropdown menu labeled "Tests". Keep only "Backup Media" and "Full Backup" as primary buttons.

**5. Add status filter tabs to the backup table**
- Add compact filter tabs (All / Success / Failed) above the table so you can quickly filter records.
- Reduce default limit from 50 to 20 records.

**6. Reduce padding throughout**
- Change outer padding from `p-6` to `p-4`, reduce `space-y-6` to `space-y-4`, and tighten card padding per the compact UI design policy.

### Technical Details

**Database cleanup (one-time):**
```sql
DELETE FROM backup_history 
WHERE status = 'failed' 
AND error_message LIKE '%InvalidAccessKeyId%';
```

**Files modified:**
- `src/pages/BackupHistory.tsx` -- compact layout, dropdown for test buttons, filter tabs, tighter spacing
- `src/components/backup/StorageMonitorCard.tsx` -- wrap in a Collapsible component, collapsed by default

**No new files or dependencies needed.** Uses existing `Collapsible`, `DropdownMenu`, and `Tabs` components from the UI library.

