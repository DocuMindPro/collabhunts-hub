
# Plan: Update Subscription Pricing

## Summary
Update the pricing across the entire CollabHunts platform from the current pricing ($39 Basic, $99 Pro, $299 Premium) to the new competitive pricing ($10 Basic, $49 Pro, $99 Premium).

## New Pricing Structure
| Plan | Old Price | New Price | In Cents |
|------|-----------|-----------|----------|
| Basic | $39/mo | **$10/mo** | 1000 |
| Pro | $99/mo | **$49/mo** | 4900 |
| Premium | $299/mo | **$99/mo** | 9900 |

---

## Files to Update

### 1. Core Configuration Files (Source of Truth)

**`src/config/plans.ts`** - Centralized plan configuration
- Line 69: `price: 3900` → `price: 1000` (Basic)
- Line 102: `price: 9900` → `price: 4900` (Pro)
- Line 135: `price: 29900` → `price: 9900` (Premium)

**`src/lib/stripe-mock.ts`** - Mock Stripe integration
- Line 36: `price: 3900` → `price: 1000` (Basic)
- Line 65: `price: 9900` → `price: 4900` (Pro)
- Line 94: `price: 29900` → `price: 9900` (Premium)

---

### 2. UI Pages with Hardcoded Pricing

**`src/pages/Pricing.tsx`** - Main pricing page
- Line 100: `"$39"` → `"$10"` (Basic card)
- Line 118: `"$99"` → `"$49"` (Pro card)
- Line 133: `"$299"` → `"$99"` (Premium card)
- Line 338: `"$39/mo"` → `"$10/mo"` (Feature comparison table - Basic)
- Line 347: `"$99/mo"` → `"$49/mo"` (Feature comparison table - Pro)
- Line 353: `"$299/mo"` → `"$99/mo"` (Feature comparison table - Premium)

**`src/pages/Brand.tsx`** - Brand landing page
- Line 182: `"$39"` → `"$10"` (Basic tier)
- Line 190: `"$99"` → `"$49"` (Pro tier)
- Line 198: `"$299"` → `"$99"` (Premium tier)

---

### 3. Upgrade Components

**`src/components/UpgradeModal.tsx`** - Modal for feature upgrades
- Line 20: `price: 39` → `price: 10` (Basic - chat)
- Line 32: `price: 99` → `price: 49` (Pro - campaigns)
- Line 45: `price: 99` → `price: 49` (Pro - crm)
- Line 58: `price: 99` → `price: 49` (Pro - filters)
- Line 71: `price: 99` → `price: 49` (Pro - badge)
- Line 84: `price: 39` → `price: 10` (Basic - content_library)
- Line 97: `price: 99` → `price: 49` (Pro - post_booking)
- Line 110: `price: 99` → `price: 49` (Pro - mass_message)
- Line 123: `price: 299` → `price: 99` (Premium - unlimited_campaigns)
- Line 136: `price: 299` → `price: 99` (Premium - more_storage)
- Line 149: `price: 39` → `price: 10` (Basic - pricing)

**`src/components/UpgradeBanner.tsx`** - Banner for upgrades
- Line 20: `"$39/mo"` → `"$10/mo"` (Basic - chat)
- Line 27: `"$99/mo"` → `"$49/mo"` (Pro - campaigns)
- Line 34: `"$99/mo"` → `"$49/mo"` (Pro - crm)
- Line 41: `"$99/mo"` → `"$49/mo"` (Pro - filters)
- Line 48: `"$99/mo"` → `"$49/mo"` (Pro - badge)
- Line 55: `"$39/mo"` → `"$10/mo"` (Basic - content_library)
- Line 62: `"$99/mo"` → `"$49/mo"` (Pro - mass_message)
- Line 69: `"$299/mo"` → `"$99/mo"` (Premium - unlimited_campaigns)
- Line 76: `"$299/mo"` → `"$99/mo"` (Premium - more_storage)
- Line 111: `"$39/mo"` → `"$10/mo"` (inline default fallback)
- Line 212: `"$39"` → `"$10"` (default banner "Starting at")

