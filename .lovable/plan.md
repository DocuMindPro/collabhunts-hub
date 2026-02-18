
# Three Issues — Root Causes and Fixes

## Issue 1: Keyboard Covering Phone Number Input

**Root cause:** The `useKeyboardScrollIntoView` hook is attached to the scrollable `div` container in both `NativeLogin.tsx` and `NativeCreatorOnboarding.tsx`. When the user taps the Phone Number input (which is rendered by `PhoneInput`), the hook fires `target.scrollIntoView({ behavior: 'smooth', block: 'center' })`. This scrolls the input to the center of the **entire viewport** — not the center of the **visible area above the keyboard**.

The real problem is that on Android, when the soft keyboard opens, the WebView viewport **does not shrink** (unless `Keyboard.resize` is set to `native` or `ionic`). This means `block: 'center'` centers the element relative to the full screen height — which puts it behind the keyboard.

Additionally, the `PhoneInput` component renders a country code dropdown. When the dropdown opens (inside the phone input), the focusin event fires on a `button` (the flag selector), not on an `INPUT`, so the scroll doesn't always trigger at the right time.

**The real fix:** Replace the generic `useKeyboardScrollIntoView` hook approach with a more reliable method:
1. Use `window.visualViewport` API (which reports the actual visible area above the keyboard) instead of `scrollIntoView`
2. Add a `visualViewport.resize` listener that fires when the keyboard appears/disappears and repositions the focused input

The fix in `useKeyboardScrollIntoView.ts`:
- Change from `scrollIntoView({ block: 'center' })` to computing the position relative to `window.visualViewport` and scrolling the container manually to ensure the input is visible above the keyboard height

---

## Issue 2: Debug Console Not Working — Add Visible Button

**Root cause:** The `NativeDebugConsole` / `NativeDebugProvider` is ONLY rendered inside `NativeAppGate` at the very end — after the user is logged in and past onboarding. The code in `NativeAppGate.tsx` is:

```tsx
return (
  <NativeDebugProvider>
    {children(selectedRole, brandProfile)}
  </NativeDebugProvider>
);
```

But `NativeLogin` and `NativeCreatorOnboarding` are rendered **before** this — they are returned directly from `NativeAppGate` without being wrapped in `NativeDebugProvider`:

```tsx
if (!user) return <NativeLogin />;          // No debug provider!
if (showOnboarding) return <NativeCreatorOnboarding ... />;  // No debug provider!
```

So `window.NATIVE_DEBUG_OPEN` is **never set** when the user is on the login or onboarding screens, because `NativeDebugProvider` hasn't mounted yet. Tapping 5 times calls `window.NATIVE_DEBUG_OPEN()` which is `undefined`, so nothing happens.

**The fix:**
1. Wrap ALL returns in `NativeAppGate` with `NativeDebugProvider` — not just the final authenticated screen
2. Add a **visible debug button** (a small floating "🐛 Debug" button in the bottom-right corner) that is visible on native platforms, so you don't need to tap 5 times. This is a temporary button that can be removed later.

---

## Issue 3: App Crashes When Tapping "Add Photo" (Optional)

**Root cause (critical):** In `NativeCreatorOnboarding.tsx`, the photo button is:

```tsx
<input ref={fileInputRef} type="file" accept="image/*" capture="user" onChange={handleImageSelect} className="hidden" />
<button onClick={() => fileInputRef.current?.click()} ...>
```

The `capture="user"` attribute on the `<input type="file">` element forces the device to **open the camera directly** instead of showing the gallery/file picker. On Android WebView (Capacitor), this can crash because:

1. The Android WebView's file chooser requires a specific `onShowFileChooser` callback implementation in the native Capacitor bridge. When `capture="user"` is set, it bypasses the standard file chooser and tries to start the camera intent directly. In some Android WebView versions, this causes a `NullPointerException` in the native layer.

2. The app has no camera permission handling in the Capacitor config or `handleImageSelect`. On Android, opening the camera without the `CAMERA` permission declared in AndroidManifest causes an immediate crash.

**The fix:**
- Remove `capture="user"` from the file input so it shows the standard Android file picker (Gallery + Camera option) instead of forcing the camera directly. This is the standard pattern used by all production Android apps.
- Add proper error handling in `handleImageSelect` with a try/catch that shows a helpful toast on failure
- For the onboarding case specifically, make the entire photo button more crash-safe by wrapping the click handler in a try/catch

