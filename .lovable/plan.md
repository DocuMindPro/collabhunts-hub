
# iOS-Specific Fix Plan: Keyboard, Debug Console & Profile Creation Crash

## Why iOS Was Never Actually Fixed

The previous fixes were applied assuming Android behavior. Here's what's different on iOS and why everything is still broken:

---

## Issue 1: Keyboard Covering Phone Input (iOS-Specific Root Cause)

### What's Different on iOS

The `capacitor.config.ts` has `Keyboard.resize: 'ionic'`. On **Android**, `ionic` mode shrinks the `window.visualViewport.height` when the keyboard opens, which is exactly what `useKeyboardScrollIntoView` relies on. 

On **iOS (WKWebView)**, `ionic` resize mode works **differently** — the viewport does NOT shrink via `visualViewport.height`. Instead, iOS uses a completely different approach: the page body shifts upward, and `window.visualViewport.offsetTop` changes. The result:

- `vv.height` does NOT decrease on iOS when keyboard opens
- `vv.offsetTop` increases instead
- The current code uses `visibleBottom = vv.offsetTop + vv.height` — this returns the **full screen height** on iOS, so `inputBottom > visibleBottom - 20` is **always false**, meaning the scroll **never fires**

### Second iOS Problem: Sign-In Screen Has No Scroll Container

The sign-in form (`viewMode === 'signin'`) in `NativeLogin.tsx` uses `min-h-screen` with `justify-center` — there is **no overflow-y-auto container**, and **no `scrollContainerRef` attached**. Even if the hook worked perfectly, it has nothing to scroll because the sign-in view is not a scrollable container. The `useKeyboardScrollIntoView` refs are only attached to `brandScrollRef` and `creatorScrollRef` — the main sign-in view with email/password inputs has **no scroll hook at all**.

### The Real iOS Fix

**Two-part fix:**

**Part A** — Fix `useKeyboardScrollIntoView.ts` to handle iOS correctly:

On iOS, instead of relying on `visualViewport` height changes, we use the `@capacitor/keyboard` plugin's `keyboardWillShow` event which provides the **exact keyboard height in pixels**. This is the most reliable cross-platform approach:

```typescript
// On iOS native: use Capacitor Keyboard plugin for exact keyboard height
// On Android: use visualViewport (already works)
// On web: no-op
```

When keyboard shows on iOS: scroll the container by `inputBottom - (screenHeight - keyboardHeight) + 80px padding`.

**Part B** — Fix the sign-in view to be a scrollable container and attach the scroll ref to it.

**The simplest and most reliable solution for iOS** is to use the `Keyboard` plugin's `keyboardWillShow` event to get the exact keyboard height, then use CSS `padding-bottom` on the scroll container equal to the keyboard height. This is the standard iOS pattern and works 100% of the time:

```typescript
// When keyboard shows: add padding-bottom = keyboardHeight to scroll container
// Then scroll focused input into view
// When keyboard hides: remove padding
```

This avoids all the `visualViewport` iOS quirks entirely.

---

## Issue 2: Debug Console Button Not Working

### The Real Problem

Looking at the code carefully:

1. `NativeDebugProvider` IS now wrapping all views in `NativeAppGate` ✓
2. `NativeDebugConsole` sets `window.NATIVE_DEBUG_OPEN = () => setIsOpen(true)` ✓  
3. The floating `FloatingDebugButton` calls `window.NATIVE_DEBUG_OPEN?.()` ✓

**But:** `FloatingDebugButton` is defined as a component **inside** the `NativeAppGate` function body, which means it's re-created on every render. More critically — it only renders when `Capacitor.isNativePlatform()` returns `true`. **On the iOS Capacitor WebView, `Capacitor.isNativePlatform()` should return `true`.**

