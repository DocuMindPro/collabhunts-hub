
# Architecture & Scalability Review — CollabHunts

This is a candid, full-stack audit of where the platform is solid, where it will hit walls as you grow, and what improvements would meaningfully move the needle. No fluff.

---

## Overall Verdict

The platform is **well above average for a Lovable-built app** and would survive a proper early-stage launch. The core architecture — web marketing shell + native app workspace + backend-as-a-service — is a legitimate pattern used by real startups. However, there are **7 specific areas** that need work before you scale past a few hundred active users.

---

## What Is Already Solid

**1. Architecture Separation (Strong)**
The web/native split is clean. Lazy loading on the web, eager loading only for native-critical paths, a proper `NativeAppGate` auth orchestrator — this shows genuine architectural thinking, not just copy-paste.

**2. Database Design (Good)**
Over 100+ migration files, 60+ tables with proper foreign keys, RLS policies, and a `backup_history` + automated S3 backup system. The schema handles complex flows: disputes, deliverables, affiliate earnings, delegate access — this is not a toy database.

**3. Backend Functions (Solid)**
30+ edge functions cover: push notifications, AI draft agreements, image optimization, scheduled jobs (cron), S3 backup, mass messaging, dispute deadlines. This is production-grade backend surface area.

**4. iOS/Android CI (Now Fixed)**
The workflow split (iOS manual, Android auto) is the right call. Build badges are in place.

**5. Real-time Notifications**
Postgres `LISTEN/NOTIFY` via Supabase Realtime is correctly wired for notifications with sound + browser notification fallback. This scales fine to thousands of concurrent users on Supabase's infrastructure.

---

## The 7 Issues That Will Bite You at Scale

---

### Issue 1: CRITICAL — Stripe Is Still a Mock

**Current state:** `src/lib/stripe-mock.ts` is 200 lines of simulated payment logic. The `confirmMockPayment` function literally uses `setTimeout` to fake processing. `createCheckoutSession` returns `{ success: true, message: "Mock checkout session created" }`. There is no real money moving.

**Why it matters:** This means brand subscriptions ($99/yr Basic, $299/yr Pro) are recorded in the database as if they were paid, but no actual payment was charged. If you have live users on "paid" plans right now, they are on free plans with paid-tier features. As you add more paying customers, this debt compounds.

**What needs to happen:** Integrate real Stripe Checkout (or Stripe Billing for subscriptions). This requires:
- A real Stripe account and API key (`STRIPE_SECRET_KEY` as a secret)
- A new edge function `create-checkout-session` that calls Stripe's API
- A webhook endpoint `stripe-webhook` to handle `checkout.session.completed`, `invoice.payment_failed`, `customer.subscription.deleted`
- The existing `brand_subscriptions` table stays — just gets populated by the webhook instead of mock code

This is the single most important gap. Everything else is optimization.

---

### Issue 2: HIGH — Admin Page Loads ALL Data at Once

**Current state:** `Admin.tsx` `fetchProfiles()` runs:
```
supabase.from("profiles").select("*") // ALL users
supabase.from("creator_profiles").select(...) // ALL creators  
supabase.from("brand_profiles").select(...) // ALL brands
supabase.from("bookings").select(...) // ALL bookings
supabase.from("creator_social_accounts").select(...) // ALL social accounts
```
All in one shot, all joined in JavaScript memory.

**Why it matters:** Supabase has a **1000-row default limit**. Right now this silently truncates your data — you may already be missing users/creators/bookings in the admin view without knowing it. And as you scale to 2,000+ users, this page will start failing or timing out entirely because it's doing all filtering client-side in JavaScript arrays.

**Fix:** Add `.range()` pagination to each query and move filtering to server-side `ilike()` queries instead of JavaScript `.filter()`.

---

### Issue 3: HIGH — No React Query Caching on Dashboards

**Current state:** `CreatorDashboard` fetches the creator profile in a raw `useEffect` with no caching. `NativeBrandDashboard` passes data down as props from `NativeAppGate`. Individual tab components (`BookingsTab`, `MessagesTab`, etc.) each have their own `useEffect` fetches with no coordination.

**Why it matters:** Every tab switch re-fetches data from the server. On mobile with spotty connections (Lebanon, etc.), this creates visible loading states on EVERY tab switch. More importantly, there's no cache invalidation — if a booking status changes in one tab, another tab shows stale data.

