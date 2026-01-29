
# Update Creator Services to Event-Based Model

## Overview
The creator onboarding "Services & Pricing" step currently lists social media content services (Instagram Post, TikTok Video, UGC Content, etc.) which are remnants of the old influencer marketplace model. These need to be replaced with event-based services that align with the new platform identity focused on in-person creator experiences.

## Current State
The following services are currently listed:
- Instagram Post
- Instagram Story  
- Instagram Reel
- TikTok Video
- YouTube Video
- YouTube Short
- UGC Content
- Brand Ambassador
- Product Review
- Shoutout
- Custom Content

## New Event-Based Services
Based on the packages defined in `src/config/packages.ts`, the new services should be:

| Service | Description |
|---------|-------------|
| Meet & Greet | Fan appearances at cafes, restaurants, and retail locations |
| Workshop | Educational or creative sessions at studios, gyms, or creative spaces |
| Competition Event | PK challenge events at malls and entertainment centers |
| Brand Activation | On-site promotional events for product launches |
| Private Event | Exclusive appearances for private parties or corporate events |
| Live Performance | Entertainment performances at venues |
| Custom Experience | Tailored events designed for specific brand needs |

## Files to Update

### 1. src/components/admin/CreatorOnboardingPreview.tsx (Lines 67-73)
**Current:**
```typescript
const serviceTypes = [
  { value: "instagram_post", label: "Instagram Post" },
  { value: "instagram_reel", label: "Instagram Reel" },
  { value: "tiktok_video", label: "TikTok Video" },
  { value: "youtube_video", label: "YouTube Video" },
  { value: "ugc_content", label: "UGC Content" }
];
```

**New:**
```typescript
const serviceTypes = [
  { value: "meet_greet", label: "Meet & Greet" },
  { value: "workshop", label: "Workshop" },
  { value: "competition", label: "Competition Event" },
  { value: "brand_activation", label: "Brand Activation" },
  { value: "private_event", label: "Private Event" },
  { value: "live_performance", label: "Live Performance" },
  { value: "custom", label: "Custom Experience" }
];
```

### 2. src/pages/CreatorSignup.tsx (Lines 109-117)
**Current:**
```typescript
const serviceTypes = [
  { value: "instagram_post", label: "Instagram Post" },
  { value: "instagram_story", label: "Instagram Story" },
  { value: "instagram_reel", label: "Instagram Reel" },
  { value: "tiktok_video", label: "TikTok Video" },
  { value: "youtube_video", label: "YouTube Video" },
  { value: "youtube_short", label: "YouTube Short" },
  { value: "ugc_content", label: "UGC Content" }
];
```

**New:** Same event-based services as above

### 3. src/pages/NativeCreatorOnboarding.tsx (Lines 43-55)
**Current:**
```typescript
const SERVICE_TYPES = [
  'Instagram Post',
  'Instagram Story',
  'Instagram Reel',
  'TikTok Video',
  'YouTube Video',
  'YouTube Short',
  'Twitter/X Post',
  'Brand Ambassador',
  'Product Review',
  'Shoutout',
  'Custom Content',
];
```

**New:**
```typescript
const SERVICE_TYPES = [
  'Meet & Greet',
  'Workshop',
  'Competition Event',
  'Brand Activation',
  'Private Event',
  'Live Performance',
  'Custom Experience',
];
```

### 4. src/components/creator-dashboard/ServicesTab.tsx
- Update the service type display formatting to handle new event-based types

### 5. src/components/creator-dashboard/ServiceEditDialog.tsx  
- Update placeholder text: `"e.g., instagram_post, youtube_video"` to `"e.g., meet_greet, workshop"`
- Update field labels to reflect event context (delivery days becomes "Event Duration")

### 6. src/pages/CreatorProfile.tsx
- Update the "Services & Pricing" section to display event packages appropriately

## Additional UI Text Updates

### Step Headers & Descriptions
- **CreatorOnboardingPreview.tsx line 474-475:**
  - Title: "Services & Pricing" (keep)
  - Description: "What do you offer?" becomes "What event experiences do you offer?"

- **CreatorSignup.tsx line 1310-1311:**
  - Title: "Services & Pricing" (keep)
  - Description: "What services do you offer?" becomes "What event experiences can brands book?"

- **NativeCreatorOnboarding.tsx line 435-436:**
  - Title: "Set your services & pricing" (keep)
  - Description: "Add at least one service you offer" becomes "Add at least one event experience you offer"

## Summary of Changes
| File | Change Type |
|------|-------------|
| CreatorOnboardingPreview.tsx | Update serviceTypes array + description text |
| CreatorSignup.tsx | Update serviceTypes array + description text |
| NativeCreatorOnboarding.tsx | Update SERVICE_TYPES array + description text |
| ServiceEditDialog.tsx | Update placeholder text and field labels |
| ServicesTab.tsx | Ensure new service types display correctly |
| CreatorProfile.tsx | Update section to show event packages |

## Technical Notes
- The `src/config/packages.ts` file already defines the event package types (meet_greet, workshop, competition, custom) - the new services will align with these
- Database column `creator_services.service_type` is a text field, so no schema changes needed
- Existing services with old types will continue to work (display with their raw values) until creators update them
