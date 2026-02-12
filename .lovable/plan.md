

## Add Native App Logo to Admin Branding + Use It in App Screens

The native app currently shows a hardcoded orange "CH" placeholder instead of the actual Collab Hunts logo. This plan adds a new "Native App Logo" upload slot to the admin Branding Assets page and updates all native app screens to display it.

---

### What Changes

#### 1. Add "Native App Logo" asset to Admin Branding page (`src/components/admin/AdminBrandingSeoTab.tsx`)

Add a new entry to the `ASSET_CONFIGS` array:
- **Key**: `native_app_logo_url`
- **Label**: "Native App Logo"
- **Description**: "Logo shown on the mobile app login and role screens"
- **Dimensions**: "Recommended: 512x512px, PNG (square, with rounded corners)"
- **Accept**: `image/png,image/jpeg,image/svg+xml`
- **Icon**: Smartphone icon

This will automatically give it the same upload/replace/remove/preview functionality as the other branding assets.

#### 2. Create a reusable `NativeAppLogo` component (`src/components/NativeAppLogo.tsx`)

A small component that:
- Fetches `native_app_logo_url` from `site_settings` (with fallback to `logo_icon_url`)
- Shows the uploaded logo image if available
- Falls back to the orange "CH" placeholder if no logo is configured
- Accepts `size` prop for consistent sizing across screens

#### 3. Update native screens to use `NativeAppLogo`

Replace the hardcoded orange "CH" box in three places:
- **`src/pages/NativeLogin.tsx`** -- sign-in view (line 458), role-select view (line 534)
- **`src/components/NativeRolePicker.tsx`** -- top logo area (line 54)

---

### Technical Details

**New site_settings key**: `native_app_logo_url` -- the `upload-site-asset` edge function already handles arbitrary asset types via the `assetType` and `settingKey` form fields, so no backend changes are needed.

**Files to create:**
- `src/components/NativeAppLogo.tsx`

**Files to modify:**
- `src/components/admin/AdminBrandingSeoTab.tsx` -- add entry to ASSET_CONFIGS
- `src/pages/NativeLogin.tsx` -- replace 2 hardcoded logo blocks with `<NativeAppLogo />`
- `src/components/NativeRolePicker.tsx` -- replace 1 hardcoded logo block with `<NativeAppLogo />`

