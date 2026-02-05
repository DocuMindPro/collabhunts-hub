

# Homepage Hero Section Refresh

## Overview

Update the homepage hero section to reflect the current zero-fee discovery marketplace model, remove outdated payment/escrow references, and create a more compelling slogan that highlights the platform's value proposition.

---

## Current Issues

| Element | Current (Outdated) | Problem |
|---------|-------------------|---------|
| Event Types | Includes "Competition" | Package was removed |
| Stats | "15% Platform Fee Only" | Now zero transaction fees |
| Stats | "50% Escrow Protection" | No escrow system |
| Benefits | "Payment Protection" with escrow | No escrow system |
| How It Works | "secure with 50% deposit" | No managed payments |

---

## Proposed Changes

### 1. Main Headline & Rotating Words

**Current:**
```
Creator Events [Made Easy / In Real Life / At Your Venue / That Drive Traffic]
```

**Proposed Options:**
```
Option A: "Find VIP Creators" [For Your Brand / For Live Events / Near You / In Minutes]

Option B: "Creator Collabs" [Made Simple / Start Here / Zero Fees / That Convert]

Option C: "Hunt Your Creator" [For Events / For Content / For Growth / Today]
```

### 2. Subtitle

**Current:**
> "Book creators for live fan experiences at your venue. Drive foot traffic, create buzz, and get professional content."

**Proposed:**
> "Discover vetted creators for brand events, content, and collaborations. Browse profiles, connect directly, and negotiate your own terms — zero platform fees."

### 3. Event Types (Quick Filters)

**Current:**
```tsx
["Meet & Greet", "Workshop", "Competition", "Brand Activation", "Private Event"]
```

**Proposed (removed Competition, aligned with packages):**
```tsx
["Unbox & Review", "Social Boost", "Meet & Greet", "Brand Activation", "Custom Experience"]
```

### 4. Stats Section

**Current:**
- 100% Verified Creators
- 15% Platform Fee Only
- 50% Escrow Protection

**Proposed:**
- **100%** Vetted Creators
- **$0** Transaction Fees
- **VIP** Creator Options

### 5. Benefits Section

**Current:**
```tsx
{ icon: Sparkles, title: "Payment Protection", description: "50% escrow system protects both parties" }
```

**Proposed:**
```tsx
{ icon: Sparkles, title: "Direct Deals", description: "Negotiate and pay creators directly — no middleman fees" }
```

### 6. How It Works Steps

**Current Step 2:**
> "Select a date, choose a package, and secure with 50% deposit"

**Proposed Step 2:**
> "Message creators, discuss terms, and finalize with an AI-drafted agreement"

---

## File to Modify

**`src/pages/Index.tsx`**

### Line-by-Line Changes

**Lines 110-112** - Update event types:
```tsx
const eventTypes = [
  "Unbox & Review", "Social Boost", "Meet & Greet", "Brand Activation", "Custom Experience"
];
```

**Lines 114** - Update rotating words:
```tsx
const rotatingWords = ["Made Simple", "Zero Fees", "Near You", "That Convert"];
```

**Lines 116-132** - Update steps:
```tsx
const steps = [
  {
    icon: Search,
    title: "Discover Creators",
    description: "Browse vetted creators by location, niche, and availability"
  },
  {
    icon: Calendar,
    title: "Connect Directly",
    description: "Message creators, discuss terms, and finalize with an AI-drafted agreement"
  },
  {
    icon: MapPin,
    title: "Collab & Grow",
    description: "Execute your event or campaign and watch your brand grow"
  }
];
```

**Lines 134-139** - Update benefits:
```tsx
const benefits = [
  { icon: Users, title: "Drive Foot Traffic", description: "Creators bring their followers directly to your venue" },
  { icon: Star, title: "Vetted & VIP Creators", description: "All creators are reviewed; VIP creators go the extra mile" },
  { icon: MapPin, title: "Local Focus", description: "Find creators in your city ready for in-person collabs" },
  { icon: Sparkles, title: "Zero Platform Fees", description: "Negotiate and pay creators directly — no middleman" },
];
```

**Lines 162-167** - Update headline:
```tsx
<h1 className="text-5xl md:text-6xl lg:text-7xl font-heading font-bold leading-tight">
  Find Your Creator{" "}
  <span className="bg-gradient-accent bg-clip-text text-transparent">
    <RotatingText words={rotatingWords} />
  </span>
</h1>
```

**Lines 171-174** - Update subtitle:
```tsx
<p className="text-xl text-muted-foreground">
  Discover vetted creators for brand events, content, and collaborations. 
  Connect directly, negotiate your own terms — zero platform fees.
</p>
```

**Lines 214-227** - Update stats:
```tsx
<div className="flex items-center gap-6 pt-4">
  <div className="text-center">
    <p className="text-2xl font-bold text-primary">100%</p>
    <p className="text-xs text-muted-foreground">Vetted Creators</p>
  </div>
  <div className="text-center">
    <p className="text-2xl font-bold text-primary">$0</p>
    <p className="text-xs text-muted-foreground">Transaction Fees</p>
  </div>
  <div className="text-center">
    <p className="text-2xl font-bold text-primary">VIP</p>
    <p className="text-xs text-muted-foreground">Creator Options</p>
  </div>
</div>
```

---

## Summary

| Section | Before | After |
|---------|--------|-------|
| Headline | "Creator Events" | "Find Your Creator" |
| Rotating Words | "Made Easy", etc. | "Made Simple", "Zero Fees", "Near You", "That Convert" |
| Subtitle | Venue/booking focused | Discovery/marketplace focused |
| Event Types | Includes Competition | Aligned with current packages |
| Stats | Fee % + Escrow % | Vetted + $0 Fees + VIP |
| Benefits | Payment Protection | Zero Platform Fees |
| Steps | Deposit/escrow language | Direct messaging/agreement language |

