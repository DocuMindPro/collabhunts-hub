

## Change Free Opportunity Posts from 3 to 4 per Month (Basic Plan)

### What Changes

Update all references from "3 free opportunity posts/month" to "4 free opportunity posts/month", both in display text and in the actual enforcement logic.

### Technical Details

**4 files to modify:**

| File | Line(s) | Change |
|------|---------|--------|
| `src/components/brand-dashboard/CreateOpportunityDialog.tsx` | 108 | Change `Math.max(0, 3 - usedThisMonth)` to `Math.max(0, 4 - usedThisMonth)` |
| `src/components/brand/BrandPricingSection.tsx` | 40 | Change text `"3 free opportunity posts/month"` to `"4 free opportunity posts/month"` |
| `src/lib/stripe-mock.ts` | 27 | Change text `"3 free opportunity posts per month"` to `"4 free opportunity posts per month"` |
| `src/components/brand-dashboard/BrandVerificationBadgeCard.tsx` | 266-268 | Change display text from "3 Free Opportunity Posts/Month" and "Post up to 3 opportunities" to "4" in both places |

No database changes needed -- the limit is enforced purely in frontend logic.

