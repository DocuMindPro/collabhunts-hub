

## Add Package Descriptions Inside the Dropdown

### Approach

Instead of cluttering the UI with extra panels, we'll add a **one-line hint** directly inside each dropdown option. This way creators immediately understand the difference before even selecting. The existing "Package Info" card (lines 219-225) already shows the full description after selection, so the dropdown hints just need to be short and clear.

### What It Looks Like

Each dropdown item will show:
- **Package name** (bold/normal weight)
- **Short hint** underneath in smaller, muted text

For example:
- **Unbox & Review** — "Product shipped to you, review from home"
- **Social Boost** — "Visit the brand's venue, create content on-site"
- **Meet & Greet** — "Appear at the brand's location, meet fans"
- **Custom Experience** — "Flexible, bespoke collaboration you negotiate"

### Technical Details

**File: `src/components/creator-dashboard/ServiceEditDialog.tsx`**

1. Add a new constant `PACKAGE_HINTS` mapping each type to a short creator-facing hint:
   ```
   const PACKAGE_HINTS: Record<string, string> = {
     unbox_review: "Product shipped to you — review from home",
     social_boost: "Visit the brand's venue & create content",
     meet_greet: "Appear at the brand's location, meet fans",
     custom: "Flexible collab — you negotiate the details",
   };
   ```

2. Update the `SelectItem` rendering (lines 209-213) to show the hint below the name:
   - Replace the plain text with a two-line layout using a flex column
   - Name in normal weight, hint in `text-xs text-muted-foreground`
   - Use `className="h-auto py-2"` on `SelectItem` so the taller items don't get clipped

This keeps the dropdown clean — just 2 lines per option — while giving creators instant clarity about what each package involves (at-home vs. on-location).
