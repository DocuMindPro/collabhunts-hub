

## Enrich Quotation Inquiries with Full Brand Details

### What Changes
When you view a quotation inquiry in the admin panel, each row will show an expandable detail section with all the brand's information so you can call them prepared.

### Layout

Currently each row only shows: company name, email, phone, industry, plan, status, date, notes.

After the change, clicking a row will expand to show a detailed info card below the row with:

**Contact Info:**
- Full name (first + last)
- Phone number (clickable)
- Email (clickable)
- Position/role in company

**Company Info:**
- Company name
- Industry
- Company size
- Website URL (clickable link)
- Monthly budget range
- Marketing intent

**Venue/Location Details:**
- Venue name and type
- Venue address and city
- Country
- Venue capacity
- Parking available
- Accessibility info
- Amenities

**Preferences:**
- Preferred platforms
- Preferred categories

**Account Info:**
- Current plan
- Verification status
- Phone verified status
- Account created date

### Technical Details

**File: `src/components/admin/AdminQuotationsSection.tsx`**

1. **Expand the `brand` interface** to include all `brand_profiles` fields: `company_size`, `contact_position`, `website_url`, `monthly_budget_range`, `marketing_intent`, `venue_name`, `venue_type`, `venue_address`, `venue_city`, `location_country`, `venue_capacity`, `parking_available`, `accessibility_info`, `amenities`, `preferred_platforms`, `preferred_categories`, `brand_plan`, `verification_status`, `phone_verified`, `created_at`, `logo_url`

2. **Update the Supabase query** to select all fields from `brand_profiles` instead of just `id, company_name, phone_number, first_name, last_name, industry, user_id`

3. **Add expandable row state** -- track which inquiry ID is expanded via `expandedId` state

4. **Add a collapsible detail panel** below each table row that shows all brand info in a clean grid layout when the row is clicked

5. **Import additional icons** from Lucide: `Building2, Globe, MapPin, Users, ChevronDown, ChevronUp, DollarSign, Tag, Briefcase`

### Single File Changed
- `src/components/admin/AdminQuotationsSection.tsx`
