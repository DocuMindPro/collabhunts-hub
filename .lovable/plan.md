
# Add Brand Verification Badge Card

## Overview
Create a verification card for brands in their Account tab that allows them to:
1. See their current verification status
2. Pay the $99 verification fee
3. Submit their request for admin review

## Current State
- **Database**: `brand_profiles` has `verification_status`, `is_verified`, `verification_submitted_at`, etc. - but no payment tracking columns
- **Admin UI**: Already built in `AdminVerificationsTab.tsx` to approve/reject requests
- **Brand UI**: Missing - brands have no way to request verification

## Required Changes

### 1. Database Migration
Add payment tracking columns to `brand_profiles` (similar to creator_profiles):
- `verification_payment_status` (text, default 'not_paid')
- `verification_paid_at` (timestamptz)
- `verification_expires_at` (timestamptz)
- `verification_payment_id` (text)

### 2. New Component: `BrandVerificationBadgeCard.tsx`
Create a card component similar to `VerificationBadgeCard.tsx` but adapted for brands:

**States to Handle:**
- **Not Started**: Show benefits, $99/year price, require phone verification first
- **Payment Needed**: Phone verified, ready to pay
- **Pending Review**: Paid, waiting for admin approval
- **Approved/Active**: Show verified status with expiry date
- **Rejected**: Show rejection reason with option to reapply
- **Expired**: Option to renew

**Key Differences from Creator Card:**
- Brands require admin review after payment (creators get instant activation)
- Must have verified phone before requesting verification
- Show "Verified Business" terminology

### 3. Update `BrandAccountTab.tsx`
Add the `BrandVerificationBadgeCard` component after the Phone Verification card.

## Flow

```text
┌──────────────────────────────────────────────────────────────┐
│                  Brand Verification Flow                     │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  1. Phone Not Verified                                       │
│     ├── Show: "Verify your phone first"                     │
│     └── Disabled payment button                              │
│                                                              │
│  2. Phone Verified, Not Paid                                 │
│     ├── Show: Benefits + $99/year price                     │
│     └── "Get Verified" button → Payment dialog              │
│                                                              │
│  3. Paid, Pending Review                                     │
│     ├── Show: "Under Review" status                         │
│     └── "Our team will review your request within 24-48h"   │
│                                                              │
│  4. Approved (Active)                                        │
│     ├── Show: Green "Verified Business" badge               │
│     └── Expiry date + renewal option (if expiring soon)     │
│                                                              │
│  5. Rejected                                                 │
│     ├── Show: Rejection reason                              │
│     └── "Reapply" button                                    │
│                                                              │
│  6. Expired                                                  │
│     ├── Show: "Verification Expired"                        │
│     └── "Renew" button → Payment dialog                     │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

## Files to Create/Modify

| File | Action | Description |
|------|--------|-------------|
| Database Migration | Create | Add payment tracking columns |
| `src/components/brand-dashboard/BrandVerificationBadgeCard.tsx` | Create | New verification card component |
| `src/components/brand-dashboard/BrandAccountTab.tsx` | Modify | Import and render the verification card |

## Technical Details

### BrandVerificationBadgeCard Component
- Props: `brandProfileId: string`, `phoneVerified: boolean`
- Fetches verification status on mount
- Uses `MockPaymentDialog` for payment (same as creator verification)
- On successful payment:
  - Sets `verification_payment_status = 'paid'`
  - Sets `verification_paid_at` and `verification_expires_at` (1 year)
  - Sets `verification_status = 'pending'`
  - Sets `verification_submitted_at`

### BrandAccountTab Updates
- Fetch brand profile including verification fields
- Pass `brandProfileId` and `phoneVerified` to `BrandVerificationBadgeCard`
- Position the verification card prominently (after phone verification)

## Benefits Display
- "Verified Business" badge on your profile
- Increased trust with creators
- Priority visibility in creator searches
