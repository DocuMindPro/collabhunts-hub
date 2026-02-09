

## Compact & Professional Creator Profile Tab Redesign

### Problem
The Profile tab has 9 separate full-width cards stacked vertically, each with generous p-6 padding and large headers. This creates excessive scrolling and a fragmented, bloated feel. Sections like Location (3 small inputs), Categories (a row of pills), and Demographics (4 dropdowns) each occupy their own oversized card unnecessarily.

### Solution
Consolidate related sections, reduce padding, and use multi-column layouts to create a dense, professional settings page -- similar to Stripe or Linear account settings.

### Changes (single file: `src/components/creator-dashboard/ProfileTab.tsx`)

**1. Merge "Basic Information" + "Location" + "Categories" + "Demographics" into one card**
- Single card titled "Profile Details" with internal section dividers (thin borders, not separate cards)
- Display Name + Bio in the first section
- Location fields in a 3-column grid row (already exists but inside its own card)
- Categories as a compact pill row (no card wrapper)
- Demographics in a 2x2 grid with languages below
- Each sub-section separated by a slim `<Separator />` instead of a full card boundary

**2. Reduce all card padding**
- CardHeader: `p-4` instead of default `p-6`
- CardContent: `p-4 pt-0` instead of default `p-6 pt-0`
- Inner spacing: `space-y-4` reduced to `space-y-3` where appropriate

**3. Compact the "Your Media" card**
- Profile image section: reduce avatar from `h-28 w-28` to `h-20 w-20`
- Cover images: reduce gap, keep grid but tighter
- Remove verbose helper text, keep only essential hints inline

**4. Compact the "Privacy & Visibility Settings" card**
- Remove the outer colored border/bg styling -- use a standard card
- Remove inner `p-4` boxes around each toggle -- use simple flex rows with less padding (`py-3`)
- Remove separators between toggles (the flex rows provide enough visual separation)

**5. Compact the "Phone Number" card**
- Merge into the consolidated "Profile Details" card as another section
- Reduce the verified display from a full bordered box to an inline row

**6. Reduce CardTitle sizes**
- Use `text-base` instead of default `text-2xl` for card titles
- Use `text-sm` for card descriptions

**7. Sticky save button**
- Make the "Save Changes" button sticky at the bottom of the viewport so users don't have to scroll all the way down

### Result
The Profile tab will go from ~9 separate cards to ~4 compact cards:
1. **Your Media** (profile image + covers + portfolio -- compacted)
2. **Profile Details** (name, bio, phone, location, categories, demographics, languages -- all consolidated)
3. **Privacy & Visibility** (3 toggles in compact rows)
4. **Social Accounts** / **Verification** / **Team Access** (these remain separate as they are self-contained components)

This reduces vertical scrolling by roughly 40-50% while keeping all functionality intact.

### Technical Details

- All changes are in `src/components/creator-dashboard/ProfileTab.tsx`
- No database changes required
- No new dependencies needed
- The sub-components (`SocialAccountsSection`, `VerificationBadgeCard`, `TeamAccessCard`, `PortfolioUploadSection`) remain as-is since they are separate component files
- The save handler and all state management remain unchanged
