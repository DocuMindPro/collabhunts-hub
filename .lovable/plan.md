
# Enhance "Open to Invites" Banner - LinkedIn-Style Half-Moon Design

## Current State
The "Open to Invites" badge is currently a small green pill in the top-left corner of the creator card image. It's not prominent enough to catch attention.

## Proposed Design
Create a larger, more visible banner similar to LinkedIn's "Open to Work" feature. Two options:

### Option A: Arc/Half-Moon Banner (Recommended)
A curved green banner along the bottom-left corner of the image, similar to LinkedIn's iconic "Open to Work" frame.

```text
+---------------------------+
|                    ★ 5.0  |
|  ⓘ 1.1K                   |
|                           |
|       [Creator Photo]     |
|                           |
|  ╭───────────────╮        |
|  │ #OpenToInvite │ ← Curved green arc
|  ╰───────────────╯        |
|   toto                    |
|   Fashion                 |
+---------------------------+
```

### Option B: Corner Banner (Alternative)
A diagonal ribbon-style banner on the top-left or bottom-left corner.

## Implementation Details

### File: `src/pages/Influencers.tsx`

Replace the current small pill badge with a curved arc banner positioned at the bottom-left of the image (above the creator name overlay).

**Current Code (lines 665-668):**
```tsx
{creator.open_to_invitations && (
  <div className="absolute top-3 left-3 flex items-center gap-1 px-2 py-1 bg-green-500 rounded-full text-white text-[10px] font-medium z-10">
    Open to Invites
  </div>
)}
```

**New Design:**
```tsx
{creator.open_to_invitations && (
  <div className="absolute bottom-14 left-0 z-10">
    <div className="bg-green-500 text-white text-[11px] font-semibold px-4 py-1.5 rounded-r-full shadow-lg flex items-center gap-1.5">
      <span className="inline-block w-2 h-2 bg-white rounded-full animate-pulse" />
      Open to Invites
    </div>
  </div>
)}
```

This creates a:
- Larger banner positioned at bottom-left (above name)
- Rounded on the right side only (tab/ribbon effect)
- Includes a pulsing dot for attention
- More padding and larger text (11px vs 10px)
- Positioned above the creator name/category overlay

### Also Update
- Remove the conditional shift of the platform badge (no longer needed since badge moves to bottom)
- Apply same changes to all 3 repeated card sections in the file (lines ~665, ~762, ~852)

## Visual Comparison

**Before:**
```text
+------------------+
| [Open] [ⓘ 1.1K]  | ← Small pill, easily missed
|                  |
|   [Photo]        |
|                  |
|   Name           |
|   Category       |
+------------------+
```

**After:**
```text
+------------------+
|  [ⓘ 1.1K]   ★5.0 |
|                  |
|   [Photo]        |
|                  |
|  ● Open to Invites | ← Large tab banner
|   Name           |
|   Category       |
+------------------+
```

## Files to Modify

| File | Changes |
|------|---------|
| `src/pages/Influencers.tsx` | Update badge style in all 3 card sections (0-8, 8-16, 16+) |

## Summary
- Move badge from top-left corner to bottom-left (above creator name)
- Use a tab/ribbon style (rounded-r-full) instead of pill
- Increase size with larger padding and font
- Add pulsing indicator dot for extra visibility
- Remove platform badge conditional positioning logic
