

## Support Chat Widget -- Full Implementation Plan

### How Professional Platforms Handle This

Most SaaS platforms (Intercom, Zendesk, Crisp) use a **hybrid approach**:
- A floating chat bubble (bottom-right corner)
- Opens into a small chat window where users can type messages
- Messages become "tickets" that support staff can reply to
- If support is offline, the message is saved and the user gets an email reply

This is exactly what we'll build -- a **built-in live chat + ticket system** native to your platform, no third-party needed.

### User Experience

**For Brands and Creators (logged-in users only):**
1. A floating circle button appears bottom-right on every page (above the mobile bottom nav on mobile)
2. Clicking it opens a chat panel with their conversation history
3. They type a message -- it's instantly saved as a support ticket
4. They see replies from admin in the same chat thread
5. If they close and reopen, their full history is there

**For Admin:**
- A new "Support" tab in the Admin dashboard
- Shows all open/pending support conversations
- Admin can reply directly in the chat thread
- Can also mark tickets as resolved
- Badge count shows unresolved tickets

### Database Design

**New table: `support_tickets`**
| Column | Type | Description |
|---|---|---|
| id | uuid | Primary key |
| user_id | uuid | The user who opened the ticket (FK to auth.users) |
| subject | text | Auto-generated from first message or category |
| status | text | `open`, `in_progress`, `resolved`, `closed` |
| priority | text | `low`, `medium`, `high` |
| created_at | timestamptz | When opened |
| resolved_at | timestamptz | When resolved |

**New table: `support_messages`**
| Column | Type | Description |
|---|---|---|
| id | uuid | Primary key |
| ticket_id | uuid | FK to support_tickets |
| sender_id | uuid | Who sent it (user or admin) |
| content | text | Message text |
| is_admin | boolean | Whether this message is from admin |
| is_read | boolean | Read status |
| created_at | timestamptz | Timestamp |

**RLS Policies:**
- Users can only see their own tickets and messages
- Admins can see all tickets and messages
- Users can insert tickets and messages for their own tickets
- Admins can insert messages and update ticket status

**Realtime:** Enable realtime on `support_messages` so both sides see replies instantly.

### Files to Create

1. **`src/components/SupportWidget.tsx`** -- The floating button + chat panel
   - Floating circle button (bottom-right, z-50)
   - On mobile: positioned above the bottom nav (bottom-20)
   - Opens a slide-up panel with chat interface
   - Shows previous messages, input field, send button
   - Only renders for logged-in users
   - Realtime subscription for new admin replies

2. **`src/components/admin/AdminSupportTab.tsx`** -- Admin support dashboard
   - List of all tickets with status filters (open, in progress, resolved)
   - Click a ticket to open the conversation
   - Reply inline, change status, set priority
   - Badge count for unresolved tickets
   - Email notification option (uses existing email-utils)

### Files to Modify

3. **`src/App.tsx`** -- Add `SupportWidget` globally (after CookieConsent, only on web)
4. **`src/pages/Admin.tsx`** -- Add "Support" tab with badge count
5. **`src/hooks/useAdminBadgeCounts.ts`** -- Add open support ticket count

### Technical Details

- The widget uses a Sheet/Drawer pattern on mobile (slides up from bottom) and a fixed popover on desktop
- Messages use optimistic updates (same pattern as `MessageDialog`)
- Admin replies trigger an email notification to the user via `sendNotificationEmail`
- The floating button shows an unread badge when admin has replied
- On pages with bottom nav (native app), the button shifts up to avoid overlap
- No new edge functions needed -- all handled via direct Supabase queries with RLS

### Visual Layout

```text
Desktop:                          Mobile:
+---------------------------+     +------------------+
|                           |     |                  |
|       Page Content        |     |   Page Content   |
|                           |     |                  |
|                      [?]--+     |             [?]--+
+---------------------------+     +--[nav bar]-------+

When opened:
+---------------------------+     +------------------+
|                           |     | Support     [x]  |
|       Page Content   +----|     |------------------|
|                      |Chat|     | msg history      |
|                      |hist|     |                  |
|                      |    |     |                  |
|                      |____|     | [type message..] |
|                      |send|     +--[nav bar]-------+
+---------------------------+
```

