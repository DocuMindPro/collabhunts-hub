

## Add "Quality Messaging" Selling Point to Homepage and Brand Page

### The Key Insight to Communicate

This is a unique value proposition that no section currently addresses:

**For Brands:** Creators on CollabHunts are vetted and respond fast. Unlike social media where your DM gets buried under thousands of fan messages, here every message is a business inquiry -- so creators actually see and reply to you.

**For Creators:** No more drowning in thousands of useless DMs from fans and spam. On CollabHunts, every message is from a verified brand with a real business intent. Fewer messages, but each one has a much higher chance of turning into a paid collaboration.

### Design: Dual-Perspective Section

A split-view section with two GlowCards side by side -- one for brands, one for creators -- each explaining the messaging quality benefit from their perspective. Visually distinct with brand/creator color coding.

### Changes

**1. Homepage (`src/pages/Index.tsx`)**

Add a new section between the "Zero Fees + Privacy" section and the "Benefits" section. Layout:

- Section title: "Business Messages Only. No Noise."
- Two-column grid with GlowCards:
  - **Left card (For Brands):** Icon: ShieldCheck. Headline: "Creators That Actually Reply". Body explains vetted creators, fast response times, business-only inbox means your message gets seen. Trust pills: "Vetted Profiles", "Fast Responses", "Business-Only Inbox".
  - **Right card (For Creators):** Icon: Zap. Headline: "Fewer Messages, Higher Conversions". Body explains no fan spam, only verified brand inquiries, every message is a potential paid collab. Trust pills: "Verified Brands", "No Fan Spam", "Higher Conversion Rate".

**2. Brand Page (`src/pages/Brand.tsx`)**

Add a similar section after the Benefits section and before the Zero Fees section. Same dual-perspective layout but with slightly different copy tailored to the brand audience -- emphasizing why this matters for brands specifically, while also showing the creator benefit (which explains WHY creators respond fast).

### Technical Details

**Files to modify:**
- `src/pages/Index.tsx` -- Add new section (~40 lines) between lines 317-320
- `src/pages/Brand.tsx` -- Add new section (~40 lines) between lines 298-301

**Components used (all existing):**
- `AnimatedSection` for scroll animations
- `GlowCard` for the glassmorphism card effect
- Lucide icons: `ShieldCheck`, `Zap`, `MessageSquare`, `CheckCircle`
- No new dependencies, no new files, no database changes

