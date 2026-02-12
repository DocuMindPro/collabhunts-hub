

## Fix Support Widget Issues and Add Intake Form

### Problems to Fix

1. **Duplicate messages**: The chat shows each message twice because both the realtime subscription AND the optimistic insert in `handleSend` add the same message. The realtime listener fires for the user's own messages too.

2. **Missing user context for admin**: Admin only sees name and email but not whether the user is a brand or creator, and has no context about their issue.

3. **No intake form**: Messages go straight through without gathering context first.

---

### Solution

#### 1. Fix duplicate messages in SupportWidget

In `handleSend`, stop adding the message optimistically. Instead, let the realtime subscription handle all new messages. This means:
- Remove the line that manually adds the message after insert
- The realtime `INSERT` listener already handles adding new messages (including the user's own)
- Also add a deduplication guard in the realtime handler (already exists but the optimistic add races with it)

#### 2. Add intake form before first message

When there's no existing ticket, show a short intake form instead of a direct text input:
- **Category** dropdown: "Booking Issue", "Payment Issue", "Account Problem", "Technical Bug", "Partnership Question", "Other"
- **Describe your issue** text area

When submitted, this creates the ticket with the category as subject, and the description as the first message. After the ticket is created, the widget switches to the normal chat view.

#### 3. Add user context to support tickets (database change)

Add a `category` column to `support_tickets` so admin can see the issue type at a glance. Also store `user_type` from profiles for quick identification.

**Migration:**
```sql
ALTER TABLE public.support_tickets 
  ADD COLUMN category text DEFAULT 'other',
  ADD COLUMN user_type text;
```

#### 4. Enrich admin view with user type

In `AdminSupportTab`, fetch `user_type` from profiles and display it as a badge (Brand/Creator) next to the user name. Also show the ticket category.

---

### Files to Change

**Database:**
- New migration adding `category` and `user_type` columns to `support_tickets`

**Modified files:**
- **`src/components/SupportWidget.tsx`**
  - Remove optimistic message insert (fixes duplication)
  - Add intake form state: when no ticket exists, show category selector + description field
  - On submit, create ticket with category/user_type, then send first message
  - After ticket created, switch to normal chat mode

- **`src/components/admin/AdminSupportTab.tsx`**
  - Fetch `user_type` from profiles alongside existing data
  - Display user type badge (Brand/Creator) in ticket list and detail view
  - Show ticket category as a tag

### Technical Details

**Intake form flow in SupportWidget:**
1. User clicks support bubble
2. No existing ticket found -> show intake form with category dropdown and text area
3. User fills form and clicks "Submit"
4. System creates ticket (with category, user_type from their profile) and first message
5. Widget switches to chat view for follow-up conversation

**Duplicate fix:**
- In `handleSend`, after successful insert, only clear the input -- do not add the message to state
- The realtime subscription's `INSERT` handler will add it
- Keep the existing dedup check in the realtime handler as a safety net
