

# Creator Spotlight - Collabstr-Style Larger Cards

## Overview

Redesign the Featured Creators grid to use larger, taller cards similar to Collabstr's layout. Currently cards are tiny squares in a dense 4-column grid at all sizes. The new design uses fewer, bigger cards with a portrait aspect ratio, prominent badges at the top, and visible info (name, follower count, category) overlaid at the bottom.

---

## Key Design Changes (Collabstr Reference)

```text
CURRENT (Desktop):
+--+--+--+--+--+--+   <- 6 tiny square cards per row
|  |  |  |  |  |  |
+--+--+--+--+--+--+

PROPOSED (Desktop):
+--------+--------+--------+--------+
|  VIP   |Top Crt |        | Vetted |  <- 4 larger portrait cards
|        |        |        |        |
|        |        |        |        |
| Name   | Name   | Name   | Name   |
| @5K Fsh| @18K   | @2M    | @10K   |
+--------+--------+--------+--------+

PROPOSED (Mobile):
+------+------+
| VIP  |      |  <- 2 columns, portrait cards
|      |      |
| Name | Name |
+------+------+
+------+------+
|      | Vttd |
|      |      |
| Name | Name |
+------+------+
```

---

## Changes to `src/components/home/CreatorSpotlight.tsx`

### 1. Grid Layout
Change from dense small grid to larger cards:
```tsx
// Before
grid-cols-4 md:grid-cols-4 lg:grid-cols-6 gap-2 md:gap-4 lg:gap-6

// After  
grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-5 lg:gap-6
```

### 2. Card Aspect Ratio
Change from `aspect-square` to a taller portrait ratio like Collabstr:
```tsx
// Before
<div className="aspect-square relative overflow-hidden">

// After
<div className="aspect-[3/4] relative overflow-hidden">
```

### 3. Reduce Creator Count
Show 8 instead of 16 so cards are bigger and page isn't too long:
```tsx
.limit(8)
```

### 4. Badges - Always Visible at Top
Make badges always visible (not scaled down), positioned at the top like Collabstr:
```tsx
<div className="absolute top-2 left-2 flex items-center gap-1.5 z-10">
  {isVetted && <VettedBadge variant="pill" size="sm" showTooltip={false} />}
  {isVip && <VIPCreatorBadge variant="pill" size="sm" showTooltip={false} />}
</div>
```
Remove the `scale-75` mobile shrinking so badges are always readable.

### 5. Info Overlay - Always Show Details
Show name, follower count, and category on all screen sizes (not hidden on mobile):
```tsx
<div className="absolute bottom-0 left-0 right-0 p-3 md:p-4 text-white">
  <p className="font-semibold text-sm md:text-base truncate">
    {creator.display_name}
  </p>
  <div className="flex items-center gap-2 text-xs opacity-90 mt-1">
    {primarySocial && primarySocial.follower_count && (
      <span className="flex items-center gap-1">
        <PlatformIcon className="h-3 w-3" />
        {formatFollowers(primarySocial.follower_count)}
      </span>
    )}
    {creator.categories?.[0] && (
      <span className="truncate">
        {primarySocial?.follower_count ? "· " : ""}{creator.categories[0]}
      </span>
    )}
  </div>
</div>
```

### 6. Card Text Sizes
Remove the tiny `text-[10px]` mobile sizing:

| Element | Before | After |
|---------|--------|-------|
| Name | text-[10px] md:text-sm | text-sm md:text-base |
| Padding | p-1.5 md:p-3 | p-3 md:p-4 |
| Follower info | hidden md:flex | flex (always visible) |
| Card rounding | rounded-lg md:rounded-xl | rounded-xl |

### 7. Stronger Gradient Overlay
Ensure text readability over images with a more pronounced gradient:
```tsx
<div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
```

---

## Summary

| Change | Before | After |
|--------|--------|-------|
| Grid columns (mobile) | 4 | 2 |
| Grid columns (desktop) | 6 | 4 |
| Aspect ratio | Square (1:1) | Portrait (3:4) |
| Creator count | 16 | 8 |
| Badges on mobile | Scaled 75% | Full size |
| Follower/category on mobile | Hidden | Visible |
| Name text (mobile) | 10px | 14px (text-sm) |
| Card padding (mobile) | 6px | 12px |

The result will be bigger, more visually impactful cards that match the Collabstr style with prominent badges and visible creator info at all screen sizes.

