

## Collaboration Options Redesign + Dedicated Guide Pages

### Overview

Restructure the `/brand` page to move collaboration options below pricing, give each option its own section with rich explanations, and create dedicated guide pages for each collaboration type.

### Changes

**1. Restructure `/brand` page layout (Brand.tsx)**

Current section order:
```
Hero > Benefits > Collaboration Options (cards grid) > How It Works > Pricing > Venue Types > ...
```

New section order:
```
Hero > Benefits > How It Works > Pricing > Collaboration Options (individual sections) > Venue Types > ...
```

Remove the current 4-column card grid. Replace with individual, alternating-layout sections for each collaboration type (Unbox & Review, Social Boost, Meet & Greet, Live PK Battle, Custom Experience). Each section includes:
- Package name and short tagline
- 2-3 sentence explanation of the collaboration
- Key highlights (3-4 bullet points from the package phases)
- "Ideal for" tags
- A "Learn More" link that navigates to `/collaborations/{type-slug}`

Sections alternate left/right text alignment for visual variety (similar to feature showcase patterns).

**2. Create 5 new guide pages**

New route pages under `/collaborations/:slug`:
- `/collaborations/unbox-review`
- `/collaborations/social-boost`
- `/collaborations/meet-greet`
- `/collaborations/live-pk-battle`
- `/collaborations/custom-experience`

Each page covers the full process in a user-friendly, step-by-step format:

- **What is it?** - Clear explanation of the collaboration type
- **How it works** - Step-by-step process (browse creators, message, negotiate, sign agreement, execute, review)
- **What to expect** - Deliverables breakdown (pre/during/post phases from package config)
- **Best practices** - Tips for brands (e.g., "Always request a signed agreement so bookings appear on your Calendar", "Be clear about deliverables upfront", "Check creator reviews before booking")
- **Platform features to use** - Highlights of AI agreements, Calendar tracking, messaging
- **CTA** - "Find Creators" or "Contact Us" button depending on package type

**3. New shared component: CollaborationSection**

A reusable component for rendering each collaboration's section on the `/brand` page. Props: package data, index (for alternating layout), slug (for Learn More link).

**4. New page component: CollaborationGuide**

A single page component (`src/pages/CollaborationGuide.tsx`) that reads the `:slug` param, maps it to the package config, and renders the full guide content. Uses static content objects for best practices and process steps per collaboration type.

**5. Router update (App.tsx)**

Add route: `/collaborations/:slug` pointing to `CollaborationGuide`.

### Technical Details

**Files to create:**
- `src/components/brand/CollaborationSection.tsx` - Reusable section for each collab type on `/brand` page
- `src/pages/CollaborationGuide.tsx` - Full guide page with slug-based routing

**Files to modify:**
- `src/pages/Brand.tsx` - Remove card grid, add individual `CollaborationSection` components below `BrandPricingSection`, reorder sections
- `src/App.tsx` - Add `/collaborations/:slug` route

**Data approach:**
- Leverage existing `EVENT_PACKAGES` and `PACKAGE_ORDER` from `src/config/packages.ts` for deliverables and phase data
- Define guide-specific content (best practices, process steps, tips) as a static config object within `CollaborationGuide.tsx`, keyed by slug
- Map slugs to `PackageType`: `unbox-review` to `unbox_review`, `social-boost` to `social_boost`, etc.

**Design patterns:**
- Reuse existing `AnimatedSection`, `GlowCard`, and design tokens for consistency with the rest of the `/brand` page
- Guide pages use `Navbar`/`Footer` wrapper, accordion or vertical step layout for the process, and a final CTA section

