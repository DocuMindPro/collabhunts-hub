
# Emphasize Zero Fees and Confidentiality on Homepage

## Overview
Add prominent $0 fees messaging and a new confidentiality/privacy section throughout the homepage. The zero-fee message will appear in more places, and a dedicated "Trust & Privacy" banner will highlight that only creators can see brands and only brands can see creators.

## Changes

### 1. Hero Sub-headline Enhancement (`src/pages/Index.tsx`, ~line 161-164)
- Add a bold inline "$0 fees" callout in the hero description text
- Change to: "Discover vetted creators for brand events, content, and collaborations. Connect directly, negotiate your own terms -- **$0 platform fees, always.**"

### 2. New Trust Banner Below Hero Stats (`src/pages/Index.tsx`, ~line 216-237)
- Add a subtle inline trust strip below the animated stats with two key points:
  - A `ShieldCheck` icon + "Zero Fees -- No commissions, no hidden charges"
  - A `EyeOff` icon + "Private by Design -- Brands and creators see only each other"
- Styled as a compact row with muted background pills, matching the existing design language

### 3. Update Benefits Array (`src/pages/Index.tsx`, ~line 124-129)
- Replace the existing "Zero Platform Fees" benefit card with a stronger description: "No commissions, no hidden charges, no subscription required to connect. You keep 100% of every deal."
- Add a 5th benefit card for confidentiality:
  - Icon: `ShieldCheck`
  - Title: "Private & Confidential"
  - Description: "Only brands see creators. Only creators see brands. Your data stays between you."
- Change grid to `lg:grid-cols-5` (or keep 4 and swap one less important card)

### 4. Dedicated "Zero Fees + Privacy" Section (`src/pages/Index.tsx`)
- Add a new full-width banner section between BentoGrid and Benefits
- Left side: Large "$0" animated counter with "Zero Fees. Zero Commissions. Zero Catches." heading
- Right side: A `ShieldCheck` icon card explaining the confidentiality model: "Your marketplace is private. Brands only see creator profiles. Creators only see brand opportunities. No public exposure, no competitor snooping."
- Use `GlowCard` with gradient background for visual impact
- This becomes the primary trust-building section

### 5. Update BentoGrid Step 2 Description (`src/components/home/BentoGrid.tsx`, ~line 25)
- Change "No middlemen involved." to "No middlemen, no fees, complete privacy."

### 6. Update PlatformFeatures Subtitle (`src/components/home/PlatformFeatures.tsx`, ~line 129-131)
- Add "All at zero cost" to the subtitle: "Every tool you need, from first message to final delivery -- all at zero cost"

### 7. CTA Cards Enhancement (`src/pages/Index.tsx`, ~line 326, 366)
- Add a small "$0 fees" badge/pill below each CTA card description to reinforce the message one more time before the user clicks

## Files

| File | Action |
|------|--------|
| `src/pages/Index.tsx` | Add trust banner, new section, update benefits, enhance CTAs |
| `src/components/home/BentoGrid.tsx` | Update step 2 description |
| `src/components/home/PlatformFeatures.tsx` | Update subtitle |

## Visual Result
The zero-fee message will appear in 6 places across the homepage (hero text, hero stats, trust banner, dedicated section, benefits card, CTA cards). The confidentiality feature will appear in 3 places (trust banner, dedicated section, benefits card). This creates strong reinforcement without feeling repetitive, as each instance uses a different visual treatment.
