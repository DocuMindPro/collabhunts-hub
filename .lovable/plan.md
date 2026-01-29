

# Replace Browser Prompts with Professional Modals

## Problem Summary
The creator signup flow currently uses JavaScript's native `prompt()` function to collect:
1. **Social Media Accounts** (Step 4): Username and follower count
2. **Services & Pricing** (Step 5): Price, description, and delivery days

These browser prompts appear as ugly system dialogs in the top-left corner, looking unprofessional and inconsistent with the rest of the application's design.

## Solution Overview
Replace all `prompt()` calls with beautiful, styled modal dialogs using the existing Radix UI Dialog component. Each modal will have:
- Professional header with title and description
- Properly styled input fields with labels
- Cancel and Submit buttons
- Form validation with error feedback
- Smooth animations (already built into Dialog component)

## Detailed Implementation Plan

### 1. Create Reusable Modal State (in CreatorSignup.tsx)
Add new state variables to manage the modal dialogs:

```text
+------------------------------------------+
| New State Variables                      |
+------------------------------------------+
| - showSocialModal: boolean               |
| - selectedPlatform: string               |
| - socialUsername: string                 |
| - socialFollowers: string                |
| - showServiceModal: boolean              |
| - selectedServiceType: string            |
| - servicePrice: string                   |
| - serviceDescription: string             |
| - serviceDeliveryDays: string            |
+------------------------------------------+
```

### 2. Social Media Account Modal
Replace the `addSocialAccount()` function with:
- Button click opens a modal dialog
- Modal contains fields for username and follower count
- Platform icon displayed in modal header
- Submit button validates and adds the account

```text
+------------------------------------------------+
|  [Instagram Icon] Add Instagram Account        |
|------------------------------------------------|
|  Username                                      |
|  +------------------------------------------+  |
|  | @yourusername                            |  |
|  +------------------------------------------+  |
|                                                |
|  Follower Count                                |
|  +------------------------------------------+  |
|  | 50000                                    |  |
|  +------------------------------------------+  |
|                                                |
|  [Cancel]                    [Add Account]     |
+------------------------------------------------+
```

### 3. Service & Pricing Modal
Replace the `addService()` function with:
- Button click opens a modal dialog
- Modal contains fields for price, description (optional), and delivery days
- Service type displayed in modal header
- Submit button validates price and adds the service

```text
+------------------------------------------------+
|  Add Workshop Service                          |
|  Set your pricing for this experience          |
|------------------------------------------------|
|  Price (USD) *                                 |
|  +------------------------------------------+  |
|  | 500                                      |  |
|  +------------------------------------------+  |
|                                                |
|  Description (optional)                        |
|  +------------------------------------------+  |
|  | A 2-hour interactive workshop...         |  |
|  +------------------------------------------+  |
|                                                |
|  Delivery Days                                 |
|  +------------------------------------------+  |
|  | 7                                        |  |
|  +------------------------------------------+  |
|                                                |
|  [Cancel]                    [Add Service]     |
+------------------------------------------------+
```

### 4. Files to Modify

| File | Changes |
|------|---------|
| `src/pages/CreatorSignup.tsx` | Add modal state, Dialog components, replace `prompt()` calls with modal opens, add modal submission handlers |

### 5. Implementation Details

**Step 1: Add imports**
- Import `Dialog`, `DialogContent`, `DialogHeader`, `DialogTitle`, `DialogDescription`, `DialogFooter` from `@/components/ui/dialog`

**Step 2: Add state variables** (around line 100)
- 9 new state variables for managing modal visibility and form inputs

**Step 3: Replace `addSocialAccount()` function** (lines 720-750)
- New function `openSocialModal(platform)` - opens modal with selected platform
- New function `handleSocialSubmit()` - validates and saves the account, closes modal

**Step 4: Replace `addService()` function** (lines 752-775)
- New function `openServiceModal(serviceType)` - opens modal with selected service type
- New function `handleServiceSubmit()` - validates and saves the service, closes modal

**Step 5: Add Modal JSX** (after step 7's JSX, before closing CardContent)
- Two Dialog components with proper form fields and buttons

## Expected Result
After this change:
- Clicking a platform button (Instagram, TikTok, etc.) opens a professional modal centered on screen
- Clicking a service button (Meet & Greet, Workshop, etc.) opens a professional modal centered on screen
- All inputs are properly styled with labels, placeholders, and validation
- The modals match the application's design system perfectly
- No more ugly browser prompts!

