
# Hide Public Pricing -- Move to Chat-Based Price Sharing ✅ IMPLEMENTED

## What Changes

Currently, creator prices are visible everywhere: on creator cards in the Influencers listing, on creator profile pages, in the booking dialog, and in the profile preview. The goal is to remove all public-facing prices and instead let brands **request pricing** in chat, and let creators **send their pricing** in chat on demand.

---

## All Touchpoints That Need Changing

### 1. Influencers Listing Page (`src/pages/Influencers.tsx`)

**Remove price from creator cards.** Currently lines 572-584 show a `DimmedPriceRange` on every creator card. Replace the price section with a "Request Pricing" label or simply show the package count (e.g., "3 packages").

### 2. Creator Profile Page (`src/pages/CreatorProfile.tsx`)

**Hide prices from package cards.** Lines 906-914 show `DimmedPrice` next to each package name. Remove the price display but keep the package name, description, and "Inquire" button. The "Inquire" button already opens a conversation -- it just won't pre-fill a price anymore.

**Remove price from sidebar.** Lines 990-1002 show a `DimmedPriceRange` in the "Quick Stats" sidebar. Remove the entire "Price" stat row.

**Remove price from mobile floating button logic.** Lines 1019-1022 reference `price_cents` to find the "lowest price" service. Change to just pick the first service instead.

**Update BookingDialog.** Lines 232-256 in `BookingDialog.tsx` show "Base Price" and total. Remove price display from the dialog since prices are now private. The dialog should just show the package name and let the brand message the creator.

### 3. Creator Profile Preview (`src/components/creator-dashboard/ProfilePreview.tsx`)

**Hide prices from the creator's own preview.** Lines 457-462 show `DimmedPrice` on each package. Remove price display. Lines 514-521 show `DimmedPriceRange` in sidebar -- remove that stat row.

**Remove prices from custom deliverables.** Lines 469-485 show `$xx` per deliverable in the "Content Menu". Remove the price column from this display.

### 4. Creator Services Tab (`src/components/creator-dashboard/ServicesTab.tsx`)

**Keep prices in the creator's own management view.** Creators still set prices internally -- they just aren't shown publicly. No changes needed to how creators enter prices. The ServicesTab is their private dashboard, so prices remain visible here.

### 5. Brand Chat -- Add "Request Pricing" Button (`src/components/brand-dashboard/BrandMessagesTab.tsx`)

**Add a "Request Pricing" button** in the brand's chat message input area (next to the existing "Send Agreement" button). When clicked, it sends a structured message (type: `pricing_request`) that appears as a styled card in the chat asking the creator for their rates.

### 6. Creator Chat -- Add "Send Pricing" Button (`src/components/creator-dashboard/MessagesTab.tsx`)

**Add a "Send Pricing" button** next to the existing "Send Offer" button in the creator's chat input. When clicked, it opens a dialog showing the creator's active packages with their prices. The creator selects which packages to share, and a styled pricing card is sent as a structured message (type: `pricing_response`) displaying the selected packages and prices.

### 7. New Chat Components

- **`PricingRequestMessage.tsx`** -- Renders a styled card for the brand's pricing request (e.g., "Pricing Requested" with a note). On the creator's side, it shows a "Send My Pricing" button that triggers the pricing share flow.
- **`PricingResponseMessage.tsx`** -- Renders a styled card showing the creator's shared packages and prices, with an "Inquire" button for the brand to start the negotiation.
- **`SendPricingDialog.tsx`** -- Dialog for creators to select which packages/prices to share in chat.

### 8. Inquiry Form Card (`src/components/chat/InquiryFormCard.tsx`)

**Remove price pre-fill.** Lines 119-120 show "Starting at $xx". Remove this reference since prices are no longer public. The budget field stays (brands propose their own budget).

### 9. Package Inquiry Message (`src/components/chat/PackageInquiryMessage.tsx`)

No changes needed -- this already handles negotiation data with proposed budgets. It will continue working since brands propose budgets, not reference public prices.

### 10. Send Offer Dialog (`src/components/chat/SendOfferDialog.tsx`)

The creator's "Send Offer" dialog already fetches their own services and pre-fills their private price. This stays as-is since it's the creator sharing their price in context of an offer. No changes needed.

### 11. Creator Onboarding (`src/pages/NativeCreatorOnboarding.tsx`)

**Keep price input during onboarding.** Creators still set prices during signup -- those prices are stored in the database for their own reference and for sharing via chat. The onboarding form stays unchanged.

---

## New Message Types

Two new structured message types flow through the existing `messages` table:

**Pricing Request** (sent by brand):
```json
{
  "type": "pricing_request",
  "notes": "I'd like to know your rates for Instagram content"
}
```

**Pricing Response** (sent by creator):
```json
{
  "type": "pricing_response",
  "packages": [
    { "service_type": "unbox_review", "price_cents": 15000, "delivery_days": 7 },
    { "service_type": "social_boost", "price_cents": 30000 }
  ]
}
```

These use the existing `messages` table with `message_type` column. No database changes are needed.

---

## Summary of Files to Change

| File | Action |
|---|---|
| `src/pages/Influencers.tsx` | Remove `DimmedPriceRange` from creator cards, show package count instead |
| `src/pages/CreatorProfile.tsx` | Remove `DimmedPrice` from packages, remove price sidebar stat, update mobile CTA logic |
| `src/components/creator-dashboard/ProfilePreview.tsx` | Remove prices from packages and sidebar |
| `src/components/BookingDialog.tsx` | Remove price display from dialog |
| `src/components/chat/InquiryFormCard.tsx` | Remove "Starting at $xx" reference |
| `src/components/brand-dashboard/BrandMessagesTab.tsx` | Add "Request Pricing" button to message input |
| `src/components/creator-dashboard/MessagesTab.tsx` | Add "Send Pricing" button to message input |
| `src/components/chat/PricingRequestMessage.tsx` | **New** -- renders pricing request card in chat |
| `src/components/chat/PricingResponseMessage.tsx` | **New** -- renders pricing response card in chat |
| `src/components/chat/SendPricingDialog.tsx` | **New** -- creator selects packages to share |

No database migrations needed. No edge function changes needed.
