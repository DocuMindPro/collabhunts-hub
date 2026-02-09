

## Restrict Team Access to Pro Only

Three small changes needed:

### 1. Pricing feature cards (`BrandPricingSection.tsx`)
- **Basic plan**: Change "Team access (invite members)" from `included: true` to `included: false`
- **Pro plan**: Keep it as `included: true` (no change)
- **Free plan**: Already `included: false` (no change)

### 2. Feature gating logic (`BrandAccountTab.tsx`)
- Change the lock condition from `planType === "free"` to `planType !== "pro"`
- This locks the feature for both Free and Basic plans

### 3. Locked message (`BrandAccountTab.tsx`)
- Update the message from "Basic and Pro plans" to "Pro plan" only:
  `"Team access is available on the Pro plan. Upgrade to invite team members."`

No database or edge function changes required.

