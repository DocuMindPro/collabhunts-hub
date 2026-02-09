

## Hide Prices for Basic/Pro and Add Quotation Inquiry System

### What Changes

Currently, Basic ($99/year) and Pro ($299/year) prices are shown publicly. This plan hides those prices, replaces the CTA buttons with "Get a Quotation", and creates a full inquiry flow: non-logged-in brands must register first, then a quotation inquiry is recorded and admins are notified with the brand's full details so they can reach out by phone or email.

### User Flow

1. Visitor sees the pricing section on /brand page
2. Free plan still shows "$0/forever" with "Get Started Free" button
3. Basic and Pro plans show features but **no price** -- just a "Get a Quotation" button
4. Clicking "Get a Quotation":
   - If not logged in as a brand: redirected to /brand-signup (or /login) with a query param like `?quotation=basic`
   - After registration/login: the quotation inquiry is automatically submitted
   - If already logged in as a brand: inquiry is submitted immediately and a confirmation message appears
5. Admin receives a notification with brand details and the plan they inquired about
6. Brand sees a "Thank you" dialog confirming the team will reach out soon

### Technical Details

**1. Database: Create `quotation_inquiries` table**

New table to track all quotation requests:

```sql
CREATE TABLE public.quotation_inquiries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_profile_id UUID REFERENCES public.brand_profiles(id) ON DELETE CASCADE,
  plan_type TEXT NOT NULL, -- 'basic' or 'pro'
  status TEXT DEFAULT 'pending', -- 'pending', 'contacted', 'closed'
  admin_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.quotation_inquiries ENABLE ROW LEVEL SECURITY;
-- Brands can insert their own inquiries and read their own
CREATE POLICY "Brands can insert own inquiries" ON public.quotation_inquiries
  FOR INSERT WITH CHECK (brand_profile_id IN (
    SELECT id FROM public.brand_profiles WHERE user_id = auth.uid()
  ));
CREATE POLICY "Brands can view own inquiries" ON public.quotation_inquiries
  FOR SELECT USING (brand_profile_id IN (
    SELECT id FROM public.brand_profiles WHERE user_id = auth.uid()
  ));
-- Admins can do everything
CREATE POLICY "Admins full access" ON public.quotation_inquiries
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
  );
```

**2. Modify `BrandPricingSection.tsx`**

- Remove `price` and `period` display for Basic and Pro plans (keep them for Free)
- Change CTA text for Basic from "Get Started" to "Get a Quotation"
- Change CTA text for Pro from "Contact Us" to "Get a Quotation"
- Instead of `<Link to={ctaLink}>`, clicking the button will:
  - Check if user is logged in as a brand
  - If yes: insert into `quotation_inquiries`, send admin notification, show thank-you dialog
  - If no: navigate to `/brand-signup?quotation=basic` or `/brand-signup?quotation=pro`
- Make the component stateful (add `useState` for auth check, dialog state, etc.)

**3. Modify `BrandSignup.tsx`**

- After successful registration, check for `?quotation=basic` or `?quotation=pro` query param
- If present: automatically insert a `quotation_inquiries` record for the newly created brand
- Also insert a notification for all admin users about the new quotation inquiry
- Still navigate to brand-onboarding as usual

**4. Admin notification on inquiry**

When a quotation inquiry is created (either from BrandPricingSection for logged-in brands, or from BrandSignup for new registrations):
- Query `user_roles` for all admin user IDs
- Insert a notification for each admin:
  - Title: "New Quotation Inquiry"
  - Message: "[Company Name] is inquiring about the [Basic/Pro] plan"
  - Type: "quotation_inquiry"
  - Link: "/admin" (to the brands tab)

**5. Thank-you confirmation dialog**

A simple dialog shown after inquiry submission:
- Title: "Thank You!"
- Message: "Thank you for inquiring about our [Basic/Pro] plan. Our team will reach out to you very soon via phone or email."
- Single "OK" button to dismiss

**6. Admin panel: View quotation inquiries**

Add a section or tab in the admin panel to see quotation inquiries with:
- Brand name, email, phone number, plan inquired, date
- Status (pending/contacted/closed) that admins can update
- This could be a sub-section in the existing AdminBrandsTab or a new lightweight tab

### Files to Create/Modify

| File | Change |
|------|--------|
| Migration SQL | Create `quotation_inquiries` table |
| `src/components/brand/BrandPricingSection.tsx` | Hide prices for Basic/Pro, change CTAs to "Get a Quotation", add auth check + inquiry submission + thank-you dialog |
| `src/pages/BrandSignup.tsx` | Auto-submit quotation inquiry after registration if `?quotation=` param present |
| `src/pages/Login.tsx` | Pass through `?quotation=` param so returning brands can also trigger inquiry after login |
| `src/components/admin/AdminBrandsTab.tsx` | Add quotation inquiries section showing brand details, phone, plan, status with update capability |
| `src/lib/stripe-mock.ts` | Remove price display from Basic/Pro plan descriptions (optional, for consistency) |

