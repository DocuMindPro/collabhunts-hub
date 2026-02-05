
# Knowledge Base Comprehensive Update

## Overview
The Knowledge Base (`src/data/knowledgeBase.ts`) contains significant outdated content that doesn't align with the current platform identity and business model. This plan details a complete refresh to match the current "classifieds-style marketplace" model with zero transaction fees.

## Key Issues Identified

### 1. Business Model Mismatch
**Current KB says:**
- "CollabHunts handles all payments" / "Brand pays CollabHunts"
- "You receive the full price you set" (implies platform processing)
- "50% deposit" / "escrow system"
- "72 hours to review deliverables" with auto-release
- Subscription tiers: Basic $39, Pro $99, Premium $299

**Should reflect (per project memory):**
- Zero transaction fees - all payments happen directly between parties
- Platform is classifieds-style (OLX/Dubizzle model)
- Revenue from: Creator Boost packages, Brand Verified Badge ($99), Opportunity listings ($15 + $25 featured)
- AI-drafted agreements for record-keeping
- "Starting from" pricing with negotiable terms

### 2. Creator Articles Need Updates
- Remove references to "managed bookings" and "CollabHunts pays you"
- Update pricing model to reflect "base prices displayed as Starting from"
- Clarify that all negotiations happen via messaging
- Update package descriptions to use "Typical deliverables may include" language
- Add info about Boost packages ($29-79/week featuring options)

### 3. Brand Articles Need Updates  
- Remove managed booking process references
- Update subscription tiers to match `plans.ts` (Basic $10, Pro $49, Premium $99)
- Clarify self-service messaging model
- Remove "72-hour auto-release" payment flow (doesn't apply)
- Update to reflect "classifieds" discovery model

### 4. Recently Added Restrictions
- Creators cannot access `/influencers` page (just implemented)
- Navigation hides "Find Creators" and "For Brands" from creators
- This should be reflected if relevant to KB content

### 5. Platform Updates Outdated
- Dates from 2024 (should be updated)
- Some features mentioned don't match current implementation

---

## Files to Modify

### Primary File: `src/data/knowledgeBase.ts` (~1,482 lines)

#### Section 1: Platform Updates (lines 62-310)
- Update dates to 2025/2026
- Revise feature descriptions to match current implementation
- Add new updates about:
  - Zero transaction fee model
  - AI-drafted agreements
  - Creator access restrictions

#### Section 2: Creator Categories (lines 370-876)

**"getting-started-creators" category:**
- "how-collabhunts-works" - Complete rewrite
  - Remove: "CollabHunts will contact you", "Get paid by CollabHunts"
  - Add: Direct negotiation model, AI agreements, external payments
  
- "profile-approval-process" - Minor updates
  
- "setting-up-services" - Update
  - Reflect "Starting from" pricing display
  - Note that exact deliverables are finalized in agreements

**"grow-your-business" category:**
- Update pricing tips to reflect marketplace dynamics
- Add section on Boost packages for visibility

**"managing-bookings-creators" category:**
- Rewrite to reflect direct brand communication
- Remove managed booking references

**"payments-creators" category:**
- Complete rewrite
  - Remove: Platform payment processing
  - Add: Direct payment arrangements, agreement as record

**"disputes-creators" category:**
- Update to reflect mediation model (not escrow-based)

#### Section 3: Brand Categories (lines 879-1372)

**"getting-started-brands" category:**
- "how-collabhunts-works-brands" - Complete rewrite
  - Remove: "held in escrow", managed process
  - Add: Discovery platform, direct messaging, negotiate terms
  
- "finding-creators" - Keep with minor updates

**"booking-creators" category:**
- Rewrite entire booking process
- Remove managed flow, add direct negotiation

**"subscriptions-brands" category:**
- Update prices: Basic $10, Pro $49, Premium $99
- Update feature lists to match `plans.ts`
- Clarify: no transaction fees

**"campaigns-brands" category:**
- Update to reflect $15 base + $25 featured pricing
- Clarify approval process

**"disputes-brands" category:**
- Update to reflect non-escrow model

#### Section 4: Shared Categories (lines 1376-1440)
- "platform-policies" - Update prohibited activities
  - Remove: "Circumventing the platform for payments" (payments ARE external now)

---

## Content Updates Summary

### New Messaging Throughout:

| Old Language | New Language |
|--------------|--------------|
| "CollabHunts handles all payments" | "Arrange payment directly with the creator/brand" |
| "Payment held in escrow" | "Professional AI-drafted agreement for record-keeping" |
| "50% deposit required" | "Terms negotiated between parties" |
| "$39/month Basic" | "$10/month Basic" |
| "72-hour auto-release" | Removed entirely |
| "Managed bookings" | "Direct negotiation via platform messaging" |
| "You receive the full price" | "All financial transactions happen externally" |
| "CollabHunts pays you after delivery" | "Brands pay you directly per your agreement" |

### New Articles to Add:
1. **"Understanding the Marketplace Model"** - Explain zero-fee classifieds approach
2. **"AI-Drafted Agreements"** - How agreements work, what they include
3. **"Boost Your Profile"** - Featuring options for creators ($29-79/week)
4. **"Verified Business Badge"** - $99 badge for brands
5. **"Posting Opportunities"** - $15 base + $25 featured upgrade

### Articles to Remove/Merge:
- Remove heavy references to managed payment flow
- Merge dispute articles to reflect simplified model

---

## Platform Manual Updates

### File: `src/data/platformManual.ts` (~1,271 lines)

Updates needed in:
- **Subscription timeline** section - update prices
- **Delivery/Payment timeline** - remove or update significantly
- **Dispute timeline** - simplify for non-escrow model

---

## Technical Changes

### Line Estimates:
- `knowledgeBase.ts`: ~60% of content needs modification
- `platformManual.ts`: ~20% needs modification

### Implementation Approach:
1. Update platform updates section with fresh dates and new features
2. Rewrite creator "Getting Started" and "Payments" categories
3. Rewrite brand "Getting Started", "Booking", and "Subscriptions" categories  
4. Update shared policies
5. Add new articles for monetization features
6. Update platformManual.ts operational docs

---

## Detailed Article Rewrites

### Creator: "How CollabHunts Works" (New Content)
```
Welcome to CollabHunts - a marketplace connecting creators with brands 
looking for authentic collaborations. Here's how it works:

1. Create your profile - Add bio, social accounts, and portfolio
2. Set up service packages - Define offerings with "Starting from" prices
3. Get discovered - Brands find you via search and filters
4. Negotiate directly - Chat with brands to agree on terms
5. Sign AI-drafted agreement - Professional record of deliverables
6. Deliver content & get paid - All payments arranged directly

No transaction fees - we're a discovery platform, not a payment processor.
```

### Brand: "Subscription Tiers" (New Content)
```
Choose the Right Plan:

No Package (Free):
- Search creators on the marketplace

Basic ($10/month):
- Chat & negotiate with creators
- View all creator pricing
- 10 GB Content Library

Pro ($49/month):
- All Basic features
- Post 1 campaign/month
- Advanced demographic filters
- Creator CRM (save, notes, folders)
- Mass messaging (50/day)
- Verified Business Badge eligibility

Premium ($99/month):
- All Pro features
- Unlimited campaigns
- 50 GB Content Library
- Mass messaging (100/day)

Note: All bookings are arranged directly with creators - 
no transaction fees or platform processing.
```

---

## Timeline Estimate
This is a substantial content update affecting ~1,500+ lines across two files. The changes are primarily content/copy updates rather than structural code changes.
