

# Show Follower Counts in Range Checkboxes

## What's Wrong
The follower range checkboxes only display the tier name (e.g., "Nano", "Micro") but not the actual follower counts (e.g., "1K - 10K"). The user wants the counts visible so brands know exactly what each tier means.

## What's NOT Wrong
The toggle behavior is already correct -- it controls whether the selected ranges are enforced or if any creator can apply. No logic changes needed.

## Change in `src/components/brand-dashboard/CreateOpportunityDialog.tsx`

Update the checkbox label (around line 498-499) to include the `range.description` alongside the `range.label`:

**Before:**
```
Nano
```

**After:**
```
Nano (1K - 10K)
```

Specifically, change the label text from `{range.label}` to `{range.label} ({range.description.replace(' followers', '')})` to show:
- Nano (1K - 10K)
- Micro (10K - 50K)
- Mid-tier (50K - 100K)
- Macro (100K - 500K)
- Mega (500K+)

## File to Modify

| File | Change |
|------|--------|
| `src/components/brand-dashboard/CreateOpportunityDialog.tsx` | Update checkbox label text to include follower count range |
