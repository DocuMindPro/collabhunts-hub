
## Add TikTok Live Insights to Creator Onboarding + Admin Filtering

### Overview
Add a new onboarding step that asks creators about their TikTok Live activity. The data will be stored in a new database table and surfaced in the Admin panel with filtering and detail view capabilities.

### Onboarding Flow Logic

```text
Question 1: "Do you go live on TikTok?"
  |
  +-- YES --> Question 2: "What's your average monthly revenue from TikTok Live?"
  |              (dropdown: Under $100, $100-$500, $500-$1,000, $1,000-$5,000, $5,000+)
  |
  +-- NO  --> Question 2: "Would you be interested in going live on TikTok if it could generate income?"
                 (options: Yes definitely, Maybe - I'd like to learn more, Not right now)
```

This captures three valuable data points:
- Whether the creator currently goes live
- If yes: their earning tier (helps you assess their value)
- If no: their openness to it (helps you identify potential converters)

### Database Migration

New table `creator_tiktok_live_insights` linked to `creator_profiles`:

```sql
CREATE TABLE public.creator_tiktok_live_insights (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_profile_id uuid NOT NULL REFERENCES public.creator_profiles(id) ON DELETE CASCADE,
  goes_live boolean NOT NULL DEFAULT false,
  monthly_revenue_range text,        -- 'under_100', '100_500', '500_1000', '1000_5000', '5000_plus'
  interest_in_going_live text,       -- 'yes_definitely', 'maybe', 'not_now' (only when goes_live = false)
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(creator_profile_id)
);

ALTER TABLE public.creator_tiktok_live_insights ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Creators can manage own tiktok insights"
  ON public.creator_tiktok_live_insights
  FOR ALL USING (
    creator_profile_id IN (
      SELECT id FROM public.creator_profiles WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can view all tiktok insights"
  ON public.creator_tiktok_live_insights
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid())
  );
```

### Files to Edit

**1. `src/pages/CreatorSignup.tsx`** (web onboarding)
- Add state for `goesLiveTiktok`, `tiktokMonthlyRevenue`, `tiktokLiveInterest`
- Insert a new step between current Step 4 (Social Accounts) and Step 5 (Services) -- this step only shows if the creator added TikTok as a social account
- If TikTok is not in their social accounts, skip this step automatically
- On final submit, insert a row into `creator_tiktok_live_insights`
- Update total steps count from 7 to 8

**2. `src/pages/NativeCreatorOnboarding.tsx`** (native/mobile onboarding)
- Same TikTok Live step between Social Accounts (step 2) and Services (step 3)
- Conditionally show only if TikTok was added in step 2
- On submit, insert into `creator_tiktok_live_insights`
- Update total steps from 4 to 5

**3. `src/components/admin/AdminCreatorsTab.tsx`** (admin panel)
- Fetch `creator_tiktok_live_insights` data alongside existing queries
- Add to `CreatorData` interface: `goes_live_tiktok`, `tiktok_monthly_revenue`, `tiktok_live_interest`
- Add a new filter dropdown: "TikTok Live" with options: All, Goes Live, Doesn't Go Live, Interested, Not Interested
- Show TikTok Live info in the Creator Detail modal (new section below Categories)
- Include TikTok Live columns in CSV export

**4. `src/components/admin/CreatorOnboardingPreview.tsx`** (admin preview)
- Add the TikTok Live step to the onboarding preview so admins can see how it looks

### UI for the New Onboarding Step

The step will use a clean card-based selection (radio-style cards, not plain radio buttons):

- **"Do you go live on TikTok?"** -- Two large tappable cards: "Yes, I go live" / "No, I don't"
- **Follow-up (if Yes):** Select dropdown for monthly revenue range
- **Follow-up (if No):** Three tappable cards for interest level, each with a short description

### Admin Detail Modal Addition

New section in the creator detail dialog:

```text
TikTok Live
Goes Live: Yes / No
Monthly Revenue: $500-$1,000  (or "Interest Level: Maybe - I'd like to learn more")
```

### Admin Filter Addition

New dropdown in filter row 2:

```text
[TikTok Live ▾]
  All
  Goes Live
  Doesn't Go Live
  Interested in Going Live
  Not Interested
```
