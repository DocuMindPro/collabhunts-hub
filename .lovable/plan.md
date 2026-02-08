
## Update Pro Plan Price to $299/year

A simple update to change the Pro plan price from "Custom" to "$299/year" across the pricing section and mock payment config.

### Changes

**1. `src/components/brand/BrandPricingSection.tsx`**
- Change Pro plan `price` from `"Custom"` to `"$299"`
- Change Pro plan `period` from `""` to `"/year"`
- Keep the CTA as "Contact Us" pointing to `/contact` (or change to "Get Started" -- keeping "Contact Us" since Pro includes a dedicated CSM that requires coordination)

**2. `src/lib/stripe-mock.ts`**
- Update the Pro plan `price` from `0` to `29900` (cents) to reflect the $299/year pricing
