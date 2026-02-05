

# Add Labels to Mobile Tab Navigation

## Problem
The Creator Dashboard's tab navigation shows **only icons** on mobile web view (screens < 640px). The labels are hidden using `hidden sm:inline`, making it difficult for users to understand what each tab does.

## Solution
Make the labels always visible on mobile, but use a smaller font size to fit the limited space. This matches the pattern already used in `MobileBottomNav` which shows labels in 10px text.

## Changes Required

### 1. Update `CreatorDashboard.tsx`
Modify the TabsList to show labels on all screen sizes:

**Current:**
```tsx
<span className="hidden sm:inline">Overview</span>
```

**Proposed:**
```tsx
<span className="text-[10px] sm:text-sm">Overview</span>
```

This makes labels:
- Always visible (remove `hidden`)
- Very small (10px) on mobile for space efficiency
- Normal size on larger screens

### 2. Adjust Tab Styling
The tabs also need layout adjustments for mobile:
- Change from horizontal inline layout to vertical stacking (icon above label) on mobile
- Use `flex-col` on mobile, horizontal on larger screens

**Proposed tab trigger structure:**
```tsx
<TabsTrigger value="overview" className="flex-col sm:flex-row gap-0.5 sm:gap-2 shrink-0 px-2 sm:px-3">
  <BarChart3 className="h-4 w-4" />
  <span className="text-[10px] sm:text-sm">Overview</span>
</TabsTrigger>
```

## Files to Modify

| File | Changes |
|------|---------|
| `src/pages/CreatorDashboard.tsx` | Update all 8 TabsTrigger components to show labels on mobile |
| `src/pages/BrandDashboard.tsx` | Apply same pattern for consistency |

## Visual Result

**Before (mobile):**
```
[📊] [👤] [📦] [📅] [🗓] [💼] [🚀] [💬]
```

**After (mobile):**
```
 📊    👤    📦    📅    🗓    💼    🚀    💬
Over  Prof  Pack  Agr  Cal  Opp  Boo  Msg
```

## Technical Notes
- Uses existing Tailwind responsive classes (`sm:` prefix for 640px+)
- Consistent with `MobileBottomNav` which uses 10px text
- No database changes required
- Quick implementation - just class name updates

