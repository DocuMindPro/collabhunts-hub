

# Add Repeated & Multiple Schedule Push Notifications

## Overview
Enhance the push notification scheduling system to support:
1. **Repeated/recurring schedules** (e.g., daily, weekly, monthly)
2. **Multiple scheduled dates** per notification (e.g., send the same notification on Feb 26, Mar 5, and Mar 12)

## Database Changes

Add columns to the `scheduled_push_notifications` table:

- `repeat_type` (text, nullable) -- Values: `none`, `daily`, `weekly`, `monthly`. Default `none`.
- `repeat_end_date` (timestamptz, nullable) -- When the recurring schedule stops.
- `parent_id` (uuid, nullable, FK to self) -- Links child occurrences back to a parent for repeated schedules.

When a repeated notification is created, the initial row is the "parent" with the repeat settings. The cron job (or at creation time) generates child rows for each occurrence.

## UI Changes in `AdminAnnouncementsTab.tsx`

Update the "Schedule for Later" section to add:

1. **Multiple Dates Mode**: A toggle or option to add multiple specific dates. Show a list of selected dates with an "Add Date" button and the ability to remove individual dates.

2. **Repeat Mode**: A select dropdown for repeat frequency (`None`, `Daily`, `Weekly`, `Monthly`) and an optional end date picker for when the repetition stops.

3. **Delivery radio group** becomes three options:
   - Send Now
   - Schedule for Later (single date/time)
   - Schedule Multiple / Repeat

When submitting with multiple dates, insert one row per date into `scheduled_push_notifications`. When submitting with repeat, insert the parent row with `repeat_type` and `repeat_end_date`, then generate child rows for each occurrence up to the end date.

## Changes to `ScheduledNotificationsList.tsx`

- Show repeat badge (e.g., "Repeats Weekly") on notifications that have a `repeat_type`.
- Group child notifications under their parent, or show them flat with a "Recurring" indicator.
- Cancelling a parent with repeat cancels all pending children too.

## Files to Modify

| File | Change |
|------|--------|
| Database migration | Add `repeat_type`, `repeat_end_date`, `parent_id` columns |
| `src/components/admin/AdminAnnouncementsTab.tsx` | Add multiple dates UI, repeat frequency selector, updated submission logic |
| `src/components/admin/ScheduledNotificationsList.tsx` | Show repeat badges, handle bulk cancel of recurring series |

## Technical Details

### Multiple dates insertion logic:
```typescript
// For each selected date, create a scheduled notification
for (const date of selectedDates) {
  const scheduledAt = new Date(date);
  scheduledAt.setHours(hours, minutes, 0, 0);
  await supabase.from("scheduled_push_notifications").insert({
    title, body, scheduled_at: scheduledAt.toISOString(),
    created_by: user.id,
  });
}
```

### Repeat schedule logic:
```typescript
// Generate occurrences from start date to end date
const occurrences = generateOccurrences(startDate, endDate, repeatType);
// Insert parent row
const { data: parent } = await supabase.from("scheduled_push_notifications").insert({
  title, body, scheduled_at: occurrences[0].toISOString(),
  repeat_type: repeatType, repeat_end_date: endDate.toISOString(),
  created_by: user.id,
}).select().single();
// Insert child rows
for (const date of occurrences.slice(1)) {
  await supabase.from("scheduled_push_notifications").insert({
    title, body, scheduled_at: date.toISOString(),
    parent_id: parent.id, created_by: user.id,
  });
}
```

### Cancel recurring series:
```typescript
await supabase.from("scheduled_push_notifications")
  .update({ status: "cancelled" })
  .or(`id.eq.${parentId},parent_id.eq.${parentId}`)
  .eq("status", "pending");
```

