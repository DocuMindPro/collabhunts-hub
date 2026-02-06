

# Add Platform Features Showcase to Homepage

## Overview
Add a new visually stunning "Platform Features" section between the Benefits section and Testimonials. This section will highlight the three key platform capabilities -- AI-Drafted Agreements, Smart Calendar, and Opportunity Board -- using a creative split-screen bento layout with animated visual mockups.

## New Component: `src/components/home/PlatformFeatures.tsx`

A dedicated section with three feature showcases in an alternating layout (feature left / visual right, then flipped). Each feature card includes:

### Feature 1: AI-Drafted Agreements
- Icon: `FileCheck` from lucide
- Title: "AI-Drafted Agreements"
- Description: "Finalize every deal with a professional, AI-generated agreement. Choose from templates like Unbox & Review, Social Boost, or Meet & Greet -- customized to your exact terms."
- Visual: A stylized mini "agreement card" mockup showing a document icon, checkmarks for "Deliverables defined", "Timeline set", "Price confirmed", with a subtle green "Signed" badge -- all built with HTML/CSS, no images needed

### Feature 2: Smart Calendar
- Icon: `CalendarDays` from lucide
- Title: "Never Miss a Collab"
- Description: "Every signed agreement automatically appears on your calendar with color-coded events and smart reminders at 7 days, 1 day, and day-of. Stay organized effortlessly."
- Visual: A mini calendar mockup with 3 colored dots on different dates representing booking types, plus a small notification bell badge

### Feature 3: Opportunity Board
- Icon: `Megaphone` from lucide
- Title: "Post & Discover Opportunities"
- Description: "Brands post gigs with budgets and requirements. Creators browse and apply in one click. The fastest way to match for your next event."
- Visual: A mini opportunity card mockup showing a title, budget badge, and "Apply" button

## Layout Design
- Uses a 2-column asymmetric bento grid on desktop (text + visual mockup side by side)
- Row 1: Text left, visual right (Agreement)
- Row 2: Visual left, text right (Calendar) -- alternating for visual rhythm
- Row 3: Full-width card with text left and visual right (Opportunities)
- Each row uses `GlowCard` with different glow colors (primary, secondary, accent)
- All wrapped in `AnimatedSection` with staggered delays
- Mobile: stacks to single column, visual mockups sit below text

## Changes to `src/pages/Index.tsx`
- Import the new `PlatformFeatures` component
- Place it between the Benefits section and TestimonialCarousel (line ~303)
- Section heading: "Built for Seamless Collabs" with subtitle "Every tool you need, from first message to final delivery"

## Visual Details
- Section background: `bg-background` with subtle decorative blur circles
- Mini mockup cards use `bg-muted/50` with `border border-border/30` for a subtle, layered look
- Animated entrance: text slides from left, visual slides from right (alternating)
- Hover effects on the visual mockups: slight scale-up and border glow
- Color-coded dots on calendar: primary (bookings), accent (agreements), secondary (deadlines)

## Files

| File | Action |
|------|--------|
| `src/components/home/PlatformFeatures.tsx` | Create -- new features showcase component |
| `src/pages/Index.tsx` | Edit -- import and place PlatformFeatures between Benefits and Testimonials |

