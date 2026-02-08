

## Admin Subscription Management + ID Search Fix

### Problem 1: No way to manage brand subscriptions manually
Currently, the Feature Overrides tab only handles creator features and brand verification badges. There's no way to activate/deactivate brand subscription plans (Free, Basic, Pro) manually.

### Problem 2: Partial ID search doesn't work
The Feature Overrides search uses a strict UUID regex (`isUUID`), so searching with a partial ID like `b7d30894` fails -- it falls through to a name search instead of matching against IDs. The same issue exists in the Brands tab search which doesn't search by ID at all.

---

### Changes

**1. Add Brand Subscription Management to Feature Overrides (`AdminFeatureOverridesTab.tsx`)**

When a brand is selected, add a new "Subscription Plan" section below the Verified Badge toggle:
- Show current active subscription plan (Free/Basic/Pro) with status
- Add a dropdown to switch plans (None/Basic/Pro)
- On change: cancel existing active subscriptions, insert a new `brand_subscriptions` record with the selected plan, status "active", and a 1-year period
- Log the override in `admin_feature_overrides` with feature_key "subscription_plan"

**2. Fix partial ID search in Feature Overrides (`AdminFeatureOverridesTab.tsx`)**

Update the search logic to detect partial hex strings (8+ hex characters) in addition to full UUIDs:
- If input looks like a hex fragment (matches `/^[0-9a-f]{4,}$/i`), search using `.ilike('id', '%query%')` and `.ilike('user_id', '%query%')` in addition to name search
- This way `b7d30894` will match creator/brand profiles whose ID starts with that prefix

**3. Add ID search to Brands tab (`AdminBrandsTab.tsx`)**

The Brands tab search (line 144-149) currently only filters by company_name, email, and phone. Add `b.id` and `b.user_id` to the filter:
```
b.id.toLowerCase().includes(search.toLowerCase()) ||
b.user_id.toLowerCase().includes(search.toLowerCase())
```
(The Creators tab already has `c.id` in its search -- line 161. The All Users tab also already searches by profile IDs -- lines 296-302.)

---

### Technical Details

**Files to modify:**

- `src/components/admin/AdminFeatureOverridesTab.tsx`
  - Update `isUUID` helper to also detect partial hex strings for flexible ID matching
  - Change the `.or()` query to use `.ilike` for partial ID matches instead of strict `.eq`
  - Add subscription plan management UI (Select dropdown + toggle logic) in the brand features card
  - Add `toggleBrandSubscription(planType)` function that cancels existing subs and inserts a new one

- `src/components/admin/AdminBrandsTab.tsx`
  - Add `b.id` and `b.user_id` to the search filter (line 144-149)

**No database changes needed** -- the `brand_subscriptions` table already exists with the right schema (plan_type, status, current_period_start, current_period_end, brand_profile_id).
