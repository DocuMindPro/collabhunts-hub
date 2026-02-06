

# Make Profile ID Visible to Everyone (Not Admin-Only)

## What's Changing

The creator profile ID with the copy button already exists in the code, but it's currently hidden behind an admin-only check. You want it visible to all visitors, similar to how TikTok shows user IDs publicly.

## Changes

### 1. CreatorProfile.tsx -- Remove admin-only restriction (2 places: mobile + desktop layouts)

- **Mobile layout (line 582)**: Remove the `{isAdmin && (` wrapper so the ID + copy button is always shown
- **Desktop layout (line 664)**: Same removal

The ID display will show a truncated ID like `ID: 7cd60651...` with a copy icon, visible to everyone.

### 2. Brand Profile

Brands don't have a public profile page like creators do -- the Brand.tsx page is a general landing page. Brand IDs are already visible with copy buttons in the admin Feature Overrides search results, which is the primary place where brand IDs are needed. No changes needed here.

### Technical Details

Both mobile and desktop sections will change from:
```tsx
{isAdmin && (
  <button onClick={...}>
    <span>ID: {creator.id.slice(0, 8)}...</span>
    <Copy />
  </button>
)}
```
To simply:
```tsx
<button onClick={...}>
  <span>ID: {creator.id.slice(0, 8)}...</span>
  <Copy />
</button>
```

### Files to Modify
- `src/pages/CreatorProfile.tsx` -- Remove `isAdmin` guard from ID display in both mobile and desktop layouts
