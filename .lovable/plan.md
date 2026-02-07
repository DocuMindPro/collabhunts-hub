
## Fix: Announcement Banner Should Reappear for New Announcements

### Problem
The dismiss tracking uses a hash of the announcement **text**. So if you:
1. Dismiss the banner
2. Turn it off, then back on (with the same or similar text)
3. The old localStorage key still matches, keeping it hidden

Even with different text, stale dismissed keys accumulate in localStorage.

### Solution
Use the `updated_at` timestamp from the `site_settings` table as the dismiss key instead of the text hash. Every time you save banner settings in admin, `updated_at` changes, which invalidates all previous dismissals automatically.

### Changes

**`src/components/AnnouncementBanner.tsx`**
- Fetch `updated_at` along with the announcement settings (from the `announcement_text` row)
- Use `updated_at` as the localStorage dismiss key instead of `btoa(text)`
- When a user dismisses, store against the current `updated_at` value
- When admin saves new settings (even same text), `updated_at` changes, so the banner reappears for everyone

**`src/components/admin/AdminAnnouncementsTab.tsx`**
- No changes needed -- it already sets `updated_at: new Date().toISOString()` on every save, which is exactly what we need

### How It Works
1. Admin saves announcement settings -- `updated_at` gets a new timestamp
2. User visits site -- banner fetches settings including `updated_at`
3. User dismisses -- localStorage stores `announcement_dismissed_{timestamp}`
4. Admin saves again (new announcement or re-enables) -- new `updated_at` value
5. User visits again -- old dismiss key no longer matches, banner reappears
