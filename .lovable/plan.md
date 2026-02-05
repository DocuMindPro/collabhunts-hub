
# Generalize Package Descriptions

## The Problem
Current package descriptions lock in specific numbers that should be negotiable:
- "1 Instagram Reel", "1 TikTok video" 
- "3 hours at venue", "1-2 hours"
- "1 week before", "2 weeks before"

Since the final agreement is between creator and brand, these specifics shouldn't be set in stone on the public-facing cards.

## Proposed Solution
Keep the **structure and guidance** (what types of deliverables, what phases exist) but remove the **specific quantities and durations**. The cards become a "menu of possibilities" rather than a fixed contract.

### Before → After Examples

**Phase Titles:**
- "During Visit (1-2 hours)" → "During Visit"
- "Pre-Event (1 week before)" → "Pre-Event"
- "During Event (3 hours)" → "During Event"

**Phase Items:**
- "1 Instagram Reel (permanent post)" → "Instagram Reel (permanent post)"
- "1 TikTok video (same content)" → "TikTok video"
- "1 announcement video" → "Announcement video"
- "1 recap video" → "Recap video"

**Also Remove:**
- The `durationRange` display from the UI (the "1-2 hours" / "2-4 hours" under price)

### What Stays
- Package names and general descriptions
- Phase structure (Pre/During/Post)
- Types of deliverables (Reels, TikToks, venue visits, etc.)
- "Ideal for" section
- Upsells section

---

## Files to Modify

### 1. `src/config/packages.ts`
Update the phase titles and items to remove specific counts/timeframes:

**Unbox & Review:**
- "Content Posted" items: "Reel/TikTok (permanent post)" instead of "1 Reel/TikTok"

**Social Boost:**
- Phase title: "During Visit" instead of "During Visit (1-2 hours)"
- Items: "Instagram Reel (permanent post)", "TikTok video" (no "1" prefix)

**Meet & Greet:**
- Phase titles: "Pre-Event", "During Event", "Post-Event" (no timeframes)
- Items: "Announcement video", "Recap video" (no "1" prefix)

**Live PK Battle:**
- Phase titles: "Pre-Event", "During Event", "Post-Event" (no "2 weeks", "2-6 hours")
- Items: generalized wording

### 2. `src/components/brand/PackageCard.tsx`
- Remove the `durationRange` display section (the clock icon with hours)
- Keep everything else as-is

---

## Result
Brands see the **type of experience** they can expect without being locked into specific quantities. The actual deliverables (how many posts, exact duration) get negotiated and finalized in the agreement between creator and brand.
