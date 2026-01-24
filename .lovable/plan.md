

# CollabHunts Platform Analysis & Automation Enhancement Plan

## Current Platform Overview

### How CollabHunts Works

**Business Model:** CollabHunts is a creator-brand marketplace connecting influencers with brands for paid collaborations. Revenue comes from:

1. **Brand Subscriptions** (Primary Revenue)
   - None (Free): Browse only, no messaging
   - Basic ($39/mo): Chat with creators, view pricing, 10GB storage
   - Pro ($99/mo): CRM, 1 campaign/month, advanced filters, verification badge
   - Premium ($299/mo): Unlimited campaigns, 50GB storage, priority support

2. **Platform Fees** (Managed Service)
   - 15-20% fee on bookings routed through CollabHunts' managed agency model
   - Brands pay CollabHunts, who then pays creators

3. **Advertising Placements**
   - Sell ad spots on platform pages to external advertisers

4. **Franchise System** (70/30 split)
   - Franchise owners pay one-time fee for territorial rights
   - Receive 70% of platform revenue from their assigned countries

5. **Affiliate Program** (50/50 split)
   - Affiliates get 50% of CollabHunts' cut from referred users

---

### Current Manual Processes (Admin Pain Points)

| Process | Current State | Frequency |
|---------|--------------|-----------|
| Creator Approvals | Manual review required | Every new signup |
| Campaign Approvals | Manual review required | Every new campaign |
| Business Verifications | Manual website/phone check | On request |
| Dispute Resolution | Manual admin decision | When escalated |
| Affiliate Payouts | Manual approval | Monthly requests |
| Franchise Payouts | Manual approval | Monthly requests |
| Subscription Management | Manual tier changes | Support requests |

### What's Already Automated
- Database backups (daily cron)
- Dispute reminders & auto-escalation (hourly cron)
- Payment auto-release after 72 hours
- Content expiration reminders (daily cron)
- Ad placement expiration (hourly cron)
- Email notifications (all transactional)

---

## Automation Enhancement Plan

### Phase 1: Auto-Approve Creators (High Impact)

**Problem:** Every creator signup requires manual admin approval, creating bottlenecks and delays.

**Solution:** Implement tiered auto-approval based on verified criteria:

```
Auto-Approve if ALL conditions met:
├── Phone verified = true
├── At least 1 social account linked with 1,000+ followers
├── Profile photo uploaded
├── Bio length >= 50 characters
├── At least 1 service created with valid pricing
└── Location country provided

Otherwise → Queue for manual review
```

**Implementation:**
- Create a database trigger or edge function on `creator_profiles` insert/update
- Check criteria programmatically
- Auto-set `status = 'approved'` if criteria pass
- Send welcome email automatically
- Only flag "edge cases" for manual review

**Benefit:** Reduces 80%+ of manual approvals, faster creator onboarding.

---

### Phase 2: Auto-Approve Campaigns (Medium Impact)

**Problem:** Every brand campaign needs manual approval before going live.

**Solution:** Auto-approve campaigns from trusted brands:

```
Auto-Approve if ANY condition met:
├── Brand is verified (is_verified = true)
├── Brand has Pro or Premium subscription
├── Brand has previously run 3+ approved campaigns
└── Campaign budget <= $500 (low-risk threshold)

Otherwise → Queue for manual review
```

**Implementation:**
- Database trigger on `campaigns` insert
- Check brand trust signals
- Auto-set `status = 'active'` for trusted brands
- Flag new/unverified brands for review

**Benefit:** Faster campaign launches for trusted brands, only review high-risk cases.

---

### Phase 3: Auto-Verify Businesses (Medium Impact)

**Problem:** Brand verification requires manual website/phone check.

**Solution:** Implement automated verification checks:

```
Auto-Verify if ALL conditions met:
├── Phone verified = true (already done via OTP)
├── Website URL provided AND returns 200 status
├── Website contains company name in title/meta
├── Brand has active paid subscription (Basic+)
├── Account age >= 7 days (prevent abuse)
└── No previous verification rejections

Otherwise → Queue for manual review
```

**Implementation:**
- Edge function to check website validity
- Use Lovable AI to analyze website content for legitimacy
- Auto-approve if all checks pass
- Flag suspicious cases (new domains, mismatched names)

**Benefit:** Instant verification for legitimate businesses.

---

### Phase 4: Simplify Payout Processing

**Problem:** Affiliate and franchise payouts require manual approval.

**Current Flow:**
```
User requests payout → Admin reviews → Admin approves → Mark as processed
```

**Proposed Flow:**
```
User requests payout → System validates balance → Auto-approve if valid → Admin notified for actual payment
```

**Implementation:**
- Auto-approve requests if:
  - Available balance >= requested amount
  - No pending disputes involving user
  - Account in good standing
- Create "ready for payment" queue for admin
- Admin only needs to confirm funds sent, not approve request

**Benefit:** Removes approval bottleneck, admin focuses only on disbursement.

---

### Phase 5: Dispute Resolution Assistance

**Problem:** Dispute resolution is fully manual and requires context gathering.

**Solution:** AI-assisted dispute analysis:

```
When dispute reaches admin:
├── Auto-generate summary of:
│   ├── Booking details
│   ├── Message history between parties
│   ├── Deliverables submitted
│   ├── Timeline of events
│   └── Similar past dispute resolutions
├── AI-suggested resolution with confidence score
└── Admin reviews and confirms/modifies
```

