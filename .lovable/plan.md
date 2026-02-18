
# README Build Badge + Complete iOS Gap Audit

## Part 1: Build Status Badges for README

### What needs to change
The `README.md` file needs two GitHub Actions status badges added at the top — one for the iOS TestFlight build and one for the Android APK build. These badges auto-update to show passing/failing status on every push to `main`.

The badge URLs follow the GitHub Actions standard format:
```
https://github.com/{OWNER}/{REPO}/actions/workflows/{workflow-filename}/badge.svg
```

Both workflow files are already defined:
- `.github/workflows/build-ios.yml` → workflow name: `Build iOS & Upload to TestFlight`
- `.github/workflows/build-android.yml` → workflow name: `Build Android APK`

**Important:** Since this is a Lovable-connected repo, the GitHub username and repo name aren't hardcoded in the project files. The badge will use a placeholder that the user replaces once — OR we can use a relative path approach that works once the repo is known. The cleanest approach is to add the badges with a clear `YOUR-GITHUB-USERNAME/YOUR-REPO-NAME` placeholder so you can fill it in once.

Badges will be added right at the top of `README.md`, before "Project Info", so they are immediately visible on the GitHub repo homepage.

---

## Part 2: Gap Audit — What's Still Missing or Wrong

After reading every relevant native file, here is the complete list of remaining gaps:

---

### Gap 1: `NativeBrandDashboard.tsx` — Content Hidden Behind Bottom Nav (CRITICAL)

**Problem:** The dashboard renders tab content in `<div className="pb-20">`. On iPhone with the home indicator, the bottom nav has `safe-area-bottom` which adds `~34px` to its visual height on top of `64px (h-16)`. Total nav height = ~98px. But `pb-20` = only `80px`. This means the last ~18px of every tab's content is **hidden behind the bottom nav on iPhone X and later**.

**Fix:** Change `pb-20` to `pb-24` AND add `safe-area-bottom` padding to account for the home indicator:
```tsx
// BEFORE
<div className="pb-20">{renderTab()}</div>

// AFTER
<div className="pb-24 safe-area-bottom">{renderTab()}</div>
```

---

### Gap 2: `CreatorDashboard.tsx` — Same Bottom Nav Content Overlap (CRITICAL)

**Problem:** The creator dashboard wrapper in `App.tsx` line 120: `<div className="min-h-screen bg-background pb-20">`. Same issue — `pb-20` only covers the 64px nav bar height but misses the `env(safe-area-inset-bottom, ~34px)` extra spacing on iPhone.

**Fix:** Change the wrapper in `App.tsx` (the `NativeAppRoutes` component) from `pb-20` to `pb-24 safe-area-bottom`. Also, `CreatorDashboard.tsx` itself uses `pb-20` on the outer wrapper — change it too.

---

### Gap 3: `NativeCreatorOnboarding.tsx` — Fixed Footer Button Hidden Behind Home Indicator (CRITICAL)

**Problem:** The "Continue" / "Create Profile" fixed footer button uses:
```tsx
<div className="fixed bottom-0 left-0 right-0 p-4 bg-background border-t border-border safe-area-bottom">
```
This has `safe-area-bottom` ✅ — BUT `safe-area-bottom` only adds `padding-bottom: env(safe-area-inset-bottom, 0px)`. The button inside the footer still sits at `bottom: 0`. The button's touch area is fine BUT the scroll container `pb-24` may not be tall enough since the footer + safe area can be ~110px tall. The scrollable content area needs `pb-28 safe-area-bottom` to ensure the last input/element isn't hidden behind the footer.

**Fix:** Change the scroll container from `pb-24` to:
```tsx
<div ref={scrollContainerRef} className="flex-1 overflow-y-auto px-4" 
  style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 120px)' }}>
```
Using inline style here is safer because we need additive math (`safe-area + footer-height`), which CSS utility classes can't do without a calc() expression.

---

### Gap 4: `MobileBottomNav.tsx` — Nav Height Mismatch Causes Content Clip (MEDIUM)

**Problem:** `MobileBottomNav` has `safe-area-bottom` on the `<nav>` — this is correct. BUT `h-16` (64px) is the height of the tab row ABOVE the safe area. The total nav height varies by device:
- iPhone without home indicator: 64px
- iPhone with home indicator (X/11/12/13/14/15): 64px + ~34px = ~98px

The creator dashboard wrapper uses a fixed `pb-20 (80px)` — not enough for newer iPhones. This is the same root cause as Gap 2.

**Fix:** Covered by Gap 2 fix.

---

### Gap 5: `NativeRolePicker.tsx` — Version Number is Hardcoded `v1.0.0 (build 1)` (MINOR)

**Problem:** At the bottom of the role picker screen:
```tsx
<p className="mt-4 text-xs text-muted-foreground/60">v1.0.0 (build 1)</p>
```
This is hardcoded and will never update. As you push new builds (the Android CI already bumps build numbers automatically), this shows a stale version.

