

## World-Class Brand Account Tab Redesign

### Design Philosophy

Inspired by premium SaaS account pages (Linear, Stripe, Vercel), this redesign focuses on: a bold brand identity hero, visual hierarchy through subtle gradients, and consolidated sections that reduce card count while increasing polish.

### Changes (all in `src/components/brand-dashboard/BrandAccountTab.tsx`)

**1. Premium Brand Identity Hero**
Replace the current plain card with a visually striking header:
- Subtle gradient background (`bg-gradient-to-r from-primary/5 via-primary/3 to-transparent`)
- Larger logo (`h-16 w-16`) with a ring/border accent and shadow
- Company name in `text-xl font-bold` with the plan badge inline
- Email shown as secondary text directly under name (removes need from Account Details)
- "Member since" as a subtle tertiary line
- Upgrade button styled as a gradient pill (`bg-gradient-to-r from-primary to-primary/80 text-white`)

**2. Two-Column Grid for Status Cards**
Place Phone Verification and Verification Badge side-by-side on desktop using `grid grid-cols-1 md:grid-cols-2 gap-3`. This cuts vertical height in half and looks more professional. Both cards get matching compact styling.

**3. Refined Phone Verification Card**
- Remove CardHeader entirely; use a single-line inline layout with icon + title + status + action button all in one row
- Only expand to a multi-line form when editing

**4. Streamlined Account Details**
- Remove Company row (already shown in hero)
- Remove Email row (already shown in hero) 
- Remove Member Since (already shown in hero)
- Keep only: Industry, Size, Website, Location as a minimal detail grid
- Use a borderless design with alternating subtle backgrounds instead of border-b lines

**5. Team Access Card**
- Compact header matching other cards (`p-4 pb-2`, `text-sm` title)
- Reduce locked-state padding

**6. Overall Spacing**
- Container: `space-y-2.5` (tighter than current `space-y-3`)
- Max width stays `max-w-3xl`

### Visual Result

```text
+--------------------------------------------------+
| [Logo 16x16]  CompanyName   [Free badge]         |
|               email@email.com                     |
|               Member since Feb 3, 2026   [Upgrade]|
+--------------------------------------------------+
| Phone Verification    | Verified Business Badge   |
| No phone · [Add]      | Phone required first      |
+--------------------------------------------------+
| Team Access                                       |
| Pro plan required · [View Plans]                  |
+--------------------------------------------------+
| Account Details                                   |
| Industry ............ Tech                        |
| Location ............ Lebanon                     |
| Website ............. collabhunts.com             |
+--------------------------------------------------+
```

### Technical Details

- Single file change: `src/components/brand-dashboard/BrandAccountTab.tsx`
- No new components, no database changes
- Tailwind-only styling with existing utility classes
- Child components (`BrandVerificationBadgeCard`, `TeamAccessCard`) remain unchanged; only wrapper layout and the main tab file change
