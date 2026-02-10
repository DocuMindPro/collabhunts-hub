

## Change "Become VIP" to Interest-Based (Like Boost)

### What Changes

Replace the mock payment flow on the VIP Creator Badge card with a simple "I'm Interested" button that inserts a record into the existing `boost_interest_requests` table -- the same table the Boost Profile feature uses. Admins already see these requests in the Feature Overrides tab.

### Single File Change: `src/components/creator-dashboard/VerificationBadgeCard.tsx`

**Remove:**
- `MockPaymentDialog` import and usage
- `handlePaymentSuccess` function
- `showPaymentDialog` state
- `date-fns` imports (`addYears`)

**Add:**
- A `submitting` state (boolean)
- A `handleInterest` function that inserts into `boost_interest_requests` with `feature_type: "vip_badge"`
- A "Coming Soon" badge in the header
- Replace the "Become VIP" / "Renew VIP" buttons with "I'm Interested" buttons (with a Bell icon, matching the Boost dialog style)
- Show a success state if the creator has already expressed interest (query `boost_interest_requests` for existing `vip_badge` entry)
- Keep the active/expired states as-is (admin can still grant VIP manually via Feature Overrides)

**New flow for unpaid creators:**
1. Creator sees benefits list + "$99/year" pricing info (unchanged)
2. Button says "I'm Interested" with a Bell icon instead of "Become VIP"
3. Click inserts into `boost_interest_requests` with `feature_type: "vip_badge"`
4. Toast: "We've noted your interest! Our team will review and reach out to you soon."
5. Admin sees the request in Feature Overrides tab (already wired up)

No database changes needed -- the `boost_interest_requests` table already accepts any string as `feature_type`.

