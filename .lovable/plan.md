
## Brand Pricing Plans: Free, Basic, Pro

### Overview

Add a pricing section directly to the `/brand` page (not a separate page) with 3 clear tiers, and link to it from the Footer using an anchor (`/brand#pricing`).

### The 3 Plans

| | Free | Basic ($99/year) | Pro (Contact Us) |
|---|---|---|---|
| Verified Badge | No | Yes | Yes |
| Opportunity Posts | $15 each | 3 free/month, then $15 | Unlimited |
| Customer Success Manager | No | No | Dedicated CSM |
| Browse Creators | Yes | Yes | Yes |
| Direct Messaging | Yes | Yes | Yes |

### Changes

**1. `src/pages/Brand.tsx`**
- Add a new "Pricing" section (with `id="pricing"`) between the "How It Works" and "Venue Types" sections
- 3-column card layout: Free, Basic (highlighted as popular), Pro
- Free: "$0/forever" -- list features, CTA "Get Started Free" linking to `/brand-signup`
- Basic: "$99/year" -- list features including badge + 3 free posts, CTA "Get Started" linking to `/brand-signup` (they upgrade from dashboard after signup)
- Pro: "Custom" -- list features including unlimited posts + dedicated CSM, CTA "Contact Us" linking to `/contact`

**2. `src/components/Footer.tsx`**
- Add a "Brand Pricing" link under the "For Brands" section (non-logged-in state) pointing to `/brand#pricing`
- Also add it under "Quick Links" for logged-in brand users

**3. `src/lib/stripe-mock.ts`**
- Update `SUBSCRIPTION_PLANS` to reflect the 3 tiers: `free`, `basic`, `pro`
- Basic = current verified ($99/year, badge + 3 free posts)
- Pro = new tier (custom pricing, unlimited posts, CSM)

**4. `src/components/brand-dashboard/CreateOpportunityDialog.tsx`**
- Add Pro plan logic: if brand has a `pro` plan type, skip payment entirely (unlimited posts)
- Keep existing Basic logic (3 free posts/month, then $15)
- Keep existing Free logic ($15 per post)

**5. Database consideration**
- No new columns needed. The existing `is_verified` + `verification_expires_at` already covers Basic. For Pro, we can add a `brand_plan` column (`free`/`basic`/`pro`) to `brand_profiles` to distinguish Pro from Basic, since both have verification badges but Pro gets unlimited posts.

### Technical Details

**New database column:**
- `brand_plan` (text, default `'free'`) on `brand_profiles` -- tracks which plan the brand is on

**Pricing section UI:**
- Uses existing GlowCard component for the highlighted (Basic) plan
- Responsive: stacks on mobile, 3 columns on desktop
- Smooth scroll anchor via `id="pricing"`

**Footer link:**
- Non-logged-in: appears under "For Brands" as "Brand Pricing"
- Logged-in brands: appears under "Quick Links" as "Plans & Pricing"

**Opportunity posting logic update:**
```text
Brand clicks "Post Opportunity"
  |
  +-- Pro plan? --> Post for FREE (unlimited)
  |
  +-- Basic plan (verified + not expired)?
  |     +-- free_posts_used < 3? --> Post FREE
  |     +-- else --> $15 payment
  |
  +-- Free plan --> $15 payment
```
