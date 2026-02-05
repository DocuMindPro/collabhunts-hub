
# Communicate Flexible Deliverables

## The Problem
Currently, listing "Instagram Reel" and "TikTok video" as separate items implies both are required. You want to communicate that these are **options/examples** that get finalized during the agreement negotiation.

## Proposed Solutions

### Option A: Add a "Typical Deliverables" Header (Recommended)
Add a small intro text before the phases that signals flexibility:

**Before each phase section, add:**
> "Typical deliverables may include:"

This makes it clear that items listed are examples of what **could** be included, not a fixed checklist.

### Option B: Use "and/or" Language in Items
Combine related content types into flexible statements:
- "Instagram Reel (permanent post)" + "TikTok video" → **"Social content (Reels and/or TikToks)"**
- Keep the format general but informative

### Option C: Add a Footer Note
Add a small disclaimer at the bottom of each card:
> "*Exact deliverables finalized in agreement"

---

## Recommended Approach: Combine A + C

### Changes to Make

**1. `src/components/brand/PackageCard.tsx`**
Add a subtle intro line before the phases section:
```
Typical deliverables may include:
```

Add a footer note after the phases:
```
*Exact deliverables finalized in agreement
```

**2. `src/config/packages.ts`**
Simplify content-related items by using flexible wording:
- Social Boost "Content Delivered" phase:
  - Current: "Instagram Reel (permanent post)", "TikTok video"
  - New: "Social content (Reels, TikToks, or both)"
  
- Unbox & Review "Content Posted" phase:
  - Current: "Reel/TikTok (permanent post)"
  - Keep as-is (already implies flexibility with the slash)

---

## Visual Result

```text
┌─────────────────────────────────┐
│  Social Boost                   │
│  Custom pricing                 │
│                                 │
│  Typical deliverables include:  │  ← New header
│                                 │
│  DURING VISIT                   │
│  ✓ Creator visits venue         │
│  ✓ Captures content on-site     │
│                                 │
│  CONTENT DELIVERED              │
│  ✓ Social content (Reels,       │  ← Flexible wording
│    TikToks, or both)            │
│  ✓ Tag & location in all posts  │
│                                 │
│  *Finalized in agreement        │  ← New footer
│                                 │
│  [Find Creators]                │
└─────────────────────────────────┘
```

---

## Technical Details

### File: `src/components/brand/PackageCard.tsx`
- Add intro text before the phases map: `<p className="text-xs text-muted-foreground italic mb-2">Typical deliverables may include:</p>`
- Add footer note after phases: `<p className="text-xs text-muted-foreground/70 italic mt-2">*Exact deliverables finalized in agreement</p>`

### File: `src/config/packages.ts`
- Update `social_boost.phases[1].items` (Content Delivered) to consolidate social content items
- Update `meet_greet.phases[2].items` (Post-Event) similarly if needed
- Keep process-related items unchanged (venue visits, interactions, etc.)

---

## Summary
This approach:
1. **Keeps the structure** - Brands still see the types of deliverables and phases
2. **Signals flexibility** - Clear language that these are examples, not fixed requirements
3. **Sets expectations** - Footer reminds them that the agreement is where specifics get locked in
