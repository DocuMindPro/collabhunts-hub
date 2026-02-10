export type FeatureType = 'featured_badge' | 'homepage_spotlight' | 'category_boost' | 'auto_popup';

export interface FeaturingTier {
  id: FeatureType;
  name: string;
  description: string;
  pricePerWeek: number; // in cents
  benefits: string[];
  icon: string;
  comingSoon?: boolean;
}

export const CREATOR_CATEGORIES = [
  { value: 'lifestyle', label: 'Lifestyle' },
  { value: 'fashion', label: 'Fashion' },
  { value: 'beauty', label: 'Beauty' },
  { value: 'travel', label: 'Travel' },
  { value: 'health_fitness', label: 'Health & Fitness' },
  { value: 'food_drink', label: 'Food & Drink' },
  { value: 'tech_gaming', label: 'Tech & Gaming' },
  { value: 'music_dance', label: 'Music & Dance' },
  { value: 'comedy', label: 'Comedy' },
  { value: 'business', label: 'Business' },
] as const;

export const FEATURING_TIERS: FeaturingTier[] = [
  {
    id: 'featured_badge',
    name: 'Featured Badge',
    description: '"Featured" badge + top of search results',
    pricePerWeek: 2900, // $29/week
    benefits: [
      'Featured badge on your profile',
      'Priority in search results',
      'Stand out from other creators'
    ],
    icon: 'Badge',
    comingSoon: true
  },
  {
    id: 'homepage_spotlight',
    name: 'Homepage Spotlight',
    description: 'Rotating spotlight on homepage',
    pricePerWeek: 4900, // $49/week
    benefits: [
      'Featured on homepage carousel',
      'Maximum visibility to brands',
      'Includes Featured badge'
    ],
    icon: 'Star',
    comingSoon: true
  },
  {
    id: 'category_boost',
    name: 'Category Boost',
    description: 'Top of your category results',
    pricePerWeek: 3900, // $39/week
    benefits: [
      'Top position in your category',
      'Targeted visibility',
      'Great for niche creators'
    ],
    icon: 'TrendingUp',
    comingSoon: true
  },
  {
    id: 'auto_popup',
    name: 'Auto Popup',
    description: 'Profile pops up for brands on first visit',
    pricePerWeek: 7900, // $79/week
    benefits: [
      'Automatic profile popup for new brands',
      'Highest visibility option',
      'Includes all other features'
    ],
    icon: 'Sparkles',
    comingSoon: true
  }
];

export const getFeaturingTier = (id: FeatureType): FeaturingTier | undefined => {
  return FEATURING_TIERS.find(tier => tier.id === id);
};

export const formatFeaturingPrice = (cents: number): string => {
  return `$${(cents / 100).toFixed(0)}`;
};
