

# Add Follower Range Enforcement Toggle

## Overview

Replace the static disclaimer text below the "Continue to Payment" button with a toggle (Switch) that lets brands decide whether to enforce follower range restrictions. When ON, only creators matching the selected follower ranges can apply. When OFF, any creator can apply regardless of follower count.

## Changes in `src/components/brand-dashboard/CreateOpportunityDialog.tsx`

### 1. Add New State Variable

```tsx
const [enforceFollowerRange, setEnforceFollowerRange] = useState(true);
```

### 2. Replace Disclaimer with Toggle Row

Remove the current `<p>` disclaimer and replace it with a compact Switch row inside the `DialogFooter`:

```tsx
<div className="flex items-center justify-between w-full p-2 border rounded-lg text-xs">
  <div>
    <p className="font-medium text-sm">Restrict by follower range</p>
    <p className="text-muted-foreground">
      {enforceFollowerRange
        ? "Only matching creators can apply"
        : "Any creator can apply regardless of follower count"}
    </p>
  </div>
  <Switch checked={enforceFollowerRange} onCheckedChange={setEnforceFollowerRange} />
</div>
```

### 3. Pass Enforcement Flag to Database Insert

In `handleSubmit`, include the enforcement flag in the pending data:

```tsx
follower_ranges: enforceFollowerRange && formData.follower_ranges.length > 0
  ? formData.follower_ranges
  : null,
```

When the toggle is OFF, `follower_ranges` is saved as `null` (meaning no restriction), even if the brand had checked some ranges. This keeps the database logic simple -- `null` means open to all.

### 4. Reset on Form Clear

Add `setEnforceFollowerRange(true)` alongside the existing form reset after successful submission.

## No Database Changes Needed

The existing `follower_ranges` column (TEXT ARRAY, nullable) already supports this. `null` = open to all, populated array = restricted. The filtering logic on the creator side already handles this.

## Summary

- One new Switch toggle replaces the static disclaimer
- Brands have explicit control over enforcement
- Default is ON (restricted) to encourage quality matching
- No backend changes required

## File to Modify

| File | Change |
|------|--------|
| `src/components/brand-dashboard/CreateOpportunityDialog.tsx` | Add state, replace disclaimer with toggle, update data logic |

