

## Add Zero Platform Fees Emphasis to /brand Page

### Problem
The /brand page mentions "$0 Platform Fees" in a small floating card on the hero image and as one of four benefit cards, but it doesn't have a dedicated, high-impact section that really drives home the zero-fee value proposition -- the platform's strongest selling point.

### Solution
Add a bold, standalone "Zero Fees" banner section between the Benefits and How It Works sections. This will be a visually striking, full-width section with:

### Design

A centered, compact callout with:
- A large animated "$0" counter (using the existing `AnimatedCounter` component pattern) as the visual anchor
- Bold headline: "Zero Platform Fees. Ever."
- Subtext explaining the direct-payment model
- Three inline trust pills: "No commissions", "No hidden charges", "Direct payments"
- Subtle orange gradient background accent with a GlowCard wrapper for premium feel

### Technical Details

**File: `src/pages/Brand.tsx`**
- Add a new section between the Benefits section (line ~298) and How It Works section (line ~300)
- Import `AnimatedCounter` from `@/components/home/AnimatedCounter`
- The section uses existing components: `AnimatedSection`, `GlowCard`
- No new files, no new dependencies, no database changes

### Visual Structure (approximate)

```text
+--------------------------------------------------+
|              $0                                   |
|     Zero Platform Fees. Ever.                     |
|  Negotiate directly with creators. No commissions,|
|  no middleman, no hidden charges.                 |
|                                                   |
|  [No Commissions] [No Hidden Fees] [Direct Pay]  |
+--------------------------------------------------+
```

Also update the Final CTA section (line ~484) to reinforce "zero fees" in its subtitle text.

