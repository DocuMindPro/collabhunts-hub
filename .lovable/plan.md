

## Enable Brand Reviews for Creators

### Overview

The review system is fully built but never wired up. This plan connects it to the agreement-based flow so brands can rate creators after a confirmed agreement.

### When Can a Brand Review?

A "Leave Review" button appears when:
- An agreement between the brand and creator has `status = 'confirmed'` (both parties signed)
- AND either the event date has passed, OR 7 days have elapsed since confirmation (whichever comes first)

This prevents premature reviews while keeping things simple without payment/delivery gating.

### Database Changes

**Migration: Update `reviews` table**
- Make `booking_id` nullable (was required, but agreements don't create bookings)
- Add `agreement_id` (uuid, nullable, FK to `creator_agreements`)
- Add constraint: at least one of `booking_id` or `agreement_id` must be set
- Add unique constraint on `agreement_id` + `brand_profile_id` (one review per agreement)

### Files to Modify

1. **`src/components/brand-dashboard/BrandBookingsTab.tsx`**
   - Import `ReviewDialog` and add a "Leave Review" / "Edit Review" button on completed/confirmed bookings
   - Fetch existing reviews for the brand's bookings to show edit vs create state
   - Show star rating inline if review already exists

2. **`src/components/ReviewDialog.tsx`**
   - Add optional `agreementId` prop (alongside existing `bookingId`)
   - Update insert logic to use `agreement_id` when provided instead of `booking_id`

3. **`src/components/chat/AgreementMessage.tsx`**
   - After an agreement is confirmed and the review window opens, show a "Leave Review" button in the agreement card
   - Only visible to the brand (not the creator)

4. **`src/pages/CreatorProfile.tsx`** (or wherever public reviews are displayed)
   - Ensure reviews linked via `agreement_id` also appear on the creator's public profile
   - No change needed if the existing query just fetches from `reviews` by `creator_profile_id`

### User Flow

```text
Brand sends agreement --> Creator confirms
       |
       v
  7 days pass (or event date passes)
       |
       v
  "Leave Review" button appears in:
    - Brand Bookings tab (for booking-based)
    - Agreement message card (for agreement-based)
    - Brand dashboard overview
       |
       v
  Brand clicks --> ReviewDialog opens
       |
       v
  Submits rating + optional text
       |
       v
  Creator's average_rating & total_reviews update
```

### Technical Details

- The `ReviewDialog` component already handles both create and edit flows
- Reviews are already displayed on `ProfilePreview.tsx` and the public creator profile page -- no changes needed there since they query by `creator_profile_id`
- The `average_rating` and `total_reviews` on `creator_profiles` should be updated via a database trigger (or recalculated on read) -- will check if this trigger already exists and add it if not
- Review eligibility check: `agreement.status === 'confirmed' AND (event_date < now() OR confirmed_at + 7 days < now())`
- RLS policy on `reviews`: brands can only insert/update reviews where `brand_profile_id` matches their profile

