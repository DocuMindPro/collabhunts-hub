

# Add AI Text Improvement to Opportunity Creation Dialog

## Overview

Integrate the existing `AiBioSuggestions` component into the "Post an Opportunity" dialog to help brands craft better titles and descriptions. This mirrors the functionality already available in creator onboarding.

---

## Current State

The `CreateOpportunityDialog` has:
- **Title field**: Plain text input, no AI assistance
- **Description field**: Plain textarea, no AI assistance

The edge function `improve-bio` already supports:
- `campaign_title` type (min 10 chars) - for opportunity titles
- `campaign_description` type (min 20 chars) - for opportunity descriptions

---

## What Changes

### 1. Add AI Button to Title Field

After the title input, add the AI suggestions component with:
- **Type**: `campaign_title`
- **Min length**: 10 characters (already configured in edge function)
- **Label**: "title"

When user clicks "Improve with AI", they get 3 improved title suggestions.

### 2. Add AI Button to Description Field

After the description textarea, add the AI suggestions component with:
- **Type**: `campaign_description`  
- **Min length**: 50 characters (user's requirement, will update edge function)
- **Label**: "description"

When user clicks "Improve with AI", they get 3 improved description suggestions.

---

## Visual Mockup

```
┌─────────────────────────────────────────────────┐
│ Title *                                         │
│ ┌─────────────────────────────────────────────┐ │
│ │ Restaurant Opening in Downtown Beirut       │ │
│ └─────────────────────────────────────────────┘ │
│ [✨ Improve with AI]                            │
│                                                 │
│ Description                                     │
│ ┌─────────────────────────────────────────────┐ │
│ │ We're opening a new restaurant and need     │ │
│ │ food creators to come and review our menu   │ │
│ │ and share their experience...               │ │
│ └─────────────────────────────────────────────┘ │
│ [✨ Improve with AI]                            │
│ Write 12 more characters to enable AI          │
└─────────────────────────────────────────────────┘
```

---

## Implementation Details

### File 1: Update CreateOpportunityDialog.tsx

**Changes:**
1. Import `AiBioSuggestions` component
2. Add AI button below title input (type: `campaign_title`, minLength: 10)
3. Add AI button below description textarea (type: `campaign_description`, minLength: 50)

```typescript
import AiBioSuggestions from "@/components/AiBioSuggestions";

// In the Title section, after the Input:
<AiBioSuggestions
  text={formData.title}
  onSelect={(text) => setFormData(prev => ({ ...prev, title: text }))}
  type="campaign_title"
  minLength={10}
  label="title"
/>

// In the Description section, after the Textarea:
<AiBioSuggestions
  text={formData.description}
  onSelect={(text) => setFormData(prev => ({ ...prev, description: text }))}
  type="campaign_description"
  minLength={50}
  label="description"
/>
```

### File 2: Update improve-bio Edge Function

**Changes:**
1. Update `campaign_description` minimum length from 20 to 50 characters
2. Ensure the prompt handles opportunity-specific context

```typescript
// Update minLengths
const minLengths: Record<string, number> = {
  bio: 20,
  description: 20,
  campaign_title: 10,
  campaign_description: 50,  // Changed from 20 to 50
  display_name: 5,
  title: 5
};
```

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/components/brand-dashboard/CreateOpportunityDialog.tsx` | Import and add AiBioSuggestions for title and description |
| `supabase/functions/improve-bio/index.ts` | Update campaign_description minLength to 50 |

---

## User Experience Flow

1. Brand starts typing opportunity title (e.g., "Need food creators")
2. After 10+ characters, "Improve with AI" button becomes active
3. Brand clicks button → sees 3 AI-generated title alternatives
4. Brand selects one → title field updates automatically
5. Same flow for description after 50+ characters

---

## Benefits

- **Consistent UX**: Same AI assistance pattern as creator onboarding
- **Better listings**: AI helps brands write compelling opportunity posts
- **Low effort**: Reuses existing component and edge function
- **Clear guidance**: Character counter tells users how much more to type

