
# Add Dynamic City/State Dropdown Based on Country Selection

## Overview
Replace the free-text City and State input fields in the creator onboarding (Step 2) with dynamic dropdown menus that automatically populate based on the selected country. For example, when Lebanon is selected, the City dropdown will show Lebanese cities like Beirut, Jounieh, Tripoli, Zouk Mikael, etc.

## Current State
- **City**: Free-text `<Input>` field
- **State**: Free-text `<Input>` field  
- **Country**: Already using `<CountrySelect>` dropdown component

The existing `LebaneseCitySelect` component already groups Lebanese cities by region (Mount Lebanon, North, South, Bekaa) and the `LEBANESE_CITIES` config exists in `lebanese-market.ts`.

## Proposed Solution

### 1. Create New Config File: `src/config/country-locations.ts`

This file will contain city/state data for supported countries. Initially focus on:
- **Lebanon** (primary market) - cities grouped by region
- **United States** - states with major cities
- **Other countries** - fallback to free-text input

Structure:
```typescript
interface LocationData {
  states?: { value: string; label: string }[];
  cities: { value: string; label: string; state?: string }[];
}

export const COUNTRY_LOCATIONS: Record<string, LocationData> = {
  LB: {
    // Lebanese cities already defined, grouped by region
    cities: [
      { value: 'beirut', label: 'Beirut', state: 'Mount Lebanon' },
      { value: 'jounieh', label: 'Jounieh', state: 'Mount Lebanon' },
      { value: 'zouk_mikael', label: 'Zouk Mikael', state: 'Mount Lebanon' },
      { value: 'tripoli', label: 'Tripoli', state: 'North' },
      // ... more cities
    ]
  },
  US: {
    states: [
      { value: 'CA', label: 'California' },
      { value: 'NY', label: 'New York' },
      // ...
    ],
    cities: [
      { value: 'los_angeles', label: 'Los Angeles', state: 'CA' },
      // ...
    ]
  },
  // Add more countries as needed
};
```

### 2. Create New Component: `src/components/LocationSelect.tsx`

A smart component that:
- Takes the selected country code as a prop
- Shows a dropdown if the country has predefined cities/states
- Falls back to a text input if country has no data
- Supports search/filter within the dropdown

```typescript
interface LocationSelectProps {
  countryCode: string;
  cityValue: string;
  stateValue: string;
  onCityChange: (city: string) => void;
  onStateChange: (state: string) => void;
}
```

### 3. Update `src/pages/CreatorSignup.tsx`

**Replace lines 1079-1104:**

Current:
```tsx
<div className="grid grid-cols-3 gap-3">
  <div>
    <Label htmlFor="city">City</Label>
    <Input value={locationCity} onChange={...} />
  </div>
  <div>
    <Label htmlFor="state">State</Label>
    <Input value={locationState} onChange={...} />
  </div>
  <div>
    <Label htmlFor="country">Country</Label>
    <CountrySelect value={locationCountry} onChange={...} />
  </div>
</div>
```

New:
```tsx
<div className="grid grid-cols-3 gap-3">
  <div>
    <Label htmlFor="country">Country</Label>
    <CountrySelect value={locationCountry} onChange={handleCountryChange} />
  </div>
  <div>
    <Label htmlFor="state">State/Region</Label>
    <LocationSelect type="state" countryCode={locationCountry} ... />
  </div>
  <div>
    <Label htmlFor="city">City</Label>
    <LocationSelect type="city" countryCode={locationCountry} stateFilter={locationState} ... />
  </div>
</div>
```

**Add logic:**
- When country changes, reset city and state
- When state changes, reset city (if cities are state-filtered)
- For unsupported countries, show text inputs as fallback

## Lebanese Cities to Include

Expanding the existing list with more cities:
- **Mount Lebanon**: Beirut, Jounieh, Byblos/Jbeil, Zouk Mikael, Kaslik, Aley, Broummana, Dbayeh, Antelias, Baabda
- **North**: Tripoli, Batroun, Zgharta, Bcharre, Koura
- **South**: Sidon/Saida, Tyre, Nabatieh, Jezzine
- **Bekaa**: Zahle, Baalbek, Chtaura

## Visual Flow

```text
1. User selects "Lebanon" from Country dropdown
          ↓
2. State dropdown populates with regions: Mount Lebanon, North, South, Bekaa
          ↓
3. User selects "Mount Lebanon"
          ↓
4. City dropdown filters to show only Mount Lebanon cities:
   - Beirut
   - Jounieh
   - Zouk Mikael
   - Byblos
   - etc.
```

## Files to Create/Modify

| File | Action | Description |
|------|--------|-------------|
| `src/config/country-locations.ts` | Create | Country-specific city/state data |
| `src/components/LocationSelect.tsx` | Create | Smart dropdown with fallback |
| `src/pages/CreatorSignup.tsx` | Modify | Update Step 2 location fields |

## Technical Details

### Country Change Handler
```typescript
const handleCountryChange = (code: string) => {
  setLocationCountry(code);
  setLocationState(""); // Reset state
  setLocationCity("");  // Reset city
};
```

### LocationSelect Component Logic
```typescript
const LocationSelect = ({ type, countryCode, stateFilter, value, onChange }) => {
  const locationData = COUNTRY_LOCATIONS[countryCode];
  
  // No data for this country - show text input
  if (!locationData) {
    return <Input value={value} onChange={(e) => onChange(e.target.value)} />;
  }
  
  // Get options based on type (state or city)
  const options = type === 'state' 
    ? locationData.states 
    : locationData.cities.filter(c => !stateFilter || c.state === stateFilter);
  
  // Show dropdown with search
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger><SelectValue placeholder={`Select ${type}`} /></SelectTrigger>
      <SelectContent>
        {options?.map(opt => (
          <SelectItem key={opt.value} value={opt.label}>{opt.label}</SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};
```

### Dropdown Styling
Following project conventions with proper z-index and non-transparent background:
```tsx
<SelectContent className="bg-background border shadow-lg z-50">
```

## Summary
This implementation provides a user-friendly location selection that:
1. Automatically shows Lebanese cities when Lebanon is selected
2. Supports other countries with similar data structures
3. Gracefully falls back to text inputs for countries without data
4. Resets dependent fields when parent selection changes
5. Groups cities by region/state for easy navigation
