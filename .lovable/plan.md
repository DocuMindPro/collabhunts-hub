

## Fix Overlapping Badges on Mobile Creator Cards

### Problem

On mobile, creator cards on the `/influencers` page stack all badges (Vetted, Featured, VIP, Responds Fast, Free Invites) using `flex-wrap`, which causes them to cover the entire creator image when a creator has 3+ badges. The same issue exists on the homepage CreatorSpotlight cards.

### Solution

Limit badges shown on mobile to max 2, with remaining count shown as a "+N" indicator. On desktop, all badges display normally.

### Changes

**1. `src/pages/Influencers.tsx` (discovery cards, lines ~510-528)**

- Wrap the badge list in a mobile-aware container
- On mobile (below `sm`): show only the follower count pill + first qualifying badge, then a "+N" overflow indicator if more exist
- On desktop (`sm:` and up): show all badges as currently
- Reduce badge gap from `gap-1.5` to `gap-1` on mobile
- Reduce badge text/padding slightly on mobile: `px-1.5 py-0.5 text-[10px]` vs current `px-2.5 py-1 text-xs`

**2. `src/components/home/CreatorSpotlight.tsx` (homepage cards, lines ~199-208)**

- Apply the same mobile badge limiting logic
- On the 2-column mobile grid, these cards are even smaller, so limit to follower count + 1 badge max on mobile

### Technical Approach

For both files, collect all badges into an array, then render conditionally:

```text
Mobile:  [Followers] [First Badge] [+3 more]
Desktop: [Followers] [Vetted] [Featured] [VIP] [Fast] [Free Invites]
```

The "+N" indicator will be a small `bg-black/60 backdrop-blur-sm rounded-full text-white text-[10px]` pill matching the existing badge style.

Badge sizes on mobile will use smaller padding (`px-1.5 py-0.5`) and font (`text-[10px]`) to fit better in the constrained card width.

### Files to Edit

- `src/pages/Influencers.tsx` -- mobile badge overflow logic for discovery cards
- `src/components/home/CreatorSpotlight.tsx` -- same for homepage spotlight cards
