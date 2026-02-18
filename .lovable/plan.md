
## Native App: 4 Critical Bug Fixes

### Bug 1: Session Lost on Second App Launch (Auth Race Condition)

**Root cause**: `NativeAppGate.tsx` has a fundamental race condition. It runs BOTH `checkAuthAndProfile()` (initial load) AND `onAuthStateChange` simultaneously. When the app is re-opened, the auth state change listener fires `SIGNED_IN` and immediately calls `refetchProfiles` — but by this point, `isLoading` may still be `true`. The subsequent `useEffect` that watches `[isLoading, user, creatorProfile, brandProfile, selectedRole]` then finds `creatorProfile` present but `isCreatorProfileComplete()` returns `false` because the **`categories` field is not populated during the creator onboarding** (`NativeCreatorOnboarding.tsx` never writes `categories` to the profile). This causes the gate to show onboarding again instead of the dashboard.

**Two sub-fixes**:

1. **`NativeCreatorOnboarding.tsx` does not set `categories`**: The creator profile is inserted without a `categories` array. `isCreatorProfileComplete` checks for `categories.length > 0` — it will always fail. This is why the user gets kicked to onboarding on second launch. Fix: Remove the `categories` check from `isCreatorProfileComplete`, or add a category selection step to onboarding, OR simply relax the check to only require `display_name` and `bio`.

2. **`NativeAppGate.tsx` race condition**: The `onAuthStateChange` listener fires async calls including `await refetchProfiles(...)` directly inside the callback. Per Supabase docs, awaiting inside `onAuthStateChange` can cause deadlocks. Fix: wrap profile refetch in `setTimeout(..., 0)` to avoid blocking the auth state change.

**Files**: `src/components/NativeAppGate.tsx`, `src/pages/NativeCreatorOnboarding.tsx`

---

### Bug 2: Keyboard Covers Country/Phone Dropdowns (Cannot Select Fields)

**Root cause**: Both `PhoneInput.tsx` and `CountrySelect.tsx` render their dropdown menus using `position: absolute` with `z-50`. On iOS/Android, when the soft keyboard is open, it shrinks the viewport. The dropdown appears below the button — but that area is now under the keyboard. The dropdown is physically rendered in the DOM but visually hidden behind the keyboard.

**The proper fix for Capacitor native**: The dropdowns need to open **upward** (above the button) when the input is near the bottom of the screen. Additionally, all the signup/onboarding forms need `scrollIntoView` behavior when inputs are focused — the form should scroll up so the keyboard doesn't cover inputs.

**Specific changes**:

1. **`PhoneInput.tsx`**: Change the dropdown to render fixed/upward. Add a `ref` to the trigger button, measure its position relative to viewport, and render the dropdown above the button if it's in the lower half of the screen. Add `onFocus` to auto-scroll the field into view.

2. **`CountrySelect.tsx`**: Same fix — render dropdown upward when near bottom of screen.

3. **`NativeLogin.tsx`**: Wrap the entire scrollable form in a `div` that responds to keyboard height. When the phone input section is focused, use `scrollIntoView({ behavior: 'smooth', block: 'center' })` to bring it into view automatically.

4. **`capacitor.config.ts`**: Currently has `resize: 'body'` for the Keyboard plugin. Change this to `resize: 'none'` and handle keyboard avoidance in CSS via `interactive-widget: resizes-content` — this gives more predictable behavior for dropdowns.

**Files**: `src/components/PhoneInput.tsx`, `src/components/CountrySelect.tsx`, `src/pages/NativeLogin.tsx`, `src/pages/NativeCreatorOnboarding.tsx`, `src/pages/NativeBrandOnboarding.tsx`

---

### Bug 3: Brand Account Creation "Load Failed"

**Root cause**: In `NativeLogin.tsx`, when a brand user completes signup via `handleBrandSignup`, it calls `supabase.auth.signUp(...)` and then immediately tries to `supabase.from('brand_profiles').insert(...)` using `authData.user.id`. On native, the `signUp` call sometimes returns a user object but the session is not yet fully established in Supabase — the subsequent DB insert happens before the auth token is propagated, causing an RLS policy violation ("load failed" = network/auth error).

**Fix**: In `handleBrandSignup`, add a small delay (or session refresh) between the `signUp` call and the `brand_profiles` insert. Specifically:
- After `supabase.auth.signUp()`, call `supabase.auth.setSession(authData.session)` explicitly to ensure the session is active before the DB insert
- Wrap the entire operation in `safeNativeAsync` with a 15s timeout (same pattern as `NativeBrandOnboarding.tsx` already does correctly)
- Show a more descriptive error if the insert fails due to RLS

**Also**: The `handleBrandSignup` in `NativeLogin.tsx` does NOT use `safeNativeAsync` — it's raw async without any timeout wrapper. On slow/unreliable mobile networks, this hangs indefinitely showing a spinner.

**File**: `src/pages/NativeLogin.tsx`

---

### Bug 4: All Onboarding Forms — Keyboard Overlap via Scroll-into-View

**Root cause**: `NativeCreatorOnboarding.tsx` and `NativeBrandOnboarding.tsx` have `overflow-y-auto` on the content div but no automatic scroll-to-focused-field behavior. When the keyboard opens, it doesn't push the form up — iOS WebView just shrinks the visible area and the form stays put.

**Fix**: Add a global `onFocus` handler on the scrollable container that calls `(e.target as HTMLElement).scrollIntoView({ behavior: 'smooth', block: 'center' })` for all input/textarea/select elements. This ensures that when the user taps any field, it scrolls into the center of the visible area — above the keyboard.

This can be implemented as a simple React utility hook `useKeyboardScrollIntoView()` that attaches a `focusin` event listener to the container div.

**Files**: `src/pages/NativeCreatorOnboarding.tsx`, `src/pages/NativeBrandOnboarding.tsx`

---

### Summary of All File Changes

| File | Changes |
|---|---|
| `src/components/NativeAppGate.tsx` | Fix auth race condition: wrap `refetchProfiles` in `onAuthStateChange` with `setTimeout`; relax `isCreatorProfileComplete` to not require `categories` |
| `src/pages/NativeLogin.tsx` | Fix brand signup "load failed": wrap brand profile insert in `safeNativeAsync` with timeout; set session explicitly before DB insert |
| `src/components/PhoneInput.tsx` | Add upward-opening dropdown when near bottom of screen; add `onFocus` scroll-into-view |
| `src/components/CountrySelect.tsx` | Add upward-opening dropdown when near bottom of screen |
| `src/pages/NativeCreatorOnboarding.tsx` | Add `focusin` scroll-into-view on container; fix `categories` not being set in profile insert |
| `src/pages/NativeBrandOnboarding.tsx` | Add `focusin` scroll-into-view on container |
| `capacitor.config.ts` | Change `Keyboard.resize` from `'body'` to `'ionic'` for better native keyboard behavior |

**No database changes required.**
