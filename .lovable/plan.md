

## Native iOS App Polish and UX Simplification

This plan covers two areas: (1) fixing the splash/loading screen, and (2) simplifying the user experience for both brands and creators.

---

### 1. Fix the Splash / Loading Screen

**The Problem**: The current Capacitor splash screen shows the app-icon.png stretched/cropped badly on iOS (the zoomed-in orange screenshot you shared). This is the native Capacitor SplashScreen plugin using `CENTER_CROP` with `backgroundColor: '#1a1a2e'`.

**The Fix**: Replace the current splash approach with a clean, branded orange screen with a simple white spinner in the center.

**Changes:**

- **`capacitor.config.ts`**: Change `backgroundColor` to `#F97316` (your brand orange), disable the default spinner since we'll rely on the React loading screen, and set `launchAutoHide: true` with a short duration.

- **`src/components/NativeLoadingScreen.tsx`**: Redesign to a full orange background (`bg-[#F97316]`) with:
  - White app icon (small, centered, not cropped)
  - A subtle white pulsing dot loader below it
  - "Collab Hunts" in white text
  - No dark background -- pure brand orange

- **`index.html`** (pre-React loader): Update the pre-React loader background from `#1a1a2e` (dark blue) to `#F97316` (orange) so there's no flash between native splash and React loading. The spinner and text colors change to white to match.

- **`src/components/PageLoader.tsx`**: Also update to use the orange branded style for consistency.

---

### 2. UX Simplification -- Gaps Found

After reviewing all native flows as a user, here are the issues and fixes:

**A. Brand Account Tab has no Sign Out button on native**
- The `BrandAccountTab` component is the web version and doesn't include a sign-out button for native users.
- **Fix**: Add a sign-out button at the bottom of `BrandAccountTab` when running on native platform (similar to what was done for Creator's AccountTab).

**B. Brand onboarding is too many steps for mobile**
- Currently 3-4 steps for existing users (Company Details, Location, Logo & Social). Most brand users on mobile just want to get in quickly.
- **Fix**: Merge Location into the Company Details step (add country and address fields below industry/size). This reduces it from 3 steps to 2 for existing users: (1) Company Info + Location, (2) Logo & Social.

**C. Creator onboarding requires a 50-character bio AND a profile photo just to proceed**
- Mobile users want to get started fast. Requiring a photo upload and a 50-char bio on step 1 creates friction.
- **Fix**: Make profile photo optional at onboarding (can add later). Reduce bio minimum from 50 to 20 characters.

**D. Creator signup form asks for "Full Name" but Brand signup asks for First/Last separately -- inconsistent**
- **Fix**: No code change needed, this is intentional (brand needs first/last for business contact). Leave as-is but worth noting.

**E. No way for brands to sign out from the native brand dashboard**
- The `NativeBrandDashboard` has an Account tab but it renders the web `BrandAccountTab` which lacks a native sign-out.
- **Fix**: Add a sign-out section to the brand account experience on native.

---

### Technical Details

**Files to modify:**

1. **`capacitor.config.ts`**
   - Change `SplashScreen.backgroundColor` from `'#1a1a2e'` to `'#F97316'`
   - Change `spinnerColor` to `'#FFFFFF'`

2. **`src/components/NativeLoadingScreen.tsx`**
   - Full redesign: orange background, white icon, white pulsing dots loader, white text

3. **`index.html`**
   - Update pre-React loader `background` from `#1a1a2e` to `#F97316`
   - Update text/spinner colors to white
   - Update loader-ring border colors to white tones

4. **`src/components/PageLoader.tsx`**
   - Match the new orange branded style for native consistency

5. **`src/pages/NativeBrandOnboarding.tsx`**
   - Merge Location step into Company Details step (reduce total steps by 1)

6. **`src/pages/NativeCreatorOnboarding.tsx`**
   - Make profile photo optional (remove validation requirement)
   - Reduce bio minimum from 50 to 20 characters

7. **`src/components/brand-dashboard/BrandAccountTab.tsx`**
   - Add a "Sign Out" button at the bottom when on native platform

**No database changes required.**

