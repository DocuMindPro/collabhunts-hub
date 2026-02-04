

# Auto-Populate Package Features in Opportunity Creation

## Overview

When a brand selects a package type (other than Custom Experience), the form should:
1. Auto-display the locked package deliverables from `EVENT_PACKAGES`
2. Only allow brands to add special requirements in a separate field
3. For "Custom Experience" only, enable full description customization

---

## Current vs New Behavior

| Scenario | Current | New |
|----------|---------|-----|
| Package selected (not custom) | Empty description textarea, brand writes anything | Auto-display package `includes` items as locked/read-only, rename field to "What's Included" |
| Custom Experience selected | Empty description textarea | Show editable description textarea with AI assist |
| No package selected | Empty description textarea | Show nothing or prompt to select package first |

---

## Visual Mockup

**When "Social Boost" is selected:**
```
┌─────────────────────────────────────────────────────────┐
│  Package Type                                           │
│  ┌─────────────────────────────────────────────────┐    │
│  │ Social Boost                               ▼    │    │
│  └─────────────────────────────────────────────────┘    │
│                                                         │
│  What's Included (Standard Package)                     │
│  ┌─────────────────────────────────────────────────┐    │
│  │ ✓ 1-2 hour venue visit                          │    │
│  │ ✓ 1 Instagram Reel (permanent)                  │    │
│  │ ✓ 1 TikTok video                                │    │
│  │ ✓ 3 Instagram Stories                           │    │
│  │ ✓ Tag & location in all posts                   │    │
│  │ ✓ Honest review with CTA                        │    │
│  └─────────────────────────────────────────────────┘    │
│  🔒 These deliverables are fixed for this package       │
│                                                         │
│  Special Requirements (Optional)                        │
│  ┌─────────────────────────────────────────────────┐    │
│  │ Must mention our new summer menu. Wear casual   │    │
│  │ clothing, no competitor logos...                │    │
│  └─────────────────────────────────────────────────┘    │
│  [✨ Improve with AI]                                   │
└─────────────────────────────────────────────────────────┘
```

**When "Custom Experience" is selected:**
```
┌─────────────────────────────────────────────────────────┐
│  Package Type                                           │
│  ┌─────────────────────────────────────────────────┐    │
│  │ Custom Experience                          ▼    │    │
│  └─────────────────────────────────────────────────┘    │
│                                                         │
│  Description *                                          │
│  ┌─────────────────────────────────────────────────┐    │
│  │ Describe your custom collaboration needs,       │    │
│  │ deliverables expected, timeline...              │    │
│  └─────────────────────────────────────────────────┘    │
│  [✨ Improve with AI]                                   │
│                                                         │
│  Special Requirements (Optional)                        │
│  ┌─────────────────────────────────────────────────┐    │
│  │ Any specific requirements for creators...       │    │
│  └─────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────┘
```

---

## Implementation Details

### File: `CreateOpportunityDialog.tsx`

**1. Derive package features dynamically**

```typescript
const selectedPackage = formData.package_type 
  ? EVENT_PACKAGES[formData.package_type as keyof typeof EVENT_PACKAGES] 
  : null;
const isCustomPackage = formData.package_type === 'custom';
```

**2. Replace Description section with conditional rendering**

When a standard package is selected:
- Display a styled, read-only list of deliverables from `selectedPackage.includes`
- Add a lock icon and helper text explaining these are fixed
- Remove the AI suggestions for description (not needed - content is locked)

When Custom Experience is selected:
- Show the existing editable description textarea with AI assist
- Make it required for custom packages

**3. Update "Requirements" to "Special Requirements"**

- Keep the requirements textarea for all package types
- Update label to "Special Requirements (Optional)"
- Update placeholder to clarify this is for additional notes beyond the standard package

**4. Move Package Type selector before the description section**

The package selection should come first so the form can react to it.

---

## Form Flow After Changes

```
1. Title *
2. Package Type (dropdown) ← Moved up
3. IF standard package → "What's Included" (read-only list)
   IF custom → "Description *" (editable textarea)
4. Event Date, Time
5. Paid/Free toggle, Budget
6. Spots Available
7. Location (Country/Region/City)
8. Special Requirements (editable textarea - all packages)
9. Minimum Followers
```

---

## Code Changes Summary

| Section | Change |
|---------|--------|
| Form state | No changes needed - `description` still used, auto-populated for standard packages |
| Package Type | Move selector above description section |
| Description | Replace with conditional: locked list OR editable textarea |
| Requirements | Update label to "Special Requirements (Optional)" |
| Submit logic | For standard packages, auto-generate description from `includes` array |

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/components/brand-dashboard/CreateOpportunityDialog.tsx` | Conditional description rendering, locked deliverables display, reorder form fields |

---

## Database Storage

For standard packages:
- `description` column will store the auto-generated deliverables list (for display in opportunity listings)
- `requirements` column stores brand's special requirements

For custom packages:
- `description` stores the brand's custom description
- `requirements` stores additional requirements as before

---

## Benefits

- **Clarity for brands**: They know exactly what they're getting with each package
- **Consistency for creators**: Standard packages have predictable deliverables
- **Flexibility where needed**: Custom Experience allows full customization
- **Reduced errors**: Brands can't accidentally remove standard deliverables

