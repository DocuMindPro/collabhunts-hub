

# Fix Creator Badges on Homepage Cards

## Problem

Badges aren't showing because the current logic requires `is_featured: true` for the Vetted badge, but both approved creators have `is_featured: false`. Per the badge system:
- **Vetted** = all approved creators (free, automatic)
- **VIP** = creators who paid for VIP status ($99/year)
- **Featured** = creators who purchased a boost package ($29-$79/week)

## Changes to `src/components/home/CreatorSpotlight.tsx`

### 1. Fix Badge Logic

Current (broken):
```typescript
const isVip = (creator.featuring_priority || 0) >= 3;
const isVetted = !isVip && creator.is_featured;
```

Updated:
```typescript
const isVip = creator.is_vip === true;
const isFeatured = creator.is_featured === true;
const isVetted = creator.status === 'approved'; // All approved = vetted
```

### 2. Fetch `is_vip` from Database

Add `is_vip` to the select query:
```typescript
.select('id, display_name, profile_image_url, categories, is_featured, featuring_priority, is_vip')
```

Update the Creator interface to include `is_vip`.

### 3. Show All Three Badge Types

Display up to 3 badges on each card:
- **Vetted** (green shield pill) -- shown on ALL cards since all approved creators are vetted
- **Featured** (amber sparkles pill) -- shown when `is_featured` is true (paid boost)
- **VIP** (gold crown pill) -- shown when `is_vip` is true (paid VIP subscription)

```tsx
<div className="absolute top-2 left-2 flex flex-wrap items-center gap-1.5 z-10">
  <VettedBadge variant="pill" size="sm" showTooltip={false} />
  {isFeatured && <FeaturedBadge variant="pill" size="sm" />}
  {isVip && <VIPCreatorBadge variant="pill" size="sm" showTooltip={false} />}
</div>
```

### 4. Create a Featured Badge Component (if not existing)

New file `src/components/FeaturedBadge.tsx` -- a pill badge with amber Sparkles icon and "Featured" text, similar to the existing VettedBadge/VIPCreatorBadge pattern.

### 5. Remove the Conditional Wrapper

Currently badges only render if `(isVip || isVetted)`. Since all approved creators are vetted, always render the badge container.

---

## Database Check

Need to verify if `is_vip` column exists on `creator_profiles`. If not, we'll use `featuring_priority >= 3` as the VIP indicator (current convention) until a proper VIP subscription column is added.

## Files to Create/Modify

| File | Action | Description |
|------|--------|-------------|
| `src/components/FeaturedBadge.tsx` | CREATE | New Featured pill badge (amber Sparkles icon) |
| `src/components/home/CreatorSpotlight.tsx` | MODIFY | Fix badge logic, always show Vetted, conditionally show Featured/VIP |

## Result

Every creator card will display at minimum the green "Vetted" pill badge. Creators with active boost packages show an additional "Featured" badge. VIP subscribers show the gold "VIP Creator" badge. All three can stack.

