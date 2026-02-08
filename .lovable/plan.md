

## Add Upgrade Prompt Banner in Messages Tab + E2E Testing

### Part 1: Messaging Limit Banner

**New Component: `src/components/brand-dashboard/MessagingLimitBanner.tsx`**

A compact alert banner that appears at the top of the Messages tab when the brand is near (70%+) or at their monthly messaging limit.

- **Near limit (e.g. 7/10)**: Yellow/warning banner -- "You've messaged 7 of 10 new creators this month. Upgrade for unlimited messaging."
- **At limit (e.g. 10/10)**: Red/destructive banner -- "You've reached your monthly limit of 10 new creators. Upgrade to keep connecting."
- **Pro plan or under 70%**: Banner hidden entirely.
- Includes a dismiss button and an "Upgrade" link pointing to `/brand`.
- Reuses the same data-fetching pattern from `MessagingQuotaCard` (calls `getCurrentPlanType`, `getMessageLimit`, reads `brand_profiles` counters).

**Modify: `src/components/brand-dashboard/BrandMessagesTab.tsx`**

- Import and render `<MessagingLimitBanner />` at the top of the messages layout, just below the "Messages" heading (line ~444), so it's visible regardless of which conversation is selected.

### Part 2: End-to-End Testing

After implementation, manually test via the browser tool:

1. Open the app and navigate to the brand dashboard messages tab
2. Verify the banner renders correctly based on the current quota state
3. Check that the upgrade link navigates to `/brand`
4. Verify the banner does not appear for Pro plans or when usage is low

### Technical Details

- The banner component follows the same pattern as `MessagingQuotaCard`: fetch user, get plan type, get limit, read counters from `brand_profiles`, handle monthly reset logic.
- Uses the existing `Alert` UI component with `AlertTitle` and `AlertDescription` for consistent styling.
- No database changes needed -- all data already exists from the previous migration.

