
# Fix "Register Your Brand" Banner Showing to Creators

## Problem
The "Register your brand to book creators" banner on the Influencers page (`/influencers`) is incorrectly displayed to logged-in creators like elias@gmail.com.

**Current logic (line 749):**
```tsx
{authCheckComplete && !hasBrandProfile && isLoggedIn && (
```

This shows the banner to ANY logged-in user who doesn't have a brand profile, including creators.

## Solution
Add a check for creator profiles. The banner should only appear for logged-in users who have NEITHER a brand profile NOR a creator profile (i.e., new users exploring the platform).

## Changes Required

### File: `src/pages/Influencers.tsx`

**1. Add state for creator profile check:**
```tsx
const [hasBrandProfile, setHasBrandProfile] = useState(false);
const [hasCreatorProfile, setHasCreatorProfile] = useState(false);  // NEW
const [isLoggedIn, setIsLoggedIn] = useState(false);
```

**2. Update `checkUserStatus` function to also check for creator profile:**
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
      
      // Check for creator profile (NEW)
      const { data: creatorProfile } = await supabase
        .from("creator_profiles")
        .select("id")
        .eq("user_id", user.id)
        .maybeSingle();
      
      setHasBrandProfile(!!brandProfile);
      setHasCreatorProfile(!!creatorProfile);  // NEW
      setIsLoggedIn(true);
    } else {
      setHasBrandProfile(false);
      setHasCreatorProfile(false);  // NEW
      setIsLoggedIn(false);
    }
  } catch (error) {
    console.error("Error checking user status:", error);
  } finally {
    setAuthCheckComplete(true);
  }
};
```

**3. Update the banner condition to exclude creators:**
```tsx
{/* Call to action for non-registered brands - hide from creators */}
{authCheckComplete && !hasBrandProfile && !hasCreatorProfile && isLoggedIn && (
```

## Summary

| Current Behavior | New Behavior |
|-----------------|--------------|
| Banner shown to all logged-in non-brand users | Banner only shown to logged-in users with NO profile at all |
| Creators see "Register Your Brand" ❌ | Creators don't see the banner ✓ |
| Brands don't see it ✓ | Brands don't see it ✓ |
| Non-logged-in users don't see it ✓ | Non-logged-in users don't see it ✓ |

This is a quick fix requiring only ~10 lines of changes.
