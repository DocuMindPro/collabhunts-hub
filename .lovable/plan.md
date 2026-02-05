

# Platform Pivot: Marketplace Model (OLX/Dubizzle Style)

## Vision Summary

Transform from a **transaction-fee marketplace** (15% cut + escrow) to a **classifieds-style marketplace** where:
- **Zero transaction fees** - Deals happen directly between creators and brands
- **Revenue from featuring** - Creators pay to boost visibility, brands pay for verification and opportunity posts
- **AI-powered agreements** - Help creators draft professional contracts with templates
- **Growth first** - Maximize user acquisition before monetization emphasis

---

## Current vs New Business Model

| Aspect | Current (Remove) | New Model |
|--------|------------------|-----------|
| **Transaction Fee** | 15% platform cut | 0% - we don't touch payments |
| **Escrow System** | 50% deposit held | None - handled externally |
| **Booking Payment** | Through platform | Off-platform (WhatsApp, bank, cash) |
| **Revenue Source** | Per-booking fee | Featuring, ads, verification badges |
| **Opportunity Board** | Free for brands | Paid posting (like job boards) |
| **Agreement** | None needed (we handle) | AI-drafted contracts for record |

---

## New Revenue Streams

### 1. Creator Featuring Tiers
| Tier | Description | Price (example) |
|------|-------------|-----------------|
| **Featured Badge** | "Featured" badge + top of search results | $29/week |
| **Homepage Spotlight** | Rotating spotlight on homepage | $49/week |
| **Category Boost** | Top of specific category (e.g., "Food Creators") | $39/week |
| **Auto Popup** | Profile pops up for brands on first visit | $79/week |

### 2. Brand Features
| Feature | Description | Price (example) |
|---------|-------------|-----------------|
| **Verified Business Badge** | One-time verification fee | $99 |
| **Opportunity Posting** | Post opportunities for creators to apply | $49/post |
| **Featured Opportunity** | Highlighted in opportunity board | $79/post |

### 3. Ad Placements (Already Built)
The existing `AdPlacement` component can display paid ads on:
- Creator discovery page sidebar
- Homepage spotlight areas
- Opportunity board

---

## Implementation Phases

### ✅ Phase 1: Remove Payment System (COMPLETED)

**Files deleted:**
- `src/lib/escrow-utils.ts` - Removed escrow utilities
- `src/components/MockPaymentDialog.tsx` - Removed mock payment dialog

**Files modified:**
- `src/config/packages.ts` - Removed PLATFORM_FEE_PERCENT, DEPOSIT_PERCENT, escrow types and functions
- `src/components/chat/AcceptOfferDialog.tsx` - Converted from payment flow to simple agreement confirmation
- `src/components/chat/SendOfferDialog.tsx` - Removed fee/deposit calculations and display
- `src/components/chat/OfferMessage.tsx` - Removed deposit display, updated button text
- `src/components/EventBookingDialog.tsx` - Removed escrow/deposit logic
- `src/components/brand-dashboard/BrandBookingsTab.tsx` - Removed escrow status display
- `src/components/creator-dashboard/BookingsTab.tsx` - Removed escrow status display

**Changes made:**
- "Accept & Pay Deposit" → "Confirm Agreement"
- Booking creation no longer requires payment
- No platform fees displayed
- Agreement confirmation sends a message indicating payment should be arranged directly

### ✅ Phase 2: Agreement System (COMPLETED)

**Database Changes:**
- Created `creator_agreements` table with RLS policies

**New Files Created:**
- `src/config/agreement-templates.ts` - Agreement templates configuration
- `src/components/agreements/SendAgreementDialog.tsx` - AI-powered agreement drafting dialog
- `src/components/chat/AgreementMessage.tsx` - Agreement display in chat with Confirm/Decline
- `supabase/functions/draft-agreement/index.ts` - AI drafting endpoint using Lovable AI

**Files Modified:**
- `src/components/creator-dashboard/MessagesTab.tsx` - Added agreement message support and Send Agreement button
- `src/pages/CreatorDashboard.tsx` - Removed Payouts tab, renamed "Events" to "Agreements"

### 🔲 Phase 3: Creator Featuring System (NEXT)

**New Components:**
- `src/components/agreements/AgreementTemplates.tsx` - Pre-built templates
- `src/components/agreements/AgreementBuilder.tsx` - AI-assisted builder
- `src/components/agreements/AgreementPreview.tsx` - Preview before sending
- `src/components/chat/AgreementMessage.tsx` - Display in chat with Confirm/Decline buttons

**New Edge Function:**
- `supabase/functions/draft-agreement/index.ts` - Uses Lovable AI to help draft

