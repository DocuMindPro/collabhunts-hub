
# Show Price Ranges Instead of Single Prices

## Overview
Currently, prices are displayed as a single "lowest price + " format (e.g., "$500 +"). This should change to show the actual price **range** from minimum to maximum (e.g., "$200 to $300"), providing clearer pricing expectations for brands.

## Changes Required

### 1. Create New DimmedPriceRange Component
**File: `src/components/DimmedPriceRange.tsx`** (new file)

A new component that displays price ranges with the same dimming/locking behavior as DimmedPrice:
- Takes `minPrice` and `maxPrice` props (in cents)
- If min equals max, shows single price: "$200"
- If different, shows range: "$200 to $300"
- Maintains existing locked/visible states for subscription-gated pricing

### 2. Update Find Influencers Page
**File: `src/pages/Influencers.tsx`**

**Add helper function:**
```typescript
const getPriceRange = (services: CreatorWithDetails['services']) => {
  if (services.length === 0) return { min: 0, max: 0 };
  const prices = services.map(s => s.price_cents);
  return { 
    min: Math.min(...prices), 
    max: Math.max(...prices) 
  };
};
```

**Update 3 card sections** (lines ~700, ~797, ~895):
- Replace `lowestPrice` usage with `priceRange`
- Change display from:
  ```
  $500 +
  ```
  To:
  ```
  $200 - $300
  ```
- Remove the trailing "+" since the range already shows full spread

### 3. Update Creator Profile Quick Stats
**File: `src/pages/CreatorProfile.tsx`**

**Change label** (line ~969):
- From: "Starting Price"
- To: "Price"

**Update price display** (lines ~970-982):
- Calculate both min and max from `creator.services`
- If min equals max: Show single price "$200"
- If different: Show range "$200 to $300"
- Use the new DimmedPriceRange component

## Technical Details

### DimmedPriceRange Component Interface
```typescript
interface DimmedPriceRangeProps {
  minPrice: number;  // in cents
  maxPrice: number;  // in cents
  canViewPrice: boolean;
  className?: string;
  size?: "sm" | "md" | "lg";
  onClick?: () => void;
}
```

### Display Logic
| Scenario | Display |
|----------|---------|
| Min = Max | `$200` |
| Min < Max | `$200 - $300` |
| No services | `Contact` or `N/A` |
| Not subscribed | Lock icon with `$•• - ••` |

### Files to Modify/Create
| File | Action |
|------|--------|
| `src/components/DimmedPriceRange.tsx` | Create new |
| `src/pages/Influencers.tsx` | Modify price display in 3 places |
| `src/pages/CreatorProfile.tsx` | Change label + use price range |
