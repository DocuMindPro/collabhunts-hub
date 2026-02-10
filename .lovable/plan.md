

## Fix Announcement Banner: Custom Link Text + Broken URL

### Two Issues

**1. "Learn More" is hardcoded** -- you can't change it to something like "Give Feedback" or "Read More"

**2. Link opens inside the app** -- entering `www.feedback.com` results in navigating to `yoursite.lovable.app/www.feedback.com` because there's no `https://` prefix. The link needs auto-prefixing.

### Solution

**Add a new field: "Link Text"** stored in `site_settings` as `announcement_link_text`, and **auto-prefix URLs** that don't start with `http://` or `https://`.

### Database Change

Add a new row to `site_settings` for `announcement_link_text` (single INSERT migration).

### File Changes

| File | Change |
|------|--------|
| `src/components/admin/AdminAnnouncementsTab.tsx` | Add "Link Text" input field next to "Link URL". Fetch/save `announcement_link_text`. Use it in the preview instead of hardcoded "Learn More". Auto-prefix URL with `https://` if missing when saving. |
| `src/components/AnnouncementBanner.tsx` | Fetch `announcement_link_text` from `site_settings`. Use it instead of hardcoded "Learn More". Auto-prefix URL with `https://` if it doesn't start with `http`. |

### Admin UI Layout (updated)

```text
Link URL (optional)          Link Text (optional)       Banner Style
[https://feedback.com   ]    [Give Feedback        ]    [Warning (Amber) v]
```

- "Link Text" defaults to "Learn More" if left empty
- URL auto-prefixed: `www.feedback.com` becomes `https://www.feedback.com`

### Technical Detail

URL fix in both files:
```typescript
const safeUrl = (url: string) => {
  if (!url) return "";
  if (url.match(/^https?:\/\//)) return url;
  return `https://${url}`;
};
```

No other files affected. Two files modified, one small migration.

