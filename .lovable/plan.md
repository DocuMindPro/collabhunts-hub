
# Compact and Beautiful Opportunities Page Redesign

## Problems with Current Design
- Cards are too tall with excessive padding (p-6 headers, p-6 content)
- Description text takes up unnecessary space showing deliverable lists
- Details section has too much vertical spacing
- Package badge on a separate line adds height
- The overall card density is poor -- too much whitespace

## Changes to `src/pages/Opportunities.tsx`

### 1. Reduce Card Padding
- CardHeader: change from default `p-6` to `p-4 pb-2`
- CardContent: change from default `p-6 pt-0` to `px-4 pb-4 pt-0`

### 2. Compact Header Row
- Move the package type badge inline with the paid/free badge in the header row (instead of a separate line in content)
- Reduce title from `text-lg` to `text-base font-semibold`

### 3. Remove Description
- Remove the description block entirely -- it shows raw deliverable lists which is noisy and not useful at the card level. The details (date, location, spots, budget) already convey what matters.

### 4. Tighter Details Section
- Reduce spacing from `space-y-2` to `space-y-1.5`
- Use smaller icons: `h-3.5 w-3.5` instead of `h-4 w-4`
- Use `text-xs` instead of `text-sm` for detail rows
- Combine date and time into a single cleaner format

### 5. Inline Metadata Row
- Combine spots left + budget into a single horizontal row with a separator dot instead of stacking vertically
- Move follower requirement inline with other metadata

### 6. Slimmer Apply Button Area
- Reduce button padding area: `pt-3` instead of `pt-4`
- Use smaller button size: `h-9` instead of default

### 7. Smaller Grid Gap
- Reduce grid gap from `gap-4` to `gap-3`

### 8. Compact Eligibility Warning
- Make it a single-line inline text instead of a full Alert box

## Visual Result
Cards will be roughly 40% shorter, fitting more opportunities on screen with a cleaner, more modern look. Key info (title, brand, date, location, budget, spots) remains scannable at a glance.

## File
| File | Changes |
|------|---------|
| `src/pages/Opportunities.tsx` | Redesign card layout for compactness and visual polish |
