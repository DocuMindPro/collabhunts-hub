

## Fix Two-Tier Brand Registration Gate

### Current Problems

1. **No two-tier split**: BrandSignup is one giant form requiring everything upfront (name, email, password, phone, logo, company name, industry, social media, address). The intended flow was Tier 1 (quick signup) then Tier 2 (full registration).
2. **`registration_completed` is never set to `true`**: The field exists in the database (defaults to `false`) but no code ever updates it.
3. **No feature gating**: Once a brand profile exists, users get full access to everything -- browsing creators, messaging, inquiring -- regardless of whether `registration_completed` is `true` or `false`.

### Intended Flow (Per Original Request)

```text
Guest --> Tier 1 Signup (Name, Email, Password, Phone) --> Account Created (registration_completed = false)
                                                                    |
                                                         Can log in, sees dashboard
                                                         but RESTRICTED from:
                                                         - Browsing creators (/influencers)
                                                         - Messaging creators
                                                         - Sending inquiries
                                                         - Booking
                                                                    |
                                                         Prompted to "Complete Registration"
                                                                    |
Tier 2 Registration (Logo, Company Name, Industry, Size, Location, Social Media, Address)
                                                                    |
                                                         registration_completed = true
                                                         Full access unlocked
```

### Implementation Plan

**1. Split `BrandSignup.tsx` into Tier 1 (Quick Signup)**
- Keep only: First Name, Last Name, Email, Password, Phone Verification, Terms checkbox
- Remove from this page: Logo, Company Name, Website, Industry, Company Size, Country, Address, Social Media
- On submit: Create auth user + insert `brand_profiles` row with just basic info (`first_name`, `last_name`, `phone_number`, `phone_verified`, `terms_accepted_at`) and `registration_completed = false` (the default)
- Navigate to `/brand-dashboard` after signup

**2. Create a new "Complete Registration" page/flow**
- New component or repurpose the existing `BrandOnboarding` flow
- Contains Tier 2 fields: Brand Logo, Company Name, Website, Industry, Company Size, Country, Address, Social Media
- On submit: Updates the `brand_profiles` row with all business details AND sets `registration_completed = true`
- Accessible from the dashboard via a prominent banner

**3. Add Registration Gate to `BrandProtectedRoute.tsx`**
- After confirming a brand profile exists, also fetch `registration_completed`
- Pass `registrationCompleted` status down (or store in context)
- Allow access to dashboard but with restricted state

**4. Add Registration Completion Banner to `BrandDashboard.tsx`**
- When `registration_completed = false`, show a prominent banner at the top:
  "Complete your brand registration to unlock all features -- browse creators, send messages, and post opportunities."
  with a CTA button linking to the registration completion page

**5. Gate Feature Access**
- **`/influencers` page**: Check `registration_completed` before allowing access; redirect incomplete brands to dashboard with a toast
- **BrandOverviewTab**: Disable/hide "Find Creators" button when not registered
- **BrandMessagesTab**: Show a locked state prompting registration completion
- **BrandBookingsTab**: Show a locked state prompting registration completion  
- **BrandOpportunitiesTab**: Disable "Post Opportunity" when not registered
- **Homepage (`Index.tsx`)**: When user has brand profile but `registration_completed = false`, still redirect to dashboard (where they see the banner)

### Files to Modify

| File | Change |
|------|--------|
| `src/pages/BrandSignup.tsx` | Strip down to Tier 1 fields only; remove logo/company/industry/social media sections |
| `src/components/BrandProtectedRoute.tsx` | Fetch `registration_completed` and pass it as context/prop |
| `src/pages/BrandDashboard.tsx` | Add registration completion banner when `registration_completed = false` |
| `src/pages/BrandOnboarding.tsx` | Repurpose or add a step for Tier 2 business details that sets `registration_completed = true` |
| `src/pages/Influencers.tsx` | Check `registration_completed` and block access for incomplete brands |
| `src/components/brand-dashboard/BrandOverviewTab.tsx` | Conditionally disable features |
| `src/components/brand-dashboard/BrandMessagesTab.tsx` | Show locked state for unregistered |
| `src/components/brand-dashboard/BrandOpportunitiesTab.tsx` | Disable posting for unregistered |

### No Database Changes Needed
The `registration_completed` column already exists with a default of `false`. No schema changes required.

