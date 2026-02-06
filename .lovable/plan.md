

# Upgrade Hero Rotating Slogans

## What Changes

Replace the current 4 rotating words beneath "Find Your Creator" with 4 punchier, more memorable slogans that reinforce the platform's core value props (zero fees, privacy, local creators, results).

## New Slogans

1. **"Zero Fees, Full Impact"** -- Immediately hits the $0 fee message with a power close
2. **"Your City, Your Creator"** -- Emphasizes the local, in-person angle
3. **"Private. Direct. Done."** -- Three punchy words capturing confidentiality + simplicity
4. **"Where Collabs Come Alive"** -- Emotional hook tying to live events

## Code Change

**`src/pages/Index.tsx`** -- Update the `rotatingWords` array (~line 136):

```tsx
// Before
const rotatingWords = ["Made Simple", "Zero Fees", "Near You", "That Convert"];

// After
const rotatingWords = ["Zero Fees, Full Impact", "Your City, Your Creator", "Private. Direct. Done.", "Where Collabs Come Alive"];
```

Single line change, no new files needed. The existing `RotatingText` component already handles the fade-in/fade-out animation and gradient underline.

