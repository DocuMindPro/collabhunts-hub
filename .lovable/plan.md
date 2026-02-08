

## Fix: Creator ID Search in Admin Panel + Shorten Copied ID Display

### Problem 1: Admin search doesn't find creators by ID
The search filter in `AdminCreatorsTab.tsx` only checks `display_name`, `email`, and `phone_number`. When you paste a creator ID, it finds nothing.

### Problem 2: The copied ID is the full UUID (too long)
On the creator profile page, clicking the ID copies the full UUID like `7cd60651-3545-43aa-84d6-f6d7dc8bf4b8`. You want a shorter format.

---

### Changes

**File 1: `src/components/admin/AdminCreatorsTab.tsx`**
- Update the search filter (around line 156) to also match against `c.id` (the creator profile UUID)
- This means pasting a full or partial UUID in the search box will find the matching creator

Current:
```tsx
filtered = filtered.filter(c =>
  c.display_name.toLowerCase().includes(search.toLowerCase()) ||
  c.email?.toLowerCase().includes(search.toLowerCase()) ||
  c.phone_number?.includes(search)
);
```

Updated to also check `c.id`:
```tsx
filtered = filtered.filter(c =>
  c.display_name.toLowerCase().includes(search.toLowerCase()) ||
  c.email?.toLowerCase().includes(search.toLowerCase()) ||
  c.phone_number?.includes(search) ||
  c.id.toLowerCase().includes(search.toLowerCase())
);
```

- Also update the search placeholder to mention ID: `"Search name, email, phone, ID..."`

**File 2: `src/pages/CreatorProfile.tsx`**
- Change the copy-to-clipboard action to copy only the first 8 characters (the short ID) instead of the full UUID
- This matches what's visually displayed (`7cd60651...`)
- The admin search will still work with partial matches, so searching `7cd60651` will find the creator

Two locations to update (mobile and desktop views, around lines 580-590 and 660-670):
- Change `navigator.clipboard.writeText(creator.id)` to `navigator.clipboard.writeText(creator.id.slice(0, 8))`

### No database changes needed.
