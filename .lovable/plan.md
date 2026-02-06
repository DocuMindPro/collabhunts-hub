
# Add Brand Logo to Signup and Opportunity Cards

## What Changes

1. **Brand Signup form** -- Add a mandatory logo upload field in the "Brand Information" section
2. **Brand Account tab** -- Add logo display and change option so brands can update it later
3. **Opportunities page** -- Show the brand's logo as a small round avatar next to the company name on each card

## How It Works

The `logo_url` column already exists in `brand_profiles` but is never populated. We will:

1. Create a new storage bucket `brand-logos` (public) via SQL migration
2. Add a logo upload input to the signup form that uploads to this bucket using Supabase Storage (simpler than the R2 edge function pattern, and consistent with the existing `profile-images` bucket)
3. Save the resulting public URL to `brand_profiles.logo_url` during signup
4. Display the logo on opportunity cards using the `ProfileAvatar` component

## Database Change

Create storage bucket + RLS policies:
```sql
INSERT INTO storage.buckets (id, name, public) VALUES ('brand-logos', 'brand-logos', true);

CREATE POLICY "Anyone can view brand logos" ON storage.objects FOR SELECT USING (bucket_id = 'brand-logos');
CREATE POLICY "Authenticated users can upload brand logos" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'brand-logos' AND auth.role() = 'authenticated');
CREATE POLICY "Users can update their own brand logos" ON storage.objects FOR UPDATE USING (bucket_id = 'brand-logos' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users can delete their own brand logos" ON storage.objects FOR DELETE USING (bucket_id = 'brand-logos' AND auth.uid()::text = (storage.foldername(name))[1]);
```

## Code Changes

### 1. `src/pages/BrandSignup.tsx`
- Add state for `logoFile` and `logoPreview`
- Add a circular logo upload area (click-to-upload) in the Brand Information section, before the company name field
- Mark it as required -- disable the submit button if no logo is selected
- On submit: upload file to `brand-logos/{userId}/{filename}`, get public URL, include `logo_url` in the brand_profiles insert

### 2. `src/pages/Opportunities.tsx` (card header area, ~line 367-377)
- Replace the `Building2` icon with a `ProfileAvatar` showing `opportunity.brand_profiles.logo_url`
- The avatar will be small (h-7 w-7) and sit to the left of the title/company name
- Falls back to company initial letter if no logo

### 3. `src/components/brand-dashboard/BrandAccountTab.tsx`
- Add a logo display/upload section so brands can view and update their logo after registration

## Visual Result

Each opportunity card will show a small round brand logo to the left of the title, making cards instantly recognizable and more professional. The signup form will have a prominent logo upload area ensuring every brand has a logo from day one.
