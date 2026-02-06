

# Add Registration Fields to Brand Signup

## Overview

Add mandatory fields for first name, last name, position/title, and location address to the brand registration form.

## Database Migration

Add 3 new columns to `brand_profiles`:

```sql
ALTER TABLE public.brand_profiles
  ADD COLUMN first_name text,
  ADD COLUMN last_name text,
  ADD COLUMN contact_position text;
```

These are nullable at the DB level (existing rows won't have them), but the signup form will enforce them as required.

## Form Changes in `src/pages/BrandSignup.tsx`

### New State Variables
Replace the single `fullName` field with:
- `firstName` (mandatory)
- `lastName` (mandatory)
- `contactPosition` (mandatory) -- e.g. "Marketing Manager", "Owner", "CEO"
- `venueAddress` (mandatory) -- uses existing `venue_address` column

### New Validation Schemas
```typescript
const firstNameSchema = z.string().trim().min(2, "First name required").max(50);
const lastNameSchema = z.string().trim().min(2, "Last name required").max(50);
const positionSchema = z.string().trim().min(2, "Position required").max(100);
const addressSchema = z.string().trim().min(5, "Address required").max(300);
```

### Form UI Updates

Replace the current "Your Full Name" input with two side-by-side fields:

| Field | Label | Placeholder | Required |
|-------|-------|-------------|----------|
| First Name | "First Name" | "John" | Yes |
| Last Name | "Last Name" | "Doe" | Yes |

Add a new "Position / Title" field after the name fields:

| Field | Label | Placeholder | Required |
|-------|-------|-------------|----------|
| Position | "Your Position / Title" | "e.g., Marketing Manager, Owner" | Yes |

Add a "Location Address" field in the Brand Information section (after Country):

| Field | Label | Placeholder | Required |
|-------|-------|-------------|----------|
| Address | "Business Address" | "e.g., Hamra Street, Beirut" | Yes |

### Submit Handler Updates

- Validate new fields with zod schemas
- Pass `full_name` to auth signup as `${firstName} ${lastName}`
- Save to `brand_profiles`:
  - `first_name: firstName`
  - `last_name: lastName`
  - `contact_position: contactPosition`
  - `venue_address: venueAddress`

## Files to Change

| File | Action |
|------|--------|
| Database migration | Add `first_name`, `last_name`, `contact_position` columns |
| `src/pages/BrandSignup.tsx` | Replace fullName with firstName/lastName, add position and address fields |

