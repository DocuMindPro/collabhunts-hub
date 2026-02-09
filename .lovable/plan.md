

## Add Social Media Accounts to Brand Onboarding

### What Changes
Brands will be asked for their Facebook, Instagram, and TikTok profile URLs during onboarding. This applies to both the real onboarding flow and the admin testing preview.

### Database Migration
Add 3 new columns to `brand_profiles`:
- `facebook_url` (text, nullable)
- `instagram_url` (text, nullable)
- `tiktok_url` (text, nullable)

### New Component: `SocialMediaStep.tsx`
A new step component at `src/components/brand-onboarding/SocialMediaStep.tsx` with:
- 3 input fields with platform icons (Facebook, Instagram, TikTok)
- Placeholder URLs showing expected format (e.g., `https://instagram.com/yourbrand`)
- URL validation: if a URL is entered, it must contain the correct platform domain
  - Facebook: must contain `facebook.com/` or `fb.com/`
  - Instagram: must contain `instagram.com/`
  - TikTok: must contain `tiktok.com/@`
- All fields are optional -- brands can skip or leave blank
- Error messages shown inline for invalid URLs
- Props: `value`, `onChange`, `onNext`, `onBack`, `onSkip`

### Real Onboarding Flow (`BrandOnboarding.tsx`)
- Total steps increases from 4 to 5
- New step order:
  1. Intent
  2. Budget
  3. Categories
  4. Platforms
  5. Social Media Accounts (NEW)
- Step 5 "Finish Setup" triggers `savePreferences`
- `savePreferences` updated to also save `facebook_url`, `instagram_url`, `tiktok_url`
- Add `socialMedia` object to preferences state

### Admin Preview (`BrandOnboardingPreview.tsx`)
- Total steps increases from 5 to 6
- New step order:
  1. Phone Verification
  2. Intent
  3. Budget
  4. Categories
  5. Platforms
  6. Social Media Accounts (NEW) + Close Preview button
- Purely visual preview, no data saved

### Technical Details

**Files:**
1. **Database migration** -- Add 3 columns to `brand_profiles`
2. **Create** `src/components/brand-onboarding/SocialMediaStep.tsx`
3. **Edit** `src/pages/BrandOnboarding.tsx` -- Add step 5, update save logic
4. **Edit** `src/components/admin/BrandOnboardingPreview.tsx` -- Add step 6

