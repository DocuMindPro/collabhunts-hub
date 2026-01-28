// Event-based package configuration for in-person creator experiences
// Single source of truth for all event package data

export type PackageType = 'meet_greet' | 'workshop' | 'competition' | 'custom';

export interface EventPackage {
  name: string;
  description: string;
  priceRange: { min: number; max: number } | null; // in cents, null for custom
  defaultDuration: number | null; // in hours
  includes: string[];
  idealFor: string[];
}

export const EVENT_PACKAGES: Record<PackageType, EventPackage> = {
  meet_greet: {
    name: 'Meet & Greet',
    description: 'Creator meets fans at your venue with live social coverage',
    priceRange: { min: 30000, max: 80000 }, // $300-$800
    defaultDuration: 3,
    includes: [
      '3 hours at venue',
      'Live social coverage',
      '5 content pieces',
      'Photo opportunities with fans',
      'Social media posts from venue',
    ],
    idealFor: ['Cafes', 'Restaurants', 'Retail stores', 'Pop-up events'],
  },
  workshop: {
    name: 'Workshop',
    description: 'Creator hosts an educational or creative session',
    priceRange: { min: 50000, max: 120000 }, // $500-$1,200
    defaultDuration: 2,
    includes: [
      '2-hour workshop session',
      'Ticket sales management',
      'Professional content capture',
      'Q&A session',
      'Workshop materials coordination',
    ],
    idealFor: ['Studios', 'Gyms', 'Creative spaces', 'Educational venues'],
  },
  competition: {
    name: 'Competition Event',
    description: 'Two creators face off in an exciting PK challenge',
    priceRange: { min: 80000, max: 200000 }, // $800-$2,000
    defaultDuration: 4,
    includes: [
      '2 creators',
      '4 hours of entertainment',
      'PK challenge format',
      'Highlight reel video',
      'Live streaming support',
      'Winner announcement ceremony',
    ],
    idealFor: ['Malls', 'Large venues', 'Entertainment centers', 'Gaming cafes'],
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

// Package type ordering for display
export const PACKAGE_ORDER: PackageType[] = ['meet_greet', 'workshop', 'competition', 'custom'];
