

## Add Creator Messaging Limits per Plan

### Overview

Add monthly messaging limits to each brand plan tier. The limit tracks how many **unique creators** a brand can start conversations with per month (not total messages).

- **Free**: 1 creator/month
- **Basic**: 10 creators/month  
- **Pro**: Unlimited

### Database Changes

Add two columns to `brand_profiles`:
- `creators_messaged_this_month` (integer, default 0) -- counter for unique creators messaged
- `creators_messaged_reset_at` (timestamptz, default now()) -- tracks when to reset the counter

### Code Changes

**1. `src/components/brand/BrandPricingSection.tsx`**
- Update feature lists:
  - Free: Change "Direct messaging" to "Message 1 creator/month"
  - Basic: Change "Direct messaging" to "Message 10 creators/month"
  - Pro: Change "Direct messaging" to "Unlimited creator messaging"

**2. `src/lib/stripe-mock.ts`**
- Update the features arrays to reflect the new messaging limits

**3. `src/lib/subscription-utils.ts`**
- Update `canBrandMessageCreator` to actually check the messaging limit based on brand plan
- Add helper `getMessageLimit(plan)` returning 1 / 10 / Infinity
- Add logic to auto-reset counter if current month differs from `creators_messaged_reset_at`
- Check if the creator was already messaged (existing conversation) -- those don't count again

**4. `src/pages/CreatorProfile.tsx`**
- Before creating a new conversation, call `canBrandMessageCreator` to check the limit
- If existing conversation already exists, allow messaging (no new count)
- If limit reached, show a toast explaining the limit and suggesting an upgrade
- On successful new conversation creation, increment `creators_messaged_this_month`

**5. `src/components/brand-dashboard/BrandMessagesTab.tsx`**
- No changes needed -- brands can always continue existing conversations. The limit only applies to **starting new** conversations.

### Logic Flow

```text
Brand clicks "Message" on a Creator Profile
  |
  +-- Existing conversation? --> Allow (no limit check)
  |
  +-- New conversation:
        |
        +-- Reset counter if new month
        |
        +-- Pro plan? --> Allow (unlimited)
        |
        +-- Basic plan + messaged < 10? --> Allow, increment counter
        |
        +-- Free plan + messaged < 1? --> Allow, increment counter
        |
        +-- Limit reached --> Show upgrade prompt, block
```

### What counts toward the limit
- Only **new unique creator conversations** count
- Continuing an existing conversation does NOT count
- Counter resets on the 1st of each month automatically (checked at time of use)

