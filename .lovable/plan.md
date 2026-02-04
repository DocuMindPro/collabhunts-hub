

# Replace Minimum Followers with Multi-Select Follower Ranges

## Overview

Replace the single "Minimum Followers" number input in opportunity creation with a multi-select follower range system. When creators try to apply, automatically check their highest follower count against the selected ranges and block them with a clear explanation if they don't qualify.

---

## Current State vs New Behavior

| Aspect | Current | New |
|--------|---------|-----|
| **Opportunity Creation** | Single number input (e.g., 5000) | Multi-select checkboxes for follower ranges |
| **Application Check** | No validation - anyone can apply | Automatic check against creator's max followers |
| **User Feedback** | None | Clear message explaining why they can't apply |
| **Database Storage** | `min_followers` (integer) | `follower_ranges` (text array) |

---

## Follower Range Options

```
[ ] Nano (1K - 10K)
[ ] Micro (10K - 50K)
[ ] Mid-tier (50K - 100K)
[ ] Macro (100K - 500K)
[ ] Mega (500K+)
```

Brands can select multiple ranges (e.g., both "Nano" and "Micro" to accept creators with 1K-50K followers).

---

## Visual Mockup

### Opportunity Creation

```
┌─────────────────────────────────────────────────────────┐
│  Follower Range (Optional)                              │
│  Select which creator sizes you're looking for          │
│                                                         │
│  ┌─────────────────────────────────────────────────┐    │
│  │  [ ] Nano (1K - 10K)                            │    │
│  │  [x] Micro (10K - 50K)                          │    │
│  │  [x] Mid-tier (50K - 100K)                      │    │
│  │  [ ] Macro (100K - 500K)                        │    │
│  │  [ ] Mega (500K+)                               │    │
│  └─────────────────────────────────────────────────┘    │
│                                                         │
│  💡 Leave all unchecked to accept all creator sizes     │
└─────────────────────────────────────────────────────────┘
```

### Opportunity Display (for creators)

```
┌─────────────────────────────────────────────────────────┐
│  📊 Micro, Mid-tier creators                            │
└─────────────────────────────────────────────────────────┘
```

### Ineligible Creator View

```
┌─────────────────────────────────────────────────────────┐
│  [Apply Now] ← Button disabled                          │
│                                                         │
│  ⚠️ Your highest follower count (2,500) doesn't meet    │
│     this opportunity's requirements (10K-100K).         │
│     Build your audience to qualify for similar roles!   │
└─────────────────────────────────────────────────────────┘
```

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/components/brand-dashboard/CreateOpportunityDialog.tsx` | Replace min_followers input with multi-select checkboxes |
| `src/pages/Opportunities.tsx` | Add follower validation logic, show eligibility status |
| Database migration | Add `follower_ranges` column (text array), keep `min_followers` for backward compatibility |

---

## Technical Implementation

### 1. Database Migration

```sql
-- Add new column for follower ranges
ALTER TABLE public.brand_opportunities 
ADD COLUMN follower_ranges TEXT[] DEFAULT NULL;

-- Column stores array like ['nano', 'micro', 'mid_tier']
```

### 2. Follower Range Configuration

Create a config object for reuse:

```typescript
const FOLLOWER_RANGES = {
  nano: { label: 'Nano', min: 1000, max: 10000 },
  micro: { label: 'Micro', min: 10000, max: 50000 },
  mid_tier: { label: 'Mid-tier', min: 50000, max: 100000 },
  macro: { label: 'Macro', min: 100000, max: 500000 },
  mega: { label: 'Mega', min: 500000, max: Infinity },
};
```

### 3. Create Opportunity Dialog Changes

Replace the min_followers input section with:
- Multi-select checkboxes for each follower range
- Form state changes from `min_followers: string` to `follower_ranges: string[]`
- Submit logic stores array to database

### 4. Opportunities Page Changes

When loading opportunities:
1. Fetch creator's social accounts with follower counts
2. Get the highest follower count across all platforms
3. For each opportunity with `follower_ranges`:
   - Check if creator's max followers falls within any selected range
   - If not eligible: disable Apply button, show explanation message
4. Display the required ranges on opportunity cards

### 5. Eligibility Check Logic

```typescript
const checkEligibility = (maxFollowers: number, ranges: string[]) => {
  if (!ranges || ranges.length === 0) return true; // No restriction
  
  return ranges.some(rangeKey => {
    const range = FOLLOWER_RANGES[rangeKey];
    return maxFollowers >= range.min && maxFollowers < range.max;
  });
};
```

---

## User Experience Flow

### Brand Creating Opportunity
1. Fills out opportunity form
2. Optionally selects one or more follower ranges
3. If none selected, all creator sizes are accepted
4. Posts opportunity

### Creator Viewing Opportunities
1. Opens Opportunities page
2. System fetches their social accounts and calculates max followers
3. For each opportunity:
   - If no follower range restriction: normal "Apply Now" button
   - If ranges specified and creator qualifies: normal "Apply Now" button
   - If ranges specified and creator doesn't qualify:
     - Button shows "Not Eligible" (disabled)
     - Helper text explains: "Your highest follower count (X) doesn't meet requirements (Y-Z range)"

---

## Data Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    Opportunities Page                       │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  1. Fetch opportunities                                     │
│  2. Fetch creator's social accounts                         │
│  3. Calculate: maxFollowers = max(all platform followers)   │
│                                                             │
│  For each opportunity:                                      │
│     │                                                       │
│     ├── Has follower_ranges?                                │
│     │      │                                                │
│     │      ├── NO → Show "Apply Now"                        │
│     │      │                                                │
│     │      └── YES → Check maxFollowers vs ranges           │
│     │              │                                        │
│     │              ├── ELIGIBLE → Show "Apply Now"          │
│     │              │                                        │
│     │              └── NOT ELIGIBLE → Show disabled button  │
│     │                   + explanation message               │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Benefits

1. **Better Targeting** - Brands can target specific creator tiers
2. **Multi-tier Flexibility** - Accept multiple ranges, not just a minimum
3. **Clear Expectations** - Creators know immediately if they qualify
4. **Helpful Feedback** - Non-eligible creators understand why and what to work toward
5. **Reduced Noise** - Brands don't receive applications from mismatched creators

