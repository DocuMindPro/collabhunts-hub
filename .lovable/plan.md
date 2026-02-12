
## Fix Duplicate Role Selection After Signup

### Problem
When a new user signs up via NativeLogin (brand or creator), the `SIGNED_IN` auth event fires before the profile insert completes. NativeAppGate refetches profiles, finds none, and shows the NativeRolePicker again -- duplicating the role selection the user already made.

### Root Cause
Race condition in NativeAppGate's `onAuthStateChange` handler: `signUp()` triggers `SIGNED_IN` immediately, but the brand/creator profile insert happens after that in NativeLogin's signup handler.

### Fix (in `src/components/NativeAppGate.tsx`)

In the `onAuthStateChange` `SIGNED_IN` handler, after refetching profiles and finding neither exists, check the user's `user_metadata.user_type` to determine what to do:

- If `user_type === 'brand'`: auto-set `showBrandOnboarding(true)` so the user goes straight to brand onboarding (or auto-select 'brand' if a profile is found on a retry)
- If `user_type === 'creator'`: auto-set `showOnboarding(true)` so the user goes straight to creator onboarding

Additionally, add a short delayed retry (1.5s) for profile refetch to catch the case where the profile insert completes just after the auth event. If the retry finds the profile, auto-select the role instead of showing onboarding.

### Changes

**File: `src/components/NativeAppGate.tsx`**

Update the `onAuthStateChange` SIGNED_IN block (around line 129-137):

```typescript
// Current code:
if (creator && !brand) setSelectedRole('creator');
else if (brand && !creator) setSelectedRole('brand');

// New code:
if (creator && !brand) {
  setSelectedRole('creator');
} else if (brand && !creator) {
  setSelectedRole('brand');
} else if (!creator && !brand) {
  // Profile may not exist yet due to signup race condition.
  // Check user_metadata to auto-route.
  const userType = session?.user?.user_metadata?.user_type;

  // Retry after a short delay to catch the profile insert
  setTimeout(async () => {
    if (!mounted) return;
    const retried = await refetchProfiles(session.user.id);
    if (retried.brand && !retried.creator) {
      setSelectedRole('brand');
    } else if (retried.creator && !retried.brand) {
      setSelectedRole('creator');
    } else if (!retried.brand && !retried.creator) {
      // Still no profile -- use metadata to skip role picker
      if (userType === 'brand') setShowBrandOnboarding(true);
      else if (userType === 'creator') setShowOnboarding(true);
    }
  }, 1500);
}
```

Also apply the same `user_metadata` check to the auto-select `useEffect` (around line 143-150) so that on initial load, if neither profile exists but metadata indicates a type, the user is routed directly to onboarding instead of the role picker.

### Files Modified
- `src/components/NativeAppGate.tsx`
