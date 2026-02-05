
# Redirect Creators Away from /influencers Page

## Overview
Implement full restriction (like Collabstr) - when a logged-in creator tries to access the `/influencers` marketplace page, they will be automatically redirected to their creator dashboard.

## Changes Required

### File: `src/pages/Influencers.tsx`

Update the `checkUserStatus` function to redirect creators immediately after detecting their profile:

```tsx
const checkUserStatus = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      // Check for brand profile
      const { data: brandProfile } = await supabase
        .from("brand_profiles")
        .select("id")
        .eq("user_id", user.id)
        .maybeSingle();
      
      // Check for creator profile
      const { data: creatorProfile } = await supabase
        .from("creator_profiles")
        .select("id")
        .eq("user_id", user.id)
        .maybeSingle();
      
      // Redirect creators to their dashboard - they shouldn't browse other creators
      if (creatorProfile) {
        navigate('/creator-dashboard', { replace: true });
        return;
      }
      
      setHasBrandProfile(!!brandProfile);
      setHasCreatorProfile(!!creatorProfile);
      setIsLoggedIn(true);
    } else {
      setHasBrandProfile(false);
      setHasCreatorProfile(false);
      setIsLoggedIn(false);
    }
  } catch (error) {
    console.error("Error checking user status:", error);
  } finally {
    setAuthCheckComplete(true);
  }
};
```

## Behavior Summary

| User Type | Current Behavior | New Behavior |
|-----------|-----------------|--------------|
| Not logged in | Can browse creators | Can browse creators (unchanged) |
| Logged-in Brand | Can browse creators | Can browse creators (unchanged) |
| Logged-in Creator | Can browse creators | Redirected to `/creator-dashboard` |

## Why This Makes Sense
- Prevents creators from seeing competitor pricing/services
- Aligns with industry standard (Collabstr model)
- Clean separation: brands browse, creators manage their business
- Uses `replace: true` so back button doesn't loop back to `/influencers`
