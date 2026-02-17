
## Native Brand UX: 5 Critical Fixes

### Issue 1: "Brand profile created!" Toast Gets Stuck

**Root cause**: The toast notification that fires after brand profile creation is using the `sonner` toast library's default behavior — it persists until dismissed or until `duration` expires. On native mobile, the notification appears at the bottom and never auto-dismisses if the component that triggered it stays mounted.

**Fix**: In `src/pages/NativeBrandOnboarding.tsx` (and wherever this toast fires), ensure `duration: 3000` is explicitly set, and verify the toast call uses `sonner` (not the shadcn `toast`) so it auto-dismisses. Additionally, add scroll-to-top behavior in `NativeBrandDashboard.tsx` when the tab changes so any lingering UI is cleared.

**Also**: Add `useEffect` scroll-to-top to `NativeBrandDashboard.tsx` when `currentTab` changes — same fix applied to creator dashboard.

---

### Issue 2: Bookings Tab Opens Mid-Page (Not Scrolled to Top)

**Root cause**: `NativeBrandDashboard.tsx` has no scroll-to-top logic. When `handleTabChange("bookings")` is called, `currentTab` changes but the page stays at its previous scroll position. `BrandBookingsTab` is a full component with content — it renders below the fold if the previous tab was long.

**Fix**: Add `useEffect` to `NativeBrandDashboard.tsx`:
```typescript
useEffect(() => {
  setTimeout(() => { window.scrollTo({ top: 0, behavior: 'instant' }); }, 0);
}, [currentTab]);
```

This mirrors the fix already applied to `CreatorDashboard.tsx`.

---

### Issue 3: "Post Opportunity" Quick Action Does Nothing

**Root cause**: In `NativeBrandHome.tsx`, the "Post Opportunity" quick action navigates to `/brand-dashboard?tab=opportunities`. However, the brand is already on the native dashboard (not the web `BrandDashboard` page). Navigating to `/brand-dashboard` on native would redirect to the native dashboard anyway, but the `tab=opportunities` param isn't handled by `NativeBrandDashboard` — the tab rendering only handles: `home`, `messages`, `bookings`, `search`, `notifications`, `account`.

**Fix**: Change the action to use `onTabChange` to switch to a native-handled tab. Since the native dashboard doesn't have an opportunities tab, we have two options:
1. Open the web `/brand-dashboard?tab=opportunities` with `navigate()` — but this takes the user out of the native flow
2. **Better**: Add a simple "Create Opportunity" flow using the existing `CreateOpportunityDialog` component rendered natively within the Home tab

**Implementation**: Change the "Post Opportunity" action in `NativeBrandHome.tsx` to open `CreateOpportunityDialog` directly inline (it already exists in `BrandOpportunitiesTab`). Pass `brandProfileId` as a prop from `NativeBrandDashboard` to `NativeBrandHome`.

---

### Issue 4: Creator Badges (Vetted/Fast/Free Invites) Missing from Mobile Search

**Root cause**: `NativeBrandSearch.tsx` fetches only: `id, display_name, profile_image_url, categories, location_city, location_country, average_rating, is_featured, bio`. It does NOT fetch:
- `verification_payment_status` + `verification_expires_at` — needed for VIP/Vetted badge
- `avg_response_minutes` — needed for Responds Fast badge
- `open_to_invitations` — needed for Free Invites badge

The web `Influencers.tsx` page fetches all of these and renders `VettedBadge`, `RespondsFastBadge`, `VIPCreatorBadge`, and `FeaturedBadge` on each card.

**Fix**:
1. Update the `CreatorCard` interface in `NativeBrandSearch.tsx` to include these fields
2. Add them to the Supabase query `select()`
3. Render inline badge pills below the creator name in each card using the same badge components (`VettedBadge`, `RespondsFastBadge`, `FeaturedBadge`), matching website behavior

---

### Issue 5: Brand UX — Additional Polish

While reviewing the brand flow as a user:

**A. BrandBookingsTab "Book a Creator" button navigates to `/influencers`** — on native this opens the web influencers page, breaking the native UX. It should call `onTabChange("search")` instead. This requires passing `onTabChange` as a prop to `BrandBookingsTab` when rendered in native context.

However, since `BrandBookingsTab` is shared between web and native, the cleanest fix is to check if we're on a native platform inside the booking tab and navigate differently.

**Implementation**: Pass a `onFindCreators` prop (optional) to `BrandBookingsTab`. When provided (native context), use it instead of `navigate("/influencers")`.

---

### Files to Modify

| File | Change |
|---|---|
| `src/pages/NativeBrandDashboard.tsx` | Add `useEffect` scroll-to-top on `currentTab` change; pass `brandProfileId` to `NativeBrandHome`; handle `onTabChange("post-opportunity")` |
| `src/components/mobile/NativeBrandHome.tsx` | Fix "Post Opportunity" — fetch `brandProfileId` and open `CreateOpportunityDialog` directly; accept `onFindCreators` prop |
| `src/components/mobile/NativeBrandSearch.tsx` | Add badge fields to query + `CreatorCard` interface; render `VettedBadge`, `RespondsFastBadge`, `FeaturedBadge` pills on cards |
| `src/components/brand-dashboard/BrandBookingsTab.tsx` | Add optional `onFindCreators` prop; use it for the "Book a Creator" / "Find Creators" buttons when on native |

**No database changes required.**
