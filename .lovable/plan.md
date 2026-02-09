

## Further Compact the Creator Profile Tab

### What's Already Done
The `ProfileTab.tsx` file already has the consolidated layout from the previous update: merged cards, p-4 padding, text-base titles, sticky save, etc. The code changes ARE applied.

### What Still Looks Oversized (and why)

1. **Cover images** use `aspect-[4/5]` (portrait ratio) which takes significant vertical space
2. **SocialAccountsSection** component has its own large card with generous padding (not touched previously)
3. **VerificationBadgeCard** component uses default p-6 card padding with a large amber banner
4. **TeamAccessCard** component uses default p-6 card padding
5. **TabsContent wrapper** in `CreatorDashboard.tsx` has `space-y-6` adding extra gaps

### Changes

**File 1: `src/components/creator-dashboard/ProfileTab.tsx`**
- Reduce cover image aspect ratio from `aspect-[4/5]` to `aspect-[3/2]` (landscape) -- saves ~40% vertical space in the media section
- Reduce `space-y-4` between main cards to `space-y-3`

**File 2: `src/pages/CreatorDashboard.tsx`**
- Change `TabsContent` for profile from `space-y-6` to `space-y-4` to reduce gaps between sections

**File 3: `src/components/creator-dashboard/SocialAccountsSection.tsx`**
- Reduce CardHeader padding to `p-4` and CardTitle to `text-base`
- Reduce CardContent padding to `p-4 pt-0`
- Make social account rows more compact

**File 4: `src/components/creator-dashboard/VerificationBadgeCard.tsx`**
- Reduce CardHeader padding to `p-4` and CardTitle to `text-base`
- Reduce CardContent padding to `p-4 pt-0`
- Compact the inner status banner padding

**File 5: `src/components/team/TeamAccessCard.tsx`**
- Reduce CardHeader padding to `p-4` and CardTitle to `text-base`
- Reduce CardContent padding to `p-4 pt-0`

### Result
All sections on the Profile tab will use consistent compact padding and sizing, reducing total vertical scrolling by another ~30%.

