
# Brand-Created Events ("Opportunity Board") Feature

## Overview

This feature introduces a **reverse marketplace flow** where brands can create public events/opportunities that creators can discover, apply to, attend, and get paid upon delivery confirmation.

### Two Distinct Flows

The platform will support both flows:
1. **Current Flow** (Brand → Creator): Brand finds a creator and books them directly
2. **New Flow** (Creator → Brand): Brand posts an opportunity, creators apply, brand selects creators

---

## Business Logic Clarification

### Paid Events Flow
```text
Brand Creates Opportunity → Creators Apply → Brand Accepts Creator(s)
         ↓
Creator Attends Event & Creates Content
         ↓
Creator Submits Delivery (with post links)
         ↓
Brand Confirms Receipt → Platform Releases Payment (15% fee)
```

### Free Invite Flow (Open to Free Invites)
For "barter" collaborations where brands offer experiences instead of payment:

```text
Brand Creates FREE Opportunity → Only "Open to Free Invites" Creators See It
         ↓
Creator Applies → Brand Accepts
         ↓
Creator Attends & Posts Content
         ↓
Creator Marks as Delivered (with post links)
         ↓
Brand Confirms Content Posted (optional rating/review)
```

**Key Difference**: No escrow, no platform fee—just a confirmation workflow for accountability.

---

## Database Changes

### New Table: `brand_opportunities`

| Column | Type | Description |
|--------|------|-------------|
| `id` | uuid | Primary key |
| `brand_profile_id` | uuid | FK to brand_profiles |
| `title` | text | e.g., "Looking for Food Creators for Restaurant Opening" |
| `description` | text | Details about the opportunity |
| `package_type` | text | From EVENT_PACKAGES (social_boost, meet_greet, etc.) |
| `event_date` | date | When the event happens |
| `start_time` / `end_time` | time | Event timing |
| `is_paid` | boolean | true = paid booking, false = free invite |
| `budget_cents` | integer | Budget per creator (null if free) |
| `spots_available` | integer | How many creators needed |
| `spots_filled` | integer | How many accepted (default 0) |
| `requirements` | text | Creator requirements (followers, categories, etc.) |
| `min_followers` | integer | Minimum follower requirement (optional) |
| `required_categories` | text[] | Content niches wanted |
| `status` | text | 'open', 'filled', 'completed', 'cancelled' |
| `application_deadline` | timestamp | When applications close |
| `created_at` / `updated_at` | timestamps | |

### New Table: `opportunity_applications`

| Column | Type | Description |
|--------|------|-------------|
| `id` | uuid | Primary key |
| `opportunity_id` | uuid | FK to brand_opportunities |
| `creator_profile_id` | uuid | FK to creator_profiles |
| `message` | text | Creator's pitch/message |
| `proposed_price_cents` | integer | Creator's asking price (null if free invite) |
| `status` | text | 'pending', 'accepted', 'rejected', 'withdrawn' |
| `booking_id` | uuid | FK to bookings (created when accepted, for payment flow) |
| `delivery_links` | text[] | Links to posted content |
| `delivered_at` | timestamp | When creator submitted delivery |
| `confirmed_at` | timestamp | When brand confirmed receipt |
| `created_at` | timestamps | |

---

## New Pages & Components

### 1. Opportunities Discovery Page (for Creators)
**Route**: `/opportunities`

- List of open brand opportunities
- Filters: Location, Package Type, Paid/Free, Categories
- Shows: Brand name/venue, date, budget, spots left
- "Apply" button → Opens application modal

### 2. Create Opportunity Form (for Brands)
**Location**: Brand Dashboard → New "Post Opportunity" tab or button

- Form fields matching the database schema
- Toggle between "Paid Event" and "Free Invite"
- If free invite, only creators with `open_to_invitations = true` can apply

### 3. Manage Applications (for Brands)
**Location**: Brand Dashboard → New "Applications" section

- View all applications per opportunity
- Accept/Reject creators
- Message applicants
- Track delivery status

### 4. My Applications (for Creators)
**Location**: Creator Dashboard → New "Opportunities" tab

- List of opportunities they've applied to
- Application status tracking
- Submit delivery (upload links to posts)
- See confirmation status

---

## Delivery Confirmation Flow

### For Paid Events
1. Creator completes event and posts content
2. Creator submits delivery with links to posts
3. Brand reviews links and confirms
4. Platform releases payment (after 15% fee)
5. If brand doesn't confirm within 72 hours, auto-release

### For Free Invites
1. Creator attends and posts content
2. Creator submits post links
3. Brand confirms receipt (no payment involved)
4. Both parties can leave reviews
5. Builds creator's "completed collaborations" count

---

## UI/UX Additions

### Brand Dashboard Changes
- Add "Post Opportunity" button in Overview
- Add "My Opportunities" tab showing posted opportunities and applications
- Add "Pending Confirmations" section for delivery reviews

### Creator Dashboard Changes
- Add "Opportunities" tab to browse and manage applications
- Add delivery submission flow with link inputs
- Show application statuses

### Discovery Integration
- Add "Opportunities" link in main navigation
- Filter for "Open to Free Invites" creators matches free opportunities

---

## Summary of Files to Create/Modify

### New Files
| File | Purpose |
|------|---------|
| `src/pages/Opportunities.tsx` | Creator-facing opportunity discovery |
| `src/components/brand-dashboard/BrandOpportunitiesTab.tsx` | Brand's posted opportunities |
| `src/components/brand-dashboard/CreateOpportunityDialog.tsx` | Form to create opportunity |
| `src/components/brand-dashboard/OpportunityApplicationsDialog.tsx` | View/manage applications |
| `src/components/creator-dashboard/OpportunitiesTab.tsx` | Creator's applications |
| `src/components/creator-dashboard/SubmitDeliveryDialog.tsx` | Submit post links |

### Modified Files
| File | Changes |
|------|---------|
| `src/pages/BrandDashboard.tsx` | Add Opportunities tab |
| `src/pages/CreatorDashboard.tsx` | Add Opportunities tab |
| `src/App.tsx` | Add /opportunities route |
| `src/components/Navbar.tsx` | Add Opportunities link |

### Database Migration
- Create `brand_opportunities` table with RLS
- Create `opportunity_applications` table with RLS
- Policies for brands to manage their opportunities
- Policies for creators to view opportunities and manage their applications

---

## Technical Notes

### RLS Policies
- Brands can CRUD their own opportunities
- Creators can view all 'open' opportunities (with visibility rules for free vs paid)
- For free opportunities, only show to creators with `open_to_invitations = true`
- Creators can CRUD their own applications
- Brands can view/update applications on their opportunities

### Escrow Integration
When a brand accepts a creator for a **paid** opportunity:
1. Create a `bookings` record with the agreed price
2. Trigger the existing escrow flow (50% deposit)
3. Link the application to the booking via `booking_id`
4. Use existing `releasePayment()` when brand confirms delivery

### Free Invites
- No booking record created
- Just track delivery and confirmation in the application record
- Build creator reputation through completed free collaborations
