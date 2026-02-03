

# Redirect Logged-in Users from Homepage to Dashboard

## The Industry Standard

Professional SaaS platforms (Slack, Notion, Figma, Linear) follow a simple rule:

**Marketing pages are for prospects. Logged-in users go to their workspace.**

When a logged-in user visits the homepage (`/`), they should be automatically redirected to their dashboard.

---

## Current State vs. Desired State

| User Type | Current Homepage Behavior | Proposed Behavior |
|-----------|---------------------------|-------------------|
| Not logged in | Full marketing page | No change |
| Logged in (no profile) | Marketing page with CTAs | Marketing page (encourage signup) |
| Brand (logged in) | Marketing page with "Go to Dashboard" button | **Auto-redirect to brand dashboard** |
| Creator (logged in) | Marketing page with "Go to Dashboard" button | **Auto-redirect to creator dashboard** |
| Both profiles | Marketing page | **Auto-redirect to preferred dashboard** |

---

## Implementation Plan

### Update Index.tsx - Add Automatic Redirect

Add redirect logic after profile check:

```typescript
const navigate = useNavigate();

useEffect(() => {
  const checkUserProfiles = async (userId: string) => {
    const brandProfile = await safeNativeAsync(/* ... */);
    const creatorProfile = await safeNativeAsync(/* ... */);
    
    setHasBrandProfile(!!brandProfile);
    setHasCreatorProfile(!!creatorProfile);
    
    // NEW: Auto-redirect logged-in users to their dashboard
    if (brandProfile) {
      navigate("/brand-dashboard");
      return;
    }
    if (creatorProfile) {
      navigate("/creator-dashboard");
      return;
    }
    
    setAuthLoading(false);
  };
  // ...
}, [navigate]);
```

### Add Loading State

Prevent flash of marketing content while checking auth:

```typescript
const [authLoading, setAuthLoading] = useState(true);

// Show spinner while checking
if (authLoading) {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
    </div>
  );
}

// Show marketing page only for non-logged-in or no-profile users
return (
  <div className="min-h-screen flex flex-col">
    <Navbar />
    {/* ... rest of marketing content */}
  </div>
);
```

---

## Redirect Priority Logic

When a user has both profiles (rare but possible), they need a priority:

1. **Brand takes priority** - Brands are the paying customers driving bookings
2. **Creator second** - If they're a creator but not a brand, go to creator dashboard

This can be customized based on your business priorities.

---

## Edge Cases

### User Logged In But No Profile
- Show the marketing homepage so they can choose to sign up as brand or creator
- This is their first visit after account creation, they need to complete signup

### Native App (Capacitor)
- The native app already uses `NativeAppGate` which handles this differently
- These changes only affect the web platform

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/pages/Index.tsx` | Add useNavigate, authLoading state, and redirect logic |

---

## Benefits

1. **Professional experience** - Matches expectations from other SaaS tools
2. **Faster access** - Users get to their workspace immediately 
3. **Less confusion** - No more "How It Works" or "Sign Up" prompts for existing users
4. **Consistent with other pages** - Brand.tsx and Creator.tsx already redirect, homepage should too

---

## User Experience After Changes

### For Prospects (not logged in)
- See full marketing homepage with all sections
- CTAs to sign up as Brand or Creator
- No change in experience

### For Logged-in Users with Profile
- Instant redirect to their dashboard
- Brief loading spinner during auth check
- Never see irrelevant marketing content

### For Logged-in Users without Profile
- Still see marketing homepage
- Can choose to create Brand or Creator profile
- Clear path to complete registration