**Database Changes:**
```sql
CREATE TABLE creator_agreements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_profile_id UUID REFERENCES creator_profiles(id),
  brand_profile_id UUID REFERENCES brand_profiles(id),
  conversation_id UUID REFERENCES conversations(id),
  template_type TEXT, -- 'unbox_review', 'social_boost', 'meet_greet', 'custom'
  content TEXT NOT NULL, -- The full agreement text
  deliverables JSONB, -- Array of deliverables
  proposed_price_cents INTEGER,
  event_date DATE,
  status TEXT DEFAULT 'pending', -- 'pending', 'confirmed', 'declined', 'completed'
  confirmed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

### Phase 3: Creator Featuring System (New Feature)
**Database Changes:**
```sql
CREATE TABLE creator_featuring (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_profile_id UUID REFERENCES creator_profiles(id),
  feature_type TEXT NOT NULL, -- 'featured_badge', 'homepage_spotlight', 'category_boost', 'auto_popup'
  category TEXT, -- For category_boost: 'food', 'fashion', etc.
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ NOT NULL,
  price_cents INTEGER NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Add to creator_profiles
ALTER TABLE creator_profiles ADD COLUMN is_featured BOOLEAN DEFAULT false;
ALTER TABLE creator_profiles ADD COLUMN featuring_priority INTEGER DEFAULT 0;
```

**New Components:**
- `src/components/creator-dashboard/FeaturingTab.tsx` - Manage featuring options
- `src/components/creator-dashboard/BoostProfileDialog.tsx` - Purchase featuring

**Updated Queries:**
Modify creator discovery to prioritize featured creators:
```typescript
const { data } = await supabase
  .from("creator_profiles")
  .select("*")
  .order("is_featured", { ascending: false })
  .order("featuring_priority", { ascending: false })
  .order("created_at", { ascending: false });
```

### Phase 4: Paid Opportunity Posting
**Database Changes:**
```sql
ALTER TABLE brand_opportunities ADD COLUMN is_paid BOOLEAN DEFAULT false;
ALTER TABLE brand_opportunities ADD COLUMN payment_status TEXT DEFAULT 'pending';
ALTER TABLE brand_opportunities ADD COLUMN is_featured BOOLEAN DEFAULT false;
```

**Modified Flow:**
1. Brand creates opportunity
2. Before publishing → Payment dialog appears
3. Brand pays → Opportunity goes live
4. Optional: Pay extra for "Featured" placement

### Phase 5: Verification Badge System
Already partially built. Enhance to require payment:

```sql
ALTER TABLE brand_profiles ADD COLUMN verification_payment_status TEXT DEFAULT 'unpaid';
ALTER TABLE creator_profiles ADD COLUMN verification_payment_status TEXT DEFAULT 'unpaid';
```

---

## Updated Workflow: Creator-Brand Deal

```text
NEW FLOW (No Platform Interference):

1. Brand discovers creator on marketplace
2. Brand clicks "Message Creator" → Opens chat
3. Creator and brand discuss deal terms freely
4. Creator clicks "Send Agreement" → AI helps draft
   ├── Select template (Unbox, Social Boost, etc.)
   ├── AI suggests professional language
   ├── Set price, date, deliverables
   └── Preview and send
5. Agreement message appears in chat
6. Brand clicks "Confirm Agreement" → Just a record (no payment)
7. Both have documented agreement for reference
8. Deal happens OFF-platform (payment via WhatsApp, bank, etc.)
9. Optionally: Mark as "Completed" for portfolio
```

---

## UI/UX Changes

### Creator Profile Page
- Remove price display (or make it "Starting from $X")
- Add "Message to Discuss" CTA instead of "Book Now"
- Show "Featured" badge for paying creators

### Creator Dashboard
- **Remove**: Payouts tab (no platform payments)
- **Add**: "Boost Profile" tab with featuring options
- **Rename**: "Bookings" → "Agreements" or "Deals"

### Brand Dashboard
- **Remove**: Payment history, escrow tracking
- **Add**: "Post Opportunity" with payment step
- **Rename**: "Bookings" → "Agreements"

### Homepage
- Add "Featured Creators" spotlight section
- Show featured opportunities prominently

---

## Files to Delete (Payment System Removal)

| File | Reason |
|------|--------|
| `src/lib/escrow-utils.ts` | No more escrow |
| `src/components/MockPaymentDialog.tsx` | No platform payments for bookings |
| References to `PLATFORM_FEE_PERCENT`, `DEPOSIT_PERCENT` | Not applicable |

---

## Files to Create (New Features)

| File | Purpose |
|------|---------|
| `src/components/agreements/AgreementTemplates.tsx` | Template selection |
| `src/components/agreements/AgreementBuilder.tsx` | AI-powered drafting |
| `src/components/chat/AgreementMessage.tsx` | Chat display |
| `src/components/creator-dashboard/BoostProfileTab.tsx` | Featuring management |
| `src/components/FeatureCreatorDialog.tsx` | Purchase featuring |
| `supabase/functions/draft-agreement/index.ts` | AI drafting endpoint |

---

## Database Schema Changes Summary

```sql
-- 1. New agreements table
CREATE TABLE creator_agreements (...);

-- 2. Creator featuring
CREATE TABLE creator_featuring (...);
ALTER TABLE creator_profiles ADD COLUMN is_featured BOOLEAN DEFAULT false;
ALTER TABLE creator_profiles ADD COLUMN featuring_priority INTEGER DEFAULT 0;

-- 3. Paid opportunities
ALTER TABLE brand_opportunities ADD COLUMN is_paid BOOLEAN DEFAULT false;
ALTER TABLE brand_opportunities ADD COLUMN is_featured BOOLEAN DEFAULT false;

-- 4. Verification payment tracking
ALTER TABLE brand_profiles ADD COLUMN verification_payment_status TEXT;
ALTER TABLE creator_profiles ADD COLUMN verification_payment_status TEXT;

-- 5. Remove escrow columns (optional - can keep for records)
-- ALTER TABLE bookings DROP COLUMN escrow_status;
```

---

## Benefits of This Model

| Benefit | Description |
|---------|-------------|
| **Lower friction** | No payment complexity = more signups |
| **Trust OLX-style** | Users understand classified marketplace model |
| **Growth focus** | Get critical mass before monetization |
| **Multiple revenue** | Featuring, ads, verification, paid posts |
| **Simpler tech** | No escrow, disputes, refunds to manage |

---

## Implementation Priority

1. **Week 1**: Remove payment/escrow system, simplify booking to agreements
2. **Week 2**: Build AI-powered agreement drafting
3. **Week 3**: Creator featuring tiers + payment
4. **Week 4**: Paid opportunity posting
5. **Week 5**: Polish, testing, soft launch

This is a significant architectural change. Want me to start with Phase 1 (removing the payment system and simplifying to agreements)?

