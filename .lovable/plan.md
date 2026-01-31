

# Remove Workshop Package

## Overview
Remove the "workshop" package from the event packages configuration since it's not relevant to your current offerings.

## Changes Required

### File: `src/config/packages.ts`

| Change | Details |
|--------|---------|
| Update `PackageType` | Remove `'workshop'` from the union type |
| Remove package data | Delete the `workshop` object from `EVENT_PACKAGES` |
| Update `PACKAGE_ORDER` | Remove `'workshop'` from the display order array |

### Before vs After

**PackageType:**
```typescript
// Before
export type PackageType = 'social_boost' | 'meet_greet' | 'workshop' | 'competition' | 'custom';

// After
export type PackageType = 'social_boost' | 'meet_greet' | 'competition' | 'custom';
```

**PACKAGE_ORDER:**
```typescript
// Before
export const PACKAGE_ORDER: PackageType[] = ['social_boost', 'meet_greet', 'workshop', 'competition', 'custom'];

// After
export const PACKAGE_ORDER: PackageType[] = ['social_boost', 'meet_greet', 'competition', 'custom'];
```

## Final Package List
After this change, the platform will offer 4 packages:

1. **Social Boost** - $200-$500 (venue visits)
2. **Meet & Greet Event** - $400-$900 (fan appearances)
3. **Live Competition** - $800-$2,000 (competitions/tombolas)
4. **Custom Experience** - Custom pricing

