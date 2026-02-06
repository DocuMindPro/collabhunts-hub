

# Fix Invisible Rotating Slogans

## Problem
The rotating slogans render in the DOM (the gradient underline is visible), but the text itself is invisible. The root cause is a CSS conflict: the custom `.gradient-accent` class sets `background` via shorthand, which gets overridden by or conflicts with Tailwind's `bg-clip-text` utility. The text is set to `text-transparent` but the gradient background isn't clipping to the text properly.

## Solution
Replace the custom `bg-gradient-accent` class with an inline Tailwind gradient that works reliably with `bg-clip-text text-transparent`.

## Change

**`src/pages/Index.tsx`** (~line 148-150): Replace the gradient span wrapping `RotatingText`:

```tsx
// Before
<span className="bg-gradient-accent bg-clip-text text-transparent">
  <RotatingText words={rotatingWords} />
</span>

// After
<span className="bg-gradient-to-r from-primary to-yellow-500 bg-clip-text text-transparent">
  <RotatingText words={rotatingWords} />
</span>
```

This uses Tailwind's native gradient utilities which are fully compatible with `bg-clip-text`. The colors (`from-primary to-yellow-500`) match the existing accent gradient (orange to gold).

## Files

| File | Action |
|------|--------|
| `src/pages/Index.tsx` | Fix gradient class on RotatingText wrapper |

