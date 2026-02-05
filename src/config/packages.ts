// Event-based package configuration for in-person creator experiences
// Single source of truth for all event package data

export type PackageType = 'unbox_review' | 'social_boost' | 'meet_greet' | 'competition' | 'custom';

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
  durationRange: { min: number; max: number } | null; // in hours, null for custom
  includes: string[]; // Quick summary for backwards compatibility
  phases?: PackagePhase[]; // Pre/During/Post breakdown
  variants?: PackageVariant[]; // Option A/B for packages with variants
  upsells?: UpsellOption[]; // Add-on options
  idealFor: string[];
}

export const EVENT_PACKAGES: Record<PackageType, EventPackage> = {
  unbox_review: {
    name: 'Unbox & Review',
    description: 'Send your product to a creator for an authentic unboxing and review from home',
    priceRange: null,
    durationRange: null, // Flexible - typically 3-7 days after product receipt
    includes: [
      'Product shipped to creator',
      '1 Instagram Reel or TikTok video',
      'Honest review with product highlights',
      'Brand tagged in all posts',
    ],
    phases: [
      {
        title: 'Product Delivery',
        items: [
          'Brand ships product to creator',
          'Creator confirms receipt',
        ],
      },
      {
        title: 'Content Creation',
        items: [
          'Unboxing video recorded',
          'Product review/demonstration',
          'Highlights key features & benefits',
        ],
      },
      {
        title: 'Content Posted',
        items: [
          'Reel/TikTok (permanent post)',
          'Brand tagged in all posts',
        ],
      },
    ],
    upsells: [
      { id: 'instagram_stories', name: 'Instagram Stories', description: 'Add story coverage for additional reach', priceCents: 0 },
    ],
    idealFor: ['E-commerce', 'Product launches', 'Beauty brands', 'Tech gadgets', 'Fashion'],
  },
  social_boost: {
    name: 'Social Boost',
    description: 'Creator visits your venue and creates engaging content',
    priceRange: null, // Custom pricing - depends on creator rates
    durationRange: { min: 1, max: 2 }, // 1-2 hours
    includes: [
      '1-2 hour venue visit',
      '1 Instagram Reel (permanent)',
      '1 TikTok video',
      'Tag & location in all posts',
      'Honest review with CTA',
    ],
    phases: [
      {
        title: 'During Visit',
        items: [
          'Creator visits venue',
          'Tries product/service',
          'Captures content on-site',
        ],
      },
      {
        title: 'Content Delivered',
        items: [
          'Instagram Reel (permanent post)',
          'TikTok video',
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
    upsells: [
      { id: 'instagram_stories', name: 'Instagram Stories', description: 'Add story coverage for additional reach', priceCents: 0 },
    ],
    idealFor: ['Restaurants', 'Cafes', 'New openings', 'Boutiques'],
  },
  meet_greet: {
    name: 'Meet & Greet',
    description: 'Creator appearance with full promotional coverage',
    priceRange: null, // Custom pricing - depends on creator rates
    durationRange: { min: 2, max: 4 }, // 2-4 hours
    includes: [
      '1-week pre-event promotion',
      '3 hours at venue',
      'Live fan interaction & photos',
      'Recap video',
    ],
    phases: [
      {
        title: 'Pre-Event',
        items: [
          'Announcement video',
        ],
      },
      {
        title: 'During Event',
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
          'Recap video',
          'Brand tagged in all posts',
        ],
      },
    ],
    upsells: [
      { id: 'instagram_stories', name: 'Instagram Stories', description: 'Add story coverage for additional reach', priceCents: 0 },
      { id: 'photographer', name: 'Professional Photographer', description: 'Pro photos of the event', priceCents: 15000 },
      { id: 'extra_hour', name: 'Extra Hour', description: '+1 hour venue time', priceCents: 20000 },
      { id: 'discount_codes', name: 'Custom Discount Codes', description: 'Trackable promo codes', priceCents: 10000 },
    ],
    idealFor: ['Stores', 'Boutiques', 'Entertainment venues'],
  },
  competition: {
    name: 'Live PK Battle',
    description: 'Live PK battles between creators at your venue - fans buy tickets to watch in person while streaming audiences tune in online',
    priceRange: null, // Custom pricing - requires consultation
    durationRange: { min: 2, max: 6 }, // 2-6 hours
    includes: [
      '2-week pre-event promotion & ticket sales',
      'Live PK battles at venue (3-4 min rounds)',
      'In-person fan experience with live viewing setup',
      'Dual exposure: live stream + venue foot traffic',
      'Full event management by CollabHunts',
      'Revenue share from ticket sales',
    ],
    phases: [
      {
        title: 'Pre-Event',
        items: [
          'Event announcement & creator lineup reveal',
          'Ticket sales promotion across social channels',
          'Hype content from participating creators',
        ],
      },
      {
        title: 'During Event',
        items: [
          'Live PK battles between creators',
          'In-person audience experience at your venue',
          'Dual-screen setup: live stream + venue display',
          'Real-time engagement from online & in-person fans',
        ],
      },
      {
        title: 'Post-Event',
        items: [
          'Highlight reels & best moments',
          'Recap content across creator channels',
          'Venue testimonials & attendance stats',
        ],
      },
    ],
    idealFor: ['Restaurants', 'Cafes', 'Entertainment venues', 'Malls'],
  },
  custom: {
    name: 'Custom Experience',
    description: 'Tailored experience designed for your specific needs',
    priceRange: null, // Variable pricing
    durationRange: null, // Variable duration
    includes: [
      'Tailored to your needs',
      'Multi-day options available',
      'Custom content deliverables',
      'Dedicated event coordinator',
    ],
    idealFor: ['Brand launches', 'Special occasions', 'Multi-location events'],
  },
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

export const calculateUpsellsTotal = (selectedUpsellIds: string[], packageType: PackageType): number => {
  const pkg = EVENT_PACKAGES[packageType];
  if (!pkg.upsells) return 0;
  return pkg.upsells
    .filter(upsell => selectedUpsellIds.includes(upsell.id))
    .reduce((total, upsell) => total + upsell.priceCents, 0);
};

// Package type ordering for display
export const PACKAGE_ORDER: PackageType[] = ['unbox_review', 'social_boost', 'meet_greet', 'competition', 'custom'];
