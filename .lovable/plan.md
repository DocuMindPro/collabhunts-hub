

# Redesign Package Inquiry Dialog for Event-Based Identity

## The Problem

The current "Inquire About This Package" dialog shows the same content for all packages, but the packages have fundamentally different natures:

| Package | Type | Relevant Info | Booking Flow |
|---------|------|---------------|--------------|
| **Unbox & Review** | At-home content | Delivery timeline (days) | Direct message |
| **Social Boost** | Event (1-2 hours) | Duration at venue | Direct message |
| **Meet & Greet** | Event (2-4 hours) | Duration, upsells | Direct message |
| **Live PK Battle** | Managed event | Contact CollabHunts | Consultation only |
| **Custom** | Consultation | Contact CollabHunts | Consultation only |

**Issues in Current Dialog:**
1. "Est. Delivery: 7 days" shown for events where it's meaningless
2. "Your Plan Includes This" badge references removed subscription model - messaging is now FREE
3. "How Managed Service Works" steps are content-focused, not event-focused
4. No differentiation between packages that can be booked directly vs. those requiring consultation

---

## Solution: Package-Aware Booking Dialog

### New Dialog Behavior by Package Type

**Group A: Direct Booking Packages** (Unbox & Review, Social Boost, Meet & Greet)
- Show relevant package details (delivery days OR event duration)
- Single "Message Creator" CTA (messaging is free for all brands)
- Clean, simple dialog without subscription references

**Group B: Consultation Packages** (Live PK Battle, Custom)
- Show "This package requires consultation"
- "Contact CollabHunts" as primary CTA
- Brief explanation of the managed service

---

## Visual Mockup

### For Unbox & Review (At-Home Package)
```
┌─────────────────────────────────────────┐
│ Book Unbox & Review               [X]   │
├─────────────────────────────────────────┤
│ ┌─────────────────────────────────────┐ │
│ │ Package:        Unbox & Review      │ │
│ │ Creator Price:  $200                │ │
│ │ Est. Delivery:  7 days              │ │
│ └─────────────────────────────────────┘ │
│                                         │
│ [📦 Message Creator to Book]            │
│ (primary button, full width)            │
│                                         │
│ "Discuss product details, shipping      │
│  info, and content requirements"        │
└─────────────────────────────────────────┘
```

### For Social Boost / Meet & Greet (Event Packages)
```
┌─────────────────────────────────────────┐
│ Book Social Boost                 [X]   │
├─────────────────────────────────────────┤
│ ┌─────────────────────────────────────┐ │
│ │ Package:        Social Boost        │ │
│ │ Creator Price:  $500                │ │
│ │ Event Duration: 1-2 hours           │ │
│ └─────────────────────────────────────┘ │
│                                         │
│ [📍 Message Creator to Book]            │
│ (primary button, full width)            │
│                                         │
│ "Coordinate event date, venue details,  │
│  and content requirements"              │
└─────────────────────────────────────────┘
```

### For Live PK Battle / Custom (Consultation Required)
```
┌─────────────────────────────────────────┐
│ Live PK Battle Inquiry            [X]   │
├─────────────────────────────────────────┤
│ ┌─────────────────────────────────────┐ │
│ │ Package:        Live PK Battle      │ │
│ │ Pricing:        Contact for quote   │ │
│ │ Type:           Managed Event       │ │
│ └─────────────────────────────────────┘ │
│                                         │
│ ⚡ This is a Managed Event              │
│ CollabHunts handles all coordination,   │
│ creator booking, and event management.  │
│                                         │
│ [📧 Contact CollabHunts]                │
│ [📝 Use Contact Form]                   │
│                                         │
│ ℹ️ We typically respond within 24 hours │
└─────────────────────────────────────────┘
```

---

## Implementation Details

### 1. Update BookingDialog.tsx Structure

Remove:
- Subscription check logic (`isSubscribed`, `getCurrentPlanType`)
- "Your Plan Includes This" badge
- "Subscribe to Unlock" button
- Dual "Direct" vs "Managed" options for simple packages

