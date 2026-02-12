

## Remove "View all releases on GitHub" Link

Remove the "View all releases on GitHub" link from the `/download` page, as shown in the screenshot.

### Change

**File: `src/pages/Download.tsx`** (lines 115-122)
- Delete the `<a>` tag that links to `https://github.com/DocuMindPro/collabhunts-hub/releases`

