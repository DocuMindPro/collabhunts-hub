

## Redesign Brand Opportunity Cards (Dashboard View)

### Problem
The current opportunity cards in the Brand Dashboard "Opps" tab are plain and text-heavy with minimal visual hierarchy. They show only basic metadata (title, status, package type, date, applications, spots, budget) in a flat list format with no description preview, no location, no deliverables preview, no deadline info, and no visual distinction between card types.

### Solution
Redesign the `BrandOpportunitiesTab` cards to be richer, more visually polished, and information-dense -- following dashboard card best practices.

### Changes (single file: `src/components/brand-dashboard/BrandOpportunitiesTab.tsx`)

**1. Add a `views_count` column to the database**
- Add an integer `views_count` column (default 0) to `brand_opportunities` so brands can see how many creators viewed their posting
- This will be incremented on the public Opportunities page when a creator views the card details

**2. Fetch additional data**
- Include `is_featured`, `requirements`, `location_city`, `location_country`, `follower_ranges`, `start_time`, `end_time`, `description` in the interface (already fetched via `select("*")`)
- Add `views_count` to the interface after the migration

**3. Redesigned card layout**

Each opportunity card will have:

```text
+------------------------------------------------------+
| [Package Icon]  Title                    [Status] [...] |
| Brand Package Name  *  Location  *  Date + Time        |
|------------------------------------------------------|
| Description preview (2 lines, truncated)              |
|                                                       |
| [Deliverables pill] [Follower target pill]            |
|                                                       |
| +----------+ +----------+ +----------+ +----------+  |
| | 0 Views  | | 0 Apps   | | 3 Spots  | | $50/ea   |  |
| +----------+ +----------+ +----------+ +----------+  |
|                                                       |
| [Deadline badge if set]    [View Applications button] |
+------------------------------------------------------+
```

Key visual improvements:
- **Package-colored left accent border** (blue for Social Boost, purple for Meet and Greet, orange for Unbox and Review, gray for Custom)
- **Stats grid** with 4 mini stat cards (Views, Applications, Spots Left, Budget) using icons and subtle backgrounds
- **Description preview** truncated to 2 lines with `line-clamp-2`
- **Deliverables preview** showing first 2 items from the package includes as small pills
- **Follower targeting** shown as a compact badge when set
- **Location** shown with MapPin icon
- **Time range** shown when start/end times exist
- **Application deadline** shown as a countdown/warning badge when approaching
- **Featured glow** ring effect on featured opportunities matching the public board style
- **Progress bar** for spots filled (visual fill indicator)

**4. Increment views on the public Opportunities page**
- In `src/pages/Opportunities.tsx`, add a lightweight view counter that increments `views_count` when a creator scrolls an opportunity card into view (using IntersectionObserver or on card render)

### Database Migration
```sql
ALTER TABLE brand_opportunities 
ADD COLUMN views_count integer NOT NULL DEFAULT 0;
```

### Files to Edit
- `src/components/brand-dashboard/BrandOpportunitiesTab.tsx` -- full card redesign
- `src/pages/Opportunities.tsx` -- add view count increment on card visibility

