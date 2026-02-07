

## Fix Hero Image Scroll Movement and Cut-Off Badge on Homepage

### Problems
1. **Hero image moves on scroll**: The `ParallaxImage` component applies a `translateY` transform during scroll, making the image shift up/down as you scroll -- this looks jarring.
2. **"Live - In-Person Events" badge is cut off**: The floating badge uses negative positioning (`-bottom-4 -right-4`) but sits inside the `ParallaxImage` container which has `overflow-hidden`, clipping the badge.

### Solution

**`src/pages/Index.tsx`**
- Move the "Live - In-Person Events" floating badge **outside** the `ParallaxImage` component so it's not clipped by the `overflow-hidden`
- Wrap both the `ParallaxImage` and the badge in a `relative` container div so the badge still positions correctly relative to the image
- Reduce the parallax speed or disable it entirely so the image stays stable on scroll (the subtle movement causes more visual confusion than polish on this hero)

**`src/pages/Index.tsx` changes (lines ~231-253)**
- Wrap the ParallaxImage + badge in a new `<div className="relative">` container
- Move the badge div to be a sibling of ParallaxImage (not a child), positioned relative to the wrapper
- Set parallax `speed={0}` or simply replace `ParallaxImage` with a static image to stop the scroll movement

### Technical Details

The `ParallaxImage` component has `overflow-hidden` baked into line 73, which is required for the parallax effect (the image is scaled 110% and translates). Since we want the badge visible outside the image bounds, we need to separate them. The fix restructures the markup like this:

```
Before:
  <ParallaxImage> (overflow-hidden)
    <img /> (moves on scroll)
    <badge /> (clipped!)
  </ParallaxImage>

After:
  <div className="relative"> (no overflow-hidden)
    <ParallaxImage speed={0}> (or static img)
      <img /> (stays put)
    </ParallaxImage>
    <badge /> (now visible, positioned relative to wrapper)
  </div>
```

This is a small, focused change -- only the hero section markup in `Index.tsx` needs updating. No component changes required.
