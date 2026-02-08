

## Brand Subscription Plan: $99/Year Bundle

### What Changes

Currently, the verification badge ($99/year) and opportunity posting ($15 each) are separate. You want to combine them into a single $99/year subscription that includes:

- **Verified Business Badge** for 1 year
- **3 free opportunity posts per month**
- Non-subscribers pay $15 per post, no badge

### Database Changes

Add two new columns to `brand_profiles`:

- `free_posts_used_this_month` (integer, default 0) -- tracks how many free posts used this month
- `free_posts_reset_at` (timestamp) -- when the counter was last reset

### Files to Modify

**1. `src/components/brand-dashboard/BrandVerificationBadgeCard.tsx`**
- Update the marketing copy to mention "3 free opportunity posts/month" as a benefit of the $99/year plan
- Add it to the features list in the "Not Started" state

**2. `src/components/brand-dashboard/CreateOpportunityDialog.tsx`**
- Before showing the payment dialog, check if the brand has an active verified subscription (`is_verified = true` and `verification_expires_at` in the future)
- If subscribed: check `free_posts_used_this_month` -- if under 3, skip payment entirely and post for free; if 3 already used, show payment as normal
- If not subscribed: show $15 payment as currently works
- Reset the monthly counter if `free_posts_reset_at` is in a previous month
- Update button text to reflect "Post Free (X/3 remaining)" vs "Continue to Payment ($15)"

**3. `src/lib/stripe-mock.ts`**
- Update the `SUBSCRIPTION_PLANS` to remove the old tiered plans (basic/pro/premium) and replace with a single $99/year brand plan description (or just clean up references)

**4. `src/components/admin/AdminFeatureOverridesTab.tsx`**
- Update the verification badge description to mention the bundle

### Logic Flow

```text
Brand clicks "Post Opportunity"
  |
  +-- Has active verification? (is_verified + not expired)
  |     |
  |     +-- free_posts_used_this_month < 3?
  |     |     YES --> Post for FREE, increment counter
  |     |     NO  --> Show $15 payment dialog
  |     |
  +-- No active verification
        |
        +-- Show $15 payment dialog (no badge, pay per post)
```

### Monthly Counter Reset Logic

When checking free posts, compare `free_posts_reset_at` to the current month. If it's a different month, reset `free_posts_used_this_month` to 0 and update `free_posts_reset_at` to now -- all done client-side before the check.