Add:
- Package type detection using `service.service_type`
- Conditional rendering based on package category
- Dynamic subtitle text based on package type

### 2. Package Type Classification

```typescript
const CONSULTATION_PACKAGES = ['competition', 'custom'];
const EVENT_PACKAGES = ['social_boost', 'meet_greet'];
const HOME_PACKAGES = ['unbox_review'];

const requiresConsultation = CONSULTATION_PACKAGES.includes(service.service_type);
const isEventPackage = EVENT_PACKAGES.includes(service.service_type);
const isHomePackage = HOME_PACKAGES.includes(service.service_type);
```

### 3. Dynamic Details Section

```typescript
// Show delivery days only for at-home packages
{isHomePackage && (
  <div className="flex justify-between">
    <span>Est. Delivery:</span>
    <span>{service.delivery_days} days</span>
  </div>
)}

// Show event duration for event packages
{isEventPackage && packageInfo.durationRange && (
  <div className="flex justify-between">
    <span>Event Duration:</span>
    <span>{packageInfo.durationRange.min}-{packageInfo.durationRange.max} hours</span>
  </div>
)}

// Show "Managed Event" for consultation packages
{requiresConsultation && (
  <div className="flex justify-between">
    <span>Type:</span>
    <span>Managed Event</span>
  </div>
)}
```

### 4. Conditional CTA Rendering

```typescript
{requiresConsultation ? (
  // Consultation flow - contact CollabHunts
  <>
    <Card className="border-primary/20 bg-primary/5">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <Zap className="h-5 w-5 text-primary mt-0.5" />
          <div>
            <h4 className="font-semibold">This is a Managed Event</h4>
            <p className="text-sm text-muted-foreground">
              CollabHunts handles creator coordination, event setup, 
              and all logistics. We'll provide a custom quote.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
    <Button onClick={handleManagedBooking} className="w-full">
      <Mail className="h-4 w-4 mr-2" />
      Contact CollabHunts
    </Button>
    <Button variant="ghost" onClick={handleContactPage} className="w-full">
      <Phone className="h-4 w-4 mr-2" />
      Use Contact Form
    </Button>
  </>
) : (
  // Direct booking flow - message creator
  <>
    <Button onClick={handleDirectMessage} className="w-full gradient-hero">
      <MessageSquare className="h-4 w-4 mr-2" />
      Message Creator to Book
    </Button>
    <p className="text-xs text-center text-muted-foreground">
      {isHomePackage 
        ? "Discuss product details, shipping, and content requirements"
        : "Coordinate event date, venue details, and content requirements"}
    </p>
  </>
)}
```

### 5. Update CreatorProfile.tsx

Pass additional package info to the dialog:

```typescript
// Import package config
import { EVENT_PACKAGES, type PackageType } from "@/config/packages";

// In BookingDialog component usage
<BookingDialog
  service={selectedService}
  packageConfig={selectedService ? EVENT_PACKAGES[selectedService.service_type as PackageType] : null}
  // ...other props
/>
```

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/components/BookingDialog.tsx` | Complete redesign with package-aware rendering |
| `src/pages/CreatorProfile.tsx` | Pass package config to dialog |

---

## Summary of Changes

1. **Remove subscription logic** - Messaging is now free for all brands
2. **Add package type detection** - Different flows for different package types
3. **Show relevant details** - Delivery days for at-home, duration for events, "Managed" for consultation
4. **Simplify direct booking** - Single "Message Creator to Book" CTA for most packages
5. **Clear consultation flow** - Contact CollabHunts for PK Battle and Custom packages
6. **Contextual helper text** - Different guidance based on package type

---

## Testing Recommendations

After implementation:
1. Test "Inquire About This Package" for each package type
2. Verify Unbox & Review shows "Est. Delivery"
3. Verify Social Boost/Meet & Greet shows "Event Duration"
4. Verify Live PK Battle/Custom shows "Contact CollabHunts" flow
5. Confirm no subscription badges or "upgrade" prompts appear

