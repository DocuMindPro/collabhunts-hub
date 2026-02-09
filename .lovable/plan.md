

## Fix Custom & Content Creation Agreement Questions

### Problem
The Custom Agreement and Content Creation templates currently show "Start Time" and "Duration (hours)" fields, which don't apply when a brand just wants a creator to produce a video or content by a deadline. These fields are only relevant for in-person event templates (Social Boost, Meet & Greet).

### Changes

**File: `src/config/agreement-templates.ts`**

1. Remove `eventTime` and `durationHours` from the **custom** template's `questions` array
2. Remove `eventTime` and `durationHours` from the **content_creation** template's `questions` array (also not event-based)
3. Keep `eventDate` in both -- the dialog already labels it "Delivery Deadline" when `eventTime` is not present (line 378 of the dialog)

**Before (custom):**
```
questions: ['productDescription', 'platforms', 'usageRights', 'revisionRounds', 'eventDate', 'eventTime', 'durationHours', 'specialInstructions']
```

**After (custom):**
```
questions: ['productDescription', 'platforms', 'usageRights', 'revisionRounds', 'eventDate', 'specialInstructions']
```

**Before (content_creation):**
```
questions: ['productDescription', 'platforms', 'usageRights', 'revisionRounds', 'eventDate', 'specialInstructions']
```
This one is already correct -- no `eventTime` or `durationHours`. No change needed here.

**Before (unbox_review):**
```
questions: ['productDescription', 'platforms', 'usageRights', 'revisionRounds', 'eventDate', 'specialInstructions']
```
Also already correct -- no change needed.

### Summary
Only one line changes in one file: remove `'eventTime', 'durationHours'` from the custom template's questions array. The existing conditional logic in the dialog already handles the label switch ("Event Date" vs "Delivery Deadline") and hides the time/duration fields when they're not in the questions list.

