

# Remove Live PK Battle from Opportunity Creation

## The Issue

Currently, the Package Type dropdown in "Post an Opportunity" shows all 5 package types including "Live PK Battle". Since Live PK Battles are managed events that require direct consultation with CollabHunts, brands should not be able to post these as self-service opportunities.

## Current Code (Line 170-175)

```typescript
<SelectContent>
  {Object.entries(EVENT_PACKAGES).map(([key, pkg]) => (
    <SelectItem key={key} value={key}>{pkg.name}</SelectItem>
  ))}
</SelectContent>
```

This renders ALL packages: Unbox & Review, Social Boost, Meet & Greet, **Live PK Battle**, Custom Experience

## Solution

Filter out the `competition` key when rendering package options:

```typescript
<SelectContent>
  {Object.entries(EVENT_PACKAGES)
    .filter(([key]) => key !== 'competition')
    .map(([key, pkg]) => (
      <SelectItem key={key} value={key}>{pkg.name}</SelectItem>
    ))}
</SelectContent>
```

This will show only: Unbox & Review, Social Boost, Meet & Greet, Custom Experience

## File to Modify

| File | Change |
|------|--------|
| `src/components/brand-dashboard/CreateOpportunityDialog.tsx` | Filter out `competition` from package type dropdown |

## Result

Brands can post opportunities for:
- Unbox & Review
- Social Boost  
- Meet & Greet
- Custom Experience

For Live PK Battles, brands must contact CollabHunts directly for managed event coordination.

