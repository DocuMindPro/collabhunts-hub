

# Separate Follower Range Display from Enforcement

## The Problem
Currently, when the "enforce" toggle is off, `follower_ranges` is saved as `null` in the database. This means the opportunity card shows no follower info at all. The user wants:
- **Always show** the selected follower tiers on the opportunity card (e.g., "Nano, Micro creators")
- **Separately control** whether ineligible creators are blocked from applying

## Solution
Add a new `enforce_follower_range` boolean column to the `brand_opportunities` table. Always save selected ranges, and use the boolean to control enforcement.

## Database Change
Add column `enforce_follower_range` (boolean, default `true`) to `brand_opportunities`.

## Code Changes

### 1. `src/components/brand-dashboard/CreateOpportunityDialog.tsx`
- **Line 142**: Always save `formData.follower_ranges` (not conditionally based on toggle)
- Add `enforce_follower_range: enforceFollowerRange` to the saved data object

### 2. `src/pages/Opportunities.tsx`
- Update the eligibility check: only block creators when `opportunity.enforce_follower_range` is `true`
- Always show the follower range info on the card (remove the `hasFollowerRequirement` condition, or base it on ranges being non-empty)
- Only show the "Not Eligible" warning and disabled button when `enforce_follower_range` is true AND creator doesn't match

### Summary of Behavior

| Ranges Selected | Enforce ON | Card Shows | Can Apply? |
|----------------|------------|------------|------------|
| Nano, Micro | Yes | "Nano, Micro creators" | Only if eligible |
| Nano, Micro | No | "Nano, Micro creators" | Yes, anyone |
| None selected | Either | Nothing | Yes, anyone |

