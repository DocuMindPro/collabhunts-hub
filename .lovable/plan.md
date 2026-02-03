

# Modernize Advanced Filters for Event-Based Platform

## Current State Analysis

The Advanced Filters panel currently includes filters optimized for generic influencer marketing:
- Age Range
- Gender  
- Ethnicity
- Language
- Followers by Platform

**Problem**: These filters don't align with the new event-focused identity. Brands booking creators for live events at their venues need to find creators **by location** first and foremost.

## Proposed Changes

### 1. Add Location Filters (Priority)

Add cascading location dropdowns at the TOP of Advanced Filters:
- **Country** dropdown (populated from existing `COUNTRY_LOCATIONS` data)
- **Region/State** dropdown (dynamically filtered by country)
- **City** dropdown (dynamically filtered by region)

This aligns with the creator onboarding system that already collects `location_country`, `location_state`, and `location_city`.

### 2. Reorder Filters by Relevance

New order prioritizing event booking use case:
1. **Location** (NEW - Country → Region → City cascade)
2. **Language** (important for local markets like Lebanon)
3. **Followers by Platform** (still relevant for reach)
4. Age Range (demote - less critical for events)
5. Gender (demote - less critical for events)
6. Ethnicity (consider removing - sensitive data, rarely used for event booking)

### 3. Remove or Simplify Low-Value Filters

**Consider removing Ethnicity filter:**
- Sensitive personal data
- Not typically a booking criterion for live events
- Simplifies the UI and reduces potential discrimination concerns

### 4. Add Event-Specific Filters (Optional Enhancement)

Consider adding:
- **Available Packages** - Filter by creators offering specific services (Unbox & Review, Social Boost, Meet & Greet, etc.)
- **Open to Free Invites** toggle - Quick filter for creators accepting product-only deals

---

## Technical Implementation

### Files to Modify

| File | Changes |
|------|---------|
| `src/pages/Influencers.tsx` | Add location state, import LocationSelect, add filtering logic |
| `src/components/LocationSelect.tsx` | Already exists, reusable for filters |

### New State Variables
```typescript
const [selectedCountry, setSelectedCountry] = useState("all");
const [selectedState, setSelectedState] = useState("");
const [selectedCity, setSelectedCity] = useState("");
```

### Filter Logic Addition
```typescript
// Location filter
if (selectedCountry !== "all") {
  matchesAdvanced = matchesAdvanced && 
    creator.location_country === selectedCountry;
}
if (selectedState) {
  matchesAdvanced = matchesAdvanced && 
    creator.location_state === selectedState;
}
if (selectedCity) {
  matchesAdvanced = matchesAdvanced && 
    creator.location_city === selectedCity;
}
```

### UI Layout

```text
┌─────────────────────────────────────────────────────────────┐
│ Advanced Filters                              [Clear Filters]│
├─────────────────────────────────────────────────────────────┤
│ LOCATION                                                     │
│ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐             │
│ │ Country ▼   │ │ Region ▼    │ │ City ▼      │             │
│ └─────────────┘ └─────────────┘ └─────────────┘             │
├─────────────────────────────────────────────────────────────┤
│ LANGUAGE                                                     │
│ ┌───────────────────────┐                                   │
│ │ All Languages ▼       │                                   │
│ └───────────────────────┘                                   │
├─────────────────────────────────────────────────────────────┤
│ FOLLOWERS BY PLATFORM                                        │
│ ┌─────────────┐ ┌─────────────────────────┐                 │
│ │ Platform ▼  │ │ Min followers           │                 │
│ └─────────────┘ └─────────────────────────┘                 │
├─────────────────────────────────────────────────────────────┤
│ AGE RANGE                                    18 - 65+ years │
│ ●━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━●│
├─────────────────────────────────────────────────────────────┤
│ GENDER                                                       │
│ ○ Male    ○ Female    ○ Non-binary                          │
└─────────────────────────────────────────────────────────────┘
```

---

## Summary of Changes

| Change | Reason |
|--------|--------|
| Add Country/Region/City filters | Core need for event-based booking |
| Move Location to top | Most important filter for local events |
| Keep Language filter | Important for Lebanese market |
| Keep Followers filter | Still relevant for reach |
| Demote Age/Gender | Less critical for events |
| Remove Ethnicity | Sensitive, rarely used, simplifies UI |
| Reuse LocationSelect component | Consistent UX with onboarding |

