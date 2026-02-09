

## Restrict Team Invites to Basic/Pro Brands

### Changes

**1. Update pricing feature cards** (`src/components/brand/BrandPricingSection.tsx`)
- Add "Team access (invite members)" as a feature to both **Basic** and **Pro** plans (included: true)
- Add the same feature to the **Free** plan with included: false (shown as unavailable)

**2. Gate TeamAccessCard for brands** (`src/components/brand-dashboard/BrandAccountTab.tsx`)
- Before rendering `TeamAccessCard`, fetch the brand's current subscription plan using `getCurrentPlanType`
- If the plan is `free` (not basic or pro), show a locked/upgrade message instead of the invite form, with a link to the pricing section on the /brand page

**3. Update TeamAccessCard** (`src/components/team/TeamAccessCard.tsx`)
- Add an optional `locked` prop (with an upgrade message) so the card can display a "this feature requires Basic or Pro" state when the brand is on the Free plan
- When locked, hide the invite form and show an upgrade prompt instead
- Creator accounts will remain unrestricted (no plan gating for creators)

### Technical Details

**BrandPricingSection.tsx** -- add to feature arrays:
- Free plan: `{ text: "Team access (invite members)", included: false }`
- Basic plan: `{ text: "Team access (invite members)", included: true }`
- Pro plan: `{ text: "Team access (invite members)", included: true }`

**BrandAccountTab.tsx** -- add subscription check:
- Import `getCurrentPlanType` from `@/lib/subscription-utils`
- Fetch plan type in a `useEffect` alongside the existing brand profile fetch
- Pass a `locked` boolean and upgrade message to `TeamAccessCard` when plan is `free`

**TeamAccessCard.tsx** -- add locked state:
- Accept optional `locked?: boolean` and `lockedMessage?: string` props
- When `locked` is true, render an upgrade prompt (with a link to `/brand#pricing`) instead of the invite form and delegates list

No database changes required.

