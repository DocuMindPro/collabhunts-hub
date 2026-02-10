

## Make Opportunities More Discoverable + Add Creator Engagement Features

### Problem 1: Opportunities Are Too Buried
Currently a creator must: Dashboard > Opps Tab > Click "Browse Opportunities" -- that's 3 steps to find new work.

### Problem 2: No Reason to Return
Creators only open the app when a brand messages them. There's nothing pulling them back proactively.

---

### Solution A: Surface Opportunities Everywhere

**1. Add "New Opportunities" Card to Overview Tab**
File: `src/components/creator-dashboard/OverviewTab.tsx`

- Add a new card below the stats grid showing the latest 3 open opportunities
- Each shows title, brand name, package type badge, budget, and event date
- "View All Opportunities" button links directly to `/opportunities`
- Fetch count of new opportunities posted in the last 7 days and show it as a highlighted number (e.g., "5 New This Week")

**2. Add Opportunities Count Badge to Navbar**
File: `src/components/Navbar.tsx`

- Show a count badge on the "Opportunities" nav link (similar to the unread messages badge)
- Count = open opportunities the creator hasn't viewed yet (based on opportunities created after the creator's last visit to `/opportunities`, tracked via localStorage)

**3. Add Quick-Access "Browse Opps" Button on the Opps Tab Header**
File: `src/components/creator-dashboard/OpportunitiesTab.tsx`

- Make the existing "Browse Opportunities" button more prominent (larger, with a pulsing dot if there are new ones)
- Add an inline preview section at the top showing 2-3 newest opportunities directly in the tab before the "My Applications" section, so creators see fresh opportunities without an extra click

---

### Solution B: Give Creators Reasons to Come Back (Engagement Features)

**4. "Weekly Opportunity Digest" Summary on Overview Tab**
File: `src/components/creator-dashboard/OverviewTab.tsx`

- Add a "This Week" section showing:
  - Number of new opportunities matching their category
  - Number of profile views they got
  - A motivational prompt like "3 brands are looking for creators like you!"
- This gives creators a reason to check the dashboard regularly

**5. "Recommended For You" Section on Overview Tab**
File: `src/components/creator-dashboard/OverviewTab.tsx`

- Show 2-3 opportunities that match the creator's categories/location
- Uses existing `required_categories` and `location_city` fields from opportunities
- Fetch creator's categories from their profile and match against open opportunities
- Each card is clickable and goes directly to `/opportunities` with the opportunity pre-selected

---

### Files to Modify

| File | Change |
|------|--------|
| `src/components/creator-dashboard/OverviewTab.tsx` | Add "New Opportunities" card, "This Week" summary, and "Recommended For You" section |
| `src/components/creator-dashboard/OpportunitiesTab.tsx` | Add inline preview of newest opportunities above "My Applications" |
| `src/components/Navbar.tsx` | Add badge count on "Opportunities" nav link for creators |

No database changes needed -- all data is already available via existing tables.

### Summary of Impact
- Opportunities become visible on every dashboard visit (Overview tab)
- Navbar badge creates curiosity to check new opportunities
- "Recommended For You" makes the dashboard feel personalized
- Weekly summary gives creators a reason to open the app daily/weekly even without messages
