
# Enrich User Details Dialog with All Captured Information

## What's Changing

The "User Details" dialog in the Admin users tab currently shows minimal info. You want it to display all the information collected during registration for both brands and creators.

## Current State vs. New State

### Creator Profile Section (currently shows 4 fields, will show 12+)
**Currently**: Display Name, Status, Total Earned, Completed Bookings
**Adding**:
- Profile ID (with copy button)
- Phone Number (with verified badge)
- Location (city, state, country)
- Categories
- Gender, Ethnicity
- Primary Language
- Birth Date
- Rating and Reviews count
- Price Range (min/max event price)
- Social accounts (platform, username, followers)

### Brand Profile Section (currently shows 4 fields, will show 12+)
**Currently**: Company Name, Status, Total Spent, Completed Bookings
**Adding**:
- Profile ID (with copy button)
- First Name, Last Name
- Position/Title
- Phone Number (with verified badge)
- Logo (small thumbnail)
- Industry, Company Size
- Website URL
- Business Address (venue_address, venue_city)
- Location Country
- Verification Status
- Monthly Budget Range
- Preferred Categories and Platforms

## Technical Details

### 1. Update `fetchProfiles` in `Admin.tsx` (lines 306-313)

Expand the `select` queries to fetch more columns:

**Creator profiles query** -- add: `bio, location_city, location_state, location_country, categories, gender, ethnicity, primary_language, birth_date, average_rating, total_reviews, min_event_price_cents, max_event_price_cents, profile_image_url`

**Brand profiles query** -- add: `first_name, last_name, contact_position, logo_url, industry, company_size, website_url, venue_address, venue_city, location_country, is_verified, verification_status, monthly_budget_range, preferred_categories, preferred_platforms`

Also fetch `creator_social_accounts` for the selected user's creator profile.

### 2. Update `Profile` interface (lines 34-53)

Add all the new optional fields for both creator and brand data.

### 3. Update the profile mapping (lines 350-365)

Map the new fields from fetched data into the Profile object.

### 4. Update User Details Dialog (lines 1479-1540)

**Creator section** -- add rows for:
- Profile ID with copy button
- Phone with verified indicator
- Location (city, state, country combined)
- Categories as badges
- Gender, Ethnicity, Language
- Birth Date
- Rating (stars) and Reviews count
- Price Range
- Social accounts list

**Brand section** -- add rows for:
- Profile ID with copy button
- First/Last Name and Position
- Logo thumbnail
- Phone with verified indicator
- Industry and Company Size
- Website (as link)
- Business Address
- Location Country
- Verification Status badge
- Budget Range
- Preferred Categories and Platforms as badges

### Files to Modify
- `src/pages/Admin.tsx` -- Profile interface, fetchProfiles query, data mapping, dialog UI
