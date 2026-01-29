

# Add "Open to Invitations" Badge Feature

## Overview
Add a LinkedIn-style "Open to Invitations" badge around creator profile pictures. This signals that creators are available for free collaborations where businesses offer experiences (free meals, hotel stays, products, etc.) in exchange for content/promotion.

## How It Works

**For Creators:**
- Toggle ON/OFF from their dashboard profile settings
- When enabled, a green ring/badge appears around their profile picture
- Similar to LinkedIn's "Open to Work" green frame

**For Brands/Businesses:**
- Easily spot creators open to barter/trade collaborations
- Can filter creators by "Open to Invitations" status
- Understand that these creators accept free experiences instead of payment

## Visual Design

```text
+---------------------------+
|  Profile Picture Card     |
|                           |
|     ┌─────────────┐       |
|     │   ╭─────╮   │ ← Green ring when enabled
|     │   │ 👤  │   │
|     │   ╰─────╯   │
|     │ #OpenToInvite│ ← Optional badge text
|     └─────────────┘       |
|                           |
|   "Open to Invitations"   |
|   Free collabs welcome    |
+---------------------------+
```

The badge will be visible:
1. In the creator listings (Influencers page)
2. On the creator's profile page
3. On the creator's dashboard avatar

## Database Changes

Add a new column to the `creator_profiles` table:

| Column | Type | Default | Description |
|--------|------|---------|-------------|
| `open_to_invitations` | boolean | false | Whether creator accepts experience-based collaborations |

## Files to Modify

### 1. Database Migration
- Add `open_to_invitations` column to `creator_profiles`

### 2. Creator Dashboard - Profile Settings
**File:** `src/components/creator-dashboard/ProfileTab.tsx`
- Add a toggle switch in the Preferences/Settings section
- Include description explaining the feature
- Save state to database

### 3. Profile Avatar Component
**File:** `src/components/ProfileAvatar.tsx`
- Add optional `showOpenToInvitations` prop
- When true, render a green ring/frame around the avatar
- Include small badge overlay

### 4. Creator Profile Page
**File:** `src/pages/CreatorProfile.tsx`
- Fetch and display `open_to_invitations` status
- Show badge around profile picture when enabled
- Add visual indicator near the name

### 5. Creator Listings Page
**File:** `src/pages/Influencers.tsx`
- Fetch `open_to_invitations` field with creator data
- Display green ring on creator cards when enabled
- (Optional) Add filter to show only "Open to Invitations" creators

## Implementation Steps

### Step 1: Database Migration
```sql
ALTER TABLE public.creator_profiles 
ADD COLUMN open_to_invitations boolean DEFAULT false;
```

### Step 2: Update ProfileAvatar Component
Add a green ring/border effect:

```typescript
interface ProfileAvatarProps {
  // ... existing props
  openToInvitations?: boolean;
}

// Add a green ring with optional badge
<Avatar className={cn(
  "relative",
  openToInvitations && "ring-2 ring-green-500 ring-offset-2 ring-offset-background",
  className
)}>
```

### Step 3: Add Toggle in Creator Dashboard
Add to ProfileTab.tsx in the settings section:

```typescript
// State
open_to_invitations: false,

// Toggle UI
<div className="flex items-center justify-between">
  <div>
    <Label>Open to Invitations</Label>
    <p className="text-sm text-muted-foreground">
      Show brands you're open to free collabs in exchange for experiences
    </p>
  </div>
  <Switch
    checked={profile.open_to_invitations}
    onCheckedChange={(checked) => 
      setProfile({ ...profile, open_to_invitations: checked })
    }
  />
</div>
```

### Step 4: Update Creator Listings
In Influencers.tsx, show the badge on creator cards:

```typescript
// In the card image container
{creator.open_to_invitations && (
  <div className="absolute top-3 left-3 z-10">
    <Badge className="bg-green-500 text-white text-[10px] px-1.5">
      Open to Invites
    </Badge>
  </div>
)}
```

### Step 5: Update Creator Profile Page
Show the green ring and add a tooltip explaining the feature.

## Expected Behavior

**Creator Flow:**
1. Go to Dashboard → Profile
2. Find "Open to Invitations" toggle in preferences
3. Turn it ON
4. See confirmation that profile now shows the badge
5. Badge appears around profile picture everywhere

**Brand Flow:**
1. Browse creators in the Influencers page
2. See green "Open to Invites" badge on some creator cards
3. Understand these creators accept barter/trade deals
4. Can reach out for experience-based collaborations

## Technical Details

### Badge Styles
- Ring color: `ring-green-500` (Tailwind green)
- Ring width: 2-3px
- Ring offset: 2px (so it doesn't overlap the image)
- Small badge: Green background with white text

### Data Flow
1. Creator toggles setting → saves to `creator_profiles.open_to_invitations`
2. Profile pages fetch this field → display badge if true
3. Listings page includes field in query → show badge on cards

