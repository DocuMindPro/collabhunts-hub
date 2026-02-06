
# Admin Feature Toggle for Paid Features

## Overview

Add a new "Feature Overrides" tab to the Admin Dashboard that lets you manually activate or deactivate all paid features for any creator or brand, bypassing their subscription/payment status.

## All Paid Features Identified

**Creator Paid Features:**
1. **VIP Badge** -- `verification_payment_status` (paid/unpaid), `verification_expires_at`
2. **Profile Boost / Featuring** -- `is_featured`, `featuring_priority`, plus `creator_featuring` table records
3. **Featured Badge** -- featuring type `featured_badge`
4. **Homepage Spotlight** -- featuring type `homepage_spotlight`
5. **Category Boost** -- featuring type `category_boost`
6. **Auto Popup** -- featuring type `auto_popup`

**Brand Paid Features:**
1. **Subscription Plan** -- `brand_subscriptions` table (`none`, `basic`, `pro`, `premium`)
2. **Verified Business Badge** -- `verification_payment_status` (paid/not_paid), `verification_expires_at`, `is_verified`

## What Gets Built

### 1. New Database Table: `admin_feature_overrides`

A table to track admin-granted feature overrides separately from user payments. This way toggling features on/off from admin doesn't mess with the user's actual payment records.

```text
admin_feature_overrides
- id (UUID, PK)
- target_type (text: 'creator' | 'brand')
- target_profile_id (UUID)
- feature_key (text: e.g. 'vip_badge', 'featured_badge', 'subscription_pro', etc.)
- is_enabled (boolean)
- granted_by (UUID, admin user)
- granted_at (timestamptz)
- expires_at (timestamptz, nullable -- for time-limited grants)
- notes (text, nullable)
```

### 2. New Admin Tab Component: `AdminFeatureOverridesTab.tsx`

The UI will have:
- **Search bar** to find a creator or brand by name/email
- **Two sections**: Creator Features and Brand Features
- When a user is selected, show a card with all their paid features as **toggle switches**:

**For a Creator:**
| Feature | Status | Toggle |
|---------|--------|--------|
| VIP Badge | Active (paid) | [ON/OFF] |
| Featured Badge | Inactive | [ON/OFF] |
| Homepage Spotlight | Inactive | [ON/OFF] |
| Category Boost | Inactive | [ON/OFF] |
| Auto Popup | Inactive | [ON/OFF] |

**For a Brand:**
| Feature | Status | Toggle |
|---------|--------|--------|
| Subscription Plan | None | [Select: none/basic/pro/premium] |
| Verified Business Badge | Not Paid | [ON/OFF] |

- Toggling ON directly updates the relevant database columns (e.g., sets `verification_payment_status = 'paid'`, `is_featured = true`, creates/updates subscription records)
- Toggling OFF reverses those changes
- Each toggle shows whether the feature was **paid by user** vs **admin-granted**

### 3. Integration into Admin.tsx

- Add a new tab "Features" with a crown/toggle icon in the tab list
- Import and render `AdminFeatureOverridesTab` in the new `TabsContent`

## Technical Details

### Database Migration
- Create `admin_feature_overrides` table with RLS (admin-only read/write)
- Add policy: only users with `admin` role can CRUD

### AdminFeatureOverridesTab.tsx Logic

**Search flow:**
1. User types a name/email
2. Query both `creator_profiles` and `brand_profiles` for matches
3. Display results as selectable cards

**Creator feature toggles:**
- **VIP Badge toggle**: Updates `creator_profiles.verification_payment_status` to `'paid'` or `'unpaid'`, sets/clears `verification_expires_at` (1 year from now when enabling)
- **Boost toggles** (4 types): Inserts/deactivates records in `creator_featuring` table, updates `is_featured` and `featuring_priority` on `creator_profiles`

**Brand feature toggles:**
- **Subscription plan selector**: Cancels existing active subscriptions via `brand_subscriptions` update, inserts new subscription with selected plan type and 1-year expiry
- **Verified Badge toggle**: Updates `brand_profiles.verification_payment_status` to `'paid'`/`'not_paid'`, sets/clears `is_verified`, `verification_expires_at`

### Files to Create
- `src/components/admin/AdminFeatureOverridesTab.tsx`

### Files to Modify
- `src/pages/Admin.tsx` -- Add the new tab trigger and content
- Database migration for `admin_feature_overrides` table

### New Migration SQL
```sql
CREATE TABLE public.admin_feature_overrides (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  target_type TEXT NOT NULL CHECK (target_type IN ('creator', 'brand')),
  target_profile_id UUID NOT NULL,
  feature_key TEXT NOT NULL,
  is_enabled BOOLEAN NOT NULL DEFAULT true,
  granted_by UUID REFERENCES auth.users(id),
  granted_at TIMESTAMPTZ DEFAULT now(),
  expires_at TIMESTAMPTZ,
  notes TEXT,
  UNIQUE(target_type, target_profile_id, feature_key)
);

ALTER TABLE public.admin_feature_overrides ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage feature overrides"
ON public.admin_feature_overrides
FOR ALL
USING (
  EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
);
```
