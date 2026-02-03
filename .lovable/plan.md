
# Role-Aware Footer and Page Content for Logged-in Users

## The Problem

Looking at the current footer (screenshot provided), logged-in brands see the same content as prospects:

**Current Footer Structure:**
| For Brands | For Creators | Company |
|------------|--------------|---------|
| Find Creators | Join as a Creator | About Us |
| How It Works | How It Works | Contact |
| Brand Dashboard | (varies) | Knowledge Base |
| | | What's New |
| | | Terms, Privacy, Refund |

**Issues for Logged-in Brands:**
1. "How It Works" links point to marketing pages (they already know how it works)
2. "Join as a Creator" / "Register Your Brand" are irrelevant for existing users
3. Footer sections titled "For Brands" and "For Creators" imply marketing, not workspace navigation
4. Legal pages (Terms, Privacy, Refund) still reference subscription pricing that no longer applies

**Additionally:** The About Us, Contact, and policy pages have marketing CTAs like "Join as Creator" and "Register Your Brand" which are irrelevant for logged-in users.

---

## Solution: Role-Aware Footer Pattern

Based on professional SaaS best practices, the footer should adapt based on user authentication and profile status.

### Footer Content by User State

**For Logged-out Users (Prospects):**
| For Brands | For Creators | Company |
|------------|--------------|---------|
| Find Creators | Join as a Creator | About Us |
| How It Works | How It Works | Contact |
| Register Your Brand | | What's New |
| | | Legal Links |

**For Logged-in Brands:**
| Quick Links | Resources | Company |
|-------------|-----------|---------|
| Find Creators | Knowledge Base | About Us |
| My Dashboard | What's New | Contact |
| My Messages | Help & Support | Legal Links |

**For Logged-in Creators:**
| Quick Links | Resources | Company |
|-------------|-----------|---------|
| Browse Opportunities | Knowledge Base | About Us |
| My Dashboard | What's New | Contact |
| My Bookings | Help & Support | Legal Links |

---

## Implementation Details

### 1. Update Footer.tsx - Role-Aware Sections

Add conditional rendering based on `hasBrandProfile`, `hasCreatorProfile`, and `isLoggedIn`:

```typescript
// For logged-in users: Show contextual workspace links
{isLoggedIn ? (
  <>
    {/* Quick Links - contextual to user role */}
    <div>
      <h3 className="font-heading font-semibold mb-4">Quick Links</h3>
      <ul className="space-y-2">
        <li><Link to="/influencers">Find Creators</Link></li>
        {hasBrandProfile && (
          <>
            <li><Link to="/brand-dashboard">My Dashboard</Link></li>
            <li><Link to="/brand-dashboard?tab=messages">My Messages</Link></li>
          </>
        )}
        {hasCreatorProfile && (
          <>
            <li><Link to="/opportunities">Browse Opportunities</Link></li>
            <li><Link to="/creator-dashboard">My Dashboard</Link></li>
          </>
        )}
      </ul>
    </div>

    {/* Resources - useful for logged-in users */}
    <div>
      <h3 className="font-heading font-semibold mb-4">Resources</h3>
      <ul className="space-y-2">
        <li><Link to="/knowledge-base">Knowledge Base</Link></li>
        <li><Link to="/whats-new">What's New</Link></li>
        <li><Link to="/contact">Help & Support</Link></li>
      </ul>
    </div>
  </>
) : (
  <>
    {/* For Brands - marketing to prospects */}
    <div>
      <h3>For Brands</h3>
      <ul>
        <li>Find Creators</li>
        <li>How It Works</li>
        <li>Register Your Brand</li>
      </ul>
    </div>

    {/* For Creators - marketing to prospects */}
    <div>
      <h3>For Creators</h3>
      <ul>
        <li>Join as a Creator</li>
        <li>How It Works</li>
      </ul>
    </div>
  </>
)}
```

### 2. Update AboutUs.tsx - Remove Marketing CTAs for Logged-in Users

The CTA section at the bottom shows "Join as Creator" and "Register Your Brand" - these should be hidden for users who already have profiles:

```typescript
// Only show registration CTAs for prospects (not logged in or no profile)
{!isLoggedIn && (
  <div className="flex gap-4 justify-center">
    <a href="/creator-signup">Join as Creator</a>
    <a href="/brand-signup">Register Your Brand</a>
  </div>
)}

// For logged-in users, show relevant dashboard links instead
{hasBrandProfile && (
  <div className="flex gap-4 justify-center">
    <a href="/influencers">Find Creators</a>
    <a href="/brand-dashboard">Go to Dashboard</a>
  </div>
)}
{hasCreatorProfile && !hasBrandProfile && (
  <div className="flex gap-4 justify-center">
    <a href="/opportunities">Browse Opportunities</a>
    <a href="/creator-dashboard">Go to Dashboard</a>
  </div>
)}
```

### 3. Update Contact.tsx - Contextual FAQ CTA

The "Planning an event?" CTA at the bottom references the Events page, but for logged-in brands, we should guide them differently:

```typescript
// For brands: Guide to finding creators
{hasBrandProfile && (
  <div className="bg-muted/50 rounded-xl p-6">
    <h3>Need help finding the right creator?</h3>
    <p>Browse our curated selection or check your dashboard.</p>
    <Button asChild><a href="/influencers">Find Creators</a></Button>
  </div>
)}

// For creators: Guide to opportunities
{hasCreatorProfile && !hasBrandProfile && (
  <div className="bg-muted/50 rounded-xl p-6">
    <h3>Looking for your next opportunity?</h3>
    <p>Browse open opportunities from brands.</p>
    <Button asChild><a href="/opportunities">Browse Opportunities</a></Button>
  </div>
)}

// For prospects: Original CTA
{!isLoggedIn && (
  <div className="bg-muted/50 rounded-xl p-6">
    <h3>Planning an event?</h3>
    <p>Browse our events page...</p>
    <Button asChild><a href="/events">Browse Events</a></Button>
  </div>
)}
```

### 4. Update Policy Pages (TermsOfService, PrivacyPolicy, RefundPolicy)

These pages currently reference outdated subscription pricing. Since we've moved to a transactional model:

**Changes needed:**
- Remove references to "Basic ($10/month)", "Pro ($49/month)", "Premium ($99/month)" subscription tiers
- Update language to reflect the 15% transaction fee model
- Update escrow system description (50% deposit, release on completion)
- Remove "14-day money-back guarantee" for subscriptions since there are no subscriptions

This is a content update, not a UI change.

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/components/Footer.tsx` | Role-aware section rendering, contextual links |
| `src/pages/AboutUs.tsx` | Add auth state, hide marketing CTAs for logged-in users |
| `src/pages/Contact.tsx` | Contextual FAQ CTA based on user role |
| `src/pages/TermsOfService.tsx` | Update to reflect transactional model (remove subscription refs) |
| `src/pages/PrivacyPolicy.tsx` | Minor updates if needed |
| `src/pages/RefundPolicy.tsx` | Update to reflect event booking cancellations, not subscriptions |

---

## Visual Summary

### Footer for Prospects (Current)
```
Logo | For Brands | For Creators | Company
     | Marketing  | Marketing    | Legal
```

### Footer for Logged-in Brand
```
Logo | Quick Links    | Resources      | Company
     | Dashboard      | Knowledge Base | About/Contact
     | Find Creators  | What's New     | Legal
     | My Messages    | Help & Support |
```

### Footer for Logged-in Creator
```
Logo | Quick Links     | Resources      | Company
     | Dashboard       | Knowledge Base | About/Contact
     | Opportunities   | What's New     | Legal
     | My Bookings     | Help & Support |
```

---

## Benefits

1. **Professional experience** - Matches expectations from other SaaS platforms
2. **Relevant navigation** - Users see links that matter to their role
3. **No marketing clutter** - Existing users don't see "Sign Up" prompts
4. **Consistent with recent changes** - Navbar and homepage already redirect logged-in users
5. **Updated legal content** - Policies reflect the current transactional business model
