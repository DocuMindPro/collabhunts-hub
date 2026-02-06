

# Move "Restrict by follower range" Toggle Inline with the Follower Range Label

## Current State
The toggle sits at the bottom of the dialog footer, separated from the follower range section. It looks disconnected.

## Proposed Change
Move the toggle switch to sit inline with the "Follower Range (Optional)" label, right next to it. Remove it from the `DialogFooter` entirely.

### In `src/components/brand-dashboard/CreateOpportunityDialog.tsx`:

1. **Move the Switch next to the Follower Range label** -- replace the current label area with a row that has the label on the left and the Switch on the right, plus the dynamic description text below.

2. **Remove the toggle from DialogFooter** -- the footer goes back to just having the Cancel and Continue buttons.

### Technical Details

**Follower Range section label area (around line 459):** Replace the current label + helper text with:
```tsx
<div className="flex items-center justify-between">
  <Label className="flex items-center gap-2">
    <Users className="h-4 w-4 text-muted-foreground" />
    Follower Range (Optional)
  </Label>
  <Switch checked={enforceFollowerRange} onCheckedChange={setEnforceFollowerRange} />
</div>
<p className="text-xs text-muted-foreground">
  {enforceFollowerRange
    ? "Only matching creators can apply. Leave all unchecked to accept all sizes."
    : "Any creator can apply regardless of follower count."}
</p>
```

**DialogFooter (around line 511-523):** Remove the toggle `<div>` block, keeping only the Cancel and Continue buttons.

