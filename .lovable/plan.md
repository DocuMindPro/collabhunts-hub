
# Fix Invisible Rotating Slogans

## Root Cause

CSS `background-clip: text` only clips the background to the text content of the element it's applied to. It does **not** inherit into child elements. Since `RotatingText` renders nested `<span>` elements, the gradient+clip on the wrapper in `Index.tsx` has no visible text to clip to -- making the slogans invisible.

## Solution

Move the gradient text styling into the `RotatingText` component itself, directly on the `<span>` that contains the actual text. Remove it from the wrapper in `Index.tsx`.

## Changes

### 1. `src/pages/Index.tsx` (~line 155)
Remove the gradient/clip classes from the wrapper span:

```tsx
// Before
<span className="bg-gradient-to-r from-primary to-yellow-500 bg-clip-text text-transparent">
  <RotatingText words={rotatingWords} />
</span>

// After -- just pass a className to RotatingText, no gradient wrapper needed
<RotatingText 
  words={rotatingWords} 
  className="bg-gradient-to-r from-primary to-yellow-500 bg-clip-text text-transparent" 
/>
```

### 2. `src/components/RotatingText.tsx` (~line 27-35)
Apply the passed `className` (which includes the gradient) to the inner text span, not the outer wrapper:

```tsx
// Before
<span className={cn("inline-block relative", className)}>
  <span className={cn("inline-block transition-all duration-500", ...)}>
    {words[currentIndex]}
  </span>

// After
<span className="inline-block relative">
  <span className={cn("inline-block transition-all duration-500", className, ...)}>
    {words[currentIndex]}
  </span>
```

This puts the gradient + `bg-clip-text` + `text-transparent` directly on the element that holds the text, which is the only way `background-clip: text` works in CSS.

## Files

| File | Action |
|------|--------|
| `src/pages/Index.tsx` | Remove gradient wrapper, pass className to RotatingText |
| `src/components/RotatingText.tsx` | Apply className to inner text span |

## Notes
- The user is viewing the **published** site (collabhunts.com). After this fix, the changes need to be **published** to appear on the live domain.
- The animated gradient underline is unaffected -- it renders separately and already works.
