

## Boost Tab: "Coming Soon" Mode with Admin Notification

### Overview

Transform the Boost tab from a self-service purchase flow into a "Coming Soon" preview. Creators can browse the boost options but cannot purchase them directly. When they click on a boost package, a notification is logged to the database so admins see it in their dashboard. Admin-activated boosts (via Feature Overrides) continue working as-is.

### Changes

---

### 1. New Database Table: `boost_interest_requests`

Stores creator interest when they click on a boost package.

```sql
CREATE TABLE boost_interest_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_profile_id UUID NOT NULL REFERENCES creator_profiles(id),
  feature_type TEXT NOT NULL,
  category TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  seen_by_admin BOOLEAN DEFAULT false
);

ALTER TABLE boost_interest_requests ENABLE ROW LEVEL SECURITY;

-- Creators can insert their own interest
CREATE POLICY "Creators can insert own boost interest"
  ON boost_interest_requests FOR INSERT
  WITH CHECK (creator_profile_id IN (
    SELECT id FROM creator_profiles WHERE user_id = auth.uid()
  ));

-- Admins can read all
CREATE POLICY "Admins can read all boost interests"
  ON boost_interest_requests FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
  );

-- Admins can update (mark as seen)
CREATE POLICY "Admins can update boost interests"
  ON boost_interest_requests FOR UPDATE
  USING (
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
  );
```

---

### 2. Modify `FeaturingTab.tsx` -- Add "Coming Soon" Banner

- Add a prominent "Coming Soon" banner at the top explaining self-service boosts are coming soon
- Keep showing admin-activated active boosts (these still work)
- Change "Get Featured" button to "Notify Me" / "I'm Interested" behavior
- When clicked, opens the BoostProfileDialog in preview-only mode

---

### 3. Modify `BoostProfileDialog.tsx` -- Preview-Only Mode

- Mark ALL tiers as "Coming Soon" (not just auto_popup)
- Replace "Activate Boost" button with "I'm Interested" button
- On click, insert a row into `boost_interest_requests` with the selected tier
- Show a toast: "We've noted your interest! Our team will reach out to you."
- Remove MockPaymentDialog flow entirely from creator-facing side

---

### 4. Modify `featuring-tiers.ts`

- Add `comingSoon: true` to ALL tiers (not just auto_popup)

---

### 5. Add Boost Requests to Admin Badge Counts

**File: `src/hooks/useAdminBadgeCounts.ts`**
- Add `boostRequests` to the `BadgeCounts` interface
- Fetch count of unseen `boost_interest_requests` where `seen_by_admin = false`

---

### 6. Add Boost Requests to Admin Quick Actions

**File: `src/components/admin/AdminQuickActions.tsx`**
- Add a "Boost Requests" action card showing pending unseen requests count
- Clicking navigates to the "features" tab

---

### 7. Add Boost Requests Section to Admin Features Tab

**File: `src/components/admin/AdminFeatureOverridesTab.tsx`**
- Add a new section/card at the top showing recent boost interest requests
- Display: creator name, requested boost type, date, and a "Mark Seen" button
- Include creator profile link so admin can easily navigate and activate the boost manually

---

### 8. Add Badge Count to Admin "Features" Tab

**File: `src/pages/Admin.tsx`**
- Add badge count indicator on the "Features" tab trigger showing unseen boost requests

---

### Files to Modify

| File | Change |
|------|--------|
| Database migration | Create `boost_interest_requests` table with RLS |
| `src/config/featuring-tiers.ts` | Mark all tiers `comingSoon: true` |
| `src/components/creator-dashboard/FeaturingTab.tsx` | Add "Coming Soon" banner, keep admin-activated boosts visible |
| `src/components/creator-dashboard/BoostProfileDialog.tsx` | Replace purchase flow with "I'm Interested" insert |
| `src/hooks/useAdminBadgeCounts.ts` | Add `boostRequests` count |
| `src/components/admin/AdminQuickActions.tsx` | Add boost requests action card |
| `src/components/admin/AdminFeatureOverridesTab.tsx` | Add boost interest requests list |
| `src/pages/Admin.tsx` | Add badge to Features tab |

