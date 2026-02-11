

## Expand Content Deliverables and Multi-Platform Story Upsells

### The Approach

After analyzing how your platform is structured, here is what makes the most sense:

**Standard Packages (Unbox & Review, Social Boost, Meet & Greet):**
These have locked deliverables -- that's by design and should stay that way. But the "Stories Upsell" section should expand beyond just Instagram to let creators set per-platform story prices for Instagram, TikTok, and Facebook Stories. This gives brands clear add-on options without disrupting the fixed package structure.

**Custom Experience:**
This is where the Collabstr-style deliverables builder belongs. When a creator selects Custom Experience, they get a content builder to add individual line items like:
- 1 Instagram Reel (30s) -- $500
- 2 TikTok Videos (60s) -- $900  
- 3 Instagram Stories -- $150

This lets creators showcase exactly what they offer, and brands can see a clear menu of options.

### What Changes

#### 1. New Database Table: `creator_service_deliverables`

Stores individual content line items linked to a creator's service/package:

| Column | Type | Purpose |
|--------|------|---------|
| id | UUID | Primary key |
| creator_service_id | UUID | Links to the parent package |
| platform | TEXT | instagram, tiktok, facebook, youtube |
| content_type | TEXT | reel, story, video, short, post, ugc_ad |
| quantity | INTEGER | Number of pieces (e.g., 2 videos) |
| duration_seconds | INTEGER | Video duration (optional) |
| price_cents | INTEGER | Price for this deliverable |
| description | TEXT | Optional custom note |
| sort_order | INTEGER | Display ordering |
| created_at | TIMESTAMPTZ | Timestamp |

RLS policies will allow creators to manage their own deliverables and anyone to read active ones.

#### 2. Standard Packages -- Multi-Platform Story Add-ons

Replace the single "Instagram Stories Upsell" input with a clean section showing three toggleable story options:

```text
+------------------------------------------+
|  Story Add-ons (optional)                |
|                                           |
|  [x] Instagram Stories    $ [20]          |
|  [ ] TikTok Stories       $ [--]          |
|  [ ] Facebook Stories     $ [--]          |
|                                           |
|  Brands can add stories to their booking  |
+------------------------------------------+
```

Each platform can be toggled on/off with its own price. This replaces the single `story_upsell_price_cents` column -- the new deliverables table stores each one as a separate row with `content_type = 'story'`.

#### 3. Custom Experience -- Content Deliverables Builder

When "Custom Experience" is selected, show a deliverables builder below the description:

```text
+------------------------------------------+
|  Your Content Menu                        |
|                                           |
|  Platform: [Instagram v]                  |
|  Type:     [Reel v]                       |
|  Qty:      [1]    Duration: [30s v]       |
|  Price:    $ [500]                        |
|  [+ Add Deliverable]                      |
|                                           |
|  --- Added ---                            |
|  1x Instagram Reel (30s)       $500   [x] |
|  2x TikTok Video (60s)        $900   [x] |
|  3x Instagram Story            $150   [x] |
+------------------------------------------+
```

Available platforms: Instagram, TikTok, Facebook, YouTube
Available content types per platform:
- Instagram: Reel, Story, Post, Carousel
- TikTok: Video, Story
- Facebook: Story, Post, Reel
- YouTube: Video, Short

#### 4. Display on Creator Profile

On the public creator profile page, the Custom Experience card will show the deliverables menu so brands can see exactly what the creator offers and at what price, similar to the Collabstr screenshots.

#### 5. Update ServicesTab Display

The services list in the creator dashboard will show story add-on indicators for standard packages and a deliverables summary for Custom Experience packages.

### Technical Details

**Files to create:**
- Database migration for `creator_service_deliverables` table with RLS

**Files to modify:**
- `src/components/creator-dashboard/ServiceEditDialog.tsx` -- Add multi-platform story toggles for standard packages + deliverables builder for Custom Experience
- `src/components/creator-dashboard/ServicesTab.tsx` -- Show deliverables/add-ons in the service cards
- `src/pages/CreatorProfile.tsx` -- Display deliverables on the public profile for Custom Experience packages
- `src/config/packages.ts` -- Add platform/content type constants for the deliverables builder

