

# Update Live Competition Package

## Overview
Replace the current Option A/B format with a single, focused description that clearly explains the **Creator PK Battle** concept - where live streamers compete at physical venues while fans attend in person.

## What Is a "PK Battle"?
A PK (Player Kill) is a popular live streaming format where two creators go head-to-head for 3-4 minutes, collecting points/diamonds from supporters. The one with the highest score wins. This package brings these battles to real-world venues.

## Changes to Live Competition Package

### Remove
- Option A: "Creator vs Creator Challenge"
- Option B: "Fan Competition/Tombola"
- The `variants` array entirely

### Add
A clear **phases structure** (Pre-Event → During Event → Post-Event) that explains:

| Phase | Details |
|-------|---------|
| **Pre-Event (2 weeks)** | Event announcement, ticket sales promotion, creator hype content |
| **During Event (2-6 hours)** | Live PK battles at venue, in-person audience experience, dual-screen setup (live stream + in-person) |
| **Post-Event** | Highlight reels, recap content, testimonials |

### Updated Description
*"Live PK battles between creators at your venue - fans buy tickets to watch in person while streaming audiences tune in online"*

### Updated Includes
- 2-week pre-event promotion & ticket sales
- Live PK battles at venue (3-4 min rounds)
- In-person fan experience with live viewing setup
- Dual exposure: live stream + venue foot traffic
- Full event management by CollabHunts
- Revenue share from ticket sales

### Updated Ideal For
- Restaurants, Cafes, Entertainment venues, Malls

## Revenue Model Explained
The card will clearly communicate the win-win-win model:
- **Venue**: Gets foot traffic + advertising exposure
- **Creators**: Earn from event + their normal PK earnings
- **CollabHunts**: Event management fee from ticket revenue
- **Venue bonus**: Optional cut from ticket sales

## Files to Modify

| File | Changes |
|------|---------|
| `src/config/packages.ts` | Remove `variants`, add `phases`, update description and includes |
| `src/components/brand/PackageCard.tsx` | No changes needed - already handles phases display |

