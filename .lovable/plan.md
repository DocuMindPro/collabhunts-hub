

## Reduce Featuring Prices by 50%

### Single File Change

**File: `src/config/featuring-tiers.ts`**

Update all `pricePerWeek` values to half their current amounts:

| Tier | Current | New |
|------|---------|-----|
| Featured Badge | 2900 ($29) | 1450 ($15) |
| Homepage Spotlight | 4900 ($49) | 2450 ($25) |
| Category Boost | 3900 ($39) | 1950 ($20) |
| Auto Popup | 7900 ($79) | 3950 ($40) |

Prices display via the shared `formatFeaturingPrice` helper which rounds to whole dollars, so the displayed prices will be $15, $25, $20, and $40 per week respectively.

This single config file controls both the creator-facing UI (BoostProfileDialog, FeaturingTab) and the admin-facing display, so all references update automatically.

No database or backend changes needed -- pricing is front-end config only.
