

## Add Native Brand Registration to the Mobile App

### Current Problem
When a user without a brand profile taps "Brand / Venue" in the role picker, they see a grayed-out card saying "Register on the website first." This is a poor mobile experience -- users should be able to register as a brand directly in the app.

### Solution
Create a native brand signup and onboarding flow inside the app, following the same pattern used for creator onboarding (`NativeCreatorOnboarding`). This will be a multi-step wizard that combines Tier 1 (account creation) and Tier 2 (profile completion) into one smooth in-app flow.

### User Flow

1. User taps "Brand / Venue" card (currently grayed out) in the role picker
2. App shows a native brand registration wizard with these steps:
   - **Step 1 - Account Info**: First name, last name, email, password, terms checkbox
   - **Step 2 - Company Basics**: Company name, position/title, industry, company size
   - **Step 3 - Location**: Country selector, business address
   - **Step 4 - Logo and Social Media**: Logo upload, Facebook/Instagram/TikTok URLs
3. On submit: creates auth account, creates brand_profiles row with `registration_completed = true`
4. App auto-selects brand role and enters the brand dashboard

### Files to Create

**`src/pages/NativeBrandOnboarding.tsx`**
- A full-screen, mobile-optimized multi-step wizard (similar to NativeCreatorOnboarding)
- Steps with progress bar at top, back/next navigation
- Handles both signup (auth.signUp) and profile creation (brand_profiles insert)
- Sets `registration_completed: true` since all data is collected in one flow
- Props: `user: User | null` (null = new signup, non-null = existing user adding brand role), `onComplete` callback

### Files to Modify

**`src/components/NativeRolePicker.tsx`**
- Make the "Brand / Venue" card clickable (remove opacity/disabled state)
- Change text from "Register on the website first" to "Set up your brand profile"
- Add `onStartBrandOnboarding` callback prop (same pattern as `onStartCreatorOnboarding`)

**`src/components/NativeAppGate.tsx`**
- Add `showBrandOnboarding` state (mirrors existing `showOnboarding` for creators)
- Import and render `NativeBrandOnboarding` when active
- Add `handleBrandOnboardingComplete` callback that refetches profiles and auto-selects brand role
- Pass `onStartBrandOnboarding` to NativeRolePicker

### Technical Details

- The wizard reuses existing components: `Input`, `Select`, `CountrySelect`, `ProfileAvatar`, `Progress`
- Logo upload uses the same `brand-logos` storage bucket pattern from the web onboarding
- For new users (no auth account yet): Step 1 creates the account via `supabase.auth.signUp`, then subsequent steps build the profile
- For existing users (already logged in but no brand profile): skips Step 1 and goes straight to company basics
- Affiliate referral tracking is preserved (checks localStorage for `affiliate_referral_code`)
- Social media fields use the same Facebook/Instagram/TikTok pattern as the web version
- No phone verification in native flow (can be done later in the Account tab, matching the existing web behavior where phone is optional during signup when testing mode is on)

