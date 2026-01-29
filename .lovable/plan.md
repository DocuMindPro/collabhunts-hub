

# Implement Price Range Tiers Selection System

## Overview
Transform the pricing system from "exact price within bounds" to "select from predefined price tiers". Each service type will have multiple selectable price ranges that admins configure, and creators will pick their tier during signup.

## Current vs. New Behavior

| Aspect | Current | New |
|--------|---------|-----|
| Admin defines | One min/max per service | Multiple tier ranges per service |
| Creator input | Types exact price (e.g., $500) | Selects tier (e.g., "$500 - $800") |
| Stored value | Single `price_cents` | `min_price_cents` + `max_price_cents` |
| Brand sees | Exact price | Price range tier |

## Database Changes

### 1. Create New `service_price_tiers` Table
Store multiple tier options per service type:

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| service_type | text | e.g., "meet_greet" |
| tier_name | text | e.g., "Standard", "Premium" |
| min_price_cents | integer | Lower bound of tier |
| max_price_cents | integer | Upper bound of tier |
| sort_order | integer | Display order |
| is_enabled | boolean | Can creators select this tier? |

Example data:
```text
| service_type | tier_name | min_price_cents | max_price_cents |
|--------------|-----------|-----------------|-----------------|
| meet_greet   | Standard  | 30000           | 50000           |
| meet_greet   | Premium   | 50000           | 80000           |
| meet_greet   | VIP       | 80000           | 120000          |
| workshop     | Basic     | 50000           | 80000           |
| workshop     | Advanced  | 80000           | 120000          |
```

### 2. Modify `creator_services` Table
Add columns to store the selected range instead of exact price:

| Column | Type | Description |
|--------|------|-------------|
| min_price_cents | integer (new) | Lower bound of selected tier |
| max_price_cents | integer (new) | Upper bound of selected tier |
| price_tier_id | uuid (new) | Reference to selected tier |

Keep existing `price_cents` for backwards compatibility (can be set to midpoint or min).

## Admin Panel Changes

### Update `AdminServicesSettings.tsx`
Transform the UI to manage multiple tiers per service:

```text
+--------------------------------------------------+
|  Service Price Tiers                             |
|  Configure pricing tiers for each service        |
|--------------------------------------------------|
|  Meet & Greet                           [Toggle] |
|  +--------------------------------------------+  |
|  | Tier 1: $300 - $500         [Edit] [X]    |  |
|  | Tier 2: $500 - $800         [Edit] [X]    |  |
|  | Tier 3: $800 - $1,200       [Edit] [X]    |  |
|  +--------------------------------------------+  |
|  [+ Add Tier]                                    |
|--------------------------------------------------|
|  Workshop                               [Toggle] |
|  +--------------------------------------------+  |
|  | Basic: $500 - $800          [Edit] [X]    |  |
|  | Advanced: $800 - $1,200     [Edit] [X]    |  |
|  +--------------------------------------------+  |
|  [+ Add Tier]                                    |
|--------------------------------------------------|
|                                  [Save Changes]  |
+--------------------------------------------------+
```

Admin capabilities:
- Add new tiers for any service type
- Edit tier name, min/max prices
- Remove tiers
- Reorder tiers
- Toggle service type on/off

## Creator Signup Changes

### Update Service Modal in `CreatorSignup.tsx`
Replace the price input field with a tier selection dropdown/radio buttons:

```text
+------------------------------------------------+
|  Add Meet & Greet                              |
|  Select your pricing tier for this experience  |
|------------------------------------------------|
|  Price Range *                                 |
|  +------------------------------------------+  |
|  | ○ Standard ($300 - $500)                 |  |
|  | ● Premium ($500 - $800)    ← selected    |  |
|  | ○ VIP ($800 - $1,200)                    |  |
|  +------------------------------------------+  |
|                                                |
|  Description (optional)                        |
|  +------------------------------------------+  |
|  | ...                                      |  |
|  +------------------------------------------+  |
|                                                |
|  Delivery Days                                 |
|  +------------------------------------------+  |
|  | 7                                        |  |
|  +------------------------------------------+  |
|                                                |
|  [Cancel]                    [Add Service]     |
+------------------------------------------------+
```

Creator flow:
1. Click on a service type (e.g., Meet & Greet)
2. Modal opens showing available tiers as radio buttons
3. Select desired tier
4. Optionally add description and delivery days
5. Submit - stores min/max from selected tier

## Files to Create/Modify

### Database Migration
- Create `service_price_tiers` table
- Add `min_price_cents`, `max_price_cents`, `price_tier_id` columns to `creator_services`
- Migrate existing data: keep current `service_price_ranges` or convert to tiers
- Add RLS policies

### Files to Modify

| File | Changes |
|------|---------|
| `src/components/admin/AdminServicesSettings.tsx` | Complete redesign for multi-tier management |
| `src/pages/CreatorSignup.tsx` | Replace price input with tier selector radio buttons |
| `src/integrations/supabase/types.ts` | Will auto-update after migration |

### Display Updates (Future)
Files that show creator prices to brands will need updates to display ranges instead of exact prices:
- Creator profile pages
- Booking dialogs
- Search/browse listings

## Implementation Steps

1. **Database Migration**
   - Create `service_price_tiers` table with seed data
   - Add new columns to `creator_services`
   - Set up RLS policies

2. **Admin Panel Redesign**
   - Fetch tiers grouped by service type
   - Add/edit/delete tier UI
   - Save changes to database

3. **Creator Signup Modal**
   - Fetch tiers for selected service type
   - Display as radio button group
   - Store selected tier's min/max on submit

4. **Update Service Interface**
   - Change `Service` interface to include `minPriceCents` and `maxPriceCents`
   - Update form submission logic

## Technical Details

### Service Interface Change
```typescript
// Current
interface Service {
  serviceType: string;
  priceCents: number;        // Single exact price
  description: string;
  deliveryDays: number;
}

// New
interface Service {
  serviceType: string;
  minPriceCents: number;     // Selected tier min
  maxPriceCents: number;     // Selected tier max
  priceTierId?: string;      // Optional reference
  description: string;
  deliveryDays: number;
}
```

### Tier Selection State
```typescript
const [selectedTierId, setSelectedTierId] = useState<string>("");
const [serviceTiers, setServiceTiers] = useState<PriceTier[]>([]);
```

## Expected Behavior

**Admin Side:**
1. Navigate to Admin > Settings
2. See all service types with their tiers
3. Add new tier: Click "+ Add Tier", enter name and range
4. Edit tier: Modify name/prices inline
5. Delete tier: Click X to remove
6. Save all changes

**Creator Side:**
1. During signup, click "Meet & Greet"
2. Modal shows available tiers as radio options
3. Select "Premium ($500 - $800)"
4. Add description and delivery days
5. Submit - service saved with that range

**Brand Side (future):**
1. View creator profile
2. See "Meet & Greet: $500 - $800"
3. Can negotiate within or discuss pricing

