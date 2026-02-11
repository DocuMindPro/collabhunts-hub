

## Auto-Create Conversation on Opportunity Accept

### Problem
When a brand accepts a creator's opportunity application, there's no way for them to start chatting. The brand would have to go to the creator's profile and click "Message" -- which counts against their monthly messaging limit. This makes the $15 opportunity post nearly useless for Free plan brands (1 message/month limit).

### Solution
When a brand clicks "Accept" on an opportunity application, automatically create a conversation between them and exempt it from the messaging counter. Also add a "Message" button on accepted applications so the brand can jump straight into the chat.

### Changes

**`src/components/brand-dashboard/OpportunityApplicationsDialog.tsx`**
- Modify the `updateApplicationStatus` function: when status is "accepted", also create a conversation (or find existing one) between the brand and the creator
- Do NOT call `incrementMessagingCounter` -- opportunity-based conversations are exempt from the limit
- Add a "Message" button on accepted applications that navigates to the conversation
- Need to pass `brandProfileId` as a new prop (or fetch it internally)

**`src/components/brand-dashboard/BrandOpportunitiesTab.tsx`**
- Pass the brand's `brandProfileId` to `OpportunityApplicationsDialog` so it can create conversations

**`src/lib/subscription-utils.ts`**
- Update `canBrandMessageCreator` to also check if the brand and creator are connected through an accepted opportunity application. If so, return `{ canMessage: true }` even if the limit is reached -- this ensures that if the brand later visits the creator's profile and clicks "Message," it still works since they already have a relationship through the opportunity

### Flow

1. Brand reviews applications and clicks "Accept"
2. System updates application status to "accepted"
3. System checks for existing conversation between brand and creator
4. If none exists, creates one (without incrementing the messaging counter)
5. A "Message" button appears on the accepted application card
6. Brand clicks "Message" and goes straight to the conversation

### Why this is safe
- The conversation is only created on explicit "Accept" -- not on every application
- The messaging counter is not incremented, so opportunity-based connections don't eat into the brand's monthly quota
- If a conversation already exists (brand previously messaged this creator), it reuses the existing one
- The `canBrandMessageCreator` function is updated to recognize opportunity-linked creators, so the limit check remains consistent everywhere

