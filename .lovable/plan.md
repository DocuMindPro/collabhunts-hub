

## Team Access / Invite Users Feature

Allow brand owners and creator owners to invite team members (employees, agencies) via email so they can manage the account on their behalf with the same access level.

### How It Works

1. The account owner goes to the Account tab and sees a new "Team Access" card
2. They enter an email address and click "Send Invite"
3. The invited person receives an email with a link to sign up / log in
4. Once they log in, they automatically get access to the same dashboard as the owner
5. The owner can see pending and active team members, and revoke access

### Database Changes

**New table: `account_delegates`**

| Column | Type | Notes |
|--------|------|-------|
| id | uuid | Primary key |
| owner_user_id | uuid | The brand/creator owner who invited |
| delegate_user_id | uuid (nullable) | Filled once the invitee signs up and accepts |
| delegate_email | text | Email of the invited person |
| account_type | text | 'brand' or 'creator' |
| profile_id | uuid | The brand_profile or creator_profile id being shared |
| status | text | 'pending', 'active', 'revoked' |
| invited_at | timestamptz | When the invite was sent |
| accepted_at | timestamptz (nullable) | When the invitee accepted |

**RLS Policies:**
- Owners can SELECT, INSERT, UPDATE their own delegate rows
- Delegates can SELECT rows where they are the delegate
- No public access

**New edge function: `send-team-invite`**
- Sends an email (via Resend) to the invited person with a link to the platform
- Creates the `account_delegates` row

### Application Flow

**For the inviter (owner):**
- New "Team Access" card in both `BrandAccountTab` and `ProfileTab` (creator)
- Shows list of current team members with status badges (pending / active)
- Input field + button to invite by email
- Button to revoke access for any member

**For the invitee (delegate):**
- When they log in, the app checks `account_delegates` for their email
- If a pending invite exists, it updates `delegate_user_id` and sets status to 'active'
- The delegate is then associated with the owner's brand/creator profile
- Dashboard queries are updated to also check delegate access: if the logged-in user is a delegate for a brand/creator, they see that dashboard

**Dashboard access changes:**
- `BrandProtectedRoute` and `CreatorProtectedRoute` are updated to also allow delegates through
- Dashboard pages (`BrandDashboard`, `CreatorDashboard`) resolve the profile by checking both direct ownership and delegation

### Technical Details

**Files to create:**
- `src/components/team/TeamAccessCard.tsx` -- shared card component for both dashboards
- `supabase/functions/send-team-invite/index.ts` -- edge function to send invite email

**Files to modify:**
- `src/components/brand-dashboard/BrandAccountTab.tsx` -- add TeamAccessCard
- `src/components/creator-dashboard/ProfileTab.tsx` -- add TeamAccessCard
- `src/pages/BrandDashboard.tsx` -- resolve profile for delegates
- `src/pages/CreatorDashboard.tsx` -- resolve profile for delegates
- `src/components/BrandProtectedRoute.tsx` -- allow delegates
- `src/components/CreatorProtectedRoute.tsx` -- allow delegates
- Database migration for the new table, RLS policies

**Edge function (`send-team-invite`):**
- Accepts `{ email, accountType, profileId }`
- Validates the caller owns the profile
- Inserts into `account_delegates`
- Sends email via Resend with a link to the platform login/signup page

**Delegate auto-linking (on login):**
- After authentication, a check runs: query `account_delegates` where `delegate_email` matches the logged-in user's email and status is 'pending'
- If found, update `delegate_user_id` to the current user's id, set status to 'active'

This approach requires a Resend API key for sending invite emails. If one is not already configured, it will need to be set up.
