

# Make Instagram Stories an Upsell Add-On

## Summary

Remove specific story counts from standard packages and turn Instagram Stories into an optional upsell that brands can add when booking. Creators will set their story upsell price during onboarding.

---

## Package Changes

### Current vs New Deliverables

| Package | Current | New |
|---------|---------|-----|
| **Unbox & Review** | 1 Reel/TikTok + 2-3 Stories + Brand tag | 1 Reel/TikTok + Brand tag |
| **Social Boost** | 1 Reel + 1 TikTok + 3 Stories + Tag & location | 1 Reel + 1 TikTok + Tag & location |
| **Meet & Greet** | Announcement + 3 countdown stories + Recap + 3 highlight stories | Pre-event announcement + Recap video + Brand tag |

### Universal Upsell (Added to All Standard Packages)

```
Instagram Stories
Add story coverage for additional reach
Creator's price: $[creator_set_price]
```

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/config/packages.ts` | Remove story counts from includes/phases, add standard upsell option |
| `src/components/creator-onboarding/PackageStep.tsx` | Add story upsell price input during onboarding |
| `src/components/creator-dashboard/ServiceEditDialog.tsx` | Add story upsell price field for editing |
| `src/components/brand-dashboard/CreateOpportunityDialog.tsx` | Update locked deliverables to reflect new package contents |
| `src/components/BookingDialog.tsx` | Show upsell option when booking |
| Database migration | Add `story_upsell_price_cents` column to `creator_services` table |

---

## Technical Implementation

### 1. Database Migration

Add a new column to store creator's story upsell price:

```sql
ALTER TABLE public.creator_services 
ADD COLUMN story_upsell_price_cents INTEGER DEFAULT NULL;
```

### 2. Update Package Configuration (`packages.ts`)

**Unbox & Review includes:**
```typescript
includes: [
  'Product shipped to creator',
  '1 Instagram Reel or TikTok video',
  'Honest review with product highlights',
  'Brand tagged in all posts',
],
```

**Social Boost includes:**
```typescript
includes: [
  '1-2 hour venue visit',
  '1 Instagram Reel (permanent)',
  '1 TikTok video',
  'Tag & location in all posts',
  'Honest review with CTA',
],
```

**Meet & Greet includes:**
```typescript
includes: [
  '1-week pre-event promotion',
  '3 hours at venue',
  'Live fan interaction & photos',
  'Recap video',
],
```

**Add universal upsell to all standard packages:**
```typescript
upsells: [
  { 
    id: 'instagram_stories', 
    name: 'Instagram Stories', 
    description: 'Add story coverage for additional reach',
    priceCents: 0 // Will be set per-creator
  }
]
```

### 3. Creator Onboarding Changes

After a creator says "Yes" to a package and sets their price, add:

```
┌─────────────────────────────────────────────────────────┐
│  Story Upsell Price (Optional)                          │
│                                                         │
│  Brands can add Instagram Stories as an extra.          │
│  Set your price for this add-on.                        │
│                                                         │
│  ┌─────────────────────────────────────────────────┐    │
│  │  $  [ 15 ]                                      │    │
│  └─────────────────────────────────────────────────┘    │
│                                                         │
│  💡 Suggested: $10-30 (low-effort upsell)               │
│     Leave empty if you don't offer this                 │
└─────────────────────────────────────────────────────────┘
```

### 4. Service Edit Dialog Changes

Add a section for story upsell pricing:

```
┌─────────────────────────────────────────────────────────┐
│  📸 Instagram Stories Upsell                            │
│                                                         │
│  Story Add-On Price (USD)                               │
│  ┌─────────────────────────────────────────────────┐    │
│  │  $  [ 20 ]                                      │    │
│  └─────────────────────────────────────────────────┘    │
│                                                         │
│  Brands can add Stories to their booking for this extra │
│  fee. Leave empty to not offer this option.             │
└─────────────────────────────────────────────────────────┘
```

### 5. Booking Flow Changes

When a brand clicks to book, show upsell option:

```
┌─────────────────────────────────────────────────────────┐
│  Package: Social Boost                                  │
│  Base Price: $200                                       │
│                                                         │
│  ╭─────────────────────────────────────────────────────╮│
│  │ ➕ Add Instagram Stories            + $20           ││
│  │    Add story coverage for additional reach          ││
│  │                                 [ ] Add to booking  ││
│  ╰─────────────────────────────────────────────────────╯│
│                                                         │
│  Total: $200                                            │
│                 or $220 with stories                    │
└─────────────────────────────────────────────────────────┘
```

### 6. Opportunity Creation Changes

Update the locked deliverables display to show the new package contents (without story counts).

---

## User Experience Flow

### Creator Onboarding
1. "Do you offer Unbox & Review?" → Yes
2. "Set your price for this package" → $150
3. "Set your Instagram Stories upsell price (optional)" → $15

### Brand Booking
1. Views creator profile
2. Clicks "Book" on Social Boost ($200)
3. Sees upsell: "Add Instagram Stories +$20"
4. Checks the box if they want it
5. Proceeds to message creator with total ($220)

### Opportunity Posting
1. Brand selects "Social Boost" package
2. Locked deliverables show: 1 Reel, 1 TikTok, Tag & location
3. No mention of Stories (brands can discuss with creators)

---

## Why This Works

1. **Lower Base Prices** - Creators can price the core video lower, looking more competitive
2. **Fair Compensation** - Extra Stories = extra pay
3. **Brand Flexibility** - Not everyone needs Stories
4. **Simple Upsell** - One optional add-on, not complex tiers
5. **Low Friction** - Creators set it once, applies to all packages

---

## Implementation Order

1. Database migration (add `story_upsell_price_cents`)
2. Update `packages.ts` with new includes/phases text
3. Update creator onboarding to collect story upsell price
4. Update service edit dialog with story upsell field
5. Update booking dialog to show upsell option
6. Update opportunity creation locked deliverables

