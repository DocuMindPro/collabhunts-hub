
# Hide "For Brands" Marketing Page from Logged-in Brands

## The Problem

When a brand is logged in, they see:

1. **"For Brands" link in navbar** - This is a marketing/onboarding page meant for prospects, not existing customers
2. **The /brand page shows irrelevant content** like:
   - "Register Your Brand" CTAs
   - "How It Works" explanations
   - FAQ about signing up
   - Marketing copy explaining what the platform does

This is confusing and unprofessional. A logged-in brand already knows what the platform does — they're a customer!

---

## Solution Overview

### What Should Change

| User Type | "For Brands" Nav Link | /brand Page Access |
|-----------|----------------------|---------------------|
| Not logged in | Show | Full marketing page |
| Creator only | Show | Full marketing page |
| Brand (logged in) | Hide | Redirect to dashboard |
| Both (creator + brand) | Hide | Redirect to brand dashboard |

This mirrors what we just did for the `/opportunities` page — show marketing to prospects, redirect existing users to their workspace.

---

## Implementation Details

### 1. Update Navbar.tsx - Hide "For Brands" from Logged-in Brands

Modify `getNavLinks()` to conditionally include the "For Brands" link only when the user doesn't have a brand profile:

```tsx
const getNavLinks = (): NavLink[] => {
  const links: NavLink[] = [
    { to: "/influencers", label: "Find Creators" },
  ];
  
  // Only show "For Brands" to non-brand users (prospects)
  if (!hasBrandProfile) {
    links.push({ to: "/brand", label: "For Brands" });
  }
  
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

Also update the mobile navigation to hide the "Register Your Brand" button for logged-in brands.

### 2. Update Brand.tsx - Add Redirect Logic

When a logged-in brand visits `/brand`, redirect them to their dashboard:

```tsx
import { useNavigate } from "react-router-dom";

const Brand = () => {
  const navigate = useNavigate();
  const [authLoading, setAuthLoading] = useState(true);
  // ... existing state

  useEffect(() => {
    const checkUserProfiles = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        setUser(session.user);
        
        const { data: brandProfile } = await supabase
          .from('brand_profiles')
          .select('id')
          .eq('user_id', session.user.id)
          .maybeSingle();
        
        // If user has a brand profile, redirect to dashboard
        if (brandProfile) {
          navigate("/brand-dashboard");
          return;
        }
        
        // Otherwise check creator profile for CTA display
        const { data: creatorProfile } = await supabase
          .from('creator_profiles')
          .select('id')
          .eq('user_id', session.user.id)
          .maybeSingle();
        
        setHasCreatorProfile(!!creatorProfile);
      }
      
      setAuthLoading(false);
    };
    // ...
  }, [navigate]);

  // Show loading while checking auth
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Rest of the marketing page...
};
```

### 3. Also Update Creator.tsx for Consistency

Apply the same pattern to the Creator page — if a logged-in creator visits `/creator`, redirect them to their dashboard:

```tsx
if (creatorProfile) {
  navigate("/creator-dashboard");
  return;
}
```

---

## Summary of Navigation Changes

### Desktop Nav (for logged-in Brand)
- **Before**: Find Creators | For Brands | What's New | Brand Dashboard
- **After**: Find Creators | What's New | Brand Dashboard

### Desktop Nav (for logged-in Creator)
- **Before**: Find Creators | Opportunities | For Brands | What's New | Creator Dashboard
- **After**: Find Creators | Opportunities | What's New | Creator Dashboard

### Mobile Nav (logged-in users)
- Remove "Register Your Brand" and "Join as a Creator" buttons since they already have accounts
- These should only show to logged-out users

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/components/Navbar.tsx` | Hide "For Brands" link from logged-in brands; clean up mobile nav for logged-in users |
| `src/pages/Brand.tsx` | Add redirect to dashboard for logged-in brands with loading state |
| `src/pages/Creator.tsx` | Add redirect to dashboard for logged-in creators with loading state |

---

## User Experience After Changes

### For Prospects (not logged in)
- See all marketing pages normally
- "For Brands" and "Join as a Creator" prominently displayed
- Can browse and learn about the platform

### For Logged-in Brands
- Don't see "For Brands" in nav (they're already a brand!)
- If they somehow navigate to `/brand`, get redirected to their dashboard
- Clean, focused navigation on what matters: Find Creators, Their Dashboard

### For Logged-in Creators
- Don't see marketing page prompts
- If they navigate to `/creator`, get redirected to their dashboard
- Focused navigation: Find Creators, Opportunities, Their Dashboard
