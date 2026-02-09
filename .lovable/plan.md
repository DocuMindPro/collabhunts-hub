

## Expand "Available Across Lebanon" to Middle East Coverage

### What Changes

**1. Update `src/config/lebanese-market.ts`** -- Add a new `MIDDLE_EAST_CITIES` array containing major cities from key Middle East countries alongside the existing Lebanese cities:

- **Lebanon**: Keep all 10 existing cities (Beirut, Jounieh, Tripoli, etc.)
- **UAE**: Dubai, Abu Dhabi, Sharjah
- **Saudi Arabia**: Riyadh, Jeddah, Dammam
- **Kuwait**: Kuwait City
- **Qatar**: Doha
- **Bahrain**: Manama
- **Jordan**: Amman
- **Egypt**: Cairo, Alexandria
- **Oman**: Muscat

Each entry will include a `country` field for grouping (e.g., `{ value: 'dubai', label: 'Dubai', country: 'UAE' }`).

**2. Update `src/pages/Brand.tsx`** -- Change the section to reflect the broader scope:

- Title: "Available Across Lebanon" → **"Available Across the Middle East"**
- Subtitle: "Host events in major cities" → **"Host events and collaborations across the region"**
- Render cities grouped by country, with country labels as subtle headers
- Import and use the new `MIDDLE_EAST_CITIES` array instead of only `LEBANESE_CITIES`
- Lebanon cities listed first (since it's the primary market), then other countries alphabetically

### Technical Details

- The existing `LEBANESE_CITIES` array stays untouched (used elsewhere in onboarding, filters, etc.)
- A new exported constant `MIDDLE_EAST_CITIES` combines Lebanese cities + regional cities
- The Brand page section will show country group headers in a clean chip/badge layout

