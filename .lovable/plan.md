

## Fix: Eliminate Brief Flash of Old Text Logo on Reload

### Problem
The `Logo` component in `src/components/Logo.tsx` initializes with `logoUrl = null`. While it fetches the logo URL from the database (takes ~0.5s), it renders an orange gradient "Collab Hunts" text as a fallback. Once the database responds, it swaps to the real logo image -- causing a visible flash.

### Solution
Instead of showing the text fallback during loading, show the local `/app-icon.png` as the immediate fallback. This way the new logo appears instantly, and when the database URL loads, it seamlessly replaces it (same logo, no flash).

### What Will Change

| File | Change |
|------|--------|
| `src/components/Logo.tsx` | Use `/app-icon.png` as the default fallback image instead of the text-based "Collab Hunts" while the database logo URL loads. Only show the text fallback if the image itself fails to load. |

### Technical Detail

The component will render the local `app-icon.png` immediately on mount, then swap to the database URL once fetched. Since both are the same logo, there will be no visible flash. The text fallback will only appear if both the database fetch and the local image fail.