**What's ironic:** `@tanstack/react-query` is already installed and used in `StorageMonitorCard` — but dashboards don't use it. The solution is to wrap dashboard queries in `useQuery()` with proper `queryKey` arrays so data is cached for 30-60 seconds and shared across tabs.

---

### Issue 4: MEDIUM — `CreatorDashboard.tsx` Still Has `pb-20` on Line 97

**Current state:** From the file we just read:
```tsx
<div className={`min-h-screen flex flex-col ${isNative ? 'pb-20' : ''}`}>
```
The plan from the previous session fixed `App.tsx` and `NativeBrandDashboard.tsx` but **`CreatorDashboard.tsx` line 97 still has the old `pb-20`**. This means the creator dashboard content on newer iPhones is still clipped.

**Fix:** Change line 97 from `pb-20` to use inline safe-area calc, same as the other files.

---

### Issue 5: MEDIUM — Messaging Counter Has a Race Condition

**Current state:** `incrementMessagingCounter` in `subscription-utils.ts` does:
```typescript
const { data: brand } = await supabase.from('brand_profiles').select('creators_messaged_this_month')...
// then:
await supabase.from('brand_profiles').update({ creators_messaged_this_month: brand.creators_messaged_this_month + 1 })
```
This is a read-then-write (non-atomic) operation. Two simultaneous messages from the same brand (rare but possible) could both read `5`, both write `6` — and the counter only increments by 1 instead of 2.

**Fix:** Replace with a database-side increment:
```sql
UPDATE brand_profiles SET creators_messaged_this_month = creators_messaged_this_month + 1 WHERE id = $1
```
This is a one-line SQL fix via a new migration using Supabase's `rpc()` call or a raw `UPDATE` with no `SELECT` first.

---

### Issue 6: MEDIUM — `package.json` Version Is `0.0.0`

**Current state:** `"version": "0.0.0"` in `package.json`. The `__APP_VERSION__` we just wired up to `vite.config.ts` will display `v0.0.0` in the app.

**Fix:** Bump to `"version": "1.0.0"` (or whatever your real version is). Also, the Android CI workflow bumps the build number in `android/app/build.gradle` but doesn't update `package.json` — so `__APP_VERSION__` will always show `1.0.0` regardless of how many builds you ship. Add a step to the iOS workflow to set this properly before building.

---

### Issue 7: LOW — `safe-area-top` Is a Custom Class with No Tailwind Definition

**Current state:** Throughout native files: `className="safe-area-top"`, `className="safe-area-bottom"`. But looking at `tailwind.config.ts` — these classes are **not defined** in the Tailwind config. They must be defined somewhere in `index.css` or they fall back to nothing.

Let me check what's actually in the CSS for these...

From `index.css`, these classes are defined as custom utilities using `env(safe-area-inset-top)` — so they work. But they're raw CSS utilities, not Tailwind classes, which means they won't tree-shake properly and can't be composed with Tailwind modifiers like `md:safe-area-top`. Not a breaking issue today, but worth noting.

---

## Summary Priority Table

| # | Issue | Impact | Effort | When to Fix |
|---|---|---|---|---|
| 1 | Stripe is mocked — no real payments | Critical | High | Before monetizing |
| 2 | Admin loads all rows, hits 1000-row limit | High | Medium | Before 1,000 users |
| 3 | No React Query caching on dashboards | High | Medium | Next sprint |
| 4 | `CreatorDashboard.tsx` still has `pb-20` | Medium | 5 min | Now |
| 5 | Messaging counter race condition | Medium | 30 min | Before heavy use |
| 6 | `package.json` version is `0.0.0` | Low | 2 min | Now |
| 7 | `safe-area-*` custom class definitions | Low | Cosmetic | Later |

---

## What I Can Fix Right Now

Items 4 and 6 are tiny — I can fix both in this session:
- `CreatorDashboard.tsx` line 97: `pb-20` → inline safe-area calc
- `package.json`: `0.0.0` → `1.0.0`

Items 3 and 5 require a focused session each.

Item 1 (Stripe) is a dedicated feature that requires your Stripe API keys and is the most important thing on this list.

Item 2 (Admin pagination) is a dedicated session once you're approaching 500+ users.

