

## Make Announcement Banner Stick with Navbar on Scroll

Currently the announcement banner sits above the navbar but scrolls away, while the navbar alone is sticky. The goal is to keep both the banner and navbar pinned together at the top when scrolling.

### Approach

Move the `AnnouncementBanner` inside the navbar's sticky container so they scroll together as one unit.

### Changes

**1. `src/components/Navbar.tsx`**
- Import and render `AnnouncementBanner` above the existing nav content, but inside the sticky `<nav>` wrapper
- This way both elements share the same `sticky top-0 z-50` behavior

**2. `src/App.tsx`**
- Remove the standalone `<AnnouncementBanner />` from the top-level layout since it will now live inside Navbar

This is the cleanest approach -- it keeps both elements in a single sticky block without needing to calculate dynamic offsets or manage multiple sticky layers.

### Technical Details

In `Navbar.tsx`, the banner will render as the first child inside the `<nav>` tag (before the container div), so visually it appears above the nav links but scrolls with them as one sticky unit. No design or UX changes -- just the scroll behavior improvement.

