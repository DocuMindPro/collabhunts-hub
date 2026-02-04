
# Add Messages Link to Navbar with Unread Badge

## Overview

Add a visible "Messages" link in the main navigation bar (next to the notification bell) that shows a red badge with the count of unread messages. This will work for both creators and brands.

## Current State

- **Notifications bell** already exists and shows a badge with unread count
- **MobileBottomNav** has message badge logic (for creators only)
- **No global Messages icon** in the desktop navbar

## Implementation

### 1. Create Reusable Hook: `useUnreadMessages`

**File:** `src/hooks/useUnreadMessages.ts`

A new hook that:
- Gets the current user's profile (creator or brand)
- Queries all conversations for that profile
- Counts unread messages (where `is_read = false` AND `sender_id != current user`)
- Subscribes to realtime updates for new messages
- Works for BOTH creators and brands

```typescript
export const useUnreadMessages = () => {
  const [unreadCount, setUnreadCount] = useState(0);
  
  // Check if user has creator OR brand profile
  // Query conversations accordingly
  // Count unread messages not sent by current user
  // Subscribe to realtime for web users
  
  return { unreadCount };
};
```

### 2. Update Navbar Desktop Navigation

**File:** `src/components/Navbar.tsx`

Add a Messages icon (MessageSquare) with badge next to the notifications bell:

```
[Knowledge Base] [Messages 🔴5] [Notifications 🔴3] [Dashboard Button] [User Menu]
```

The link routes to:
- `/creator-dashboard?tab=messages` if user has creator profile
- `/brand-dashboard?tab=messages` if user has brand profile  
- If user has both, prioritize creator dashboard

### 3. Update Mobile Sheet Menu

In the mobile hamburger menu, add a "Messages" link with badge indicator near the top of the authenticated user section.

---

## Visual Design

The Messages icon will appear like this in the navbar:

```
┌─────────────────────────────────────────────────────────────────────────┐
│  Logo  │  Find Creators  │  Opportunities  │  What's New  │  📖  📬⁵  🔔³  │
└─────────────────────────────────────────────────────────────────────────┘
                                                              ▲    ▲
                                                        Messages  Notifications
```

The badge styling will match the existing notification bell badge (red circle with number).

---

## Files to Create/Modify

| File | Action | Description |
|------|--------|-------------|
| `src/hooks/useUnreadMessages.ts` | Create | Reusable hook to count unread messages for any user type |
| `src/components/Navbar.tsx` | Modify | Add Messages icon with badge in desktop and mobile views |

---

## Technical Details

### Hook Logic for Both User Types

```typescript
// Pseudo-code for the hook
const fetchUnreadCount = async () => {
  const user = await supabase.auth.getUser();
  
  // Try to get creator profile first
  const creatorProfile = await supabase
    .from("creator_profiles")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle();
  
  // Try to get brand profile
  const brandProfile = await supabase
    .from("brand_profiles")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle();
  
  // Get conversations for either profile type
  let conversations = [];
  if (creatorProfile) {
    conversations = await supabase
      .from("conversations")
      .select("id")
      .eq("creator_profile_id", creatorProfile.id);
  } else if (brandProfile) {
    conversations = await supabase
      .from("conversations")
      .select("id")
      .eq("brand_profile_id", brandProfile.id);
  }
  
  // Count unread messages
  const count = await supabase
    .from("messages")
    .select("*", { count: "exact", head: true })
    .in("conversation_id", conversationIds)
    .eq("is_read", false)
    .neq("sender_id", user.id);
  
  return count;
};
```

### Link Destination Logic

```typescript
const getMessagesLink = () => {
  if (hasCreatorProfile) return "/creator-dashboard?tab=messages";
  if (hasBrandProfile) return "/brand-dashboard?tab=messages";
  return "/login"; // fallback
};
```

---

## Benefits

1. **High visibility** - Messages are important for bookings, so they deserve prominent placement
2. **Consistent UX** - Badge styling matches existing notifications
3. **Works for both roles** - Creators and brands both see their unread counts
4. **Real-time updates** - Badge updates when new messages arrive (on web)