**Fix:** Use `VITE_APP_VERSION` from the environment, or simply remove the hardcoded string and replace with `import.meta.env.VITE_APP_VERSION || 'v1.0'`. We also add `VITE_APP_VERSION` to the Android + iOS CI workflows as a build step so it stays current.

Actually, the simpler fix is to inject the version dynamically from `package.json` via `vite.config.ts`. Vite already has access to `process.env` during build. We add:
```typescript
// vite.config.ts
define: {
  __APP_VERSION__: JSON.stringify(process.env.npm_package_version),
}
```
Then in `NativeRolePicker.tsx`:
```tsx
declare const __APP_VERSION__: string;
<p>v{__APP_VERSION__}</p>
```

---

### Gap 6: `NativeDebugConsole.tsx` — Debug Button Overlaps Bottom Nav (MEDIUM)

**Problem:** The floating debug button is positioned at:
```tsx
bottom: 'calc(env(safe-area-inset-bottom, 0px) + 96px)',
```
This puts it 96px above the bottom of the screen. But the bottom nav is `h-16 (64px) + safe-area-inset-bottom`. On newer iPhones with ~34px safe area, the nav is ~98px tall. So `96px` barely clears it — the debug button visually overlaps or sits right on top of the nav edge.

**Fix:** Change to `112px` base offset:
```tsx
bottom: 'calc(env(safe-area-inset-bottom, 0px) + 112px)',
```

---

### Gap 7: `NativeBrandOnboarding.tsx` — Missing `safe-area-bottom` on Scroll Content

**Problem:** Looking at how `NativeCreatorOnboarding` handles its scroll container vs `NativeBrandOnboarding` — both have a fixed footer button. The brand onboarding scroll content similarly risks being hidden behind the footer + home indicator on newer iPhones.

**Fix:** Apply the same `paddingBottom: calc(...)` inline style to the scroll container in `NativeBrandOnboarding.tsx`.

---

## Complete File Change List

| File | Change | Priority |
|---|---|---|
| `README.md` | Add iOS + Android build status badges at top | High |
| `src/App.tsx` | Change `pb-20` → `pb-24 safe-area-bottom` in `NativeAppRoutes` wrapper div | Critical |
| `src/pages/NativeBrandDashboard.tsx` | Change `pb-20` → inline `paddingBottom: calc(...)` on content wrapper | Critical |
| `src/pages/NativeCreatorOnboarding.tsx` | Fix scroll container bottom padding to include footer height + safe area | Critical |
| `src/pages/NativeBrandOnboarding.tsx` | Same scroll container fix as onboarding | Critical |
| `src/components/NativeDebugConsole.tsx` | Bump floating button offset from 96px → 112px | Medium |
| `src/components/NativeRolePicker.tsx` | Replace hardcoded version string with dynamic from package.json | Minor |
| `vite.config.ts` | Inject `__APP_VERSION__` from package.json | Minor |

---

## Technical Implementation Details

### README Badges (exact markdown)
```markdown
[![iOS Build](https://github.com/YOUR-GITHUB-USERNAME/YOUR-REPO-NAME/actions/workflows/build-ios.yml/badge.svg)](https://github.com/YOUR-GITHUB-USERNAME/YOUR-REPO-NAME/actions/workflows/build-ios.yml)
[![Android Build](https://github.com/YOUR-GITHUB-USERNAME/YOUR-REPO-NAME/actions/workflows/build-android.yml/badge.svg)](https://github.com/YOUR-GITHUB-USERNAME/YOUR-REPO-NAME/actions/workflows/build-android.yml)
```

**After I make the change, you need to replace `YOUR-GITHUB-USERNAME/YOUR-REPO-NAME` with your actual GitHub username and repository name.** You can find this in your GitHub repo URL: `https://github.com/YOUR-USERNAME/YOUR-REPO`. It's a one-time, 30-second edit.

### Content Padding Fix (the right formula)

The bottom nav is always `64px (h-16)` for the visible tabs. On top of that, `safe-area-inset-bottom` (usually `~34px` on modern iPhones, `0px` on Android and older iPhones). The scroll content must clear BOTH:

```
required padding = nav-height (64px) + safe-area-inset-bottom + extra breathing room (16px)
= calc(env(safe-area-inset-bottom, 0px) + 80px)
```

This is applied as an inline style so CSS `calc()` with `env()` works correctly (Tailwind can't compose these two values together without JIT arbitrary values which are less readable).

### Version Injection

In `vite.config.ts`, inside `defineConfig`:
```typescript
define: {
  __APP_VERSION__: JSON.stringify(process.env.npm_package_version ?? '1.0.0'),
},
```

In `NativeRolePicker.tsx`, declare the global and use it:
```typescript
declare const __APP_VERSION__: string;
// ...
<p className="mt-4 text-xs text-muted-foreground/60">v{__APP_VERSION__}</p>
```

`npm_package_version` is automatically set by npm/bun when running scripts, so this works in both local dev and CI without any extra steps.
