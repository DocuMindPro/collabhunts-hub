
# Redesign Inquiry-to-Agreement Flow

## Current Flow (Problem)
1. Brand clicks "Inquire" on a package card
2. An automated message is sent: "Hi! I'm interested in your Social Boost package..."
3. Creator sees "Reply with Quote" or "Send Offer" buttons
4. Creator has to manually fill an offer dialog with date, price, duration
5. Brand accepts the offer → Creates a booking

**Problem**: The creator is initiating the offer with details that the BRAND should be specifying (date, duration, etc.). This is backwards.

## Proposed New Flow

### Step 1: Brand Sends Inquiry (with details)
When a brand inquires about a package, they should provide:
- **Package type** (already selected)
- **Preferred date** (for event packages)
- **Duration** (for event packages)
- **Proposed budget** (optional or required)
- **Notes** (what they want, special requests)

This creates an **Inquiry Message** with structured data.

### Step 2: Creator Responds to Inquiry
Creator sees the inquiry with all brand's details and can:
- **Accept** (at the brand's proposed price) → Opens Agreement dialog
- **Counter-Offer** → Adjust the price/details and send back
- **Decline** → With optional reason

### Step 3: Negotiation Loop (if counter-offered)
Brand can then:
- **Accept** the counter → Opens Agreement confirmation
- **Counter** again → Adjust and send back
- **Decline**

This loop continues until one party accepts or declines.

### Step 4: Agreement Created
Once one party accepts, the creator sends a formal Agreement:
- Pre-filled with negotiated terms (price, date, deliverables)
- AI helps refine the agreement text
- Brand confirms → Locked to both calendars

### Key Changes

| Current | Proposed |
|---------|----------|
| Brand sends basic inquiry | Brand sends inquiry WITH date, duration, budget, notes |
| Creator sends offer (fills in date, price) | Creator responds: Accept/Counter/Decline |
| Brand accepts offer | Back-and-forth negotiation until agreement |
| Creates booking directly | Agreement created → Brand confirms → Booking + Calendar |

## Communication Model

You asked: "if they want to communicate, they can only communicate based on a note or an offer?"

**Proposed hybrid approach:**
- **Structured messages** for negotiations (Inquiry → Counter → Accept)
- **Free-form notes** can be attached to any structured message
- **Regular messages** still available for general discussion

This keeps the negotiation organized while allowing flexibility.

## Technical Implementation

### 1. New Message Type: `inquiry` (enhanced)
Current `PackageInquiryMessage` is just text. Change to structured:
```json
{
  "type": "inquiry",
  "package_type": "social_boost",
  "preferred_date": "2026-02-15",
  "preferred_time": "19:00",
  "duration_hours": 2,
  "proposed_budget_cents": 50000,
  "notes": "We're launching a new menu..."
}
```

### 2. New Message Type: `counter_offer`
```json
{
  "type": "counter_offer",
  "parent_id": "original_inquiry_id",
  "price_cents": 60000,
  "event_date": "2026-02-16",  // can propose different date
  "notes": "I'm available on the 16th instead, price adjusted for..."
}
```

### 3. Unified Negotiation Thread
- All related messages (inquiry → counter → counter → accept) linked via `parent_id`
- UI shows them as a connected "negotiation card"
- Clear visual of the back-and-forth

### 4. Agreement Integration
When "Accept" is clicked:
- Opens `SendAgreementDialog` pre-filled with negotiated terms
- AI helps polish the agreement
- Brand confirms → Creates booking + calendar entries

## Files to Modify

| File | Changes |
|------|---------|
| `src/components/chat/PackageInquiryCard.tsx` | Redesign inquiry dialog - add date, duration, budget fields |
| `src/components/chat/PackageInquiryMessage.tsx` | Display structured inquiry with all details |
| `src/components/chat/CounterOfferDialog.tsx` | **New** - Dialog for counter-offering |
| `src/components/chat/NegotiationMessage.tsx` | **New** - Unified component for inquiry/counter/accept chain |
| `src/components/chat/SendOfferDialog.tsx` | Repurpose or remove (replaced by negotiation flow) |
| `src/components/chat/AcceptOfferDialog.tsx` | Update to work with negotiation flow → Agreement |
| Database migration | Add `parent_message_id` to messages, update inquiry structure |

## Visual Flow

```text
┌────────────────────────────────────────────────────────────────────┐
│  BRAND'S VIEW                       CREATOR'S VIEW                 │
├────────────────────────────────────────────────────────────────────┤
│                                                                    │
│  1. Brand clicks "Inquire"          (waiting...)                   │
│     - Picks date: Feb 15                                           │
│     - Duration: 2 hrs                                              │
│     - Budget: $500                                                 │
│     - Notes: "New menu launch"                                     │
│                                                                    │
│  ─────────────────→  INQUIRY  ────────────────────→               │
│                                                                    │
│                                     2. Creator sees inquiry        │
│                                        [Accept $500]               │
│                                        [Counter-Offer]             │
│                                        [Decline]                   │
│                                                                    │
│                                     Creator clicks "Counter"       │
│                                        - New price: $600           │
│                                        - Note: "Premium time"      │
│                                                                    │
│  ←────────────────  COUNTER  ←─────────────────────               │
│                                                                    │
│  3. Brand sees counter-offer                                       │
│     [Accept $600]                                                  │
│     [Counter]                                                      │
│     [Decline]                                                      │
│                                                                    │
│  Brand clicks "Accept"                                             │
│                                                                    │
│  ─────────────────→  ACCEPTED  ───────────────────→               │
│                                                                    │
│                                     4. Creator receives accept     │
│                                        → Opens Agreement Dialog    │
│                                        → Sends formal agreement    │
│                                                                    │
│  ←────────────────  AGREEMENT  ←───────────────────               │
│                                                                    │
│  5. Brand confirms agreement                                       │
│     → Booking created                                              │
│     → Added to both calendars                                      │
│                                                                    │
└────────────────────────────────────────────────────────────────────┘
```

## Summary

This redesign:
1. **Puts the brand in control** of proposing dates/budget upfront
2. **Enables negotiation** with structured counter-offers
3. **Maintains clarity** with visual negotiation threads
4. **Leads to formal agreements** once terms are settled
5. **Keeps communication organized** while still allowing notes

This is a significant refactor that touches the core messaging/negotiation flow. Would you like me to implement this in phases?
