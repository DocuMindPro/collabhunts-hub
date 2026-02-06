

# Make Brand Logos Bigger and More Visible

## Problem
The brand logo on opportunity cards is currently `h-7 w-7` (28px) which is too small to see clearly, especially for logos with text or detail.

## Changes

### 1. Increase logo size on Opportunity cards
In `src/pages/Opportunities.tsx` (line 374), increase the ProfileAvatar from `h-7 w-7` to `h-9 w-9` (36px) and update the fallback text size from `text-[10px]` to `text-xs`.

### 2. Increase logo size in Admin dialog
In `src/pages/Admin.tsx` (line 1676), increase the brand logo thumbnail from `h-10 w-10` to `h-14 w-14` for better visibility in the user details view.

### Technical Details

**`src/pages/Opportunities.tsx`** (line 374):
```tsx
// From:
className="h-7 w-7 shrink-0"
fallbackClassName="text-[10px]"

// To:
className="h-9 w-9 shrink-0"
fallbackClassName="text-xs"
```

**`src/pages/Admin.tsx`** (line 1676):
```tsx
// From:
className="h-10 w-10 rounded object-cover"

// To:
className="h-14 w-14 rounded-lg object-cover border"
```

### Files to Modify
- `src/pages/Opportunities.tsx` -- increase avatar size on cards
- `src/pages/Admin.tsx` -- increase logo thumbnail in admin detail view
