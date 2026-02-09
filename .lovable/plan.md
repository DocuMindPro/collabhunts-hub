

## Add Notification Badges to Admin Tab Headers

### What Changes

Add real-time notification count badges on admin tabs that have pending/actionable items. When you click a tab, the badge clears (since you've "seen" those items). The badges auto-refresh periodically and show counts for items needing admin attention.

### Tabs That Get Badges

| Tab | What's Counted | Database Query |
|-----|---------------|----------------|
| **Venues** | Pending quotation inquiries | `quotation_inquiries` where `status = 'pending'` |
| **Approvals** | Pending creator profiles (already has badge) | `creator_profiles` where `status = 'pending'` |
| **Careers** | Pending career applications | `career_applications` where `status = 'pending'` |
| **Disputes** | Open/awaiting disputes | `booking_disputes` where status in `('open', 'awaiting_response', 'pending_response', 'pending_admin_review')` |
| **Verifications** | Pending verification requests | `brand_profiles` where `verification_status = 'pending'` |
| **Subscriptions** | No automatic pending count (search-based tab, no actionable queue) | -- |
| **Events** | No status-based pending (events are creator-managed) | -- |
| **Revenue** | Pending payout requests | `franchise_payout_requests` + `affiliate_payout_requests` where `status = 'pending'` |

### How It Works

1. When the Admin page loads, a single hook (`useAdminBadgeCounts`) fetches all pending counts in parallel
2. Each tab trigger displays a small red badge with the count (if > 0)
3. The counts auto-refresh every 2 minutes (same as the existing QuickActions widget)
4. When clicking a tab, the badge for that tab is dismissed (stored in local state as "seen") until the count changes
5. The existing Approvals badge stays as-is -- this system adds badges to the other tabs

### Technical Details

**1. Create `src/hooks/useAdminBadgeCounts.ts`**

A custom hook that:
- Fetches all pending counts in parallel from the database
- Returns a map of `{ [tabName]: number }`
- Tracks which tabs have been "seen" (clicked) to dismiss badges
- Provides a `markSeen(tab)` function
- Badge reappears if the count changes after being seen
- Auto-refreshes every 2 minutes

**2. Modify `src/pages/Admin.tsx`**

- Import and use the new `useAdminBadgeCounts` hook
- Call `markSeen(tab)` inside `handleTabChange`
- Add badge rendering to each relevant `TabsTrigger` (venues, careers, disputes, verifications, revenue)
- Keep the existing Approvals badge logic as-is (or unify it with this new system)

### Files to Create/Modify

| File | Change |
|------|--------|
| `src/hooks/useAdminBadgeCounts.ts` | New hook -- fetches all pending counts, tracks seen state |
| `src/pages/Admin.tsx` | Use hook, add badges to tab triggers, call markSeen on tab change |

