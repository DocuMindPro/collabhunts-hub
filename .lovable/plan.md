

## Redesign Creator Profile Tab with Collapsible Menu Sections

### Current State
The Profile tab displays 6 separate cards stacked vertically (Your Media, Profile Details, Privacy & Visibility, Social Accounts, VIP Badge, Team Access), requiring significant scrolling to reach all settings.

### New Layout
Replace the flat card layout with a single-page collapsible accordion menu. Each section becomes a clickable row that expands to reveal its settings. This dramatically reduces vertical space and lets creators jump to the exact setting they need.

```text
+------------------------------------------+
| Your Media                          [v]  |
|------------------------------------------|
| Profile Details                     [v]  |
|   > Name & Bio                           |
|   > Phone Number                         |
|   > Location                             |
|   > Categories                           |
|   > Demographics & Languages             |
|------------------------------------------|
| Privacy & Visibility                [v]  |
|------------------------------------------|
| Social Accounts                     [v]  |
|------------------------------------------|
| VIP Badge                           [v]  |
|------------------------------------------|
| Team Access                         [v]  |
+------------------------------------------+
|                          [Save Changes]  |
+------------------------------------------+
```

### What Will Change

| File | Change |
|------|--------|
| `src/components/creator-dashboard/ProfileTab.tsx` | Replace 6 separate `Card` components with a single `Accordion` component containing 6 collapsible items. Each item shows an icon + label as trigger, and the existing form content as the collapsible body. The first section ("Your Media") will be open by default. |

### Technical Details

- Uses the existing `@radix-ui/react-accordion` component (already installed)
- Accordion type will be `"multiple"` so users can have several sections open at once
- Default open section: "media" (most commonly edited)
- Each `AccordionItem` trigger shows the section icon + title in a clean row
- All existing form fields, upload logic, and save functionality remain unchanged -- only the wrapping layout changes
- The sticky "Save Changes" footer stays as-is at the bottom

### Benefits
- Much less scrolling -- collapsed sections take ~40px each vs 200-400px expanded
- Creators can see all settings at a glance and expand only what they need
- Cleaner, more app-like feel consistent with the compact UI design policy

