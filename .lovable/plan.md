

# Fix Overlapping Badges on Creator Discovery Cards

## Problem

On the `/influencers` page, the "Open to Free Invites" banner (absolutely positioned at `bottom-[72px]`) overlaps with the "Vetted" and "VIP Creator" pill badges in the bottom overlay. These are placed in different containers with conflicting positions.

## Solution

Consolidate all badges into a single horizontal row at the **top-left** of the card (matching the Collabstr reference where "Top Creator" and "Responds Fast" sit side by side). This eliminates overlap entirely.

### Layout (Collabstr-inspired)

All badges in one `flex-wrap` row at the top-left:

```
[Platform + Followers] [Vetted] [Featured] [VIP] [Open to Free Invites]
```

Each badge is a pill with icon + text, spaced with `gap-1.5`, wrapping to next line if needed.

## Changes in `src/pages/Influencers.tsx`

### 1. Move Vetted and VIP badges from bottom overlay to the top-left badge row (lines 454-466)

Merge the current top-left area (Platform/Followers + Featured) with Vetted, VIP, and Open to Free Invites into a single container:

```tsx
<div className="absolute top-3 left-3 right-12 flex flex-wrap items-center gap-1.5 z-10">
  {/* Platform badge */}
  <div className="flex items-center gap-1.5 px-2.5 py-1 bg-black/60 backdrop-blur-sm rounded-full text-white text-xs font-medium">
    <PlatformIcon className="h-3.5 w-3.5" />
    <span>{formatFollowers(mainPlatform.followers)}</span>
  </div>
  {/* Vetted */}
  <VettedBadge variant="pill" size="sm" showTooltip={false} />
  {/* Featured */}
  {creator.is_featured && <FeaturedBadge variant="pill" size="sm" showTooltip={false} />}
  {/* VIP */}
  {isCreatorVIP(creator) && <VIPCreatorBadge variant="pill" size="sm" showTooltip={false} />}
  {/* Open to Free Invites */}
  {creator.open_to_invitations && (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-green-500 rounded-full text-white text-xs font-semibold">
      <span className="inline-block w-2 h-2 bg-white rounded-full animate-pulse" />
      Free Invites
    </span>
  )}
</div>
```

### 2. Remove the separate "Open to Invitations Banner" block (lines 468-476)

Delete the absolutely positioned banner that causes overlap.

### 3. Remove badge row from bottom overlay (lines 486-490)

Remove the Vetted/VIP badges from the bottom since they're now at the top. The bottom overlay will only show creator name and category.

### 4. Add FeaturedBadge import

Replace the inline Featured badge JSX with the `FeaturedBadge` component (already imported but not used here -- needs to be added to imports).

## Files to Modify

| File | Change |
|------|--------|
| `src/pages/Influencers.tsx` | Consolidate all badges into single top-left row; remove bottom badge row and separate invitation banner |

