

## Fix "Venue" → "Brand" Naming and Broken Navigation

### Problem
1. The mobile sidebar menu shows "Venue Profile" instead of "Brand Profile"
2. Clicking "Venue Profile" navigates to `?tab=venue`, but the BrandDashboard has no `TabsContent` for `"venue"` -- so it shows a blank page

### Changes

**1. `src/components/Navbar.tsx` (line 54)**
- Rename `"Venue Profile"` to `"Brand Profile"` 
- Change the tab value from `"venue"` to `"account"` so it correctly links to the existing Account tab in BrandDashboard (which contains the brand profile/logo/company info)

Before:
```
{ value: "venue", label: "Venue Profile", icon: MapPin }
```
After:
```
{ value: "account", label: "Brand Profile", icon: User }
```

This single change fixes both issues: the naming and the dead link. The "account" tab already contains the brand identity hero with logo, company name, and all profile details -- making it the correct destination for "Brand Profile".

