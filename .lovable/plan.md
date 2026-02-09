

## Update Admin Panel: Disputes, Testing, and Manual Tabs

### Overview

Three admin tabs contain outdated information that doesn't match the platform's current identity and functionality. Here's what needs to change.

---

### 1. Remove Disputes Tab (Not Applicable)

The platform operates as a zero-fee marketplace -- no payments are processed, no escrow, no transaction fees. The dispute system (refund percentages, payment status updates, resolution deadlines) doesn't apply.

**Changes:**
- Remove the Disputes `TabsTrigger` and `TabsContent` from `src/pages/Admin.tsx`
- Remove the import of `AdminDisputesTab`
- Remove `disputes` from the badge counts in `src/hooks/useAdminBadgeCounts.ts`
- Optionally keep the `AdminDisputesTab.tsx` file (no harm), or delete it for cleanliness

---

### 2. Update Testing Tab -- Brand Onboarding Preview

The `BrandOnboardingPreview` component still uses old campaign/marketing language that was already updated in the real onboarding flow.

**File: `src/components/admin/BrandOnboardingPreview.tsx`**

| What's Wrong | Correct Value |
|-------------|---------------|
| Intent: "Brand Awareness", "Drive Sales", "User Generated Content", "Social Engagement" | "Book a one-time event", "Recurring collaborations", "Just exploring" |
| Budget: "Under $1,000/mo", "$1,000-$5,000/mo", "$5,000-$10,000/mo", "$10,000+/mo" | "Under $200", "$200-$500", "$500-$1,500", "$1,500+" (per event, not monthly) |
| 5 steps (with phone verification as step 1) | Keep same structure but update the content to match actual flow |

---

### 3. Update Platform Manual -- Outdated Pricing and Features

**File: `src/data/platformManual.ts`**

Multiple sections contain outdated information:

| Section | What's Wrong | Fix |
|---------|-------------|-----|
| **Business Model** (line ~398-414) | Lists "Brand Basic $10/mo, Pro $49/mo, Premium $99/mo" and specific prices | Update to reflect that Basic and Pro prices are hidden (quotation-based), keep Premium pricing, add note about quotation inquiry system |
| **Subscription Tiers** (line ~489-507) | Shows "$10/mo", "$49/mo", "$99/mo" columns with old feature matrix | Update to "Basic (Contact for pricing)", "Pro (Contact for pricing)", "Premium ($99/mo)" and update opportunity posts to 4/month for free tier |
| **Dispute Edge Function** (line ~184) | Lists `check-dispute-deadlines` | Remove from the edge functions list |
| **Dispute references** in Database Schema (line ~244-246) | Lists `booking_disputes`, `booking_offers` tables | Mark as legacy/unused or remove |
| **Creator Featuring prices** (line ~684-688) | Shows specific dollar amounts for boost packages | Verify these are still accurate |
| **Approval Workflows** | Generally fine but could mention quotation inquiry flow | Add a new article about the Quotation Inquiry workflow |
| Missing: Quotation system | No documentation about the new quotation inquiry flow | Add new article documenting how quotation inquiries work |

---

### 4. Additional Admin Tab Check

After reviewing all tabs, here are the other findings:

| Tab | Status |
|-----|--------|
| Users | OK |
| Creators | OK |
| Venues (quotation inquiries) | OK (recently added) |
| Approvals | OK |
| Events | Placeholder ("coming soon") -- could note this but not critical |
| Revenue | OK (tracks bookings for record-keeping) |
| Testing | Needs update (brand preview -- see above) |
| **Disputes** | **Remove** |
| Manual | Needs content update (see above) |
| Verifications | OK |
| Branding | OK |
| Features | OK |
| Announcements | OK |
| Careers | OK |
| Subscriptions | OK |
| **Campaigns** | The `AdminCampaignsTab` references "campaigns" -- verify if this is still used or if it's been replaced by "opportunities" |

---

### Files to Modify

| File | Change |
|------|--------|
| `src/pages/Admin.tsx` | Remove Disputes tab trigger, content, and import |
| `src/hooks/useAdminBadgeCounts.ts` | Remove `disputes` from badge counts |
| `src/components/admin/BrandOnboardingPreview.tsx` | Update intents and budgets to match actual onboarding flow |
| `src/data/platformManual.ts` | Update Business Model pricing, Subscription Tiers, remove dispute references, add Quotation Inquiry documentation |

