
# Add Admin-Controlled Service Price Ranges

## Overview
Enable admins to configure minimum and maximum price ranges for each service type. Creators will only be able to set prices within these admin-defined ranges during signup.

## Current State
- Service types are hardcoded in `CreatorSignup.tsx` (meet_greet, workshop, competition, etc.)
- The service pricing modal accepts any positive number with no constraints
- Some default ranges exist in `src/config/packages.ts` but are never enforced

## Solution Architecture

### 1. Database Table for Service Price Ranges
Create a new `service_price_ranges` table to store admin-configurable price limits:

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| service_type | text | e.g., "meet_greet", "workshop" |
| min_price_cents | integer | Minimum allowed price |
| max_price_cents | integer | Maximum allowed price |
| is_enabled | boolean | Whether this service type is available |
| updated_at | timestamp | Last update time |
| updated_by | uuid | Admin who made the change |

Seed with default values from the existing `packages.ts` configuration.

### 2. Admin Panel: Service Settings Section
Add a new card to the Admin Testing tab (or create a new "Services" tab) with:
- List of all service types with editable min/max price fields
- Toggle to enable/disable each service type
- Save button to persist changes

```text
+-----------------------------------------------+
|  Service Price Ranges                         |
|  Configure pricing limits for each service    |
|-----------------------------------------------|
|  Meet & Greet                        [Toggle] |
|  Min: $[300]  Max: $[800]                     |
|-----------------------------------------------|
|  Workshop                            [Toggle] |
|  Min: $[500]  Max: $[1,200]                   |
|-----------------------------------------------|
|  Competition Event                   [Toggle] |
|  Min: $[800]  Max: $[2,000]                   |
|-----------------------------------------------|
|  ...                                          |
|-----------------------------------------------|
|                                [Save Changes] |
+-----------------------------------------------+
```

### 3. Update Creator Signup Service Modal
Modify the service modal in `CreatorSignup.tsx` to:
- Fetch price ranges from database on component mount
- Display allowed range below the price input ("Price must be between $300 - $800")
- Validate on submit that price falls within range
- Show error if creator enters price outside range
- Only show enabled service types in the list

```text
+------------------------------------------------+
|  Add Meet & Greet                              |
|  Set your pricing for this experience          |
|------------------------------------------------|
|  Price (USD) *                                 |
|  +------------------------------------------+  |
|  | 500                                      |  |
|  +------------------------------------------+  |
|  Price must be between $300 - $800             |
|                                                |
|  Description (optional)                        |
|  +------------------------------------------+  |
|  | ...                                      |  |
|  +------------------------------------------+  |
+------------------------------------------------+
```

## Files to Create

| File | Purpose |
|------|---------|
| `src/components/admin/AdminServicesSettings.tsx` | New component for admin service configuration |

## Files to Modify

| File | Changes |
|------|---------|
| Database Migration | Create `service_price_ranges` table with default data |
| `src/components/admin/AdminTestingTab.tsx` | Add Services Settings card or link to new section |
| `src/pages/CreatorSignup.tsx` | Fetch price ranges, display limits, validate input, filter enabled services |

## Implementation Steps

1. **Database Migration**
   - Create `service_price_ranges` table
   - Add RLS policies for admin write / public read
   - Insert default rows for each service type

2. **Admin Component**
   - Create `AdminServicesSettings.tsx` with price range editors
   - Fetch current settings on mount
   - Save changes to database

3. **Integrate into Admin Panel**
   - Add the new component to `AdminTestingTab.tsx` or create a new tab

4. **Update Creator Signup**
   - Add state for price ranges
   - Fetch from database on mount
   - Filter `serviceTypes` array to only show enabled services
   - Update service modal to show price range hint
   - Add validation in `handleServiceSubmit()`

## Validation Logic

```typescript
// In handleServiceSubmit()
const priceRange = priceRanges.find(r => r.service_type === selectedServiceType);
if (priceRange) {
  const priceCents = Math.round(price * 100);
  if (priceCents < priceRange.min_price_cents || priceCents > priceRange.max_price_cents) {
    toast.error(`Price must be between $${priceRange.min_price_cents/100} and $${priceRange.max_price_cents/100}`);
    return;
  }
}
```

## Expected Behavior

**Admin Side:**
- Navigate to Admin > Testing (or new Services tab)
- See all service types with current min/max prices
- Edit any price range and save
- Toggle services on/off

**Creator Side:**
- During signup, only see enabled service types
- When adding a service, see the allowed price range
- Cannot submit a price outside the allowed range
- Clear error message if validation fails
