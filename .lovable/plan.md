
# Change "Host Events" to "Join as a Creator"

## Overview
Update all button text and relevant labels from "Host Events" to "Join as a Creator" to maintain consistent branding and messaging across the platform.

## Files to Update

### 1. src/pages/Index.tsx (Line 356)
**Current:** `Host Events`
**New:** `Join as a Creator`

### 2. src/components/Navbar.tsx (Lines 294 and 437)
Two buttons to update:
- Desktop navigation button (Line 294)
- Mobile navigation button (Line 437)

**Current:** `Host Events`
**New:** `Join as a Creator`

### 3. src/components/Footer.tsx (Line 168)
**Current:** `Host Events`
**New:** `Join as a Creator`

### 4. src/pages/Creator.tsx (Line 206)
Section heading that says "Why Host Events on CollabHunts"
**Current:** `Why Host Events on CollabHunts`
**New:** `Why Join as a Creator on CollabHunts`

### Contextual Text (No Change Needed)
The following instances use "host events" in a contextual/descriptive way and should remain unchanged:
- **Creator.tsx (Line 140):** "To host events as a creator" - describes the action
- **BrandWelcome.tsx (Lines 99-100):** "creators ready to host events at your venue" - describes what creators do
- **Brand.tsx (Line 357):** "Host events in major cities" - describes venue capability
- **AboutUs.tsx (Line 61):** "Local venues book creators to host events" - describes the platform model

## Summary Table

| File | Line | Current Text | New Text |
|------|------|--------------|----------|
| Index.tsx | 356 | Host Events | Join as a Creator |
| Navbar.tsx | 294 | Host Events | Join as a Creator |
| Navbar.tsx | 437 | Host Events | Join as a Creator |
| Footer.tsx | 168 | Host Events | Join as a Creator |
| Creator.tsx | 206 | Why Host Events on CollabHunts | Why Join as a Creator on CollabHunts |

Total: 5 text changes across 4 files
