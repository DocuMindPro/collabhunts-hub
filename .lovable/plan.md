# ✅ IMPLEMENTED


# Two-Tier Creator Badge System: Vetted + Pro

## Overview

Implement a visual trust hierarchy for creators with two distinct badges:
1. **Vetted Badge** (Free) - All approved creators automatically receive this
2. **Pro Badge** ($99/year) - Premium paid upgrade for enhanced visibility

This system helps brands quickly identify creator trust levels at a glance.

---

## Badge Design Concept

```text
+-----------------+-------------------+
|  Badge          |  Visual Style     |
+-----------------+-------------------+
|  Vetted         |  Shield icon      |
|  (Free)         |  Green color      |
|                 |  "CollabHunts     |
|                 |   Vetted"         |
+-----------------+-------------------+
|  Pro            |  Crown/Star icon  |
|  ($99/year)     |  Gold/Amber color |
|                 |  "Pro Creator"    |
+-----------------+-------------------+
```

**Visual Hierarchy on Profile:**
- Just Vetted: Single green shield badge
- Vetted + Pro: Both badges shown (Pro more prominent)

---

## Files to Modify

### 1. Create New Badge Components

**File: `src/components/VettedBadge.tsx`** (NEW)
- Green shield icon with checkmark
- Tooltip: "CollabHunts Vetted - Profile reviewed and approved"
- Size variants: sm, md, lg
- Simple, understated design

**File: `src/components/ProCreatorBadge.tsx`** (NEW)
- Crown or star icon in gold/amber
- Tooltip: "Pro Creator - Premium verified creator"
- Size variants: sm, md, lg
- More prominent, premium feel

### 2. Update Existing VerifiedBadge.tsx

**File: `src/components/VerifiedBadge.tsx`**
- Rename tooltip from "Verified Business" to "Verified Business" (keep for brands only)
- This component will now be exclusively for brand verification

### 3. Update Creator Dashboard Card

**File: `src/components/creator-dashboard/VerificationBadgeCard.tsx`**
- Rename from "Verification Badge" to "Pro Creator Badge"
- Update all copy:
  - "Verification Badge" → "Pro Creator Badge"
  - "Get Verified" → "Become Pro"
  - "Verified Badge Active" → "Pro Creator Active"
- Update icons to use crown/star instead of shield

### 4. Update Creator Profile Page

**File: `src/pages/CreatorProfile.tsx`**

**Lines 74-78** - Update `isVerified` function:
```tsx
// Helper to check if creator has active Pro status
const isPro = (creator: CreatorData) => {
  if (creator.verification_payment_status !== 'paid') return false;
  if (!creator.verification_expires_at) return false;
  return !isPast(new Date(creator.verification_expires_at));
};

// All approved creators are vetted (they're fetched with status='approved')
const isVetted = true; // Implicitly true since page only loads approved creators
```

**Lines 577, 648** - Update badge display (mobile + desktop):
```tsx
{/* Vetted badge - always shown for approved creators */}
<VettedBadge size="md" />
{/* Pro badge - shown if they paid */}
{isPro(creator) && <ProCreatorBadge size="md" />}
```

### 5. Update Influencers (Marketplace) Page

**File: `src/pages/Influencers.tsx`**

**Data Model Update (lines 29-53):**
Add fields to `CreatorWithDetails` interface:
```tsx
verification_payment_status: string | null;
verification_expires_at: string | null;
```

**Query Update (lines 200-210):**
Fetch verification fields from database

**Card Rendering (lines 450-458):**
Add badges to creator card overlay:
```tsx
{/* Creator Info - Bottom Overlay */}
<div className="absolute bottom-0 left-0 right-0 p-4">
  <div className="flex items-center gap-1.5 mb-0.5">
    <h3 className="font-heading font-semibold text-lg text-white line-clamp-1">
      {creator.display_name}
    </h3>
    <VettedBadge size="sm" className="text-white" />
    {isPro(creator) && <ProCreatorBadge size="sm" />}
  </div>
  <p className="text-sm text-white/80 line-clamp-1">
    {creator.categories[0] || "Content Creator"}
  </p>
</div>
```

### 6. Update Knowledge Base

**File: `src/data/knowledgeBase.ts`**
- Add new article explaining the two-tier badge system
- Update "Boost Your Profile" article to include Pro Creator benefits

---

## Database Considerations

No database changes required:
- **Vetted status**: Already tracked via `creator_profiles.status = 'approved'`
- **Pro status**: Already tracked via `verification_payment_status` and `verification_expires_at`

---

## Implementation Summary

| Component | Change Type | Description |
|-----------|-------------|-------------|
| `VettedBadge.tsx` | New file | Green shield badge for all approved creators |
| `ProCreatorBadge.tsx` | New file | Gold crown/star badge for $99/year payers |
| `VerificationBadgeCard.tsx` | Modify | Rename to "Pro Creator Badge" with updated copy |
| `CreatorProfile.tsx` | Modify | Show both badges where applicable |
| `Influencers.tsx` | Modify | Add badges to creator cards in marketplace |
| `VerifiedBadge.tsx` | Keep | Remains for brands only ("Verified Business") |

---

## Visual Examples

**Creator Card in Marketplace:**
```text
+------------------------+
|  [Instagram] 125K     |
|                        |
|                        |
|   [Creator Image]      |
|                        |
|                        |
| Sarah Ahmed 🛡️ 👑      |
| Lifestyle              |
+------------------------+
| Starting from $150     |
+------------------------+

🛡️ = Vetted (green shield)
👑 = Pro (gold crown)
```

**Creator Profile Header:**
```text
Sarah Ahmed 🛡️ 👑  ⭐ 4.9 (23 reviews)
📍 Beirut, Lebanon
```

---

## Benefits for Brands

- **Quick trust assessment**: See at a glance which creators are platform-approved
- **Premium tier identification**: Know which creators invested in their presence
- **Clear visual hierarchy**: Green = baseline trust, Gold = premium creator

