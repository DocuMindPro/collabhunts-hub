
# Fix Mobile Tab Navigation Overlap

## Problem
The tab navigation labels are overlapping because:
1. `TabsList` has a fixed `h-10` height (40px)
2. With `flex-col` layout, icon (16px) + text (10px) + gap exceeds this height
3. The vertical content is being clipped/overlapping

## Solution
Adjust the height and styling to properly accommodate the stacked icon + label layout on mobile.

## Changes

### 1. Update TabsList height
Make the list auto-height on mobile to fit the stacked content:

**Current:**
```tsx
<TabsList className="flex w-full overflow-x-auto gap-1 lg:w-auto lg:inline-flex">
```

**Proposed:**
```tsx
<TabsList className="flex w-full h-auto overflow-x-auto gap-0.5 p-1 sm:h-10 lg:w-auto lg:inline-flex">
```

### 2. Refine TabsTrigger styling
Optimize the individual tab buttons for mobile:

**Current:**
```tsx
<TabsTrigger value="overview" className="flex-col sm:flex-row gap-0.5 sm:gap-2 shrink-0 px-2 sm:px-3">
  <BarChart3 className="h-4 w-4" />
  <span className="text-[10px] sm:text-sm">Overview</span>
</TabsTrigger>
```

**Proposed:**
```tsx
<TabsTrigger value="overview" className="flex flex-col sm:flex-row items-center justify-center gap-0.5 sm:gap-2 shrink-0 min-w-[52px] px-1.5 py-1.5 sm:min-w-0 sm:px-3">
  <BarChart3 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
  <span className="text-[9px] leading-tight sm:text-sm truncate">Overview</span>
</TabsTrigger>
```

Key refinements:
- `h-auto` on list to allow flexible height on mobile
- `min-w-[52px]` ensures consistent tab width on mobile
- `py-1.5` gives vertical padding for the stacked layout
- Smaller icons (`h-3.5`) and text (`text-[9px]`) on mobile
- `leading-tight` reduces line height
- `truncate` prevents text overflow

### 3. Files to modify

| File | Changes |
|------|---------|
| `src/pages/CreatorDashboard.tsx` | Update TabsList and all 8 TabsTrigger styling |
| `src/pages/BrandDashboard.tsx` | Apply same updates for consistency |

## Visual Result

**Before:**
- Text overlaps with content below
- Icons and labels cramped

**After:**
- Clean vertical stacking (icon above label)
- Each tab has proper breathing room
- Smooth horizontal scroll for all 8 tabs
- No overlap with page content
