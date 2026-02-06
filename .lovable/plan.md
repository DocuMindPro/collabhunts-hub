

# Push Notifications for Creators + Announcement Banner System

## Overview
Two features managed from the Admin dashboard:
1. **Push Notifications** -- Send push notifications to creator app users (those with registered device tokens)
2. **Announcement Banner** -- A dismissible banner at the top of the website, managed by admin

---

## Feature 1: Push Notifications to Creators

### What it does
A new card in the Admin "Testing" tab (alongside the existing "Send Platform Update" email card) that lets the admin compose and send push notifications to all creators who have the mobile app installed.

### Database
- No new tables needed -- the `device_tokens` table already exists with `user_id`, `token`, `platform`, `is_active`
- The `send-push-notification` edge function already exists and sends via Firebase FCM

### New Edge Function: `send-push-to-creators`
A new edge function that:
1. Accepts `title`, `body`, `data`, and optional `target` (all creators, or specific creator user IDs)
2. Queries `device_tokens` joined with `creator_profiles` to find all active creator tokens
3. Calls FCM for each token (reusing the same Firebase auth logic from `send-push-notification`)
4. Returns success/fail counts

### Admin UI Changes (`AdminTestingTab.tsx`)
Add a new card "Send Push Notification" with:
- Title input
- Body/message textarea
- Target selector (All Creators / Specific creator search)
- Send button with confirmation
- Result feedback (X sent, Y failed)

---

## Feature 2: Announcement Banner

### What it does
A banner displayed at the very top of the website (above the navbar) that the admin can turn on/off and customize with text, link, and style.

### Database
Add 4 new rows to the existing `site_settings` table:
- `announcement_enabled` (category: announcement) -- "true"/"false"
- `announcement_text` (category: announcement) -- The banner message
- `announcement_link` (category: announcement) -- Optional URL for a CTA
- `announcement_style` (category: announcement) -- Style variant: "info", "warning", "success", "promo"

### New Component: `AnnouncementBanner.tsx`
- Fetches announcement settings from `site_settings`
- Shows a dismissible banner at the top of the page when enabled
- Stores dismissal in localStorage (keyed by text hash so new announcements show again)
- Color-coded based on style variant
- Optional "Learn More" link

### Integration in `App.tsx`
- Render `AnnouncementBanner` above the Router/routes, so it appears on every page

### Admin UI: New component `AdminAnnouncementsTab.tsx` or a card in existing tab
Add a new card in the Admin "Testing" tab (or a dedicated new tab) with:
- Toggle switch to enable/disable the banner
- Text input for the message
- Optional link URL input
- Style selector (Info / Warning / Success / Promo)
- Live preview of the banner
- Save button

---

## Technical Details

### Files to Create
1. **`supabase/functions/send-push-to-creators/index.ts`** -- Edge function to send push notifications to all creators with active device tokens
2. **`src/components/AnnouncementBanner.tsx`** -- The banner component displayed site-wide
3. **`src/components/admin/AdminAnnouncementsTab.tsx`** -- Admin UI for managing both push notifications and the announcement banner

### Files to Modify
1. **`supabase/config.toml`** -- Add `[functions.send-push-to-creators]` with `verify_jwt = false`
2. **`src/pages/Admin.tsx`** -- Add new "Announcements" tab trigger and TabsContent importing `AdminAnnouncementsTab`
3. **`src/App.tsx`** -- Add `AnnouncementBanner` component above the router

### Database Migration
Insert 4 new rows into `site_settings`:
```sql
INSERT INTO site_settings (key, value, category, description)
VALUES
  ('announcement_enabled', 'false', 'announcement', 'Whether the announcement banner is visible'),
  ('announcement_text', '', 'announcement', 'Announcement banner message text'),
  ('announcement_link', '', 'announcement', 'Optional link URL for the announcement'),
  ('announcement_style', 'info', 'announcement', 'Banner style: info, warning, success, promo');
```

### Edge Function: `send-push-to-creators`
- Validates admin auth (same pattern as `send-platform-update`)
- Queries `creator_profiles` to get creator `user_id`s, then fetches their active `device_tokens`
- Sends FCM notifications using the same Firebase JWT auth logic from `send-push-notification`
- Returns `{ success: true, sent: N, failed: N }`

### AnnouncementBanner Component
- Uses `useSiteSettings` pattern to fetch announcement keys
- Renders a full-width bar with gradient background based on style
- Close button that saves dismissal to localStorage
- Only renders on web (skipped on native via `Capacitor.isNativePlatform()`)

