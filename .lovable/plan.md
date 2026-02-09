

## Fix: Stale "Pro" Subscription Showing on Brand Dashboard

### Root Cause

The database has two records with `status = 'active'` for this brand:

1. `none` plan -- created Jan 15, 2026 (correct, current)
2. `pro` plan -- created Dec 11, 2025, **expired Jan 11, 2026** (stale, should have been marked expired)

The `getBrandSubscription` function in `subscription-utils.ts` orders results by `plan_type DESC`, so "pro" sorts before "none" and gets returned as the active subscription. While `checkAndHandleExpiredSubscriptions` exists to catch this, it may silently fail (e.g. network error swallowed by the try/catch) or lose a race with the subsequent SELECT query.

### Fix (Two Parts)

**Part 1 -- Make the query robust (code fix)**

In `src/lib/subscription-utils.ts`, change `getBrandSubscription` so the SELECT query that fetches active subscriptions also filters out rows whose `current_period_end` is in the past. This way, even if the expiration-cleanup step fails, stale rows are never returned.

```
Current:  .eq('status', 'active')
Fixed:    .eq('status', 'active').gte('current_period_end', new Date().toISOString())
```

**Part 2 -- Clean up stale data (migration)**

Run a one-time migration to mark all expired-but-still-active subscriptions as `expired`:

```sql
UPDATE brand_subscriptions
SET status = 'expired'
WHERE status = 'active'
  AND plan_type != 'none'
  AND current_period_end < now();
```

### Files to Modify

| File | Change |
|------|--------|
| `src/lib/subscription-utils.ts` | Add `.gte('current_period_end', now)` filter to the active subscription SELECT in `getBrandSubscription` |
| Migration SQL | Mark stale active subscriptions as expired |

