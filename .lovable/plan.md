
# Update Live Competition & Custom Experience Package Cards

## Overview
Modify the **Live Competition** and **Custom Experience** package cards to remove pricing and add a "Contact Us" button. These packages require consultation to determine pricing based on individual creator rates.

## Changes Required

### 1. Update Package Configuration
**File: `src/config/packages.ts`**

| Package | Change |
|---------|--------|
| `competition` | Set `priceRange: null` (removes price display) |
| `competition` | Remove `upsells` array (no fixed add-on pricing) |

The `custom` package already has `priceRange: null`, so no change needed there.

### 2. Update PackageCard Component
**File: `src/components/brand/PackageCard.tsx`**

| Change | Details |
|--------|---------|
| Add "Contact Us" button | For packages where `priceRange` is `null` |
| Conditional price display | Only show price range for Social Boost and Meet & Greet |
| Remove upsells section | Don't show for competition/custom (since pricing is custom) |
| Import Button and Link | For the contact button navigation |

### Visual Result

**Social Boost & Meet & Greet:**
- Shows price range ($200-$500, $400-$900)
- Shows duration
- Shows all deliverables
- Shows upsells if available

**Live Competition & Custom Experience:**
- Shows duration (for competition: 2-6 hours)
- Shows description and deliverables
- **No price displayed**
- **"Contact Us" button** linking to `/contact?subject=Live%20Competition%20Inquiry` or similar
- Removes add-on pricing references

### Contact Button Behavior
The button will navigate to `/contact` with a prefilled subject (e.g., "Live Competition Inquiry" or "Custom Experience Inquiry") so your team knows exactly what package the brand is interested in.
