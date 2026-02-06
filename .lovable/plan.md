

# Align Brand Onboarding and Welcome Pages with Platform Identity

## Problem

The onboarding and welcome pages still use campaign/content-marketing language that doesn't match the platform's identity as a **zero-fee discovery marketplace for event bookings**. Specific issues:

1. **IntentStep**: Options say "One-time campaign", "Ongoing content" -- should reflect event booking intent
2. **BudgetStep**: Ranges are too high ($1K-$10K+) and descriptions say "campaigns" -- should reflect per-event budgets
3. **BrandWelcome**: "How It Works" step 2 says "Workshop, or Competition" -- should use actual package names; step 3 says "Host & Earn" which doesn't make sense for brands

---

## Changes

### 1. `src/components/brand-onboarding/IntentStep.tsx`

Update the 3 intent options to match event booking:

| Current | Updated |
|---------|---------|
| "One-time campaign" / "I need creators for a specific campaign or launch" | "Book a one-time event" / "I'm looking for a creator for a specific event" |
| "Ongoing content" / "I want to build long-term creator relationships" | "Recurring collaborations" / "I want to work with creators on a regular basis" |
| "Just exploring" / "I'm researching the platform and options" | "Just exploring" / "I'm browsing creators and packages available" |

### 2. `src/components/brand-onboarding/BudgetStep.tsx`

Lower the budget ranges to reflect realistic per-event pricing and remove "campaigns" wording:

| Current | Updated |
|---------|---------|
| "Under $1,000" / "Small-scale campaigns" | "Under $200" / "Product reviews, small events" |
| "$1,000 - $5,000" / "Mid-sized campaigns" | "$200 - $500" / "Social boosts, meet & greets" |
| "$5,000 - $10,000" / "Major campaigns" | "$500 - $1,500" / "Larger events, multi-day" |
| "$10,000+" / "Enterprise-level" | "$1,500+" / "Premium experiences" |

Also change the title from "What's your monthly budget?" to "What's your budget per event?" and subtitle to "This helps us recommend the right creators and packages".

### 3. `src/pages/BrandWelcome.tsx`

Update the "How It Works" steps:

| Step | Current | Updated |
|------|---------|---------|
| 1 | "Browse Creators" / "Find creators who match your brand's vibe and audience" | "Browse Creators" / "Discover creators by category, location, and availability" |
| 2 | "Book an Event" / "Select a package: Meet & Greet, Workshop, or Competition" | "Send an Inquiry" / "Choose a package and message the creator directly" |
| 3 | "Host & Earn" / "Attract new customers and create memorable experiences" | "Collaborate" / "Finalize details, sign an agreement, and host your event" |

Also update the hero subtitle from "creators ready to host events at your venue" to "creators ready to collaborate with your brand", and the fallback text from "Connect with talented creators and host unforgettable events" to "Connect with talented creators and grow your brand".

---

## Files to Modify

| File | Change |
|------|--------|
| `src/components/brand-onboarding/IntentStep.tsx` | Update 3 intent options text |
| `src/components/brand-onboarding/BudgetStep.tsx` | Lower budget ranges, update labels |
| `src/pages/BrandWelcome.tsx` | Update "How It Works" steps and hero copy |

