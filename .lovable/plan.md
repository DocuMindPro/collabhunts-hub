
# Major Platform Transformation: Online Influencer Marketing → In-Person Creator Events

## Executive Summary

This is a **complete business pivot** from a SaaS subscription marketplace for online influencer marketing to a **booking platform for in-person creator experiences at physical venues**. This transformation requires changes to:

- **30+ pages** (rewrite, remove, or create new)
- **Database schema** (significant restructuring)
- **Business logic** (subscription-based → event-based fees)
- **User flows** (add Fans as third user type)
- **All dashboards** (Creator, Brand, Admin)
- **Legal pages** (Terms, Privacy, Refund policies)
- **Mobile app** (native creator experience)

---

## Scope Assessment

### Pages to REMOVE Completely
| Page | Current Purpose | Reason for Removal |
|------|-----------------|-------------------|
| `/pricing` | Subscription plans (Basic/Pro/Premium) | Replaced with event-based packages |
| `/campaigns` | Online campaign posting | No longer applicable |
| `/advertising` | Banner ad sales | Removed revenue stream |
| `/become-affiliate` | Affiliate program | Removed revenue stream |
| `/franchise` | Franchise opportunities | Removed revenue stream |

### Pages to SIGNIFICANTLY REWRITE
| Page | Current State | New Purpose |
|------|--------------|-------------|
| `/` (Index) | "Influencer Marketing Made Easy" | "Where Creators Meet Fans in Real Life" |
| `/influencers` | Creator search for online collabs | Creator search with event availability, location |
| `/brand` | Brand onboarding for subscriptions | Venue onboarding for event hosting |
| `/creator` | Creator signup for content creation | Creator signup for live events |
| `/creator-signup` | Basic creator registration | Add event experience, availability calendar |
| `/brand-signup` | Subscription-focused signup | Event-focused venue registration |
| `/creator-dashboard` | Online booking management | Event calendar, availability, fan engagement |
| `/brand-dashboard` | Campaign & subscription management | Event management, venue listing, booking requests |
| `/terms` | Online marketplace terms | In-person event terms, liability, escrow |
| `/privacy` | Data collection for online | Location data, event attendance tracking |
| `/refund` | Subscription refunds | Event cancellation, escrow release |

### NEW Pages to CREATE
| Page | Purpose |
|------|---------|
| `/events` | Public calendar of upcoming creator appearances |
| `/venues` | Browse venues available for events |
| `/book/:creatorId` | Event booking flow for brands |
| `/event/:eventId` | Public event detail page (for fans) |
| `/register/:eventId` | Fan registration for events |
| `/success-stories` | Past event galleries & case studies |

### Dashboards to TRANSFORM

**Creator Dashboard - Current Tabs:**
- Overview, Campaigns, Profile, Services, Bookings, Payouts, Messages

**Creator Dashboard - New Tabs:**
- Overview (event stats, upcoming appearances)
- Availability (calendar management)
- Events (past & upcoming)
- Fan Engagement (attendees, followers)
- Earnings (event-based)
- Messages

**Brand Dashboard - Current Tabs:**
- Overview, Campaigns, Bookings, Your Creators, Content Library, Account, Subscription, Messages

**Brand Dashboard - New Tabs:**
- Overview (venue stats)
- Venue Profile (location, capacity, amenities)
- Event Requests (incoming booking requests)
- My Events (past & scheduled)
- Content Received (post-event media)
- Messages

---

## Database Schema Changes

### Tables to REMOVE
```text
- brand_subscriptions (no more subscriptions)
- campaigns (no online campaigns)
- campaign_applications
- brand_storage_usage (no content library storage)
- content_library (replaced with event gallery)
- content_folders
- mass_message_templates (no mass messaging)
- creator_notes (CRM feature removed)
- ad_placements (no banner ads)
- affiliate_* tables (affiliate program removed)
- franchise_* tables (franchise program removed)
```

### Tables to MODIFY
```text
- bookings → event_bookings
  ADD: event_date, event_time_start, event_time_end
  ADD: venue_id, event_type, package_type
  ADD: escrow_status (pending_deposit, deposit_paid, completed, refunded)
  ADD: deposit_amount_cents, final_amount_cents
  ADD: attendance_count, max_capacity
  REMOVE: service_id, delivery_deadline, delivery_status

- brand_profiles → venue_profiles
  ADD: venue_name, venue_address, venue_city, venue_capacity
  ADD: venue_type (cafe, restaurant, mall, gym, etc.)
  ADD: amenities, parking_available, accessibility_info
  REMOVE: monthly_budget_range, marketing_intent

- creator_profiles
  ADD: event_experience_description
  ADD: availability_calendar (JSONB)
  ADD: event_portfolio_urls
  ADD: min_event_price_cents, max_event_price_cents
  ADD: travel_radius_km
  REMOVE: (most fields stay, repurpose for events)

- creator_services → event_packages
  MODIFY: service_type → package_type (meet_greet, workshop, competition, custom)
  ADD: duration_hours, includes_description
  ADD: min_attendees, max_attendees
```

