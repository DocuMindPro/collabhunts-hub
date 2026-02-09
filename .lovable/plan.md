
## Fix: Upgrade Button Does Nothing

### Root Cause
The "Upgrade" button in both `MessagingLimitBanner` and `MessagingQuotaCard` navigates to `/brand`. However, authenticated brands with a profile are automatically redirected from `/brand` back to `/brand-dashboard` (line 54 of `Brand.tsx`), so they never see the pricing section. The button effectively does nothing.

### Fix
Change `navigate("/brand")` to `navigate("/brand-dashboard?tab=account")` in both components. This takes brands directly to their Account tab where subscription management lives.

### Files Changed

**1. `src/components/brand-dashboard/MessagingLimitBanner.tsx`** (line 77)
- Change `onClick={() => navigate("/brand")}` to `onClick={() => navigate("/brand-dashboard?tab=account")}`

**2. `src/components/brand-dashboard/MessagingQuotaCard.tsx`** (line 100)
- Change `onClick={() => navigate("/brand")}` to `onClick={() => navigate("/brand-dashboard?tab=account")}`

Two single-line changes, no new dependencies.
