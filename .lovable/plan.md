
## Compact & Professional Brand Account Tab Redesign

### Layout Changes

**1. Brand Identity Header (top of page)**
Merge the current "Brand Logo" and "Subscription Plan" cards into a single hero-style header card at the top. This card will show:
- Logo (left) with hover-to-change overlay
- Company name + plan badge inline
- "Upgrade" button on the right
- This eliminates two separate cards and immediately communicates brand identity

**2. Reduce Card Padding & Spacing**
- Change `space-y-4` to `space-y-3` between cards
- Use `p-4` instead of `p-6` on CardHeader/CardContent (matching the compact UI design policy)
- Reduce `pb-3` headers to `pb-2`

**3. Reorder Sections**
New order from top to bottom:
1. Brand Identity Header (logo + name + plan -- merged)
2. Phone Verification (compact inline)
3. Verified Business Badge
4. Team Access
5. Company Information (collapsed/compact)
6. Account Information (collapsed/compact)

**4. Compact Company & Account Info**
Merge "Company Information" and "Account Information" into a single "Account Details" card with tighter row spacing (`py-1.5` instead of `py-2`).

### File to Edit

**`src/components/brand-dashboard/BrandAccountTab.tsx`**
- Remove separate "Subscription Plan" and "Brand Logo" cards
- Create a combined brand identity header card at the top with logo, name, plan badge, and upgrade button
- Reduce all padding: CardHeader `p-4 pb-2`, CardContent `p-4 pt-0`
- Merge Company + Account info into one card
- Tighten spacing throughout (`space-y-3`, `py-1.5` on rows, `gap-2` instead of `gap-3`)
- Smaller avatar in the header (`h-14 w-14` instead of `h-16 w-16`)

### Technical Details

All changes are CSS/layout only within `BrandAccountTab.tsx`. No database, API, or component interface changes needed. The `UpgradePlanDialog`, `BrandVerificationBadgeCard`, and `TeamAccessCard` components remain unchanged -- only their wrapper spacing is tightened via the parent's `space-y-3`.
