

## Add Upgrade Plans Dialog for Brands

### Problem
The "Upgrade" buttons in `MessagingQuotaCard` and `MessagingLimitBanner` navigate to `/brand-dashboard?tab=account`, but the Account tab has no upgrade/plan selection UI. The user lands on profile settings with no way to upgrade.

### Solution
Create a reusable `UpgradePlanDialog` component that shows the 3 brand plans (Free, Basic, Pro) in a professional dialog. Update all "Upgrade" buttons to open this dialog instead of navigating.

### Technical Details

**New File: `src/components/brand-dashboard/UpgradePlanDialog.tsx`**
- A dialog component displaying 3 plan cards (reusing the plan data from `BrandPricingSection`)
- Shows current plan highlighted with a "Current Plan" badge
- Basic and Pro plans show "Get a Quotation" button (submits inquiry to `quotation_inquiries` table, same logic as `BrandPricingSection`)
- Free plan shows "Current" if already on free
- Thank-you confirmation after submitting inquiry
- Props: `open`, `onOpenChange`, `currentPlan` (string)

**Modified: `src/components/brand-dashboard/MessagingQuotaCard.tsx`**
- Add state for dialog open/close
- Replace `navigate("/brand-dashboard?tab=account")` with `setUpgradeOpen(true)`
- Render `UpgradePlanDialog` with current plan info

**Modified: `src/components/brand-dashboard/MessagingLimitBanner.tsx`**
- Same changes: add dialog state, replace navigate with dialog open
- Render `UpgradePlanDialog`

**Modified: `src/components/brand-dashboard/BrandAccountTab.tsx`**
- Add a "Subscription Plan" card at the top showing current plan with an "Upgrade" button
- Render `UpgradePlanDialog` when clicked

### Plan Card Layout (inside dialog)

```text
+--------+  +-----------+  +--------+
|  Free  |  |   Basic   |  |  Pro   |
|  $0    |  | Quotation |  | Quota. |
| [Curr] |  | [Inquire] |  | [Inq.] |
+--------+  +-----------+  +--------+
```

### Files
1. **Create** `src/components/brand-dashboard/UpgradePlanDialog.tsx` -- New dialog with 3 plan cards and quotation submission
2. **Edit** `src/components/brand-dashboard/MessagingQuotaCard.tsx` -- Open dialog instead of navigating
3. **Edit** `src/components/brand-dashboard/MessagingLimitBanner.tsx` -- Open dialog instead of navigating
4. **Edit** `src/components/brand-dashboard/BrandAccountTab.tsx` -- Add subscription card with upgrade button

