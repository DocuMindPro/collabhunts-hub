
# Show Minimum Follower Count on Opportunity Cards

## What Changes
On the opportunity card, replace the tier name display (e.g., "Micro, Mid-tier, Mega creators") with the minimum follower count derived from the selected ranges (e.g., "Min. 10K followers").

## How It Works
The `getCombinedRange` function already calculates the overall min from selected ranges. We just need to use it for display instead of `formatFollowerRanges`.

## Code Change

### `src/pages/Opportunities.tsx` (around line 463-466)

Replace:
```
<span>{formatFollowerRanges(opportunity.follower_ranges)}</span>
```

With:
```
<span>Min. {formatFollowerCount(combinedRange?.min || 0)} followers</span>
```

This will show:
- Nano selected -> "Min. 1K followers"
- Micro + Mid-tier + Mega selected -> "Min. 10K followers"
- Macro only -> "Min. 100K followers"

One file changed, one line updated.
