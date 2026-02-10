

## Differentiate Quality Messaging Sections + Remove Creator Card from Brand Page

### Problems
1. Homepage and Brand page have nearly identical copy -- same headlines, same body text, same pills
2. Brand page has a "For Creators" card which doesn't belong on a page targeting brands

### Changes

**1. Brand Page (`src/pages/Brand.tsx`) -- Lines 300-365**

Replace the current dual-card section with a single, brand-focused section. No "For Creators" card.

- **New headline**: "Your Message Gets Seen. Every Time."
- **New subtitle**: "Unlike social media where your DM competes with thousands of fan messages, CollabHunts is a business-only platform -- creators here expect brand inquiries and respond fast."
- **Single GlowCard layout** (full-width, not two columns) with three feature rows:
  - ShieldCheck icon + "Vetted Creators" -- "Every creator is reviewed and approved before joining the platform."
  - Zap icon + "Fast Response Times" -- "Creators only receive business inquiries here, so they respond quickly -- no inbox clutter."
  - MessageSquare icon + "Business-Only Inbox" -- "No fans, no spam, no noise. Your collaboration request stands out from day one."
- Remove the second GlowCard (the "For Creators" / "Why Creators Respond Fast" card entirely)

**2. Homepage (`src/pages/Index.tsx`) -- Lines 320-385**

Keep the dual-card layout (both perspectives make sense on the homepage) but rewrite the copy so it's distinct from the Brand page:

- **New headline**: "No Spam. No Fans. Just Business."
- **New subtitle**: "CollabHunts is a professional collaboration platform -- every conversation starts with real intent."
- **Brand card**: Headline: "Your DMs Actually Get Read". Body: "Stop competing with thousands of fan messages. On CollabHunts, creators only receive business inquiries -- your pitch lands in a focused inbox, not a crowded feed." Pills: "Vetted Creators", "Priority Inbox", "Quick Replies"
- **Creator card**: Headline: "Only Serious Offers in Your Inbox". Body: "Forget sifting through thousands of irrelevant DMs. Every message you receive here is from a registered brand with real collaboration intent -- meaning less time filtering, more time earning." Pills: "Registered Brands", "Zero Spam", "Higher Deal Rate"

### Files to Modify
| File | Change |
|------|--------|
| `src/pages/Brand.tsx` | Replace dual-card section with single brand-focused section, remove "For Creators" card |
| `src/pages/Index.tsx` | Rewrite headlines and body copy to be distinct from Brand page |

### No new files, no new dependencies, no database changes.

