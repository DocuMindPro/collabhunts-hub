

# Mobile Featured Creators Grid - Compact 4x4 Layout

## Overview

Transform the Featured Creators section on mobile from a 2-column layout showing 6 creators into a dense 4-column grid showing 16 creators in 4 rows. This gives visitors a fuller preview of the creator community while encouraging brand registration to unlock full browsing.

---

## Current vs. Proposed (Mobile)

```text
CURRENT (Mobile):
+-------+-------+
|   1   |   2   |  <- 2 columns, 6 total
+-------+-------+
|   3   |   4   |
+-------+-------+
|   5   |   6   |
+-------+-------+
[Browse All Creators]

PROPOSED (Mobile):
+----+----+----+----+
| 1  | 2  | 3  | 4  |  <- 4 columns, 16 total
+----+----+----+----+
| 5  | 6  | 7  | 8  |
+----+----+----+----+
| 9  | 10 | 11 | 12 |
+----+----+----+----+
| 13 | 14 | 15 | 16 |
+----+----+----+----+
[Browse All Creators]
```

---

## Design Changes

### 1. Grid Layout Update

| Breakpoint | Current | Proposed |
|------------|---------|----------|
| Mobile (<768px) | 2 columns | 4 columns |
| Tablet (md) | 3 columns | 4 columns |
| Desktop (lg) | 6 columns | 6 columns |

### 2. Card Size Adjustments (Mobile)

Since we're fitting 4 cards per row on mobile, each card needs to be more compact:

| Element | Current | Proposed |
|---------|---------|----------|
| Card padding | p-3 | p-1.5 (mobile) |
| Name font | text-sm | text-xs (mobile) |
| Gap between cards | gap-4 | gap-2 (mobile) |
| Badges | Full pill | Smaller on mobile |
| Follower/category text | Visible | Hidden on mobile (space) |

### 3. Creator Count

| Current | Proposed |
|---------|----------|
| 6 creators fetched | 16 creators fetched |

---

## File to Modify

### `src/components/home/CreatorSpotlight.tsx`

#### Change 1: Increase fetch limit (line 53)
```tsx
// Before
.limit(6);

// After
.limit(16);
```

#### Change 2: Update grid classes (line 108)
```tsx
// Before
<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 md:gap-6 mb-10">

// After
<div className="grid grid-cols-4 md:grid-cols-4 lg:grid-cols-6 gap-2 md:gap-4 lg:gap-6 mb-10">
```

#### Change 3: Make cards more compact on mobile

Update the card container to be smaller on mobile:
```tsx
<div className="relative rounded-lg md:rounded-xl overflow-hidden ...">
```

Update info section padding:
```tsx
<div className="absolute bottom-0 left-0 right-0 p-1.5 md:p-3 text-primary-foreground">
```

Update name text size:
```tsx
<p className="font-semibold text-[10px] md:text-sm truncate">
  {creator.display_name}
</p>
```

#### Change 4: Hide follower/category on mobile

Only show on larger screens to save space:
```tsx
<div className="hidden md:flex items-center gap-2 text-xs opacity-80 mt-1">
  {/* follower count and category */}
</div>
```

#### Change 5: Adjust badges for mobile

Use smaller badges or hide text on mobile:
```tsx
{(isVip || isVetted) && (
  <div className="absolute top-1 left-1 md:top-2 md:left-2 flex items-center gap-1">
    {isVetted && <VettedBadge variant="pill" size="sm" showTooltip={false} className="scale-75 md:scale-100" />}
    {isVip && <VIPCreatorBadge variant="pill" size="sm" showTooltip={false} className="scale-75 md:scale-100" />}
  </div>
)}
```

#### Change 6: Reduce animation stagger on mobile

With 16 cards, staggering all of them would take too long:
```tsx
delay={Math.min(index * 50, 400)}  // Cap delay at 400ms
```

---

## Visual Result (Mobile)

```text
+----------------------------------------+
|         Featured Creators              |
|   See who's already on CollabHunts     |
|                                        |
| +----+ +----+ +----+ +----+           |
| |VIP | |    | |    | |Vttd|           |
| |    | |    | |    | |    |           |
| |Sara| |Ali | |Nour| |Maya|           |
| +----+ +----+ +----+ +----+           |
| +----+ +----+ +----+ +----+           |
| |    | |    | |VIP | |    |           |
| |    | |    | |    | |    |           |
| |Zein| |Lina| |Fadi| |Rima|           |
| +----+ +----+ +----+ +----+           |
| +----+ +----+ +----+ +----+           |
| |    | |    | |    | |    |           |
| |    | |    | |    | |    |           |
| |Joe | |Sam | |Mia | |Leo |           |
| +----+ +----+ +----+ +----+           |
| +----+ +----+ +----+ +----+           |
| |Vttd| |    | |    | |VIP |           |
| |    | |    | |    | |    |           |
| |Aya | |Omar| |Tia | |Jad |           |
| +----+ +----+ +----+ +----+           |
|                                        |
|     [ Browse All Creators → ]          |
|                                        |
+----------------------------------------+
```

- Compact cards with just image + name
- Badges scaled down but visible
- Follower counts hidden on mobile (shown on tablet/desktop)
- 16 creators give a good preview of the community

---

## Future Enhancement (Brand Registration Gate)

After this change, the "Browse All Creators" button can later be updated to:
1. Check if user is logged in as a brand
2. If not, show a registration prompt instead of navigating to /influencers
3. This encourages brands to register to see the full creator roster

---

## Summary

| Change | Description |
|--------|-------------|
| Grid columns | 2 -> 4 on mobile |
| Creator count | 6 -> 16 |
| Card size | Smaller padding, text, gaps |
| Meta info | Hidden on mobile |
| Badges | Scaled down 75% on mobile |
| Animation | Faster stagger (50ms vs 100ms, capped) |

