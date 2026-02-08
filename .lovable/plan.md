

## Fix: Add ID Search to "All Users" Tab in Admin Panel

### Problem
The previous fix only updated the **Creators** tab search. The **All Users** tab in `src/pages/Admin.tsx` has its own separate search filter (lines 293-300) that only checks `email`, `full_name`, `brand_name`, and `creator_display_name` -- it does not search by any ID fields.

### Solution

**File: `src/pages/Admin.tsx`**

Update the search filter (lines 295-299) to also match against:
- `profile.id` (the auth user UUID)
- `profile.creator_profile_id` (the creator profile UUID -- the one copied from the public profile)
- `profile.brand_profile_id` (the brand profile UUID)

```tsx
// Current (line 295-299):
const filtered = profiles.filter(profile => 
  profile.email.toLowerCase().includes(userSearch.toLowerCase()) ||
  profile.full_name?.toLowerCase().includes(userSearch.toLowerCase()) ||
  profile.brand_name?.toLowerCase().includes(userSearch.toLowerCase()) ||
  profile.creator_display_name?.toLowerCase().includes(userSearch.toLowerCase())
);

// Updated:
const filtered = profiles.filter(profile => 
  profile.email.toLowerCase().includes(userSearch.toLowerCase()) ||
  profile.full_name?.toLowerCase().includes(userSearch.toLowerCase()) ||
  profile.brand_name?.toLowerCase().includes(userSearch.toLowerCase()) ||
  profile.creator_display_name?.toLowerCase().includes(userSearch.toLowerCase()) ||
  profile.id.toLowerCase().includes(userSearch.toLowerCase()) ||
  profile.creator_profile_id?.toLowerCase().includes(userSearch.toLowerCase()) ||
  profile.brand_profile_id?.toLowerCase().includes(userSearch.toLowerCase())
);
```

Also update the search placeholder (line 941) from `"Search users..."` to `"Search name, email, ID..."`.

This way, pasting the short 8-character creator ID (e.g., `b7d30894`) in the All Users search will match the creator profile UUID and show the correct user.

### No database changes needed.