**`src/components/UpgradePrompt.tsx`** - Inline upgrade prompts
- Line 17: `"($39/mo)"` → `"($10/mo)"` & `"$39/mo"` → `"$10/mo"` (Basic - contact)
- Line 18: `"$39/mo"` → `"$10/mo"` (Basic CTA)
- Line 24: `"($99/mo)"` → `"($49/mo)"` (Pro - campaigns description)
- Line 25: `"$99/mo"` → `"$49/mo"` (Pro CTA)
- Line 31: `"($99/mo)"` → `"($49/mo)"` (Pro - filters description)
- Line 32: `"$99/mo"` → `"$49/mo"` (Pro CTA)
- Line 38: `"($99/mo)"` → `"($49/mo)"` (Pro - crm description)
- Line 39: `"$99/mo"` → `"$49/mo"` (Pro CTA)
- Line 46: `"$39/mo"` → `"$10/mo"` (Basic - content_library CTA)
- Line 52: `"($99/mo)"` → `"($49/mo)"` (Pro - badge description)
- Line 53: `"$99/mo"` → `"$49/mo"` (Pro CTA)
- Line 59: `"($199/mo)"` → `"($99/mo)"` (Premium - unlimited_campaigns)
- Line 60: `"$199/mo"` → `"$99/mo"` (Premium CTA)
- Line 66: `"($199/mo)"` → `"($99/mo)"` (Premium - more_storage)
- Line 67: `"$199/mo"` → `"$99/mo"` (Premium CTA)
- Line 74: `"$99/mo"` → `"$49/mo"` (Pro - mass_message CTA)
- Line 88: `"$199/mo"` → `"$99/mo"` (targetTier override for premium)
- Line 90: `"$99/mo"` → `"$49/mo"` (targetTier override for pro)
- Line 92: `"$39/mo"` → `"$10/mo"` (targetTier override for basic)

---

### 4. Legal & Documentation

**`src/pages/TermsOfService.tsx`** - Legal terms
- Line 121: `"Basic ($39/month)"` → `"Basic ($10/month)"`
- Line 122: `"Pro ($99/month)"` → `"Pro ($49/month)"`
- Line 123: `"Premium ($299/month)"` → `"Premium ($99/month)"`

**`src/data/platformManual.ts`** - Admin manual
- Line 490: `"Basic (Free)"` - Update to clarify it's `$10/mo`
- Line 491: `"($99/mo)"` → `"($49/mo)"` (Pro)
- Line 492: `"($299/mo)"` → `"($99/mo)"` (Premium)
- Line 520: Update table header prices

**`src/data/knowledgeBase.ts`** - Help articles
- Line 247: `"($99/mo)"` → `"($49/mo)"` (Pro)
- Line 248: `"($299/mo)"` → `"($99/mo)"` (Premium)
- Add Basic $10/mo to the list

---

### 5. Database Trigger (Revenue Distribution)

**Database Migration Required**
Create a new migration to update the `distribute_subscription_revenue` trigger function with new pricing:

```sql
-- Update the distribute_subscription_revenue function
CREATE OR REPLACE FUNCTION distribute_subscription_revenue()
RETURNS TRIGGER AS $$
...
    subscription_amount := CASE NEW.plan_type
      WHEN 'basic' THEN 1000   -- $10
      WHEN 'pro' THEN 4900     -- $49
      WHEN 'premium' THEN 9900 -- $99
      ELSE 0
    END;
...
$$;
```

---

## Technical Details

### Implementation Order
1. **Database migration first** - Update the trigger function for revenue distribution
2. **Core configuration files** - `src/config/plans.ts` and `src/lib/stripe-mock.ts`
3. **UI pages** - `Pricing.tsx` and `Brand.tsx`
4. **Upgrade components** - `UpgradeModal.tsx`, `UpgradeBanner.tsx`, `UpgradePrompt.tsx`
5. **Documentation** - `TermsOfService.tsx`, `platformManual.ts`, `knowledgeBase.ts`

### Testing Checklist
- Verify pricing displays correctly on `/pricing` page
- Verify pricing displays correctly on `/brand` landing page
- Verify subscription tab shows correct prices in brand dashboard
- Verify upgrade modals show correct pricing
- Verify upgrade banners show correct pricing
- Test mock payment flow with new amounts
- Verify Terms of Service reflects new pricing

### No Changes Required
- `BrandSubscriptionTab.tsx` - Uses `formatPrice()` from stripe-mock, will auto-update
- Authentication or database schema - No structural changes needed
- RLS policies - No changes needed

---

## Summary of Price Changes

| Location | Basic | Pro | Premium |
|----------|-------|-----|---------|
| Cents (config) | 1000 | 4900 | 9900 |
| Display | $10 | $49 | $99 |
| Per month text | $10/mo | $49/mo | $99/mo |

Total files to modify: **10 files + 1 database migration**
