
# Compact "Post an Opportunity" Dialog

## Changes in `src/components/brand-dashboard/CreateOpportunityDialog.tsx`

### 1. Reduce Spacing Throughout
- Change main content `space-y-4` to `space-y-3`
- Remove `py-4` from the content wrapper (keep just `pt-2`)
- Reduce `space-y-2` on individual fields to `space-y-1.5`

### 2. Inline Budget + Spots on One Row
Place "Budget per Creator" and "Number of Creators Needed" side by side in a `grid-cols-2` when paid is toggled on, saving a full row of vertical space.

### 3. Compact Paid/Free Toggle
Reduce padding from `p-4` to `p-3` and make text smaller (`text-sm` for title, `text-xs` for subtitle).

### 4. Compact Follower Range Chips
- Reduce individual chip padding from `p-3` to `p-2`
- Use a 3-column grid on desktop (`sm:grid-cols-3`) so all 5 fit in 2 rows instead of 3
- Keep descriptions concise

### 5. Reduce Requirements Textarea
Already `rows={2}`, keep as-is.

### 6. Update Button Text
Change "Continue to Payment" to include a note about eligibility filtering:
```
"Continue to Payment"
```
Add a helper text line below the button:
```
<p class="text-xs text-center text-muted-foreground">
  Only creators matching your selected criteria (location, follower range) will be able to apply.
</p>
```

### 7. Compact Package Deliverables
Reduce padding on the locked deliverables card from `p-4` to `p-3` and use tighter spacing (`space-y-1`).

## Summary
- ~30% reduction in vertical height through tighter spacing, inline grouping, and 3-col follower grid
- Clear eligibility messaging below the submit button
- No functional changes, purely visual compaction

## File to Modify
| File | Change |
|------|--------|
| `src/components/brand-dashboard/CreateOpportunityDialog.tsx` | All changes above |
