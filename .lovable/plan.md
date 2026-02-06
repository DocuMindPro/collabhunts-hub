

# Fix Inconsistent Navbar Icon Sizes

## Problem
The three icons in the navbar (Knowledge Base, Messages, Notifications) are different sizes:
- BookOpen (Knowledge Base): `h-4 w-4` (16px) -- too small
- MessageSquare (Messages): `h-5 w-5` (20px)
- Bell (Notifications): `h-5 w-5` (20px)

## Fix
Change the BookOpen icon from `h-4 w-4` to `h-5 w-5` so all three navbar icons are a consistent 20px.

## Technical Details

**File: `src/components/Navbar.tsx`** (line 252):
```tsx
// From:
<BookOpen className="h-4 w-4" />

// To:
<BookOpen className="h-5 w-5" />
```

One line change, one file.

