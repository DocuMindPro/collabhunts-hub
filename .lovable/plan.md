

## Add Location and Price Filters to Opportunities Page

### Overview

Add two new filter controls to the Opportunities page: a location/city filter and a price sort option, fitting alongside the existing search, package type, and paid/free filters.

### Changes

---

### 1. Location Filter (File: `src/pages/Opportunities.tsx`)

- Add a new state variable `selectedCity` (default: `"all"`)
- Extract unique city values from the fetched opportunities list to populate a dynamic dropdown
- Add a Select dropdown labeled "All Locations" with options derived from the opportunities data (e.g., "Achrafieh, Lebanon", "Jounieh, Lebanon")
- Add filtering logic: if a city is selected, only show opportunities matching that `location_city`
- Place the dropdown in the filters section alongside the package type select

### 2. Price Sort (File: `src/pages/Opportunities.tsx`)

- Add a new state variable `sortBy` (default: `"default"`)
- Add a Select dropdown with options:
  - "Default" (featured first, then by date -- current behavior)
  - "Price: High to Low" (sort by `budget_cents` descending, non-paid at bottom)
  - "Price: Low to High" (sort by `budget_cents` ascending, non-paid at bottom)
- Apply sorting after filtering, before rendering
- Place in the filters section next to the location dropdown

### 3. UI Layout Update

The filter card will be updated to accommodate the two new dropdowns. On mobile, they stack vertically. On desktop, they sit in a row with the existing controls:

```
[Search input                                    ]
[Package Type ▾] [Location ▾] [Sort By ▾]  ○ Paid  ○ Free
```

---

### Technical Details

**File: `src/pages/Opportunities.tsx`**

| Change | Detail |
|--------|--------|
| New state: `selectedCity` | String, default `"all"` |
| New state: `sortBy` | String, default `"default"` |
| Dynamic city list | Computed from `opportunities` array using `Set` on `location_city` |
| Filter logic | Add `matchesCity` check to `filteredOpportunities` |
| Sort logic | Replace the existing sort with a combined sort that respects `sortBy` while keeping featured-first when in default mode |
| Two new `<Select>` components | Location filter and price sort dropdowns |

No database changes or new files required. All changes are in a single file.
