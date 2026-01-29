

# Fix "Open to Invitations" Toggle Not Persisting

## Problem Identified

After investigating the code, I found **two related issues**:

### Issue 1: Toggle Requires Manual Save (UX Problem)
The "Open to Invitations" toggle only updates local React state. Users must scroll down and click "Save Changes" to persist the change to the database. This is not intuitive - users expect the toggle to work immediately like on LinkedIn.

### Issue 2: No Immediate Visual Feedback
After saving, the avatar on the page doesn't update to show the green ring until a page refresh because there's no state synchronization between the ProfileTab and other components showing the avatar.

## Solution: Auto-Save on Toggle Change

Implement immediate save when the toggle changes (like LinkedIn), with proper feedback:

### Changes to `src/components/creator-dashboard/ProfileTab.tsx`

1. Create a new function `handleOpenToInvitationsChange` that:
   - Updates local state immediately
   - Saves to database immediately
   - Shows toast confirmation
   - Handles errors gracefully

```typescript
const handleOpenToInvitationsChange = async (checked: boolean) => {
  // Optimistic update
  setProfile({ ...profile, open_to_invitations: checked });
  
  try {
    const { error } = await supabase
      .from("creator_profiles")
      .update({ open_to_invitations: checked })
      .eq("id", profile.id);
      
    if (error) throw error;
    
    toast({
      title: checked ? "You're now open to invitations!" : "Invitations disabled",
      description: checked 
        ? "Brands can now see you're open to free collaborations"
        : "Your profile no longer shows the open to invitations badge",
    });
  } catch (error) {
    // Rollback on error
    setProfile({ ...profile, open_to_invitations: !checked });
    toast({
      title: "Error",
      description: "Failed to update setting. Please try again.",
      variant: "destructive",
    });
  }
};
```

2. Update the Switch component to use this new handler:

```typescript
<Switch
  id="open-to-invitations"
  checked={profile.open_to_invitations}
  onCheckedChange={handleOpenToInvitationsChange}
/>
```

## Visual Flow After Fix

```text
User toggles "Open to Invitations" ON
          ↓
Local state updates immediately (optimistic)
          ↓
Database update sent in background
          ↓
   ┌──────┴──────┐
   ↓             ↓
SUCCESS       FAILURE
   ↓             ↓
Toast:        Rollback state
"You're       + Error toast
now open!"
```

## Files to Modify

| File | Change |
|------|--------|
| `src/components/creator-dashboard/ProfileTab.tsx` | Add auto-save function for the toggle |

## Implementation Steps

1. Add new async handler function `handleOpenToInvitationsChange`
2. Replace the inline `onCheckedChange` with the new handler
3. Add optimistic update with rollback on failure
4. Show appropriate toast messages for success/failure

## Expected Behavior After Fix

1. User toggles "Open to Invitations" ON
2. Switch immediately shows ON state
3. Toast appears: "You're now open to invitations!"
4. Refresh page - setting persists
5. Green ring appears around avatar everywhere

