// Follower range configuration for opportunity targeting
export interface FollowerRange {
  key: string;
  label: string;
  min: number;
  max: number;
  description: string;
}

export const FOLLOWER_RANGES: Record<string, FollowerRange> = {
  nano: { 
    key: 'nano',
    label: 'Nano', 
    min: 1000, 
    max: 10000,
    description: '1K - 10K followers'
  },
  micro: { 
    key: 'micro',
    label: 'Micro', 
    min: 10000, 
    max: 50000,
    description: '10K - 50K followers'
  },
  mid_tier: { 
    key: 'mid_tier',
    label: 'Mid-tier', 
    min: 50000, 
    max: 100000,
    description: '50K - 100K followers'
  },
  macro: { 
    key: 'macro',
    label: 'Macro', 
    min: 100000, 
    max: 500000,
    description: '100K - 500K followers'
  },
  mega: { 
    key: 'mega',
    label: 'Mega', 
    min: 500000, 
    max: Infinity,
    description: '500K+ followers'
  },
};

export const FOLLOWER_RANGE_ORDER = ['nano', 'micro', 'mid_tier', 'macro', 'mega'];

/**
 * Check if a creator's follower count is eligible for the given ranges
 * @param maxFollowers The creator's highest follower count across all platforms
 * @param ranges Array of range keys (e.g., ['nano', 'micro'])
 * @returns true if eligible (or no ranges specified), false if not eligible
 */
export const checkFollowerEligibility = (
  maxFollowers: number, 
  ranges: string[] | null
): boolean => {
  // No restriction - all creators are eligible
  if (!ranges || ranges.length === 0) return true;
  
  // Check if the follower count falls within any of the selected ranges
  return ranges.some(rangeKey => {
    const range = FOLLOWER_RANGES[rangeKey];
    if (!range) return false;
    return maxFollowers >= range.min && maxFollowers < range.max;
  });
};

/**
 * Get a human-readable string for the required ranges
 * @param ranges Array of range keys
 * @returns Formatted string like "Micro, Mid-tier creators"
 */
export const formatFollowerRanges = (ranges: string[] | null): string => {
  if (!ranges || ranges.length === 0) return 'All creator sizes';
  
  const labels = ranges
    .filter(key => FOLLOWER_RANGES[key])
    .map(key => FOLLOWER_RANGES[key].label);
  
  if (labels.length === 0) return 'All creator sizes';
  if (labels.length === 1) return `${labels[0]} creators`;
  
  return `${labels.join(', ')} creators`;
};

/**
 * Get the combined min/max range from selected ranges for display
 * @param ranges Array of range keys
 * @returns Object with min and max follower counts
 */
export const getCombinedRange = (ranges: string[] | null): { min: number; max: number } | null => {
  if (!ranges || ranges.length === 0) return null;
  
  const validRanges = ranges
    .filter(key => FOLLOWER_RANGES[key])
    .map(key => FOLLOWER_RANGES[key]);
  
  if (validRanges.length === 0) return null;
  
  const min = Math.min(...validRanges.map(r => r.min));
  const max = Math.max(...validRanges.map(r => r.max));
  
  return { min, max };
};

/**
 * Format a follower count for display
 * @param count The follower count
 * @returns Formatted string like "2.5K" or "1.2M"
 */
export const formatFollowerCount = (count: number): string => {
  if (count >= 1000000) {
    return `${(count / 1000000).toFixed(1)}M`.replace('.0M', 'M');
  }
  if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}K`.replace('.0K', 'K');
  }
  return count.toString();
};
