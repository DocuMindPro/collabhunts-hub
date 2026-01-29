
# Update Creator Services to Event-Based Model

## Status: ✅ COMPLETED

## Overview
The creator onboarding "Services & Pricing" step has been updated from social media content services to event-based services that align with the new platform identity focused on in-person creator experiences.

## Changes Made

### Service Types Updated
| Old Service | New Service |
|-------------|-------------|
| Instagram Post | Meet & Greet |
| Instagram Story | Workshop |
| Instagram Reel | Competition Event |
| TikTok Video | Brand Activation |
| YouTube Video | Private Event |
| YouTube Short | Live Performance |
| UGC Content | Custom Experience |

### Files Updated

1. **src/components/admin/CreatorOnboardingPreview.tsx**
   - ✅ Updated serviceTypes array to event-based services
   - ✅ Updated description: "What event experiences do you offer?"

2. **src/pages/CreatorSignup.tsx**
   - ✅ Updated serviceTypes array to event-based services
   - ✅ Updated description: "What event experiences can brands book?"

3. **src/pages/NativeCreatorOnboarding.tsx**
   - ✅ Updated SERVICE_TYPES array to event-based services
   - ✅ Updated description: "Add at least one event experience you offer"

4. **src/components/creator-dashboard/ServiceEditDialog.tsx**
   - ✅ Updated placeholder text: "e.g., meet_greet, workshop, brand_activation"

5. **src/pages/CreatorProfile.tsx**
   - ✅ Updated section title: "Event Experiences"
   - ✅ Updated description: "Available event packages you can book"

## Technical Notes
- The `src/config/packages.ts` file defines the event package types (meet_greet, workshop, competition, custom) - services now align with these
- Database column `creator_services.service_type` is a text field, so no schema changes were needed
- Existing services with old types will continue to work (display with their raw values) until creators update them