---

## Implementation Plan

### Files to Modify

| File | Changes |
|---|---|
| `src/hooks/useKeyboardScrollIntoView.ts` | Use `visualViewport` API for accurate above-keyboard scroll positioning |
| `src/components/NativeAppGate.tsx` | Wrap ALL renders (login, onboarding, etc.) in `NativeDebugProvider`; add visible floating debug button |
| `src/pages/NativeCreatorOnboarding.tsx` | Remove `capture="user"` from file input; add try/catch around fileInputRef click; add visible debug button |
| `src/pages/NativeLogin.tsx` | Add visible debug button; improve scroll behavior for phone input area |

### Fix Details

#### Fix 1 — `useKeyboardScrollIntoView.ts`

Replace `scrollIntoView` with `visualViewport`-aware scrolling:

```typescript
const handleFocusIn = (e: FocusEvent) => {
  const target = e.target as HTMLElement;
  if (target.tagName !== 'INPUT' && target.tagName !== 'TEXTAREA' && target.tagName !== 'SELECT') return;
  
  setTimeout(() => {
    const vv = window.visualViewport;
    if (!vv) {
      target.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }
    // Get position of the input relative to the visual viewport
    const rect = target.getBoundingClientRect();
    const visibleBottom = vv.height; // height = visible area above keyboard
    const inputBottom = rect.bottom;
    
    if (inputBottom > visibleBottom - 20) {
      // Input is below or near the keyboard — scroll container
      const container = containerRef.current;
      if (container) {
        const scrollAmount = inputBottom - visibleBottom + 80; // 80px padding above keyboard
        container.scrollBy({ top: scrollAmount, behavior: 'smooth' });
      }
    }
  }, 350); // slightly longer delay for keyboard to fully open
};
```

#### Fix 2 — `NativeAppGate.tsx`

Restructure all the `if/return` branches to be inside `NativeDebugProvider`:

```tsx
// BEFORE:
if (!user) return <NativeLogin />;
if (showOnboarding) return <NativeCreatorOnboarding ... />;
// ...
return (
  <NativeDebugProvider>
    {children(selectedRole, brandProfile)}
  </NativeDebugProvider>
);

// AFTER:
return (
  <NativeDebugProvider>
    {/* Floating debug button - always visible on native */}
    <FloatingDebugButton />
    
    {!user && <NativeLogin />}
    {user && showOnboarding && <NativeCreatorOnboarding ... />}
    {user && showBrandOnboarding && <NativeBrandOnboarding ... />}
    {user && !showOnboarding && !showBrandOnboarding && !selectedRole && <NativeRolePicker ... />}
    {user && selectedRole && children(selectedRole, brandProfile)}
  </NativeDebugProvider>
);
```

The `FloatingDebugButton` is a small orange bug icon button fixed to the bottom-right, only visible on `Capacitor.isNativePlatform()`.

#### Fix 3 — `NativeCreatorOnboarding.tsx`

```tsx
// BEFORE:
<input ref={fileInputRef} type="file" accept="image/*" capture="user" onChange={handleImageSelect} className="hidden" />
<button onClick={() => fileInputRef.current?.click()} ...>

// AFTER:
<input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageSelect} className="hidden" />
<button onClick={() => { try { fileInputRef.current?.click(); } catch (e) { console.error('File picker error:', e); toast.error('Could not open photo picker'); } }} ...>
```

Removing `capture="user"` lets Android show its standard bottom sheet with "Camera" and "Gallery" options — which is both safer and more user-friendly.

### Summary

| Issue | Root Cause | Fix |
|---|---|---|
| Keyboard covers phone input | `scrollIntoView` doesn't account for visual viewport above keyboard | Use `visualViewport.height` to scroll only the needed amount |
| Debug console not working | `NativeDebugProvider` not rendered around login/onboarding screens | Wrap all `NativeAppGate` returns in the provider; add visible floating button |
| Photo tap crashes app | `capture="user"` forces camera intent directly, crashes Android WebView | Remove `capture="user"` attribute; add try/catch on click handler |
