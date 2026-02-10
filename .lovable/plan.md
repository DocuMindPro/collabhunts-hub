
## Fix: Trim Whitespace from Announcement Banner URLs

### Problem
The URL stored in the database has a leading space (` www.feedback.com`). When the `safeUrl` function prepends `https://`, it becomes `https:// www.feedback.com`, which the browser encodes as `https://%20www.feedback.com` -- an invalid URL.

### Root Cause
The `safeUrl` function in `AnnouncementBanner.tsx` does not trim whitespace from the input URL before processing it.

### Fix (Two Files)

**1. `src/components/AnnouncementBanner.tsx`** -- Add `.trim()` to `safeUrl`:
```typescript
const safeUrl = (url: string) => {
  if (!url) return "";
  const trimmed = url.trim();
  if (trimmed.match(/^https?:\/\//)) return trimmed;
  return `https://${trimmed}`;
};
```

**2. `src/components/admin/AdminAnnouncementsTab.tsx`** -- Trim the URL when saving so the database value is clean going forward. In the `saveBannerSettings` function, trim `bannerLink` before saving:
```typescript
{ key: "announcement_link", value: bannerLink.trim() },
```

This two-pronged approach ensures:
- Existing dirty data in the DB is handled correctly by the banner
- New saves from admin always store clean URLs
