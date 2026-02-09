

## Fix Missing Badges on Creator Profile Page

### Problem
The discovery cards on `/influencers` show up to 5 badges (Vetted, Featured, VIP, Responds Fast, Free Invites), but the creator profile page (`/creator/:id`) only renders 2 badges: Vetted and VIP. The profile page is missing Featured, Responds Fast, and Free Invites badges entirely.

### Root Cause
The `CreatorProfile.tsx` page:
1. Does not fetch `is_featured` or `avg_response_minutes` from the `creator_profiles` table
2. Does not import `FeaturedBadge` or `RespondsFastBadge` components
3. Only renders `VettedBadge` and `VIPCreatorBadge` in both mobile and desktop badge rows

### Changes (single file: `src/pages/CreatorProfile.tsx`)

**1. Add missing data fields to the `CreatorData` interface**
- Add `is_featured: boolean | null`
- Add `avg_response_minutes: number | null`

**2. Add missing imports**
- Import `FeaturedBadge` from `@/components/FeaturedBadge`
- Import `RespondsFastBadge` from `@/components/RespondsFastBadge`

**3. Fetch the missing fields from the database**
- The query already uses `select("*")`, so `is_featured` and `avg_response_minutes` are already returned -- just need to map them into state

**4. Update state mapping in `fetchCreatorProfile`**
- Add `is_featured: profileData.is_featured` and `avg_response_minutes: profileData.avg_response_minutes` to the state object

**5. Update badge rendering (mobile, line ~589 and desktop, line ~669)**
Both badge rows currently show only:
```
<VettedBadge variant="pill" size="sm" />
{isVIP(creator) && <VIPCreatorBadge variant="pill" size="sm" />}
```

Will be updated to show all 5 badges, matching the Influencers page logic:
```
<VettedBadge variant="pill" size="sm" />
{creator.is_featured && <FeaturedBadge variant="pill" size="sm" />}
{isVIP(creator) && <VIPCreatorBadge variant="pill" size="sm" />}
{creator.avg_response_minutes !== null && creator.avg_response_minutes <= 1440 && (
  <RespondsFastBadge variant="pill" size="sm" />
)}
{creator.open_to_invitations && (
  <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-500 rounded-full text-white text-xs font-semibold">
    <span className="inline-block w-2 h-2 bg-white rounded-full animate-pulse" />
    Free Invites
  </span>
)}
```

### Result
All badges that appear on discovery cards will now also appear on the creator profile page, ensuring consistency across views.
