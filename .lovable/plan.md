

## Raise Free Plan Opportunity Post Price from $15 to $40

Update the opportunity posting fee for the Free plan from $15 to $40 across all references in the codebase.

### Files to Change

1. **`src/components/brand-dashboard/CreateOpportunityDialog.tsx`**
   - Change `OPPORTUNITY_POSTING_FEE` from `1500` to `4000` (cents)
   - Update the button label from `"Continue to Payment ($15)"` to `"Continue to Payment ($40)"`

2. **`src/lib/stripe-mock.ts`**
   - Update Free plan feature text from `"Pay $15 per opportunity post"` to `"Pay $40 per opportunity post"`

3. **`src/components/brand/BrandPricingSection.tsx`**
   - Update Free plan feature text from `"$15 per opportunity post"` to `"$40 per opportunity post"`

4. **`src/components/brand-dashboard/UpgradePlanDialog.tsx`**
   - Update Free plan feature text from `"$15 per opportunity post"` to `"$40 per opportunity post"`

5. **`src/data/knowledgeBase.ts`**
   - Update two references from `$15` to `$40` in the knowledge base articles

6. **`src/data/platformManual.ts`**
   - Update two references from `$15` to `$40` in the platform manual pricing tables

