

## Upgrade Template Selection Cards to Professional Design

### What Changes
The template selection step (Step 1) in the agreement dialog gets a visual overhaul:

1. **Reorder templates** -- Custom Agreement moves to the top as a full-width featured card
2. **Replace emoji icons with Lucide icons** -- Professional SVG icons instead of childish emojis
3. **Elevated card design** -- Gradient accents, subtle shadows, and polished hover states

### Technical Details

**File: `src/config/agreement-templates.ts`**
- Remove the `icon` emoji field from each template (no longer used)

**File: `src/components/agreements/SendAgreementDialog.tsx`** (lines 310-323)
- Import Lucide icons: `Package, Smartphone, Users, Video, PenTool`
- Create an icon map: `{ custom: PenTool, unbox_review: Package, social_boost: Smartphone, meet_greet: Users, content_creation: Video }`
- Reorder rendering: Custom first (full-width featured card with accent border), then the remaining 4 in a 2x2 grid
- Card styling upgrade:
  - Each card gets a colored icon container (rounded background with matching icon color)
  - Subtle shadow on hover with smooth transition
  - Custom Agreement card spans full width with a "Most Flexible" badge and a left accent border
  - Small arrow indicator on hover

### Visual Layout

```text
+--------------------------------------------------+
| [PenTool]  Custom Agreement     [Most Flexible]   |  <-- full width, accent border
|            Start from scratch                      |
+--------------------------------------------------+

+------------------------+  +------------------------+
| [Package]              |  | [Smartphone]           |
| Unboxing & Review      |  | Social Media Boost     |
| Product unboxing...    |  | Event attendance...    |
+------------------------+  +------------------------+

+------------------------+  +------------------------+
| [Users]                |  | [Video]                |
| Meet & Greet           |  | Content Creation       |
| Fan interaction...     |  | Custom branded...      |
+------------------------+  +------------------------+
```

### Files Changed
- `src/components/agreements/SendAgreementDialog.tsx` -- Redesign template cards with Lucide icons, reorder, professional styling
- `src/config/agreement-templates.ts` -- Keep `icon` field for backward compatibility but it won't be rendered in the dialog anymore
