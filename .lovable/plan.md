

## Redesign the Opportunities Tab -- Remove Duplication, Improve UX

### Current Problems

1. **Two "Browse Opportunities" buttons** -- "Browse All" in the Fresh Opportunities card AND a separate "Browse Opportunities" button next to "My Applications"
2. **"Fresh Opportunities" section duplicates the Overview tab** -- the same 3 latest opportunities already appear on the Overview tab
3. **Layout feels disconnected** -- two separate sections with redundant CTAs instead of one cohesive page

### Redesigned Layout

Merge everything into a single, unified page with a clear hierarchy:

```text
+----------------------------------------------------------+
|  Opportunities                        [Browse All ->]     |
|  Find gigs and track your applications                    |
+----------------------------------------------------------+
|                                                          |
|  3 New This Week  |  1 Application  |  0 Accepted        |
|  (stat cards row)                                        |
+----------------------------------------------------------+
|                                                          |
|  MY APPLICATIONS                                         |
|  [All (1)] [Pending (0)] [Active (0)] [Completed (0)]    |
|                                                          |
|  +----------------------------------------------------+  |
|  | fdgfdgfgfdgfdgfd           Withdrawn                |  |
|  | TOP CREATOR NETWORK                                 |  |
|  | Meet & Greet | Feb 11, 2026 | $232323 proposed      |  |
|  +----------------------------------------------------+  |
|                                                          |
|  --- empty state shows "Browse Opportunities" CTA ---    |
+----------------------------------------------------------+
```

### Changes (Single File: `src/components/creator-dashboard/OpportunitiesTab.tsx`)

1. **Remove the "Fresh Opportunities" card entirely** -- it already exists on the Overview tab, so showing it here is redundant
2. **Combine the header** -- single header row with title "Opportunities" on the left and one "Browse All" button on the right
3. **Add quick-stat cards** -- three small stat cards showing "New This Week", "My Applications", and "Accepted" counts for at-a-glance context
4. **Keep the application list and filters** as-is (they work well)
5. **Keep the "Browse Opportunities" CTA only in the empty state** -- when a creator has zero applications, the empty state still shows the link to discover opportunities

### Technical Details

| What | Detail |
|------|--------|
| Remove `newestOpportunities` state + fetch | No longer needed in this tab |
| Remove `NewestOpportunity` interface | Cleanup |
| Remove `fetchNewestOpportunities` call | Cleanup |
| Add stat card row | Use existing `applications` data + a simple count query for "new this week" |
| Single CTA button | Replace two buttons with one in the header |
| Keep empty-state CTA | The "Browse Opportunities" button stays only when there are zero applications |

No new files, no database changes. One file modified.

