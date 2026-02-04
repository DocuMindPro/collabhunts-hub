

# Add Cascading Location Selection to Opportunity Creation

## Overview

Implement a cascading country/city dropdown in the "Post an Opportunity" dialog that reuses the existing location data system, and make country a required field during brand signup.

---

## Changes Summary

| Component | Change |
|-----------|--------|
| `CreateOpportunityDialog.tsx` | Replace text inputs with CountrySelect and LocationSelect components, default to Lebanon |
| `BrandSignup.tsx` | Default country to Lebanon ("LB") and make it required for form submission |

---

## 1. Update Create Opportunity Dialog

### Current State (Lines 271-293)
The location section uses plain text inputs for City and Country:
```typescript
<div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
  <Input placeholder="e.g., Beirut" ... />  // City
  <Input placeholder="e.g., Lebanon" ... /> // Country
</div>
```

### New Behavior
1. **Country Dropdown** - Use existing `CountrySelect` component, defaulting to "LB" (Lebanon)
2. **City Dropdown** - Use existing `LocationSelect` component, filtered by selected country
3. **State Selection** - For countries with state/region data (like Lebanon), add a region selector that filters cities
4. **Fallback** - If country has no predefined location data, city remains a text input

### Form Data Changes
```typescript
const [formData, setFormData] = useState({
  // ... existing fields
  location_city: "",
  location_country: "LB",        // Default to Lebanon
  location_state: "",            // NEW: For region selection
});
```

### Visual Layout (3 columns on desktop)
```
┌─────────────────────────────────────────────────────────┐
│  Country *              Region              City        │
│  ┌──────────────┐      ┌──────────────┐   ┌───────────┐ │
│  │ 🇱🇧 Lebanon ▼│      │ Mount Leb ▼ │   │ Jounieh ▼ │ │
│  └──────────────┘      └──────────────┘   └───────────┘ │
└─────────────────────────────────────────────────────────┘
```

### Implementation Details

**Imports to add:**
```typescript
import CountrySelect from "@/components/CountrySelect";
import LocationSelect from "@/components/LocationSelect";
import { hasLocationData } from "@/config/country-locations";
```

**Updated form state:**
- Add `location_state` field
- Default `location_country` to "LB"

**Reset logic:**
- When country changes, reset state and city
- When state changes, reset city

**Location section replacement:**
- 3-column grid: Country | State/Region | City
- State selector only shows for countries with location data
- City selector cascades from country and state

---

## 2. Update Brand Signup

### Current State (Line 48)
```typescript
const [locationCountry, setLocationCountry] = useState("");
```

Country is optional - no validation in handleSubmit.

### Changes

1. **Default to Lebanon:**
```typescript
const [locationCountry, setLocationCountry] = useState("LB");
```

2. **Add Required Validation in handleSubmit:**
```typescript
if (!locationCountry) {
  toast({
    title: "Country Required",
    description: "Please select your country",
    variant: "destructive"
  });
  return;
}
```

3. **Update Label to show required indicator:**
```typescript
<Label htmlFor="country">Country *</Label>
```

4. **Update button disabled logic** (optional, for UX):
The form already blocks submission if required fields are missing via the early return.

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/components/brand-dashboard/CreateOpportunityDialog.tsx` | Add CountrySelect + LocationSelect with cascading logic, default to Lebanon |
| `src/pages/BrandSignup.tsx` | Default country to "LB", add required validation |

---

## Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                Create Opportunity Dialog                    │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Country: "LB" (default)                                    │
│      │                                                      │
│      ├── Has location data? (check COUNTRY_LOCATIONS)       │
│      │       │                                              │
│      │       ├── YES → Show Region dropdown                 │
│      │       │              │                               │
│      │       │              └── Filter cities by region     │
│      │       │                       │                      │
│      │       │                       └── City dropdown      │
│      │       │                                              │
│      │       └── NO → Show City text input (fallback)       │
│      │                                                      │
│      └── On change → Reset region & city                    │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Benefits

- **Consistent UX**: Reuses the same location selection system from creator onboarding
- **Better Data Quality**: Standardized city names instead of free-text variations
- **Lebanon-first**: Defaults to Lebanon as the primary market
- **Flexible**: Falls back to text input for unsupported countries

