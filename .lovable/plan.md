

# Fix Creator Dashboard Services to Use Price Tier System

## Problem Identified
The Creator Dashboard's "Event Packages" (Services) tab was not updated when we implemented the price tier system. It still uses the old single-price model while the signup flow uses the new tier-based pricing.

**Current State:**
- `ServicesTab.tsx` displays only `price_cents` ($50.00)
- `ServiceEditDialog.tsx` asks for an exact price input
- Existing services have `min_price_cents`, `max_price_cents`, `price_tier_id` all set to `null`

**Expected State:**
- Display price ranges ($300 - $500)
- Use tier selection radio buttons (like signup flow)
- Store tier data in the new columns

## Files to Update

### 1. `src/components/creator-dashboard/ServicesTab.tsx`
**Changes:**
- Update `Service` interface to include `min_price_cents`, `max_price_cents`, `price_tier_id`
- Modify price display to show range format: "$300 - $500" instead of "$50.00"
- Handle backwards compatibility for old services that only have `price_cents`

### 2. `src/components/creator-dashboard/ServiceEditDialog.tsx`
**Complete redesign to:**
- Fetch available tiers from `service_price_tiers` table
- Replace price text input with tier selection radio buttons
- Show service type as a dropdown of available types (not free text)
- Save `min_price_cents`, `max_price_cents`, and `price_tier_id` to database

## Implementation Details

### Updated Service Interface
```typescript
interface Service {
  id: string;
  service_type: string;
  price_cents: number;           // Keep for backwards compatibility
  min_price_cents: number | null;  // New tier min
  max_price_cents: number | null;  // New tier max
  price_tier_id: string | null;    // Reference to tier
  description: string | null;
  delivery_days: number;
  is_active: boolean;
  creator_profile_id: string;
}
```

### Price Display Logic
```typescript
// In ServicesTab.tsx card display
const formatPrice = (service: Service) => {
  if (service.min_price_cents && service.max_price_cents) {
    return `$${(service.min_price_cents / 100).toLocaleString()} - $${(service.max_price_cents / 100).toLocaleString()}`;
  }
  // Fallback for legacy services
  return `$${(service.price_cents / 100).toFixed(2)}`;
};
```

### ServiceEditDialog Changes
```text
+------------------------------------------------+
|  Edit Service                                  |
|  Update your service details                   |
|------------------------------------------------|
|  Service Type *                                |
|  +------------------------------------------+  |
|  | Meet & Greet                         ▼   |  |
|  +------------------------------------------+  |
|                                                |
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
|  [Toggle] Active                               |
|                                                |
|  [Cancel]                    [Update]          |
+------------------------------------------------+
```

### New State in ServiceEditDialog
```typescript
// States for tier selection
const [availableServiceTypes, setAvailableServiceTypes] = useState<string[]>([]);
const [selectedServiceType, setSelectedServiceType] = useState<string>("");
const [priceTiers, setPriceTiers] = useState<PriceTier[]>([]);
const [selectedTierId, setSelectedTierId] = useState<string>("");
const [loadingTiers, setLoadingTiers] = useState(false);

// Fetch unique service types from tiers
useEffect(() => {
  fetchServiceTypes();
}, []);

// Fetch tiers when service type changes
useEffect(() => {
  if (selectedServiceType) {
    fetchTiersForType(selectedServiceType);
  }
}, [selectedServiceType]);
```

### Database Save Logic
```typescript
const handleSubmit = async () => {
  const selectedTier = priceTiers.find(t => t.id === selectedTierId);
  
  const serviceData = {
    creator_profile_id: creatorProfileId,
    service_type: selectedServiceType,
    price_cents: selectedTier?.min_price_cents || 0, // For backwards compat
    min_price_cents: selectedTier?.min_price_cents,
    max_price_cents: selectedTier?.max_price_cents,
    price_tier_id: selectedTierId,
    description: formData.description || null,
    delivery_days: parseInt(formData.delivery_days),
    is_active: formData.is_active,
  };
  
  // Insert or update...
};
```

## Backwards Compatibility

For existing services without tier data:
1. **Display**: Show legacy `price_cents` if `min_price_cents` is null
2. **Edit**: When editing, require selecting a new tier
3. **No data loss**: Keep `price_cents` populated as a fallback

## Expected Behavior After Fix

**Existing creators:**
1. Go to Dashboard → Event Packages
2. See their existing service with legacy price display
3. Click Edit → Now shown tier selection options
4. Select appropriate tier → Service updated with new tier system

**New creators:**
1. Create service using tier radio buttons (same as signup)
2. See price range displayed in their dashboard

## Files Changed Summary

| File | Type of Change |
|------|----------------|
| `ServicesTab.tsx` | Update interface, modify price display |
| `ServiceEditDialog.tsx` | Complete redesign with tier selection |

