

## Reframe Cities Section to "Not Limited" Messaging

### Problem
The current "Available Across the Middle East" section with a fixed list of cities implies brands can ONLY host in those locations, which is limiting.

### Solution
Rebrand the section to frame the cities as popular/trending locations while making it clear the platform works anywhere.

### Changes to `src/pages/Brand.tsx`

1. **Update section title**: "Available Across the Middle East" → **"Popular Locations"**
2. **Update subtitle**: → **"Creators and brands are active in these cities — but you can host from anywhere"**
3. **Add a subtle note** below the city chips: a small text line like "Don't see your city? No problem — CollabHunts works wherever you are." with a Globe icon, styled as muted text centered below the grid.

### Technical Details

Only one file needs editing: `src/pages/Brand.tsx` (lines ~400-432 in the Middle East Cities section).

- Change the `h2` heading text
- Change the `p` subtitle text  
- Add a closing `p` element after the city grid with a Globe icon and reassuring copy
- No changes to the data source or `lebanese-market.ts` — the same cities still display, just reframed as "popular" rather than "available"
