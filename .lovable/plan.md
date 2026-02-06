

# Make the /influencers Page More Compact and Polished

## Problem

The page header is oversized (text-4xl/5xl + text-xl subtitle), the filter card has excessive padding, the advanced filters panel is very tall and spacious, and there's no strong CTA near the results. Overall it feels spread out and lacks visual punch.

## Changes in `src/pages/Influencers.tsx`

### 1. Compact Header with Inline Result Count

Reduce heading from `text-4xl md:text-5xl` to `text-2xl md:text-3xl`, subtitle from `text-xl` to `text-sm`, and reduce `mb-8` to `mb-5`. Add result count badge inline with title.

```tsx
<div className="mb-5">
  <div className="flex items-center gap-3 mb-1">
    <h1 className="text-2xl md:text-3xl font-heading font-bold">
      Book Creators for Events
    </h1>
    {!loading && (
      <Badge variant="secondary" className="text-xs">
        {filteredCreators.length} results
      </Badge>
    )}
  </div>
  <p className="text-sm text-muted-foreground">
    Find verified creators available for live fan experiences at your location
  </p>
</div>
```

### 2. Compact Filter Bar

- Reduce padding from `p-6` to `p-4`
- Reduce gap from `gap-4` to `gap-3`
- Keep `mb-4` as-is (already tight)

### 3. Compact Advanced Filters Panel

- Remove `CardHeader` and `CardTitle` -- use a simple flex row with "Advanced Filters" text and Clear button
- Reduce `space-y-6` to `space-y-4` throughout
- Use `grid grid-cols-1 md:grid-cols-2` for toggle filters (Responds Fast, Top Rated, Open to Free Invites side by side)
- Group Language + Followers by Platform on one row
- Group Age Range + Gender on one row
- Remove individual `<Separator />` between each filter -- use lighter visual separation via grid gaps
- Reduce overall padding from `p-6` to `p-4`
- Change `mb-8` to `mb-4`

### 4. Tighter Creator Grid

- Reduce `py-12` on main to `py-6`
- Reduce grid gap from `gap-4 md:gap-6` to `gap-3 md:gap-4`

### 5. Add CTA Banner Below Grid

After the results count at the bottom, add a compact CTA:

```tsx
<div className="mt-6 text-center p-4 rounded-lg bg-primary/5 border border-primary/10">
  <p className="text-sm text-muted-foreground mb-2">
    Can't find the right creator?
  </p>
  <Button size="sm" onClick={() => navigate('/brand-dashboard?tab=opportunities')}>
    Post an Opportunity
  </Button>
</div>
```

### 6. Compact Empty State

Reduce `py-12` to `py-8` on empty/loading states.

## Summary of Visual Impact

- Header: ~40% shorter
- Filter bar: ~20% shorter
- Advanced filters: ~50% shorter (2-column layout for toggles)
- Grid spacing: tighter
- Added bottom CTA for brands who don't find a match
- Overall page feels denser and more professional

## Files to Modify

| File | Change |
|------|--------|
| `src/pages/Influencers.tsx` | All changes above |

