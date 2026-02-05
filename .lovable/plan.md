
# Hide "Find Creators" and "For Brands" Links from Creators

## Problem
The navigation bar shows "Find Creators" and "For Brands" links to logged-in creators (as shown in your screenshot). Since we're implementing the Collabstr model where creators focus only on their own business, these links should be hidden.

## Current Logic vs. Required Logic

| Link | Current Behavior | Required Behavior |
|------|-----------------|-------------------|
| Find Creators | Shown to everyone | Hide from creators |
| For Brands | Hidden only from brands | Hide from creators AND brands |
| Opportunities | Shown only to creators | Shown only to creators (unchanged) |
| What's New | Shown to logged-in users | Shown to logged-in users (unchanged) |

## Changes Required

### File: `src/components/Navbar.tsx`

Update the `getNavLinks()` function to exclude creator-restricted links:

```tsx
const getNavLinks = (): NavLink[] => {
  const links: NavLink[] = [];
  
  // Only show "Find Creators" to non-creators (brands and prospects)
  if (!hasCreatorProfile) {
    links.push({ to: "/influencers", label: "Find Creators" });
  }
  
  // Only show Opportunities link to users with a creator profile
  if (hasCreatorProfile) {
    links.push({ to: "/opportunities", label: "Opportunities" });
  }
  
  // Only show "For Brands" to non-brand AND non-creator users (prospects only)
  if (!hasBrandProfile && !hasCreatorProfile) {
    links.push({ to: "/brand", label: "For Brands" });
  }
  
  if (user) {
    links.push({ to: "/whats-new", label: "What's New", icon: Sparkles });
  }
  
  return links;
};
```

## Result for Each User Type

| User Type | Navigation Links Shown |
|-----------|----------------------|
| Not logged in | Find Creators, For Brands |
| Logged-in (no profile) | Find Creators, For Brands, What's New |
| Logged-in Creator | Opportunities, What's New |
| Logged-in Brand | Find Creators, What's New |

## Summary
This is a small change (~3 lines modified) in the `getNavLinks()` function that properly restricts navigation based on user role, aligning with the Collabstr model where creators only see their business-relevant links.
