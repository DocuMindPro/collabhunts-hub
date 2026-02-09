

## Two-Tier Brand Registration: Quick Signup + Complete Later

### Concept
Brands can quickly create an account with just their name, email, password, and phone verification. They can log in anytime after that, but to use any platform features (browse creators, message, book, create opportunities), they must complete their full business registration. This captures leads without losing them to a long form.

### How It Works

```text
+---------------------------+       +---------------------------+
|  TIER 1: Quick Signup     |       |  TIER 2: Full Registration|
|  /brand-signup            |  -->  |  /brand-register          |
|                           |       |                           |
|  - First Name, Last Name  |       |  - Company Name           |
|  - Email + Password       |       |  - Brand Logo             |
|  - Phone Verification     |       |  - Industry, Size         |
|  - Terms of Service       |       |  - Country, Address       |
|                           |       |  - Website                |
|  Creates auth account +   |       |  - Social Media URLs      |
|  minimal brand_profile    |       |  - Position/Title         |
|  (registration_completed  |       |                           |
|   = false)                |       |  Sets registration_       |
+---------------------------+       |  completed = true         |
                                    +---------------------------+
```

After quick signup, the brand can log in and see their dashboard, but every tab shows a prominent banner: **"Complete your business registration to unlock all features."** Clicking any action (Find Creators, Message, Book, Create Opportunity) triggers the completion prompt.

### Database Changes

**Migration**: Add `registration_completed` column to `brand_profiles`:
- `registration_completed` (boolean, default false)
- Make `company_name` default to empty string so we can create a minimal profile at quick signup

### Files to Create

1. **`src/pages/BrandRegister.tsx`** -- The full business registration form
   - Contains all the fields currently in the bottom half of BrandSignup (company name, logo, industry, size, country, address, website, social media)
   - On submit: updates the existing brand_profile with all details, sets `registration_completed = true`
   - Redirects to `/brand-onboarding` on success
   - Only accessible to authenticated users who have `registration_completed = false`

### Files to Edit

2. **`src/pages/BrandSignup.tsx`** -- Simplify to quick signup only
   - Keep: First Name, Last Name, Email, Password, Phone Verification, Terms checkbox
   - Remove: Company Name, Logo, Industry, Size, Country, Address, Website, Social Media, Position
   - On submit: create auth user + insert minimal brand_profile (company_name set to first+last name temporarily, registration_completed = false)
   - Redirect to `/brand-register` instead of `/brand-onboarding`

3. **`src/components/BrandProtectedRoute.tsx`** -- Allow incomplete profiles
   - Currently blocks access if no brand_profile exists
   - Change: allow access if brand_profile exists (even if `registration_completed = false`)
   - Pass `registrationCompleted` status down so dashboard can show prompts

4. **`src/pages/BrandDashboard.tsx`** -- Add completion banner
   - Fetch `registration_completed` from brand_profile
   - If false, show a prominent banner at the top of every tab: "Complete your business registration to unlock all features" with a CTA button to `/brand-register`
   - Optionally disable/grey out action buttons when not registered

5. **`src/components/BrandRegistrationPrompt.tsx`** -- Update to point to `/brand-register` for logged-in users without completed registration (instead of always pointing to `/brand-signup`)

6. **`src/App.tsx`** -- Add route for `/brand-register`

7. **`src/pages/BrandOnboarding.tsx`** -- Update redirect logic
   - If user has no brand_profile, redirect to `/brand-signup` (unchanged)
   - If user has brand_profile but `registration_completed = false`, redirect to `/brand-register`

8. **`src/pages/Login.tsx`** -- After brand login, check `registration_completed`
   - If false, redirect to `/brand-register` instead of `/brand-dashboard`

### Mock Phone Verification
The existing mock phone verification toggle (`useVerificationSettings` + admin Testing tab) will continue to work exactly as it does today -- no changes needed there.

### User Journey

1. Brand visits `/brand-signup`
2. Fills in: First Name, Last Name, Email, Password, verifies phone, accepts Terms
3. Account created -- redirected to `/brand-register`
4. **If they leave now**: their account exists, they can log back in via email or phone
5. **When they log back in**: redirected to `/brand-register` to complete
6. They fill in all business details on `/brand-register`
7. On completion: redirected to `/brand-onboarding` (preferences wizard)
8. After onboarding: full dashboard access

