

# Restrict Opportunities Page to Creators Only

## The Problem

The `/opportunities` page is designed for **creators** to discover and apply to brand collaborations. However:

1. **Brands can access it** - A logged-in brand sees the page but can't apply (they don't have a creator profile)
2. **Navbar shows "Opportunities" to everyone** - Including brands who have no reason to see other brands' opportunities
3. **Confusing experience** - A brand seeing "No Opportunities Found" is misleading

Brands should manage their **own** opportunities through their dashboard's "Opportunities" tab, not browse other brands' posts.

---

## Solution Overview

### Access Control Changes

| User Type | Opportunities Page | Navbar Link |
|-----------|-------------------|-------------|
| Not logged in | Redirect to login | Hide link |
| Creator | Full access | Show link |
| Brand only | Redirect to brand dashboard | Hide link |
| Both (creator + brand) | Full access | Show link |

---

## Implementation Details

### 1. Update Navbar.tsx - Conditional Link Visibility

Remove "Opportunities" from the base navigation links and only show it to creators:

```tsx
const baseNavLinks: NavLink[] = [
  { to: "/influencers", label: "Find Creators" },
  // Remove: { to: "/opportunities", label: "Opportunities" },
  { to: "/brand", label: "For Brands" },
];

const getNavLinks = (): NavLink[] => {
  const links = [...baseNavLinks];
  
  // Only show Opportunities link to users with a creator profile
  if (hasCreatorProfile) {
    links.splice(1, 0, { to: "/opportunities", label: "Opportunities" });
  }
  
  if (user) {
    links.push({ to: "/whats-new", label: "What's New", icon: Sparkles });
  }
  
  return links;
};
```

This requires moving the `navLinks` computation to depend on `hasCreatorProfile` state.

### 2. Update Opportunities.tsx - Page-Level Access Control

Add access control logic to redirect non-creators:

```tsx
const [isCreator, setIsCreator] = useState<boolean | null>(null);
const [isBrand, setIsBrand] = useState<boolean | null>(null);
const [authLoading, setAuthLoading] = useState(true);

useEffect(() => {
  checkUserAccess();
}, []);

const checkUserAccess = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    // Not logged in - redirect to login
    navigate("/login");
    return;
  }

  // Check for creator profile
  const { data: creatorProfile } = await supabase
    .from("creator_profiles")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle();

  // Check for brand profile
  const { data: brandProfile } = await supabase
    .from("brand_profiles")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle();

  setIsCreator(!!creatorProfile);
  setIsBrand(!!brandProfile);

  if (creatorProfile) {
    setCreatorProfileId(creatorProfile.id);
    // Fetch applied opportunities...
  }

  setAuthLoading(false);
};

// If brand only (no creator profile), redirect to their dashboard
if (!authLoading && !isCreator && isBrand) {
  navigate("/brand-dashboard?tab=opportunities");
  return null;
}

// If not logged in or still loading, show loading state
if (authLoading) {
  return <LoadingSpinner />;
}

// If not a creator and not a brand, prompt to create profile
if (!isCreator && !isBrand) {
  return <PromptToCreateCreatorProfile />;
}
```

### 3. Mobile Navigation Updates

Also update the mobile Sheet navigation in Navbar.tsx to conditionally show the Opportunities link.

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/components/Navbar.tsx` | Conditionally show "Opportunities" link only for creators |
| `src/pages/Opportunities.tsx` | Add access control with redirects for non-creators |

---

## User Experience After Changes

### For Creators
- See "Opportunities" in navbar
- Can browse and apply to brand opportunities
- No changes to current functionality

### For Brands
- **Don't see** "Opportunities" in navbar (it's not relevant to them)
- If they manually navigate to `/opportunities`, redirect to their dashboard's Opportunities tab
- Manage their own posted opportunities through Brand Dashboard

### For Users Without Any Profile
- If logged in: Prompt to create a creator profile to see opportunities
- If not logged in: Redirect to login page

---

## Technical Notes

- The redirect uses `navigate()` from react-router-dom which is already imported
- Loading states prevent flash of wrong content
- Users with BOTH creator and brand profiles can still access the page (they're also creators)

