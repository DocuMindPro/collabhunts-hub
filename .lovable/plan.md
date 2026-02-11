

## Fix: Add Missing Routes to Native App

### Problem
On native platforms (BlueStacks/Android), the app uses `NativeAppRoutes` which only registers 3 routes:
- `/` (redirects to dashboard)
- `/creator-dashboard`
- `/creator/:id`

When you tap "View All", an opportunity row, or "Browse All", they all link to `/opportunities` which is **not registered** as a native route. The catch-all `*` route redirects back to `/creator-dashboard`, making it look like the page just reloads.

### Solution
Add the `/opportunities` route (and its lazy-loaded `Opportunities` page) to the `NativeAppRoutes` in `src/App.tsx`.

### Technical Details

**File: `src/App.tsx`**

1. The `Opportunities` page is already lazy-loaded at line 53. It just needs to be added to the native routes block.

2. Update `NativeAppRoutes` (lines 73-82) to include:
```
<Route path="/opportunities" element={
  <Suspense fallback={<PageLoader />}>
    <Opportunities />
  </Suspense>
} />
```

3. Since the `Opportunities` page uses `Navbar` and `Footer` (web components), we should also verify it renders cleanly on native. The page at `src/pages/Opportunities.tsx` will need a quick check -- if it includes Navbar/Footer, those should be conditionally hidden on native to avoid broken navigation elements.

**File: `src/pages/Opportunities.tsx`** (if needed)
- Wrap `Navbar` and `Footer` with `!isNativePlatform()` checks so the page renders cleanly within the native app's bottom-nav layout.

This is a minimal, targeted fix -- just registering the missing route so navigation works.

