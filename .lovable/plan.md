

## Reorder Basic Plan Features

The Basic plan's feature list has "Priority visibility" (included) appearing after "Team access" (excluded), which looks inconsistent. The fix is to reorder so all included items come first, then all excluded items.

### Change in `src/components/brand/BrandPricingSection.tsx`

Swap the order of "Team access (invite members)" and "Priority visibility" in the Basic plan:

**Before:**
1. Verified Business Badge (included)
2. Team access (invite members) (excluded)
3. Priority visibility (included)
4. Dedicated CSM (excluded)

**After:**
1. Verified Business Badge (included)
2. Priority visibility (included)
3. Team access (invite members) (excluded)
4. Dedicated CSM (excluded)

One line swap -- no other files affected.