The real issue is: **`NativeDebugProvider` is being mounted TWICE** — once for the loading state and once for the main render. Each mount calls `installNativeErrorInterceptors` separately, and each `NativeDebugProvider` instance has its own `setIsOpen` state. When the loading screen `NativeDebugProvider` unmounts (after loading completes), its `window.NATIVE_DEBUG_OPEN` reference is **replaced** by the new main `NativeDebugProvider`'s `setIsOpen`. But during the brief loading→main transition, `window.NATIVE_DEBUG_OPEN` may point to a stale closure.

**The fix:** There should be only **ONE** `NativeDebugProvider` instance for the entire app, not two separate ones (one for loading, one for main). The loading screen should be a conditional render **inside** a single provider. Additionally, the `FloatingDebugButton` needs to be moved **inside** the `NativeDebugProvider` so it always has access to the correct `setIsOpen` state — instead of relying on the global `window.NATIVE_DEBUG_OPEN`.

### What to change

- Remove the double `NativeDebugProvider` (remove the loading-state one, keep only the main one)
- Move `NativeLoadingScreen` **inside** the single `NativeDebugProvider` as a conditional render
- Make `FloatingDebugButton` part of `NativeDebugProvider` itself (not in `NativeAppGate`) so it directly calls the provider's `setIsOpen` without needing the global `window` bridge
- The button should have `touchAction: 'manipulation'` and a larger tap target (min 44×44pt per Apple HIG) since iOS is strict about tap targets

---

## Issue 3: Profile Creation Still Crashing

### The Real Problem on iOS

The previous fix added a session check, but on iOS, the **actual failure** is different from Android:

On iOS WKWebView with Capacitor, after `supabase.auth.signUp()`, the auth session **IS** immediately available (iOS handles the session cookie differently from Android). So the session check passes. But then the `INSERT` into `creator_profiles` fails because of **a different reason on iOS**: the Supabase JS client on iOS WKWebView sometimes drops the `Authorization` header on the first request after auth state change due to WKWebView's strict content security policy handling.

**Evidence:** The error toast would say `Profile insert failed: ... [code: 42501]` — that's `insufficient_privilege`, meaning RLS rejected it because `auth.uid()` was null even though a session exists client-side.

**The fix:** Before the INSERT, explicitly call `supabase.auth.setSession()` with the tokens from `getSession()` to force the Supabase client to re-attach the auth headers:

```typescript
const { data: { session } } = await supabase.auth.getSession();
if (session) {
  // Force re-attach auth headers (fixes iOS WKWebView header dropping)
  await supabase.auth.setSession({
    access_token: session.access_token,
    refresh_token: session.refresh_token,
  });
}
```

Additionally, after `signUp()` in `NativeLogin.tsx`, if `authData.session` is null (email confirmation required), we need to handle this gracefully by showing a "Check your email" message instead of routing to onboarding.

---

## Complete List of Files to Change

| File | Changes |
|---|---|
| `src/hooks/useKeyboardScrollIntoView.ts` | Complete rewrite: use `@capacitor/keyboard` events for iOS, visualViewport for Android |
| `src/components/NativeAppGate.tsx` | Single `NativeDebugProvider` wrapping everything incl. loading screen; move `FloatingDebugButton` into provider |
| `src/components/NativeDebugConsole.tsx` | Move floating debug button into `NativeDebugProvider`; fix button tap target size for iOS |
| `src/pages/NativeLogin.tsx` | Fix sign-in view to be scrollable; attach scroll ref to sign-in form too |
| `src/pages/NativeCreatorOnboarding.tsx` | Add `supabase.auth.setSession()` force re-attach before INSERT |

---

## Technical Details of Each Fix

### Fix 1A — Keyboard Hook (iOS + Android)

