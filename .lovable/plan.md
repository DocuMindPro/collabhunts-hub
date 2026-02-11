

## "My Profile" Tab: Live Preview with Edit Drawer

### Concept

The "Profile" tab becomes "My Profile" and works like Instagram or LinkedIn: **creators see their profile exactly as brands see it**. When they want to make changes, they tap an "Edit" button that slides open a drawer with the current editor.

This way, the default experience is always "this is what people see" -- no extra buttons, no mode toggles. Creators naturally notice what needs improving because they're looking at the real thing.

### How It Works

1. **Creator opens "My Profile" tab** -- they see their full public profile: cover images, avatar, bio, badges, social links, packages, reviews. Exactly what a brand sees on `/creator-profile/:id`.

2. **They spot something to fix** -- they tap the floating "Edit Profile" pencil button (bottom-right on mobile, top-right on desktop).

3. **A side drawer slides open** -- the current accordion editor (media, details, privacy, socials, etc.) appears in a Sheet panel. They make changes, save, close the drawer, and the preview refreshes automatically.

### Architecture

Rather than duplicating the entire CreatorProfile page, we extract the profile display logic into a reusable component.

**New file: `src/components/creator-dashboard/ProfilePreview.tsx`**
- Accepts a `creatorProfileId` prop
- Fetches the same data as CreatorProfile (profile, socials, services, reviews, portfolio)
- Renders the same layout (cover images, info section, packages, reviews) but without the Navbar/Footer wrapper and without the "Message Creator" / "Book" action buttons
- Shows an "Edit Profile" floating button instead

**Modified file: `src/components/creator-dashboard/ProfileTab.tsx`**
- Wraps the current editor content inside a Sheet component
- The default view renders `<ProfilePreview />` 
- The "Edit" button opens the Sheet with the existing accordion editor inside
- When the Sheet closes after saving, the preview re-fetches to show updated data

**Modified file: `src/pages/CreatorDashboard.tsx`**
- Rename "Profile" tab label to "My Profile"

### Visual Layout

```text
+--------------------------------------------------+
|  My Dashboard                                     |
|  Overview | My Profile | My Packages | ...        |
+--------------------------------------------------+
|                                                    |
|  [Cover Image 1] [Cover Image 2] [Cover Image 3]  |
|                                                    |
|  (Avatar)  Creator Name          [Vetted] [VIP]    |
|            Beirut, Lebanon                         |
|            Fashion | Beauty | Lifestyle            |
|            "Your bio text here..."                 |
|            @instagram 50K  @tiktok 120K            |
|                                                    |
|  --- Packages ---                                  |
|  [Unbox & Review - $300]  [Social Boost - $500]    |
|                                                    |
|  --- Reviews ---                                   |
|  Brand X: "Great creator!" *****                   |
|                                                    |
|                              [pencil icon]  <-- floating edit button
+--------------------------------------------------+
```

Pressing the pencil opens:

```text
                        +----------------------------+
                        |  Edit Profile         [X]  |
                        +----------------------------+
                        |  > Your Media              |
                        |  > Profile Details         |
                        |  > Privacy & Visibility    |
                        |  > Social Accounts         |
                        |  > VIP Badge               |
                        |  > Team Access             |
                        |                            |
                        |  [Save Changes]            |
                        +----------------------------+
```

### Technical Details

**`src/components/creator-dashboard/ProfilePreview.tsx`** (new)
- Reuses the same data-fetching pattern from CreatorProfile.tsx (profile, socials, services with deliverables, reviews, portfolio)
- Renders cover images grid, avatar + info section, badge row, social icons, package cards, and reviews
- Strips out brand-specific actions (Message, Book, Save) since the creator is viewing their own profile
- Accepts an `onEdit` callback prop to trigger the edit drawer
- Accepts a `refreshKey` prop to re-fetch when edits are saved

**`src/components/creator-dashboard/ProfileTab.tsx`** (modified)
- Import Sheet from ui/sheet
- Wrap the existing accordion editor inside `<SheetContent>` 
- Default render: `<ProfilePreview />` with a floating edit button
- On save: close Sheet, increment refreshKey to trigger preview re-fetch
- The sticky "Save Changes" footer moves inside the Sheet

**`src/pages/CreatorDashboard.tsx`** (modified)
- Change tab label from "Profile" to "My Profile"

