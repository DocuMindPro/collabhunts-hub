

## Improve Native Brand Experience: Login, Search, and Dashboard

This plan covers three major areas of improvement for brands using the mobile app.

---

### 1. Enhanced Native Login (Confirm Password + Google Sign-In)

**File: `src/pages/NativeLogin.tsx`**

- Add a "Confirm Password" field that only appears in Sign Up mode. Validates that both passwords match before submitting.
- Add a "Sign in with Google" button using the Lovable Cloud OAuth integration (`lovable.auth.signInWithOAuth("google")`). This requires first configuring social login via the tool, which generates the `src/integrations/lovable/` module.
- Add a divider ("or") between Google sign-in and email/password form.
- Phone sign-in is not natively supported by Lovable Cloud OAuth, so it won't be added here (the existing phone OTP flow on the web signup pages remains available).

### 2. Overhauled Native Brand Search

**File: `src/components/mobile/NativeBrandSearch.tsx`**

The current search is bare-bones -- just a text search with a flat list. This will be upgraded to a proper discovery experience:

- **Category filter chips**: Horizontal scrollable row of category pills (Lifestyle, Fashion, Beauty, Travel, etc.) that filter results by category.
- **Location filter**: A dropdown/select for filtering by city (using the existing Lebanese city data from `src/config/country-locations.ts`).
- **Sort options**: Dropdown to sort by Rating, Featured, or Newest.
- **Better creator cards**: Show avatar, name, category badge, location, rating stars, follower count from social accounts, and a "View Profile" button. Cards will be visually richer with proper spacing and borders.
- **Empty state**: More helpful empty state with suggestions to try different filters.
- **Result count**: Show "X creators found" at the top.
- Increase the default fetch limit and add pagination or "Load more" button.

### 3. Richer Brand Dashboard with Overview Tab

**Files: `src/pages/NativeBrandDashboard.tsx`, `src/components/mobile/BrandBottomNav.tsx`**

Currently the brand lands on Messages with only 4 tabs. The experience needs a proper home/overview:

- **Add a "Home" tab** to `BrandBottomNav` (replacing the current default of Messages). This becomes the landing tab. The bottom nav becomes: Home, Messages, Bookings, Search (Alerts moved into Home as a section).
- **Create `src/components/mobile/NativeBrandHome.tsx`**: A proper overview/home screen for brands containing:
  - Welcome header with brand name
  - Quick stats cards (unread messages, pending bookings, active opportunities)
  - Recent notifications/alerts section (inline, replacing the dedicated Alerts tab)
  - Quick action buttons: "Find Creators", "Post Opportunity", "View Bookings"
  - A "Featured Creators" horizontal scroll carousel showing top creators

---

### Technical Details

**Google OAuth Setup:**
- Will use the `configure-social-auth` tool to generate the Lovable integration module
- Then import `lovable` from `@/integrations/lovable/index` in NativeLogin
- Call `lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin })`

**Search Improvements - Data Query:**
```sql
-- The existing query will be enhanced to also fetch:
-- social_accounts (for follower counts)
-- services (for pricing info)
-- Filter by category, location_city
-- Order by is_featured desc, average_rating desc
```

**New/Modified Files:**
1. `src/pages/NativeLogin.tsx` -- Add confirm password + Google sign-in
2. `src/components/mobile/NativeBrandSearch.tsx` -- Full rewrite with filters and better cards
3. `src/components/mobile/NativeBrandHome.tsx` -- New file: brand home/overview screen
4. `src/components/mobile/BrandBottomNav.tsx` -- Update tabs (add Home, remove Alerts)
5. `src/pages/NativeBrandDashboard.tsx` -- Add Home tab routing, update default tab

