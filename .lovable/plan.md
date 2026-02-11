

## Replace Generic "New Opportunities" with Personalized "Matching Opportunities"

### Problem
1. The "This Week" summary card shows "X new opportunities" which is redundant
2. The "New Opportunities" section shows generic latest opportunities, not ones matched to the creator's stats

### Solution
Replace both with a smarter, personalized approach:

1. **Remove the "This Week" card entirely** (lines 263-300 in OverviewTab.tsx) -- the stat cards already cover key metrics
2. **Rename "New Opportunities" to "Opportunities For You"** and change the logic to show opportunities that match the creator's profile based on:
   - **Follower range match**: Compare creator's max follower count (from `creator_social_accounts`) against the opportunity's `follower_ranges` and `min_followers`
   - **Category match**: Compare creator's `categories` against `required_categories`
   - **Location match**: Compare creator's `location_city` against opportunity's `location_city`
3. **Remove the "Recommended For You" card** since it becomes redundant -- the main section now IS the recommendation
4. Remove the "X this week" badge from the header

### Matching Algorithm (Scoring)
Each open opportunity is scored against the creator:
- **+3 points**: Creator's follower count falls within one of the opportunity's `follower_ranges`
- **+2 points**: Creator shares at least one category with `required_categories`
- **+1 point**: Creator's city matches opportunity's `location_city`
- Show opportunities with score > 0, sorted by score descending, limit 5
- If no matches found, fall back to showing latest 3 open opportunities with a note "Browse all to find your match"

### What Will Change

| File | Change |
|------|--------|
| `src/components/creator-dashboard/OverviewTab.tsx` | Fetch creator's max follower count from `creator_social_accounts`. Remove "This Week" card. Merge "New Opportunities" and "Recommended For You" into a single "Opportunities For You" card with the scoring algorithm. Remove the weekly count badge. |

### Technical Details

The `fetchDashboardStats` function will be updated to:
1. Query `creator_social_accounts` for the creator's max `follower_count`
2. Query open `brand_opportunities` with all relevant fields including `follower_ranges` and `min_followers`
3. Score each opportunity using the algorithm above (using `checkFollowerEligibility` from `src/config/follower-ranges.ts`)
4. Display top 5 matches as "Opportunities For You" with a target icon

The section header will say "Opportunities For You" with a subtitle "Based on your profile and stats" instead of "New Opportunities" with "X this week".

