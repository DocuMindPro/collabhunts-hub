

# Update Event Packages to New Detailed Structure

## Overview
Update the package configuration to include detailed pre-event, during-event, and post-event deliverables, plus upsell options for "Meet & Greet Event" and "Live Competition" packages.

## Current vs New Structure

### Package 2: Meet & Greet Event

| Aspect | Current | New |
|--------|---------|-----|
| Price | $300-$800 | $400-$900 |
| Duration | 3 hours | 3 hours |
| Includes | 5 basic items | 12+ detailed items across 3 phases |
| Upsells | None | 3 options ($150-$200 each) |

### Package 3: Live Competition

| Aspect | Current | New |
|--------|---------|-----|
| Price | $800-$2,000 | $800-$2,000 (same) |
| Duration | 4 hours | 4 hours |
| Structure | Single format | 2 options (Creator vs Creator / Fan Competition) |
| Upsells | None | 4 options ($100-$300 each) |

## New Data Structure

To support the richer package data, we need to extend the `EventPackage` interface:

```typescript
export interface PackagePhase {
  title: string;
  items: string[];
}

export interface UpsellOption {
  id: string;
  name: string;
  description: string;
  priceCents: number;
}

export interface PackageVariant {
  id: string;
  name: string;
  description: string;
  includes: string[];
}

export interface EventPackage {
  name: string;
  description: string;
  priceRange: { min: number; max: number } | null;
  defaultDuration: number | null;
  includes: string[]; // Quick summary (backwards compatible)
  phases?: PackagePhase[]; // Pre/During/Post breakdown
  variants?: PackageVariant[]; // Option A/B for competition
  upsells?: UpsellOption[]; // Add-on options
  idealFor: string[];
}
```

## Package Details

### Meet & Greet Event ($400-$900, 3 hours)

**Pre-Event (1 week before):**
- 1 announcement video: "I'll be at [Venue] on [Date]!"
- 3 countdown stories

**During Event (3 hours):**
- Creator present at venue
- Live interaction with fans
- Photos with attendees
- Special offers/discounts promoted

**Post-Event:**
- 1 recap video
- 3 highlight stories
- Attendee testimonials collected

**Upsell Options:**
- +$150: Professional photographer
- +$200: Extra hour
- +$100: Custom discount codes

### Live Competition ($800-$2,000, 4 hours)

**Option A: Creator vs Creator Challenge**
- 2 creators compete in brand-related challenge
- Live stream on both creators' channels
- Audience voting determines winner
- Prizes sponsored by brand

**Option B: Fan Competition/Tombola**
- Creator hosts game/raffle at venue
- Tickets sold (revenue share with brand)
- Live entertainment/interaction
- Prizes = brand products/services

**Includes (both options):**
- 2 weeks pre-promotion
- 4-hour live event
- Post-event highlight reel
- Sales/lead tracking
- Professional setup assistance

**Upsell Options:**
- +$300: Second creator
- +$200: Professional streaming setup
- +$150: Prize package sponsorship
- +$100: Advanced analytics

## Files to Modify

| File | Changes |
|------|---------|
| `src/config/packages.ts` | Extended interface + updated package data |
| `src/pages/Brand.tsx` | Enhanced package display with phases/variants |
| `src/components/EventBookingDialog.tsx` | Show phases, variants selector, upsell checkboxes |

## Implementation Details

### 1. `src/config/packages.ts`

