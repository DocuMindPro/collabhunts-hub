
# Fix Creator Signup Partial Failure & Auto-Login Issue

## Problem Summary
When creating a creator account, if any step after profile creation fails (e.g., social accounts insertion), the user ends up in a broken state:
- A creator profile exists in the database
- But no social accounts or services are linked
- The user is logged in automatically
- On retry, they get "You already have a creator profile" error

The specific error causing this is: **follower count value exceeds integer max** (users entering numbers like 21,321,321,321 which is larger than 2,147,483,647).

## Technical Solution

### 1. Database Change: Increase follower_count capacity
Change the `follower_count` column from `integer` to `bigint` to handle influencers with billions of followers.

```sql
ALTER TABLE public.creator_social_accounts 
ALTER COLUMN follower_count TYPE bigint;
```

### 2. Code Changes: Add cleanup on failure

**File: `src/pages/CreatorSignup.tsx`**
- Wrap the social accounts and services insertion in try-catch
- If insertion fails after profile creation, delete the partial profile
- Add frontend validation for follower count (max 10 billion)

```typescript
// After profile creation, wrap remaining steps
try {
  // Create social accounts
  // Create services
  // Upload portfolio
} catch (insertError) {
  // Clean up the partial profile
  await supabase.from("creator_profiles")
    .delete()
    .eq("id", profileData.id);
  throw insertError;
}
```

**File: `src/pages/NativeCreatorOnboarding.tsx`**
- Apply the same cleanup pattern
- Add follower count validation

### 3. Frontend Validation
- Add maximum follower count check (10 billion)
- Show user-friendly error message if exceeded

### 4. Recovery for existing partial profiles
- If user has profile but no social accounts, allow them to complete signup
- Check for incomplete profiles and resume onboarding

## Files to Modify

| File | Changes |
|------|---------|
| `supabase/migrations/` | New migration to alter follower_count to bigint |
| `src/pages/CreatorSignup.tsx` | Add cleanup on failure + validation |
| `src/pages/NativeCreatorOnboarding.tsx` | Add cleanup on failure + validation |

## Implementation Order

1. Create database migration to change column type
2. Add cleanup logic to CreatorSignup.tsx
3. Add cleanup logic to NativeCreatorOnboarding.tsx  
4. Add frontend validation for follower count
5. Test full signup flow to verify fix
