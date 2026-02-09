

## Professional Redesign: Brand Registration Prompt

### Problem
The current popup uses rounded pill-shaped benefit rows, a large orange icon, and heavy gradient accent that gives it a playful, consumer-app feel rather than a professional B2B aesthetic.

### Design Direction
Inspired by Stripe, Linear, and Vercel modal patterns -- minimal, high-contrast, confident typography with subtle depth.

### Changes (single file: `src/components/BrandRegistrationPrompt.tsx`)

**Visual overhaul:**

1. **Remove the gradient accent bar** at the top -- replace with a clean, subtle top border or nothing
2. **Replace the large orange icon** with a smaller, understated icon inside a soft muted circle (not a bold gradient square)
3. **Typography**: Use tighter, bolder heading (`text-xl font-bold tracking-tight`) and a shorter, punchier subtitle
4. **Benefits list**: Replace the pill-shaped rows with a minimal checklist layout -- simple checkmarks with `text-sm` text, no background pills, no borders, just clean vertical list with subtle gray check icons
5. **CTA button**: Use a solid dark button (not bright orange gradient) with confident copy -- a clean `bg-foreground text-background` or primary with less visual noise, no arrow icon
6. **Add a subtle "Skip" or "Maybe Later" text link** below the CTA so it doesn't feel like a trap (currently the dialog blocks all interaction with no way out)
7. **Spacing**: Tighten padding from `p-8` to `p-6`, reduce `space-y-6` to `space-y-4`
8. **Overall card**: Add `rounded-xl` with subtle shadow, remove the harsh gradient bar

### Result
A clean, confident, business-grade modal that feels like a premium SaaS product rather than a children's app -- clear value prop, minimal decoration, strong CTA.

### Technical Details
- Single file change: `src/components/BrandRegistrationPrompt.tsx`
- No new dependencies
- No database changes
- Uses existing UI primitives (Button, Dialog)

