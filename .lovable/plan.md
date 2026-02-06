

# Remove Debug Page & Create Professional Loading Screen

## What Changes

1. **Remove the Debug page and button** -- Delete the debug route, the floating debug button, and clean up imports in `App.tsx`.

2. **Redesign the pre-React loading screen in `index.html`** -- Replace the current hourglass + debug buttons with a creative, professional loading animation featuring a camera emoji (representing collaboration/content creation) with a spinning ring around it. Clean, branded, no debug buttons visible.

3. **Update `PageLoader.tsx`** -- Make the in-app React loading screen match the new branding with the same camera/collaboration theme.

4. **Clean up `NativeLoadingScreen.tsx`** -- Update to match the new loading design.

## Technical Details

### Files to modify:

**`src/App.tsx`**
- Remove `import Debug from "./pages/Debug"`
- Remove `import NativeDebugButton from "./components/NativeDebugButton"`
- Remove the `<NativeDebugButton />` component from the render tree
- Remove the `/debug` route from both `NativeAppRoutes` and `WebAppRoutes`

**`index.html`**
- Replace the pre-React loader content: remove the hourglass emoji, "Show Debug Info" and "Test Bundle Fetch" buttons
- New design: a camera emoji with a CSS-animated spinning ring around it, "CollabHunts" brand name, and a subtle "Preparing your experience..." tagline
- Keep the error-handling scripts (they still serve a purpose for diagnosing failures), but hide the debug buttons -- they only appear if React fails to mount after 10 seconds
- Clean, dark background with the brand orange accent color

**`src/components/PageLoader.tsx`**
- Update with a camera emoji and branded styling to match the new loading screen

**`src/components/NativeLoadingScreen.tsx`**
- Update to use the camera theme consistently

### Files to delete:
- `src/pages/Debug.tsx`
- `src/components/NativeDebugButton.tsx`

### Loading Screen Design

```text
+----------------------------------+
|                                  |
|                                  |
|         [spinning ring]          |
|           📸 (camera)            |
|         [/spinning ring]         |
|                                  |
|          CollabHunts             |
|   Preparing your experience...   |
|                                  |
|                                  |
+----------------------------------+
```

- Dark branded background (#1a1a2e)
- Spinning ring in brand orange (#F97316) with a gradient trail
- Camera emoji centered inside the ring
- Clean typography, no debug clutter
- Debug info still available but only surfaces automatically if React fails to mount (as a fallback)