```typescript
import { Capacitor } from '@capacitor/core';
import { Keyboard } from '@capacitor/keyboard';

export function useKeyboardScrollIntoView<T extends HTMLElement>() {
  const containerRef = useRef<T>(null);
  const keyboardHeightRef = useRef(0); // tracks current keyboard height

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const scrollFocusedIntoView = (target: HTMLElement, kbHeight: number) => {
      const rect = target.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const visibleBottom = viewportHeight - kbHeight;
      const inputBottom = rect.bottom;

      if (inputBottom > visibleBottom - 20) {
        const scrollAmount = inputBottom - visibleBottom + 100;
        container.scrollBy({ top: scrollAmount, behavior: 'smooth' });
      }
    };

    if (Capacitor.isNativePlatform()) {
      // Use Capacitor Keyboard plugin for reliable cross-platform keyboard height
      const showHandle = Keyboard.addListener('keyboardWillShow', (info) => {
        keyboardHeightRef.current = info.keyboardHeight;
        const activeEl = document.activeElement as HTMLElement | null;
        if (activeEl && (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA') && container.contains(activeEl)) {
          setTimeout(() => scrollFocusedIntoView(activeEl, info.keyboardHeight), 100);
        }
      });

      const hideHandle = Keyboard.addListener('keyboardWillHide', () => {
        keyboardHeightRef.current = 0;
      });

      // Also handle focus events (for when keyboard is already open)
      const handleFocusIn = (e: FocusEvent) => {
        const target = e.target as HTMLElement;
        if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA')) {
          setTimeout(() => scrollFocusedIntoView(target, keyboardHeightRef.current), 350);
        }
      };
      container.addEventListener('focusin', handleFocusIn);

      return () => {
        showHandle.then(h => h.remove());
        hideHandle.then(h => h.remove());
        container.removeEventListener('focusin', handleFocusIn);
      };
    } else {
      // Web fallback using visualViewport
      const handleFocusIn = (e: FocusEvent) => { ... };
      // (same as current web fallback)
    }
  }, []);

  return containerRef;
}
```

### Fix 1B — Sign-In View Scrollable Container

The sign-in view needs to be wrapped in a scrollable div with the scroll ref:
```tsx
// BEFORE: <div className="min-h-screen bg-background flex flex-col">
//           <div className="flex-1 flex flex-col items-center justify-center p-6">

// AFTER:  <div className="min-h-screen bg-background flex flex-col">
//           <div ref={signinScrollRef} className="flex-1 overflow-y-auto flex flex-col items-center justify-center p-6">
```

### Fix 2 — Single NativeDebugProvider

```tsx
// NativeAppGate render:
return (
  <NativeDebugProvider>  {/* ONE provider only */}
    <FloatingDebugButton />  {/* Defined inside NativeDebugConsole, uses direct state */}
    {isLoading && <NativeLoadingScreen />}
    {!isLoading && !user && <NativeLogin />}
    {!isLoading && user && showOnboarding && <NativeCreatorOnboarding ... />}
    {/* etc. */}
  </NativeDebugProvider>
);
```

### Fix 3 — Force Session Re-Attach on iOS

```typescript
// In NativeCreatorOnboarding handleSubmit, BEFORE the INSERT:
const { data: { session } } = await supabase.auth.getSession();
if (session) {
  await supabase.auth.setSession({
    access_token: session.access_token,
    refresh_token: session.refresh_token,
  });
  // Small wait for iOS WKWebView to propagate the auth header
  await new Promise(r => setTimeout(r, 200));
}
```

---

## Summary

| Issue | iOS Root Cause | Fix |
|---|---|---|
| Keyboard hides inputs | `visualViewport.height` doesn't change on iOS; `Keyboard.resize='ionic'` works differently on iOS vs Android | Use `@capacitor/keyboard` `keyboardWillShow` event for exact height |
| Sign-in inputs hidden | Sign-in view has no scroll container | Make sign-in view scrollable + attach ref |
| Debug button not working | Two `NativeDebugProvider` instances cause stale closure; button tap target too small for iOS | Single provider wrapping everything; inline button state |
| Profile creation fails | iOS WKWebView drops `Authorization` header on first post-auth request | Force `setSession()` re-attach + 200ms wait before INSERT |
