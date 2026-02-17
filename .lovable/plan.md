
## Native iOS App: Splash Screen Fix + UX Simplification

### What's Wrong with the Current Splash Screen

The screenshot shows the Capacitor native splash screen using `app-icon.png` with `androidScaleType: 'CENTER_CROP'` — this zooms in and crops the image so only the center "OLLA ts" text is visible, giant and cut off. This is the **Capacitor SplashScreen plugin** behavior, not React code. The fix has two parts:

1. **Replace the splash screen image** — Capacitor needs a proper full-screen splash image (not a small icon). The `app-icon.png` is a small square icon, not designed to be a full-screen splash.
2. **Update the React loading screen** — Make it a clean orange screen with a centered white spinner.

---

### Part 1 — Splash Screen Fix

**Root Cause**: `app-icon.png` is a small circular icon being stretched/cropped to fill the whole phone screen.

**Fix in `capacitor.config.ts`**:
- Change `backgroundColor` from `#1a1a2e` (dark navy) to `#F97316` (brand orange)
- Change `showSpinner` to `false` — the Capacitor native spinner looks bad; React will show the loading UI instead
- Remove `androidScaleType: 'CENTER_CROP'` — this is what causes the zoomed-in crop effect

The result: the native splash will show a clean solid orange screen for 2 seconds before React loads. Simple, branded, zero crop issues.

**Fix `src/components/NativeLoadingScreen.tsx`**:
- Change background from `bg-background` (white/dark based on theme) to solid brand orange (`bg-[#F97316]`)
- Change the spinning ring from `border-primary` to white (`border-white/30 border-t-white`)
- Remove the app-icon image from the spinner center (no more stretched icon)
- Change text to white
- This creates a seamless transition: native splash (orange) → React loading (orange) → app

**Fix `index.html` pre-React loader**:
- Change `background: #1a1a2e` to `background: #F97316`
- Change text/spinner colors to white
- This prevents any dark "flash" between native splash and React hydration

**Fix `src/components/PageLoader.tsx`**:
- Same orange background treatment for consistency

---

### Part 2 — UX Gaps Found (Acting as User)

After reviewing all native flows:

#### A. Brand Dashboard — No Sign Out Button
The `BrandAccountTab` (shown when brands tap "Account") has zero sign-out functionality. Brands are stuck — they cannot log out of the app. Fix: Add a **Sign Out** button at the bottom of `BrandAccountTab` when on native platform, similar to the creator `AccountTab`.

#### B. Creator Onboarding — Too Much Friction on Step 1
- **Profile photo is required** — Most users don't have a photo ready. Making it optional removes a major drop-off point. Photo can be added later from the dashboard.
- **Bio requires 50 characters** — On mobile, typing 50 chars is annoying. Reduce to 20 characters minimum. Still enough to tell brands who they are.

#### C. Brand Onboarding — Location is a Separate Step (Wasted Step)
The brand flow for existing users is: Company Details → **Location (entire screen just for country + address)** → Logo & Social. The Location step has only 2 fields. Merging it into Company Details reduces from 3 steps to 2 for existing brand users — much faster.

#### D. Creator Onboarding — Service Types Are Wrong for Creators
The service types listed are: "Meet & Greet", "Workshop", "Competition Event", etc. These are **event/venue services**, not influencer/creator services. A creator's services should be things like: "Instagram Post", "TikTok Video", "YouTube Integration", "Story Mention", "Reel", "Live Stream", etc. This is a significant gap that makes creators confused about what to offer.

#### E. Bio Counter Shows Wrong Max
The bio counter shows `{bio.length}/50 characters` but 50 is the minimum, not the max. This is confusing. Should show min requirement clearly.

---

### Files to Modify

| File | Change |
|---|---|
| `capacitor.config.ts` | Orange background, no spinner, no CENTER_CROP |
| `src/components/NativeLoadingScreen.tsx` | Orange bg, white spinner ring, white text, no icon |
| `index.html` | Pre-React loader: orange bg, white text/spinner |
| `src/components/PageLoader.tsx` | Orange bg, white elements |
| `src/components/brand-dashboard/BrandAccountTab.tsx` | Add Sign Out button at bottom |
| `src/pages/NativeBrandOnboarding.tsx` | Merge Location step into Company Details (2 steps instead of 3 for existing users) |
| `src/pages/NativeCreatorOnboarding.tsx` | Make photo optional, reduce bio min to 20 chars, fix bio counter label, fix service types to creator-relevant ones |

**No database changes required.**
