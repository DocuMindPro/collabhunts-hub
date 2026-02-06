

# Add Profile IDs with Copy Button + Improve Admin Search

## Overview
Add a visible profile ID with a copy button on both creator and brand profile pages (visible only to admins), and enhance the admin Feature Overrides search to support searching by ID, name, or email.

## Changes

### 1. Creator Profile Page (`src/pages/CreatorProfile.tsx`)
- Add a small ID display below the creator name (visible only to admins)
- Show truncated UUID with a copy-to-clipboard button
- Format: `ID: 7cd60651...` with a small copy icon next to it
- Only visible when `isAdmin` is true (already tracked in state)

### 2. Admin Feature Overrides Search (`src/components/admin/AdminFeatureOverridesTab.tsx`)
- Update placeholder text to: "Search by ID, name, or email..."
- Add UUID search support: if search looks like a UUID, query `creator_profiles` and `brand_profiles` by `id` directly
- Also add search by `user_id` for UUID-like queries
- Show the profile ID next to each result button so admins can confirm they found the right one

### 3. Brand Profile Visibility
- Since the Brand.tsx page is a landing page (not a brand profile view), the brand ID will be shown in the admin Feature Overrides results instead
- In the admin panel, each brand result button will show the brand ID with a copy button

## Technical Details

### CreatorProfile.tsx Changes
- After the display name (both mobile and desktop), add a conditional block:
```tsx
{isAdmin && (
  <div className="flex items-center gap-1 text-xs text-muted-foreground">
    <span>ID: {creator.id.slice(0, 8)}...</span>
    <button onClick={() => { navigator.clipboard.writeText(creator.id); toast({ title: "ID copied" }); }}>
      <Copy className="h-3 w-3" />
    </button>
  </div>
)}
```

### AdminFeatureOverridesTab.tsx Changes
- Update search placeholder
- Detect UUID pattern in search query
- If UUID-like, search by `id` column directly on both tables
- Show profile ID (truncated) next to each result name
- Add a small copy button next to each result's ID

### Files to Modify
- `src/pages/CreatorProfile.tsx` -- Add admin-only ID display with copy button
- `src/components/admin/AdminFeatureOverridesTab.tsx` -- Update search to support ID, show IDs in results

