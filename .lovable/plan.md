

# Add "Responds Fast" Badge, Rating Filter, and Fix VIP References

## Overview

Three changes needed:
1. Replace "Filter by VIP" text in BentoGrid with proper wording (VIP is a paid tier, not a quality indicator)
2. Create a "Responds Fast" badge that auto-applies to creators who respond within 24 hours
3. Add "Responds Fast" and "Top Rated" filter toggles to the advanced filters panel

## Database Changes

### New columns on `creator_profiles`

Add two computed/cached columns to avoid expensive queries on every page load:

```sql
ALTER TABLE public.creator_profiles 
  ADD COLUMN avg_response_minutes integer DEFAULT NULL,
  ADD COLUMN average_rating numeric(3,2) DEFAULT NULL,
  ADD COLUMN total_reviews integer DEFAULT 0;
```

- `avg_response_minutes`: Updated whenever a creator sends a reply in a conversation. Calculated as the average time (in minutes) between a brand's message and the creator's first reply across recent conversations.
- `average_rating` and `total_reviews`: Cached from the reviews table (if exists) or set manually by admin for now.

### Database function to calculate response time

A trigger function on the `messages` table that, when a creator sends a message, calculates the time since the brand's last message in that conversation and updates `avg_response_minutes` on the creator's profile.

## New Component: `RespondseFastBadge.tsx`

A pill badge (matching the Collabstr "Responds Fast" reference screenshot) with a lightning bolt icon:

```
[Zap icon] Responds Fast
```

- Green/teal pill style similar to existing badges
- Only shown when `avg_response_minutes <= 1440` (24 hours)
- Displayed in the consolidated badge row on both `/influencers` cards and `CreatorSpotlight` cards

## Changes to `src/pages/Influencers.tsx`

### 1. Update interface and fetch query

Add `avg_response_minutes`, `average_rating`, `total_reviews` to `CreatorWithDetails` interface and the Supabase select query.

### 2. Add filter state variables

```tsx
const [respondsFast, setRespondsFast] = useState(false);
const [topRated, setTopRated] = useState(false);
```

### 3. Add filter logic

```tsx
if (respondsFast) {
  matchesAdvanced = matchesAdvanced && 
    (creator.avg_response_minutes !== null && creator.avg_response_minutes <= 1440);
}
if (topRated) {
  matchesAdvanced = matchesAdvanced && 
    (creator.average_rating !== null && creator.average_rating >= 4.0 && creator.total_reviews >= 3);
}
```

### 4. Add filter toggles to advanced filters panel

After the "Open to Free Invites" toggle, add two more toggles:

- **Responds Fast** (Zap icon): "Show only creators who typically respond within 24 hours"
- **Top Rated** (Star icon): "Show only creators rated 4.0+ with at least 3 reviews"

### 5. Add RespondseFastBadge to card badge row

In the consolidated top-left badge area, add:
```tsx
{creator.avg_response_minutes !== null && creator.avg_response_minutes <= 1440 && (
  <RespondsFastBadge variant="pill" size="sm" showTooltip={false} />
)}
```

### 6. Update `hasActiveAdvancedFilters` and `clearAdvancedFilters`

Include `respondsFast` and `topRated` in both.

## Changes to `src/components/home/BentoGrid.tsx`

Update Step 1 description from:
> "Filter by VIP status for premium talent."

To:
> "Filter by ratings and response time to find the best fit."

## Changes to `src/components/home/CreatorSpotlight.tsx`

Add `avg_response_minutes` to the fetch query and display the `RespondsFastBadge` in the badge row for qualifying creators.

## Files to Create

| File | Purpose |
|------|---------|
| `src/components/RespondsFastBadge.tsx` | New pill badge component (Zap icon + "Responds Fast") |

## Files to Modify

| File | Change |
|------|---------|
| `src/pages/Influencers.tsx` | Add filters, badge display, fetch new columns |
| `src/components/home/BentoGrid.tsx` | Fix "Filter by VIP" text |
| `src/components/home/CreatorSpotlight.tsx` | Add RespondseFastBadge to badge row |

## Database Migration

| Change | Details |
|--------|---------|
| Add columns to `creator_profiles` | `avg_response_minutes`, `average_rating`, `total_reviews` |
| Create trigger function | Auto-calculate avg response time on new messages |