```typescript
// New interfaces added
export interface PackagePhase {
  title: string;
  items: string[];
}

export interface UpsellOption {
  id: string;
  name: string;
  description: string;
  priceCents: number;
}

export interface PackageVariant {
  id: string;
  name: string;
  description: string;
}

// Updated meet_greet package
meet_greet: {
  name: 'Meet & Greet Event',
  description: 'Creator appearance with full promotional coverage',
  priceRange: { min: 40000, max: 90000 }, // $400-$900
  defaultDuration: 3,
  includes: [
    '1-week pre-event promotion',
    '3 hours at venue',
    'Live fan interaction & photos',
    'Recap video & stories',
  ],
  phases: [
    {
      title: 'Pre-Event (1 week before)',
      items: [
        '1 announcement video',
        '3 countdown stories',
      ],
    },
    {
      title: 'During Event (3 hours)',
      items: [
        'Creator present at venue',
        'Live interaction with fans',
        'Photos with attendees',
        'Special offers/discounts promoted',
      ],
    },
    {
      title: 'Post-Event',
      items: [
        '1 recap video',
        '3 highlight stories',
        'Attendee testimonials collected',
      ],
    },
  ],
  upsells: [
    { id: 'photographer', name: 'Professional Photographer', description: 'Pro photos of the event', priceCents: 15000 },
    { id: 'extra_hour', name: 'Extra Hour', description: '+1 hour venue time', priceCents: 20000 },
    { id: 'discount_codes', name: 'Custom Discount Codes', description: 'Trackable promo codes', priceCents: 10000 },
  ],
  idealFor: ['Stores', 'Boutiques', 'Entertainment venues'],
}

// Updated competition package
competition: {
  name: 'Live Competition',
  description: 'Exciting competition event with live audience engagement',
  priceRange: { min: 80000, max: 200000 }, // $800-$2,000
  defaultDuration: 4,
  includes: [
    '2 weeks pre-promotion',
    '4-hour live event',
    'Post-event highlight reel',
    'Sales/lead tracking',
    'Professional setup assistance',
  ],
  variants: [
    {
      id: 'creator_vs_creator',
      name: 'Creator vs Creator Challenge',
      description: '2 creators compete in brand-related challenge with live streaming',
    },
    {
      id: 'fan_competition',
      name: 'Fan Competition/Tombola',
      description: 'Creator hosts game/raffle with ticket sales and prizes',
    },
  ],
  upsells: [
    { id: 'second_creator', name: 'Second Creator', description: 'Add another creator', priceCents: 30000 },
    { id: 'streaming_setup', name: 'Professional Streaming', description: 'Pro streaming equipment', priceCents: 20000 },
    { id: 'prize_package', name: 'Prize Package Sponsorship', description: 'Branded prize setup', priceCents: 15000 },
    { id: 'analytics', name: 'Advanced Analytics', description: 'Detailed engagement report', priceCents: 10000 },
  ],
  idealFor: ['Malls', 'Large venues', 'Product launches'],
}
```

### 2. `src/pages/Brand.tsx` - Enhanced Package Cards

Update the package display section to show:
- Phase breakdown (Pre/During/Post) for meet_greet
- Variant options (A/B) for competition
- Upsell options as "Add-ons available" badges

### 3. `src/components/EventBookingDialog.tsx` - Booking Flow Updates

- For competition package: Add variant selector (Option A or B)
- Add upsell checkboxes to step 2
- Calculate total including selected upsells
- Store selected upsells in booking data

## Visual Preview

**Brand Page Package Card (Meet & Greet):**
```text
+----------------------------------+
| Meet & Greet Event               |
| $400 - $900                      |
| ⏱ 3 hours                        |
+----------------------------------+
| Pre-Event:                       |
|   ✓ 1 announcement video         |
|   ✓ 3 countdown stories          |
| During Event:                    |
|   ✓ Creator at venue             |
|   ✓ Fan photos & interaction     |
| Post-Event:                      |
|   ✓ Recap video + stories        |
+----------------------------------+
| 💎 Add-ons available             |
+----------------------------------+
```

**Booking Dialog (Competition):**
```text
+----------------------------------+
| Choose Competition Type:         |
| ○ Creator vs Creator Challenge   |
| ○ Fan Competition/Tombola        |
+----------------------------------+
| Add-ons:                         |
| ☐ +$300 Second Creator           |
| ☐ +$200 Professional Streaming   |
| ☐ +$150 Prize Package            |
| ☐ +$100 Advanced Analytics       |
+----------------------------------+
| Estimated Total: $1,100          |
+----------------------------------+
```

## Summary

1. **Extend `EventPackage` interface** with phases, variants, and upsells
2. **Update package data** with detailed breakdown matching your specs
3. **Enhance Brand page** to show rich package details
4. **Update booking dialog** with variant selection and upsell checkboxes
5. **Backward compatible** - existing bookings and components continue to work