### Tables to CREATE
```text
- events
  id, creator_profile_id, venue_id, event_booking_id
  title, description, event_type, package_type
  event_date, start_time, end_time
  is_public (fans can see), ticket_price_cents (0 = free)
  max_attendees, current_attendees
  status (scheduled, completed, cancelled)
  created_at, updated_at

- event_registrations (for fans)
  id, event_id, fan_email, fan_name, fan_phone
  status (registered, attended, no_show)
  registered_at, checked_in_at

- event_gallery (post-event content)
  id, event_id, media_url, media_type
  uploaded_by (creator or venue)
  created_at

- event_reviews
  id, event_id, reviewer_type (brand, creator, fan)
  reviewer_id, rating (1-5), review_text
  created_at

- escrow_transactions
  id, event_booking_id
  amount_cents, transaction_type (deposit, release, refund)
  status, processed_at
```

---

## Configuration Changes

### Remove: `src/config/plans.ts`
The entire subscription plan system is deprecated.

### Create: `src/config/packages.ts`
```typescript
export const EVENT_PACKAGES = {
  meet_greet: {
    name: 'Meet & Greet',
    priceRange: { min: 30000, max: 80000 }, // $300-$800
    defaultDuration: 3, // hours
    includes: [
      '3 hours at venue',
      'Live social coverage',
      '5 content pieces',
    ],
  },
  workshop: {
    name: 'Workshop',
    priceRange: { min: 50000, max: 120000 },
    defaultDuration: 2,
    includes: [
      '2-hour workshop',
      'Ticket sales management',
      'Professional content',
    ],
  },
  competition: {
    name: 'Competition Event',
    priceRange: { min: 80000, max: 200000 },
    defaultDuration: 4,
    includes: [
      '2 creators',
      '4 hours',
      'PK challenge',
      'Highlight reel',
    ],
  },
  custom: {
    name: 'Custom Experience',
    priceRange: null, // Variable
    defaultDuration: null,
    includes: ['Tailored to needs'],
  },
};

export const PLATFORM_FEE_PERCENT = 15;
export const DEPOSIT_PERCENT = 50;
```

---

## Implementation Phases

### Phase 1: Foundation (This Implementation)
**Priority: Critical - Must complete first**

1. **Database migration** - Create new schema
2. **Remove deprecated features** - Clean up subscription logic
3. **Update core pages** - Index, Creator, Brand landing pages
4. **Transform dashboards** - Basic event management
5. **Update legal pages** - New terms for events
6. **Update navigation** - Remove pricing, campaigns, add events

### Phase 2: Event System ✅ COMPLETED
1. ✅ Event booking flow with calendar (`src/components/EventBookingDialog.tsx`)
2. ✅ Escrow payment system (`src/lib/escrow-utils.ts`)
3. ✅ Public events page (`src/pages/Events.tsx`)
4. ✅ Fan registration system (`src/pages/EventDetail.tsx`)

### Phase 3: Lebanese Market (Follow-up)
1. Arabic language support
2. Local payment methods (COD, OMT)
3. City filters (Beirut, Jounieh, Tripoli)
4. WhatsApp integration

---

## Key Component Changes

### Homepage Transformation
```text
OLD:
- Tagline: "Influencer Marketing Made Easy"
- Hero: Search by category/niche/platform
- CTA: "Join as Brand" / "Join as Creator"

NEW:
- Tagline: "Where Creators Meet Fans in Real Life"
- Hero: "Book Creators for Live Experiences"
- Search: Location, event type, date
- CTA: "List Your Venue" / "Host Events"
- NEW: Upcoming events carousel
```

### Navbar Changes
```text
REMOVE:
- Pricing link
- Campaigns link

ADD:
- Events link
- Venues link

RENAME:
- "Join as Brand" → "List Your Venue"
```

### Footer Changes
```text
REMOVE:
- "For Brands" → "Pricing"
- Partners section (Affiliate, Franchise, Advertise)

ADD:
- "For Venues" section
- "For Fans" section
```

---

## Files to Modify/Create Summary

| Category | Files | Action |
|----------|-------|--------|
| Pages | 15+ files | Major rewrite |
| Components | 30+ files | Modify terminology, remove features |
| Config | 2 files | Replace plans.ts with packages.ts |
| Database | 1 migration | Major schema changes |
| Legal | 3 files | Rewrite terms, privacy, refund |
| Types | 1 file | Auto-generated after migration |

---

## Risk Assessment

| Risk | Impact | Mitigation |
|------|--------|------------|
| Data loss | High | Backup all existing data before migration |
| Breaking existing users | High | Clear communication, sunset period |
| Scope creep | High | Strict phase-based approach |
| Mobile app compatibility | Medium | Apply same changes to native flows |

---

## Technical Notes

### Lebanese Market Specifics (Phase 3)
- COD option requires manual verification flow
- Arabic RTL support needs layout adjustments
- OMT integration requires custom payment gateway
- WhatsApp Business API for notifications

### Escrow System Design
- 50% deposit on booking confirmation
- Held in platform account
- Released to creator after event completion
- 72-hour auto-release if venue doesn't dispute

---

## Recommendation

This transformation is **substantial** and should be approached in phases. I recommend:

1. **Start with Phase 1** - Foundation changes that establish the new identity
2. **Soft launch** with 10 pilot creators and 5 venues
3. **Iterate based on feedback** before full feature buildout

Would you like me to proceed with Phase 1 implementation? This will include:
- Homepage redesign
- Core terminology changes across all pages
- Database schema migration for events
- Dashboard restructuring
- Updated legal pages
- Removal of deprecated features (subscriptions, campaigns, ads, affiliate, franchise)
