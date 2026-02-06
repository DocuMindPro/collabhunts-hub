

# Fix: Featured Badge Overlapping Rating Star

## Problem
On the /influencers discovery cards, when a creator has multiple badges (Vetted, Featured, VIP Creator, Responds Fast, Free Invites), they wrap into multiple rows and overlap the rating star badge in the top-right corner.

## Solution

Two small changes to the badge container on discovery cards:

### 1. Increase right margin on badge container
Change `right-12` to `right-14` on the badges wrapper (line 481 in Influencers.tsx) to give more clearance from the rating badge.

### 2. Reduce pill badge text and padding
Make all pill badges more compact by reducing horizontal padding from `px-2.5` to `px-2` and keeping the `text-xs` size. This applies to:
- `VettedBadge.tsx` -- pill variant padding
- `FeaturedBadge.tsx` -- pill variant padding  
- `VIPCreatorBadge.tsx` -- pill variant padding and shorten label from "VIP Creator" to "VIP"
- `RespondsFastBadge.tsx` -- pill variant padding and shorten label from "Responds Fast" to "Fast"

### Files to Modify
- `src/pages/Influencers.tsx` (line 481) -- increase `right-12` to `right-14`
- `src/components/VettedBadge.tsx` -- reduce pill padding
- `src/components/FeaturedBadge.tsx` -- reduce pill padding
- `src/components/VIPCreatorBadge.tsx` -- reduce pill padding, shorten label
- `src/components/RespondsFastBadge.tsx` -- reduce pill padding, shorten label