**Implementation:**
- Edge function using Lovable AI (Gemini)
- Analyze dispute reason, messages, and deliverables
- Suggest: release/refund/split based on patterns
- Admin still makes final decision but with context

**Benefit:** Faster, more consistent dispute resolution.

---

### Phase 6: Subscription Auto-Renewal & Dunning

**Problem:** Subscriptions expire, manual follow-up needed for renewals.

**Current State:**
- Subscriptions expire → auto-downgrade to "none"
- No proactive renewal reminders

**Proposed Automation:**
```
7 days before expiry → Send renewal reminder email
3 days before expiry → Send urgent reminder
On expiry → Auto-downgrade + "We miss you" email
7 days after → Win-back email with discount offer
```

**Implementation:**
- Scheduled edge function (daily)
- Query subscriptions by `current_period_end`
- Send appropriate email based on days remaining
- Track win-back campaign conversions

**Benefit:** Reduce churn, increase renewals automatically.

---

### Phase 7: Real Payment Integration (Critical)

**Problem:** Currently using mock payments (no real money flows).

**Solution:** Integrate Paddle as Merchant of Record (as planned):

```
Implementation Steps:
1. Create Paddle products for each subscription tier
2. Implement Paddle checkout overlay for subscriptions
3. Set up webhooks for:
   ├── subscription.created
   ├── subscription.updated
   ├── subscription.canceled
   ├── subscription.payment_succeeded
   └── subscription.payment_failed
4. Map Paddle subscription IDs to brand_subscriptions table
5. Handle failed payments with retry logic
```

**Files to Modify:**
- Remove `MockPaymentDialog.tsx`
- Create `PaddleCheckout.tsx` component
- Create `paddle-webhook` edge function
- Update `BrandSubscriptionTab.tsx` to use real checkout

**Benefit:** Actually collect money, enable real business operations.

---

## Technical Improvements for Easier Maintenance

### 1. Centralized Configuration

**Problem:** Subscription plans, features, and limits are scattered across multiple files.

**Solution:** Create single source of truth:

```typescript
// src/config/plans.ts
export const PLANS = {
  none: { price: 0, features: {...}, limits: {...} },
  basic: { price: 3900, features: {...}, limits: {...} },
  pro: { price: 9900, features: {...}, limits: {...} },
  premium: { price: 29900, features: {...}, limits: {...} }
};
```

Update `stripe-mock.ts`, `Pricing.tsx`, `BrandSubscriptionTab.tsx`, etc. to import from this file.

---

### 2. Admin Dashboard Improvements

**Current Pain Points:**
- 14+ tabs in admin dashboard
- No quick actions on homepage
- Must navigate to see pending items

**Proposed Enhancement:**
```
Admin Dashboard Homepage:
┌─────────────────────────────────────────────────────┐
│ 🚨 Requires Attention                               │
├─────────────────────────────────────────────────────┤
│ • 5 pending creator approvals    [Review All]      │
│ • 2 pending campaigns            [Review All]      │
│ • 1 dispute awaiting decision    [View Dispute]    │
│ • 3 verification requests        [Review All]      │
│ • 2 payout requests              [Process]         │
└─────────────────────────────────────────────────────┘

Recent Activity Feed:
• John Doe signed up as creator (2 mins ago)
• Acme Corp subscribed to Pro (1 hour ago)
• Dispute #123 auto-escalated (3 hours ago)
```

---

### 3. Reduce Codebase Complexity

**Identified Redundancies:**
- `BrandAccountTab.tsx` duplicates phone verification logic from `CreatorSignup.tsx`
- Multiple files check subscription status independently

**Proposed Refactoring:**
- Create shared hooks:
  - `usePhoneVerification()` - reusable OTP flow
  - `useSubscriptionStatus()` - centralized plan checking
  - `useAdminApproval()` - shared approval logic

---

### 4. Automated Health Monitoring

**Proposed Edge Function:** `system-health-check`

```
Runs every hour:
├── Check database connectivity
├── Check R2 storage access
├── Check SendGrid API status
├── Count unprocessed items:
│   ├── Pending creators > 24h old
│   ├── Pending campaigns > 24h old
│   ├── Disputes > 48h without action
│   └── Payouts > 7 days pending
└── Send alert email if thresholds exceeded
```

---

## Priority Implementation Order

| Priority | Task | Effort | Impact |
|----------|------|--------|--------|
| 1 | Auto-approve creators | Medium | High |
| 2 | Paddle payment integration | High | Critical |
| 3 | Subscription renewal automation | Low | Medium |
| 4 | Auto-approve campaigns | Low | Medium |
| 5 | Admin dashboard quick actions | Medium | High |
| 6 | Centralized config refactor | Low | Medium |
| 7 | Auto-verify businesses | Medium | Medium |
| 8 | AI dispute assistance | High | Medium |
| 9 | System health monitoring | Low | Low |

---

## Summary

**Immediate wins (1-2 days each):**
1. Auto-approve creators with verified phone + social accounts
2. Add admin dashboard "Requires Attention" widget
3. Subscription renewal reminder emails

**Medium-term (1 week):**
4. Paddle payment integration to collect real money
5. Auto-approve campaigns from trusted brands
6. Centralize plan configuration

**Long-term (ongoing):**
7. AI-assisted dispute resolution
8. Automated system health monitoring

This plan will transform CollabHunts from a manually-operated platform to a largely self-running marketplace, reducing admin workload by an estimated 60-70%.

