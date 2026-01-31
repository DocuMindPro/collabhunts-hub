
# Simplify Creator Pricing & Sequential Onboarding

## Overview

This plan addresses your feedback to simplify the pricing system and make onboarding more intuitive:

1. **Remove admin-controlled price brackets** (Basic/Standard/Premium) - creators set their own single price per package
2. **Remove pricing for Live PK Battle** - just ask if they're available (Yes/No toggle)
3. **Make onboarding sequential** - one question at a time, wizard-style flow
4. **Keep package descriptions** - so creators understand what's expected

---

## What Changes

| Current State | New State |
|---------------|-----------|
| Admin sets price brackets (Basic $50-150, Standard $150-300, Premium $300-500) | Creators enter their own single price per package |
| Live PK Battle has pricing tiers | Just a Yes/No availability toggle |
| All packages shown at once in Step 5 | Sequential flow - one package question at a time |
| 7 steps total | 11+ micro-steps (feels shorter because each is quick) |

---

## Technical Implementation

### Database Changes

**Remove the `service_price_tiers` dependency:**
- The `service_price_tiers` table will be deprecated (but not deleted for backwards compatibility)
- Creator services will store a single `price_cents` value instead of `min_price_cents`/`max_price_cents` ranges
- `price_tier_id` will become optional/unused

**Schema impact on `creator_services`:**
- Keep using `price_cents` as the single price
- Set `min_price_cents = max_price_cents = price_cents` for display compatibility
- `price_tier_id` = null for new signups

### Admin Panel Changes

**File: `src/components/admin/AdminServicesSettings.tsx`**
- Remove entirely or hide the "Service Price Tiers" section
- Replace with a simple list showing which packages are enabled
- No tier management, no min/max prices

### Creator Onboarding Redesign

**File: `src/pages/CreatorSignup.tsx`**

**New Step Structure (Sequential Questions):**

| Step | Question | Input Type |
|------|----------|------------|
| 1 | Basic Info (name, email, password) | Form |
| 2 | Profile Details (display name, bio, location) | Form |
| 3 | Categories | Multi-select badges |
| 4 | Demographics (optional) | Form |
| 5 | Profile Photo | File upload |
| 6 | Cover Photos | File upload |
| 7 | Social Media Accounts | One at a time modals |
| 8 | **Unbox & Review** - "Would you do product reviews from home?" | Yes/No + Price input |
| 9 | **Social Boost** - "Would you visit venues to create content?" | Yes/No + Price input |
| 10 | **Meet & Greet** - "Would you do in-person appearances?" | Yes/No + Price input |
| 11 | **Live PK Battle** - "Are you available for live PK battles?" | Yes/No only (no price) |
| 12 | **Custom Experience** - "Open to custom brand projects?" | Yes/No + Price input |
| 13 | Portfolio (optional) | File uploads |
| 14 | Review & Submit | Terms acceptance |

**Package Step Format (Example: Unbox & Review):**

```text
+------------------------------------------+
|  Package Icon         Step 8 of 14       |
|                                          |
|  UNBOX & REVIEW                          |
|  ─────────────────────────────────────   |
|  Brands send you products to review      |
|  from home.                              |
|                                          |
|  What brands expect:                     |
|  ✓ Create an unboxing video at home      |
|  ✓ Post 1 Reel/TikTok + 2-3 Stories      |
|  ✓ Tag the brand in all posts            |
|                                          |
|  Would you offer this service?           |
|                                          |
|  [ No, skip ]   [ Yes, I'm interested ]  |
|                                          |
|  (If Yes:)                               |
|  Your Price: $ [________]                |
|                                          |
|  [ Back ]              [ Continue ]      |
+------------------------------------------+
```

**Live PK Battle Step (No Price):**

```text
+------------------------------------------+
|  LIVE PK BATTLE                          |
|  ─────────────────────────────────────   |
|  Live streaming competitions at venues.  |
|  Fans buy tickets to watch in person.    |
|                                          |
|  Note: Pricing is handled by CollabHunts |
|  during event planning discussions.      |
|                                          |
|  Are you available for PK battles?       |
|                                          |
|  [ No ]              [ Yes ]             |
|                                          |
|  [ Back ]              [ Continue ]      |
+------------------------------------------+
```

### Service Edit Dialog Update

**File: `src/components/creator-dashboard/ServiceEditDialog.tsx`**
- Remove price tier radio buttons
- Replace with single price input field
- Keep description and delivery days fields
- For Live PK Battle: just an active toggle, no pricing

### Services Tab Update

**File: `src/components/creator-dashboard/ServicesTab.tsx`**
- Show single price instead of price range
- For Live PK Battle: show "Available" or "Not Available" instead of price

### Brand View (CreatorProfile) Update

**File: `src/pages/CreatorProfile.tsx`**
- Display creator's single price per package
- For Live PK Battle: show "Contact Us" button (no price displayed)

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/pages/CreatorSignup.tsx` | Complete rewrite to sequential flow with package-specific steps |
| `src/components/admin/AdminServicesSettings.tsx` | Remove or simplify (just enable/disable packages) |
| `src/components/creator-dashboard/ServiceEditDialog.tsx` | Single price input instead of tier selection |
| `src/components/creator-dashboard/ServicesTab.tsx` | Display single price, handle PK Battle differently |
| `src/pages/CreatorProfile.tsx` | Show single price, Contact Us for PK Battle |

---

## User Experience Benefits

1. **Simpler for creators** - No confusing price brackets, just enter your price
2. **Better flow** - Answer one question, move to next (less overwhelming)
3. **Clear expectations** - Each package step explains what brands expect
4. **Faster completion** - Each step is quick, feels like progress
5. **Special handling for PK Battle** - No awkward pricing questions for event-style packages

---

## Migration Notes

- Existing creators with tier-based pricing will keep working (backwards compatible)
- When they edit a service, they'll be prompted to set a single price
- No data migration required - just new signups use simplified flow

