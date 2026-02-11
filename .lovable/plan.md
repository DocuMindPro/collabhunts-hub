

## Quarterly Social Media Stats Update System

### Overview
Every 3 months, creators will be required to update or confirm their social media follower counts. Until they do, their account will be marked inactive and a persistent banner will appear on their dashboard prompting action.

### Database Changes

**Add columns to `creator_profiles`:**
| Column | Type | Default | Purpose |
|--------|------|---------|---------|
| `stats_last_confirmed_at` | timestamptz | `now()` | Tracks when stats were last updated/confirmed |
| `stats_update_required` | boolean | `false` | Flag set to true when 3 months have passed |

**New edge function cron job: `check-stats-update`**
A scheduled function that runs daily, finds creators whose `stats_last_confirmed_at` is older than 3 months, sets `stats_update_required = true`, and inserts a notification.

### How It Works

1. **Daily cron** checks all creators where `stats_last_confirmed_at` is more than 90 days ago and `stats_update_required` is still false. For those, it sets the flag to true and creates a notification.
2. **Dashboard banner** -- When a creator logs into their dashboard and `stats_update_required` is true, a prominent alert banner appears at the top of every tab: "Your account is inactive. Please update or confirm your social media stats to reactivate."
3. **Update/Confirm flow** -- The banner has two buttons:
   - "Update Stats" -- navigates to the Profile tab's Social Accounts section where they can edit follower counts
   - "Confirm No Changes" -- one click to confirm current stats are still accurate, resets the timer
4. **On confirmation/update** -- Sets `stats_last_confirmed_at = now()` and `stats_update_required = false`, dismisses the banner.
5. **Public visibility** -- When `stats_update_required` is true, the creator's profile can optionally show as "inactive" in search results (brands see a note that stats may be outdated).

### New Files

| File | Purpose |
|------|---------|
| `src/components/creator-dashboard/StatsUpdateBanner.tsx` | Persistent alert banner shown when stats update is required, with "Update Stats" and "Confirm No Changes" buttons |
| `supabase/functions/check-stats-update/index.ts` | Daily cron edge function that flags creators needing stats updates and sends notifications |

### Modified Files

| File | Change |
|------|--------|
| `src/pages/CreatorDashboard.tsx` | Fetch `stats_update_required` from creator profile and show `StatsUpdateBanner` at the top when true |
| `src/components/creator-dashboard/SocialAccountsSection.tsx` | After saving/editing an account, also reset `stats_last_confirmed_at` and `stats_update_required` |

### StatsUpdateBanner Design

- Orange/amber alert card at the top of the dashboard (above tabs content)
- Icon: AlertTriangle
- Title: "Account Inactive -- Stats Update Required"
- Message: "To keep your account active and visible to brands, please update your social media follower counts or confirm they haven't changed. This is required every 3 months."
- Two buttons:
  - "Update Stats" (primary) -- switches to Profile tab
  - "Confirm No Changes" (outline) -- calls API to reset the timer immediately

### Confirm No Changes Flow

When clicked:
1. Update `creator_profiles` set `stats_last_confirmed_at = now()`, `stats_update_required = false`
2. Also update `creator_social_accounts` -- no changes needed to the accounts themselves
3. Show success toast: "Stats confirmed! Your account is now active."
4. Banner disappears

### Edge Function: check-stats-update

```text
Runs daily via pg_cron:
1. SELECT creators WHERE stats_last_confirmed_at < now() - interval '90 days' AND stats_update_required = false
2. UPDATE stats_update_required = true for those creators
3. INSERT notification for each: "Please update your social media stats to keep your account active"
```

### Notification

When the cron triggers:
- Title: "Stats Update Required"
- Message: "Your social media stats haven't been updated in 3 months. Please update or confirm your follower counts to keep your account active."
- Link: `/creator-dashboard?tab=profile`
- Type: `stats_update_required`

