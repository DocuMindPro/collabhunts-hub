

## Compact Mobile-Friendly Creator Dashboard Overview

### Problem
On mobile web browsers, every card uses desktop-sized padding and full-width layout. The "Profile Status" card wastes space with a full card just for one badge. Stats cards show one per row with large text and descriptions, requiring excessive scrolling.

### Solution
Make the Overview tab responsive for all mobile screens (not just native), by using Tailwind responsive breakpoints instead of `isNative` checks.

### Changes (Single File: `src/components/creator-dashboard/OverviewTab.tsx`)

**1. Merge "Profile Status" into the header area**
- Remove the dedicated Profile Status card entirely
- Show the status badge inline next to the dashboard title or as a small pill at the top of the stats grid -- saves an entire card worth of vertical space

**2. Stats grid: 2 columns on mobile, 4 on desktop**
- Change from single-column mobile to `grid-cols-2 md:grid-cols-4`
- Reduce card padding on mobile: `p-3 md:p-6`
- Hide description text on mobile, show only on `md:` and up
- Smaller font sizes on mobile: `text-lg md:text-2xl` for stat numbers

**3. "This Week" section: show on mobile too, but compact**
- Currently hidden on mobile (`!isNative &&` guard hides it for native but mobile web shows desktop version)
- Make it always visible but use smaller text and a horizontal row layout on mobile
- Numbers use `text-lg` on mobile instead of `text-2xl`

**4. Opportunities cards: tighter padding on mobile**
- Reduce padding from `p-3` to `p-2` on mobile for opportunity list items
- CardHeader/CardContent use `p-3 md:p-6` responsive padding
- Keep the layout otherwise the same since it already works well

**5. "Recommended For You": show on mobile too**
- Currently hidden on mobile web (behind `!isNative` check that was meant only for native)
- Show it with compact styling

### Summary of Visual Impact

| Section | Before (mobile) | After (mobile) |
|---------|-----------------|----------------|
| Profile Status | Full card with header + description | Inline badge at top, no card |
| Stats | 1 column, large text, descriptions | 2-column grid, compact, no descriptions |
| This Week | Full desktop size | Compact horizontal row |
| Opportunities | Desktop padding | Tighter padding |
| Recommended | Hidden | Visible, compact |

Single file change, no database changes needed.
