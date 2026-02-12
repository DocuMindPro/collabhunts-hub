

## Align Native App Signup Flows with Website

The native app currently has a generic login screen that only asks for email and password, then picks a role afterward. The website, however, collects role-specific information upfront (First Name, Last Name, Phone Verification, Terms acceptance for brands; Full Name, Phone, Terms for creators). This plan aligns both flows.

---

### Current Flow (App)
1. Generic NativeLogin (email + password only)
2. Role Picker (Creator or Brand)
3. Role-specific onboarding wizard

### New Flow (App - matching website)
1. NativeLogin shows **Sign In** by default (for returning users)
2. "Create one" switches to a **Role Selection** screen: "Join as Creator" or "Join as Brand"
3. Selecting a role opens the **role-specific signup form** matching the website:
   - **Brand**: First Name, Last Name, Email, Password, Phone Verification (optional/testing mode), Terms checkbox, then "Create Account"
   - **Creator**: Full Name, Email, Password, Phone Verification, Terms checkbox, then "Continue" into the existing onboarding steps
4. After account creation, flow continues into the existing onboarding wizards (NativeBrandOnboarding for company details, NativeCreatorOnboarding for profile setup)

---

### Changes

#### 1. Redesign NativeLogin signup mode (`src/pages/NativeLogin.tsx`)

**When in Sign Up mode**, replace the simple email/password form with:
- A role selection step first: two cards -- "Join as Creator" and "Join as Brand" (similar to NativeRolePicker's style)
- Once role is selected, show the matching signup form:

**Brand signup form** (matches `/brand-signup`):
- First Name + Last Name (side by side)
- Email
- Password (min 8 chars)
- Phone Verification section (optional/testing mode) with PhoneInput + Send Code + OTP verify
- Checkbox: "I agree to the Terms of Service and the binding arbitration clause"
- "Create Account" button

**Creator signup form** (matches `/creator-signup` step 1):
- Full Name
- Email
- Password (min 8 chars)
- Phone Verification section (optional/testing mode)
- Checkbox: "I agree to the Terms of Service and the binding arbitration clause"
- "Continue" button

**Sign In mode** stays the same (email + password + Google).

#### 2. Update NativeLogin submit logic

- **Brand signup**: Create auth user with `user_type: "brand"` metadata, create `brand_profiles` row with `first_name`, `last_name`, `phone_number`, `phone_verified`, `terms_accepted_at` (matching website's BrandSignup logic). After creation, the existing NativeBrandOnboarding handles company details.
- **Creator signup**: Create auth user with `user_type: "creator"` metadata and store phone info. After creation, the existing NativeCreatorOnboarding handles the rest of the profile.

#### 3. Update NativeBrandOnboarding to skip account step for returning users

The `NativeBrandOnboarding` already handles existing users (skips step 1). Since the new NativeLogin now handles account creation with all required fields, this should work seamlessly -- existing users go straight to company details.

#### 4. Update NativeCreatorOnboarding terms step

Since terms are now accepted during signup (in NativeLogin), the onboarding's final terms step should either check if already accepted or still show it as a confirmation.

---

### Files to Modify

1. **`src/pages/NativeLogin.tsx`** -- Major rewrite of signup mode: add role selection, role-specific forms with all website fields (names, phone verification, terms), updated submit logic
2. **`src/pages/NativeBrandOnboarding.tsx`** -- Minor: ensure it properly skips account step when user is already authenticated with a brand profile stub
3. **`src/pages/NativeCreatorOnboarding.tsx`** -- Minor: handle pre-accepted terms from signup

### Technical Details

- Import and use `PhoneInput` component (already exists at `src/components/PhoneInput.tsx`)
- Import and use `useVerificationSettings` hook for phone verification mode
- Use zod validation schemas matching the website (min 8 char password, min 2 char names, phone regex)
- Terms link opens `/terms` in browser
- Google Sign-In remains available in both sign-in and sign-up modes (via `lovable.auth.signInWithOAuth`)
- Password minimum changed from 6 to 8 characters to match website

