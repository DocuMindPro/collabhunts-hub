
# Add Floating Debug Button for Native App

## The Problem

Native Android apps don't have a URL bar. The Debug page exists at `/debug` but there's no way to navigate to it when the main app shows a white screen.

## The Solution

Add a **floating debug button** that appears in the corner of the screen on native platforms only. This button will be visible even if the rest of the app is frozen/white.

## Implementation

### Create New Component: `NativeDebugButton.tsx`

A simple floating button that:
- Only shows on native platforms (Android/iOS)
- Uses inline styles (no CSS dependencies that might fail)
- Positioned in bottom-right corner
- Always visible with high z-index
- Navigates directly to `/debug` route

```text
+------------------------+
|                        |
|    (White Screen)      |
|                        |
|                        |
|                   [🔧] | <-- Floating button
+------------------------+
```

### Modify `App.tsx`

Add the floating debug button inside the Router but outside the Routes, so it appears on every page.

```tsx
<Router>
  <NativeDebugButton />  {/* NEW - always visible */}
  <PushNotificationProvider>
    ...
  </PushNotificationProvider>
</Router>
```

## Technical Details

### File 1: `src/components/NativeDebugButton.tsx` (NEW)

```tsx
import { Capacitor } from '@capacitor/core';
import { useNavigate } from 'react-router-dom';

const NativeDebugButton = () => {
  const navigate = useNavigate();
  
  // Only show on native platforms
  if (!Capacitor.isNativePlatform()) {
    return null;
  }

  return (
    <button
      onClick={() => navigate('/debug')}
      style={{
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        width: '50px',
        height: '50px',
        borderRadius: '50%',
        backgroundColor: '#f97316',
        color: '#fff',
        border: 'none',
        fontSize: '24px',
        zIndex: 99999,
        boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
      }}
    >
      🔧
    </button>
  );
};
```

### File 2: `src/App.tsx` (MODIFY)

Add import and use the button inside Router.

## Why This Works

| Problem | Solution |
|---------|----------|
| No URL bar in APK | Floating button always visible |
| White screen blocks navigation | Button uses z-index 99999, renders above everything |
| CSS might fail | Uses inline styles only |
| Only need for debugging | Only shows on native platforms |

## Files to Create/Modify

| File | Action |
|------|--------|
| `src/components/NativeDebugButton.tsx` | CREATE |
| `src/App.tsx` | MODIFY - add import and component |

## Testing Steps

1. Push changes to GitHub
2. Build new APK
3. Install on BlueStacks/device
4. Even if screen is white, you should see an orange 🔧 button in bottom-right corner
5. Tap the button
6. Debug page opens with all diagnostic info
7. Screenshot and share with me

## Visual Preview

```
+---------------------------+
|  CollabHunts              |
|                           |
|  [WHITE SCREEN / FROZEN]  |
|                           |
|                           |
|                      [🔧] |  <-- This orange button
+---------------------------+
```

The button will be visible no matter what state the app is in, giving you direct access to the debug console.
