// Event-based package configuration for in-person creator experiences
// Single source of truth for all event package data

export type PackageType = 'social_boost' | 'meet_greet' | 'competition' | 'custom';

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
  priceRange: { min: number; max: number } | null; // in cents, null for custom
  defaultDuration: number | null; // in hours
  includes: string[]; // Quick summary for backwards compatibility
  phases?: PackagePhase[]; // Pre/During/Post breakdown
  variants?: PackageVariant[]; // Option A/B for packages with variants
  upsells?: UpsellOption[]; // Add-on options
  idealFor: string[];
}

export const EVENT_PACKAGES: Record<PackageType, EventPackage> = {
  social_boost: {
    name: 'Social Boost',
    description: 'Creator visits your venue and creates engaging content',
    priceRange: { min: 20000, max: 50000 }, // $200-$500
    defaultDuration: 2,
    includes: [
      '1-2 hour venue visit',
      '1 Instagram Reel (permanent)',
      '1 TikTok video',
      '3 Instagram Stories',
      'Tag & location in all posts',
      'Honest review with CTA',
    ],
    phases: [
      {
        title: 'During Visit (1-2 hours)',
        items: [
          'Creator visits venue',
          'Tries product/service',
          'Captures content on-site',
        ],
      },
      {
        title: 'Content Delivered',
        items: [
          '1 Instagram Reel (permanent post)',
          '1 TikTok video (same content)',
          '3 Instagram Stories (during/post visit)',
          'Tag & location in all posts',
        ],
      },
      {
        title: 'Call-to-Action',
        items: [
          'Creator\'s honest review/experience',
          '"You should check this place out!" CTA',
        ],
      },
    ],
    idealFor: ['Restaurants', 'Cafes', 'New openings', 'Boutiques'],
  },
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
  },
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
        includes: [
          '2 creators compete in brand-related challenge',
          'Live stream on both creators\' channels',
          'Audience voting determines winner',
          'Prizes sponsored by brand',
        ],
      },
      {
        id: 'fan_competition',
        name: 'Fan Competition/Tombola',
        description: 'Creator hosts game/raffle with ticket sales and prizes',
        includes: [
          'Creator hosts game/raffle at venue',
          'Tickets sold (revenue share with brand)',
          'Live entertainment/interaction',
          'Prizes = brand products/services',
        ],
      },
    ],
    upsells: [
      { id: 'second_creator', name: 'Second Creator', description: 'Add another creator', priceCents: 30000 },
      { id: 'streaming_setup', name: 'Professional Streaming', description: 'Pro streaming equipment', priceCents: 20000 },
      { id: 'prize_package', name: 'Prize Package Sponsorship', description: 'Branded prize setup', priceCents: 15000 },
      { id: 'analytics', name: 'Advanced Analytics', description: 'Detailed engagement report', priceCents: 10000 },
    ],
    idealFor: ['Malls', 'Large venues', 'Product launches'],
  },
  custom: {
    name: 'Custom Experience',
    description: 'Tailored experience designed for your specific needs',
    priceRange: null, // Variable pricing
    defaultDuration: null,
    includes: [
      'Tailored to your needs',
      'Multi-day options available',
      'Custom content deliverables',
      'Dedicated event coordinator',
    ],
    idealFor: ['Brand launches', 'Special occasions', 'Multi-location events'],
  },
};

// Platform fee configuration
export const PLATFORM_FEE_PERCENT = 15;
export const DEPOSIT_PERCENT = 50;

// Escrow statuses
export type EscrowStatus = 'pending_deposit' | 'deposit_paid' | 'completed' | 'refunded' | 'disputed';

export const ESCROW_STATUSES: Record<EscrowStatus, { label: string; color: string }> = {
  pending_deposit: { label: 'Awaiting Deposit', color: 'yellow' },
  deposit_paid: { label: 'Deposit Received', color: 'blue' },
  completed: { label: 'Payment Released', color: 'green' },
  refunded: { label: 'Refunded', color: 'red' },
  disputed: { label: 'Under Dispute', color: 'orange' },
};

// Event types
export type EventType = 'appearance' | 'workshop' | 'competition' | 'brand_activation' | 'private';

export const EVENT_TYPES: Record<EventType, string> = {
  appearance: 'Fan Appearance',
  workshop: 'Workshop',
  competition: 'Competition',
  brand_activation: 'Brand Activation',
  private: 'Private Event',
};

// Venue types
export type VenueType = 'cafe' | 'restaurant' | 'mall' | 'gym' | 'studio' | 'retail' | 'entertainment' | 'other';

export const VENUE_TYPES: Record<VenueType, string> = {
  cafe: 'Café',
  restaurant: 'Restaurant',
  mall: 'Shopping Mall',
  gym: 'Gym / Fitness Center',
  studio: 'Studio',
  retail: 'Retail Store',
  entertainment: 'Entertainment Center',
  other: 'Other',
};

// Helper functions
export const getPackage = (packageType: PackageType): EventPackage => EVENT_PACKAGES[packageType];

export const formatPrice = (cents: number): string => 
  `$${(cents / 100).toFixed(0)}`;

export const formatPriceRange = (priceRange: { min: number; max: number } | null): string => {
  if (!priceRange) return 'Custom pricing';
  return `${formatPrice(priceRange.min)} - ${formatPrice(priceRange.max)}`;
};

export const calculatePlatformFee = (totalCents: number): number => 
  Math.round(totalCents * (PLATFORM_FEE_PERCENT / 100));

export const calculateCreatorEarnings = (totalCents: number): number => 
  totalCents - calculatePlatformFee(totalCents);

export const calculateDeposit = (totalCents: number): number => 
  Math.round(totalCents * (DEPOSIT_PERCENT / 100));

export const calculateUpsellsTotal = (selectedUpsellIds: string[], packageType: PackageType): number => {
  const pkg = EVENT_PACKAGES[packageType];
  if (!pkg.upsells) return 0;
  return pkg.upsells
    .filter(upsell => selectedUpsellIds.includes(upsell.id))
    .reduce((total, upsell) => total + upsell.priceCents, 0);
};

// Package type ordering for display
export const PACKAGE_ORDER: PackageType[] = ['social_boost', 'meet_greet', 'competition', 'custom'];
