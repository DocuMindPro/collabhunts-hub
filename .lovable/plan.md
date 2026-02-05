
# Brand Registration Gate for Creator Browsing

## Overview

Implement a registration gate that requires prospects to register as a brand before they can browse all creators. The featured creators on the homepage remain visible as a teaser, but clicking "Browse All Creators" or "Find Creators" will prompt registration instead of navigating directly.

---

## User Flow

```text
PROSPECT (Not Logged In):
┌─────────────────────────────────────────────────────────┐
│  Homepage                                                │
│  ┌─────────────────────────────────────────────────────┐ │
│  │  Featured Creators (4x4 grid - 16 creators)         │ │
│  │  [Click on any creator] → Individual profile ✓      │ │
│  └─────────────────────────────────────────────────────┘ │
│                                                          │
│  [Browse All Creators] → Registration Dialog             │
│  [Find Creators nav]   → Registration Dialog             │
│  [Search button]       → Registration Dialog             │
└─────────────────────────────────────────────────────────┘

REGISTERED BRAND (Logged In with Brand Profile):
┌─────────────────────────────────────────────────────────┐
│  [Browse All Creators] → /influencers ✓                 │
│  [Find Creators nav]   → /influencers ✓                 │
│  [Search button]       → /influencers ✓                 │
└─────────────────────────────────────────────────────────┘
```

---

## Implementation Details

### 1. New Component: `BrandRegistrationPrompt.tsx`

**Location**: `src/components/BrandRegistrationPrompt.tsx`

A reusable AlertDialog component that prompts users to register their brand before accessing creator browsing.

```text
┌────────────────────────────────────────┐
│  🏢 Register Your Brand                │
│                                        │
│  To browse all creators, you need      │
│  to register your brand first.         │
│                                        │
│  Registration is free and takes        │
│  less than 2 minutes.                  │
│                                        │
│  [Cancel]  [Register Now →]            │
└────────────────────────────────────────┘
```

**Props**:
- `open: boolean` - Dialog visibility
- `onOpenChange: (open: boolean) => void` - Close handler

---

### 2. Update `src/components/home/CreatorSpotlight.tsx`

**Changes**:
1. Add auth check for brand profile
2. Replace `<Link>` with a button that either navigates or shows dialog
3. Add `BrandRegistrationPrompt` dialog

**Logic**:
```typescript
const handleBrowseAll = () => {
  if (!user) {
    // Not logged in - show registration prompt
    setShowRegistrationPrompt(true);
  } else if (hasBrandProfile) {
    // Has brand profile - navigate directly
    navigate('/influencers');
  } else {
    // Logged in but no brand profile - show registration prompt
    setShowRegistrationPrompt(true);
  }
};
```

---

### 3. Update `src/pages/Index.tsx`

**Changes**:
1. Add registration gate to the search button in hero section
2. Add registration gate to event type badges (category links)
3. Pass auth state to CreatorSpotlight component OR handle at component level

**Gated Elements**:
- Search button click → registration prompt (if no brand)
- Category badge clicks → registration prompt (if no brand)

---

### 4. Update `src/components/Navbar.tsx`

**Changes**:
1. Add registration gate to "Find Creators" link for non-brand users
2. For prospects: clicking "Find Creators" shows registration prompt
3. For logged-in brands: normal navigation to /influencers

**Logic**:
```typescript
// Instead of direct Link for "Find Creators":
const handleFindCreatorsClick = (e: React.MouseEvent) => {
  if (!user || !hasBrandProfile) {
    e.preventDefault();
    setShowRegistrationPrompt(true);
  }
  // else: allow normal navigation
};
```

---

### 5. Update `src/pages/Influencers.tsx`

**Changes**:
Add a check at the top level that redirects non-brand users away:

```typescript
useEffect(() => {
  if (authCheckComplete && !hasBrandProfile && !isLoggedIn) {
    // Redirect prospects back to homepage
    navigate('/', { replace: true });
  }
}, [authCheckComplete, hasBrandProfile, isLoggedIn]);
```

This ensures even direct URL access requires brand registration.

---

## Files to Create/Modify

| File | Action | Description |
|------|--------|-------------|
| `src/components/BrandRegistrationPrompt.tsx` | CREATE | Reusable registration prompt dialog |
| `src/components/home/CreatorSpotlight.tsx` | MODIFY | Add gate to "Browse All Creators" button |
| `src/pages/Index.tsx` | MODIFY | Add gate to search bar and category links |
| `src/components/Navbar.tsx` | MODIFY | Add gate to "Find Creators" nav link |
| `src/pages/Influencers.tsx` | MODIFY | Add redirect for non-brand users |

---

## Visual Design

### Registration Prompt Dialog

```text
┌─────────────────────────────────────────────────────┐
│                                                     │
│            🏢  Register Your Brand                  │
│                                                     │
│     To browse and connect with creators,            │
│     you need to register your brand first.          │
│                                                     │
│     ✓ Free registration                             │
│     ✓ Takes less than 2 minutes                     │
│     ✓ Direct access to all creators                 │
│                                                     │
│   ┌─────────────┐    ┌─────────────────────┐       │
│   │   Cancel    │    │   Register Now →    │       │
│   └─────────────┘    └─────────────────────┘       │
│                                                     │
└─────────────────────────────────────────────────────┘
```

---

## What Remains Accessible Without Registration

| Element | Accessible? | Notes |
|---------|-------------|-------|
| Featured creators grid (16 on homepage) | ✓ | Teaser to encourage registration |
| Individual creator profiles (/creator/:id) | ✓ | Can view but gate booking |
| Homepage content | ✓ | All marketing content visible |
| "Register Your Brand" CTA | ✓ | Always visible to prospects |
| "Join as Creator" CTA | ✓ | Creator signup unaffected |

## What Requires Brand Registration

| Element | Requires Registration |
|---------|----------------------|
| "Browse All Creators" button | ✓ |
| "Find Creators" nav link | ✓ |
| Search button in hero | ✓ |
| Category badge clicks | ✓ |
| Direct /influencers URL access | ✓ |

---

## Technical Notes

1. **Shared State**: The `BrandRegistrationPrompt` component will be self-contained with its own navigation logic

2. **Auth Check**: Each component already has access to user and brand profile state from existing patterns

3. **UX Consideration**: Individual creator profiles remain accessible to allow prospects to see creator quality before registering

4. **No Breaking Changes**: Logged-in brand users experience no change in behavior
