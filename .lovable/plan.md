

## Full Audit and Fix: All Paid Features

### Problems Found

**A. Featured Opportunities (brands pay $25 extra)**
- The `is_featured` flag is commented out in `CreateOpportunityDialog.tsx` (line 272) and never saved
- No `is_featured` column exists on `brand_opportunities` table
- The Opportunities page does not sort featured posts to the top or show a "Featured" badge

**B. Creator Profile Boosts ($29-$79/week)**
- `BoostProfileDialog` inserts records directly without going through `MockPaymentDialog` -- creators get boosts for free
- `homepage_spotlight`: CreatorSpotlight component sorts by `featuring_priority` which partially works, but does not specifically filter for creators with an active `homepage_spotlight` featuring record
- `category_boost`: No implementation on the Influencers discovery page to prioritize creators within their boosted category
- `auto_popup`: No popup implementation anywhere for brands visiting the site

**C. Admin Feature Overrides**
- Brand section only shows "Verified Business Badge" toggle -- no ability to manually grant featuring/boost to brands (or featured opportunity posts)
- Creator featuring toggles work correctly (insert into `creator_featuring` with 1-year duration)
- Need to keep both automatic (paid) and manual (admin override) paths working together

### Implementation Plan

**1. Database: Add `is_featured` column to `brand_opportunities`**
- Add `is_featured BOOLEAN DEFAULT false` to `brand_opportunities`

**2. Fix Featured Opportunity Posting (CreateOpportunityDialog)**
- Uncomment `is_featured: isFeatured` (line 272) so the flag is saved after payment
- Also save `is_featured` for free-post path when `wantsFeatured` is selected (the featured add-on toggle should still cost $25 even for free-post users, or be free for Pro -- needs decision, but current logic skips payment entirely for Pro/verified)

**3. Featured Opportunities Display (Opportunities page)**
- Sort `filteredOpportunities` so `is_featured` posts appear first
- Add a "Featured" badge (amber/gold) on featured opportunity cards
- Add a subtle highlight/border on featured cards

**4. Fix Creator Boost Payment Flow (BoostProfileDialog)**
- Integrate `MockPaymentDialog` before inserting the featuring record
- Only insert the `creator_featuring` record after successful mock payment (same pattern as VIP badge and brand verification)

**5. Implement Homepage Spotlight Logic (CreatorSpotlight)**
- After fetching creators, prioritize those with active `homepage_spotlight` featuring records by querying `creator_featuring` and moving them to the front
- Already partially working via `featuring_priority` sort, but should explicitly check for active `homepage_spotlight` records

**6. Implement Category Boost Logic (Influencers page)**
- When displaying filtered results by category, sort creators who have an active `category_boost` for that specific category to the top
- Query `creator_featuring` with `feature_type = 'category_boost'` and match against the selected category filter

**7. Auto Popup -- Mark as "Coming Soon"**
- This requires a complex popup system for brand visitors. Rather than building it half-baked, mark it as "Coming Soon" in the BoostProfileDialog and disable purchase
- Add a "Coming Soon" badge on the Auto Popup tier card

**8. Admin Feature Overrides -- No changes needed for brands**
- Brand featuring/boosting isn't part of the product (brands don't appear in a discovery page like creators do)
- The current brand section correctly shows only "Verified Business Badge" since that's the only brand-specific paid feature
- Admin Subscriptions tab (separate) handles plan management
- Creator featuring toggles already work correctly for manual overrides

### Files to Create/Modify

| File | Change |
|------|--------|
| `brand_opportunities` table | Add `is_featured` boolean column (migration) |
| `CreateOpportunityDialog.tsx` | Uncomment `is_featured` flag, save it |
| `Opportunities.tsx` | Sort featured first, add badge + highlight |
| `BoostProfileDialog.tsx` | Add `MockPaymentDialog` payment step |
| `CreatorSpotlight.tsx` | Prioritize `homepage_spotlight` records |
| `Influencers.tsx` | Sort by active `category_boost` when category filter is active |
| `featuring-tiers.ts` | Mark `auto_popup` as coming soon |
| `FeaturingTab.tsx` | Show "Coming Soon" for auto_popup |

### What Already Works Correctly
- Creator VIP Badge ($99/year) -- uses MockPaymentDialog, saves to DB
- Brand Verified Business Badge ($99/year) -- uses MockPaymentDialog, saves to DB, requires admin approval
- Admin Feature Overrides for creators -- toggles work, insert/deactivate featuring records
- Admin Subscriptions tab -- separate, manages brand plans with custom dates
- Creator featuring display on Influencers page -- sorts VIP first, then featured
- FeaturedBadge component -- renders correctly on creator cards

