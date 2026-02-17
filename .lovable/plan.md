
## Native iOS App: Splash Screen + Scroll Fix + Logo Overlap + Creator UX

### Problem 1: Splash Screen Still Showing Cropped Logo

The `capacitor.config.ts` config already has `backgroundColor: '#F97316'` and `showSpinner: false`. However, the cropped "OLLA ts" image is still appearing. This means the **Capacitor native project still has the old `app-icon.png` configured as the splash screen image** in the compiled iOS project (the `ios/` folder). Since we can only change the web code, the fix is to ensure that `capacitor.config.ts` has `splashScreenImage` explicitly removed (or pointed to nothing), and that the `launchShowDuration` is set to `0` so the native splash is essentially invisible — React takes over immediately with the orange loading screen.

**Fix**: Set `launchShowDuration: 0` so the native splash disappears instantly and the React `NativeLoadingScreen` (already orange) handles the visible loading state. This removes the cropped image entirely from the user experience.

---

### Problem 2: Logo Appearing and Disappearing (Overlap)

The `Logo` component fetches the logo URL from the database asynchronously. On first render it shows `/app-icon.png` (fallback), then when the DB fetch completes it re-renders with the remote URL. This causes a flicker: the local icon shows → the remote logo loads → another repaint. The fix:

- Add a loading state to `Logo.tsx` — render nothing (or a placeholder) while the DB fetch is in progress, then show the correct logo once resolved
- Remove the initial fallback to `LOCAL_ICON` before the DB fetch completes — only use `LOCAL_ICON` if DB returns nothing

---

### Problem 3: Tabs Open in the Middle of the Page (No Scroll-to-Top)

When tapping a tab in `MobileBottomNav`, the dashboard content changes but the scroll position stays wherever it was. There is **no `ScrollToTop` component** in the native app — the search confirmed none exists.

**Fix**: Add a `useEffect` in `CreatorDashboard.tsx` that scrolls `window` to top `(0, 0)` whenever `activeTab` changes. This is the simplest, most reliable fix for native tab switching.

```typescript
useEffect(() => {
  window.scrollTo({ top: 0, behavior: 'instant' });
}, [activeTab]);
```

---

### Problem 4: Creator UX Gaps (Additional Improvements)

After reviewing all the creator dashboard code as a user:

**A. Dashboard header wastes space on native**: The "Dashboard" title + Notifications icon row at the top is not prominently useful. Replace with a welcome card showing the user's name and profile status badge — more personal and informative.

**B. The "profile" tab is accessible on native but has no place in the bottom nav** (account replaced it): When users tap "Edit Profile" from AccountTab or OverviewTab, it navigates to `tab=profile` which works fine — no change needed here, it's fine as-is.

**C. Profile tab on native lacks a "done/back" button**: When navigating to "Profile" from the Account tab's "Edit Profile" button, there's no easy way to go back. Add a back button at the top of `ProfileTab` when on native.

**D. OverviewTab — "Opportunities For You" section doesn't show when no opps match**: The entire opportunities section is hidden with `matchedOpportunities.length > 0`. On mobile, add a fallback "Browse Opportunities" CTA card when the list is empty, so creators always have a path forward.

**E. BookingsTab — needs scroll to top**: Same scroll issue.

---

### Files to Modify

| File | Change |
|---|---|
| `capacitor.config.ts` | Set `launchShowDuration: 0` to eliminate the native splash image entirely |
| `src/components/Logo.tsx` | Add loading state — don't render fallback icon while DB fetch is in progress; prevent flicker/overlap |
| `src/pages/CreatorDashboard.tsx` | Add `useEffect` to scroll to top on tab change; improve native header to show user's name |
| `src/components/creator-dashboard/ProfileTab.tsx` | Add "Back to Account" button at top for native users |
| `src/components/creator-dashboard/OverviewTab.tsx` | Add "Browse Opportunities" CTA card when no matched opps; add welcome greeting |

**No database changes required.**
