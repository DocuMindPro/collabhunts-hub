
# Align Creator Onboarding & Brand Experience with Event Packages

## Overview
Update the creator onboarding and brand-facing views to use the standardized event packages (Unbox & Review, Social Boost, Meet & Greet, Live PK Battle, Custom) instead of the legacy generic service types. This ensures creators understand exactly what brands expect, and brands see clear deliverables for each package.

## Current State Analysis

**Problem 1: Database service types don't match package types**
The `service_price_tiers` table currently has these service types:
- `meet_greet`, `competition`, `custom`, `brand_activation`, `nightlife`, `private_event`, `content_collab`, `workshop`

But our packages are:
- `unbox_review`, `social_boost`, `meet_greet`, `competition`, `custom`

**Problem 2: No package descriptions during onboarding**
Creators only see service type names (e.g., "Meet & Greet") with no explanation of what they're expected to deliver.

**Problem 3: Brands don't see package deliverables**
On creator profiles, brands only see price and delivery days without the full package details.

---

## Implementation Plan

### Phase 1: Database Migration

Update `service_price_tiers` to align with the new package types.

| Action | Details |
|--------|---------|
| Add new tiers | Create tiers for `unbox_review` and `social_boost` |
| Keep existing | Keep `meet_greet`, `competition`, `custom` tiers (already aligned) |
| Disable legacy | Disable `brand_activation`, `nightlife`, `private_event`, `content_collab`, `workshop` |

**New Tier Structure:**

| Package | Tiers |
|---------|-------|
| `unbox_review` | Basic ($50-$150), Standard ($150-$300), Premium ($300-$500) |
| `social_boost` | Standard ($200-$400), Premium ($400-$700), Elite ($700-$1000) |
| `meet_greet` | Keep existing tiers |
| `competition` | Keep existing tiers |
| `custom` | Keep existing tiers |

---

### Phase 2: Create Shared Package Info Component

**New File: `src/components/PackageInfoCard.tsx`**

A reusable component that displays package details from `src/config/packages.ts`:
- Package name and description
- Phase breakdown (Pre-Event, During Event, Post-Event)
- Duration range
- "Ideal For" categories

This component will be used in:
1. Creator onboarding (when selecting a package to offer)
2. Creator dashboard service edit dialog
3. Brand-facing creator profile pages

---

### Phase 3: Update Creator Onboarding (Step 5)

**File: `src/pages/CreatorSignup.tsx`**

| Change | Details |
|--------|---------|
| Replace service type buttons | Show package cards with full descriptions |
| Add package info to modal | Display phase breakdown and deliverables |
| Update service type labels | Map to package names from `packages.ts` |
| Show "What brands expect" | Clear explanation of deliverables |

**New UX Flow:**
1. Creator sees all 5 packages with descriptions
2. Clicking "Add" opens modal with:
   - Full package description
   - Phase breakdown (what they need to do)
   - Price tier selection
3. Creator selects their price tier
4. Added package shows in "Added Services" list with price range

---

### Phase 4: Update Service Edit Dialog

**File: `src/components/creator-dashboard/ServiceEditDialog.tsx`**

| Change | Details |
|--------|---------|
| Add package info section | Show description and phases for selected type |
| Update service type labels | Use package names from config |
| Import `EVENT_PACKAGES` | Pull descriptions from single source of truth |

---

### Phase 5: Update Creator Profile (Brand View)

**File: `src/pages/CreatorProfile.tsx`**

| Change | Details |
|--------|---------|
| Replace generic service cards | Show package cards with full deliverables |
| Add phase breakdown | Brands see Pre/During/Post structure |
| Import `EVENT_PACKAGES` | Pull package info from config |
| Update card layout | Match the style from `/brand` page |

**Brand View Will Show:**
- Package name (e.g., "Social Boost")
- Description
- Creator's price range
- Full deliverables list
- Duration
- "Contact Us" or "Inquire" button

---

### Phase 6: Update Services Tab in Creator Dashboard

**File: `src/components/creator-dashboard/ServicesTab.tsx`**

| Change | Details |
|--------|---------|
| Show package descriptions | Display what the package includes |
| Update display names | Use `EVENT_PACKAGES` for names |

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/config/packages.ts` | No changes (already complete) |
| `src/components/PackageInfoCard.tsx` | **NEW** - Reusable package info display |
| `src/pages/CreatorSignup.tsx` | Update Step 5 with package descriptions |
| `src/components/creator-dashboard/ServiceEditDialog.tsx` | Add package info display |
| `src/components/creator-dashboard/ServicesTab.tsx` | Update service display |
| `src/pages/CreatorProfile.tsx` | Show package deliverables to brands |

**Database Migration:**
- Add tiers for `unbox_review` and `social_boost`
- Disable legacy service types

---

## Visual Result

### Creator Onboarding (Step 5)
Before: Generic buttons like "Meet & Greet", "Competition"
After: Package cards showing:
- Package name + description
- What's included (phases)
- "What brands will expect from you"
- Price tier selection

### Brand View (Creator Profile)
Before: Simple price + delivery days
After: Full package card showing:
- Package name
- Creator's price range
- All deliverables (phases)
- Duration
- Clear CTA button

---

## Technical Details

### PackageInfoCard Component Props
```text
interface PackageInfoCardProps {
  packageType: PackageType;
  showPricing?: boolean;
  priceRange?: { min: number; max: number };
  compact?: boolean;
  onSelect?: () => void;
}
```

### Package Type Mapping
The `getServiceDisplayName` function in `CreatorSignup.tsx` will be updated to use `EVENT_PACKAGES`:
```text
const getServiceDisplayName = (type: string) => {
  const pkg = EVENT_PACKAGES[type as PackageType];
  return pkg?.name || type.replace(/_/g, ' ');
};
```

### Database Changes Summary
1. Insert new `unbox_review` tiers
2. Insert new `social_boost` tiers
3. Update legacy tiers to `is_enabled = false`
