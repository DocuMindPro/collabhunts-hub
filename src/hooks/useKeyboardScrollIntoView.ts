import { useEffect, useRef } from 'react';
import { Capacitor } from '@capacitor/core';
import { Keyboard } from '@capacitor/keyboard';

/**
 * Keeps focused inputs visible above the software keyboard.
 *
 * Strategy (iOS vs Android differ significantly):
 *  - On native (iOS & Android): uses @capacitor/keyboard `keyboardWillShow`
 *    which provides the EXACT keyboard height in points/pixels. This is the
 *    only reliable method on iOS WKWebView where `visualViewport.height` does
 *    NOT shrink when the keyboard opens (unlike Android).
 *  - On web: falls back to `window.visualViewport` resize listener.
 */
export function useKeyboardScrollIntoView<T extends HTMLElement>() {
  const containerRef = useRef<T>(null);
  // Keep track of the current keyboard height so focus events that fire while
  // the keyboard is already open can also scroll correctly.
  const keyboardHeightRef = useRef(0);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    /**
     * Scroll `target` so it sits ~100px above the keyboard.
     * `kbHeight` is the keyboard height in screen pixels.
     */
    const scrollFocusedIntoView = (target: HTMLElement, kbHeight: number) => {
      const rect = target.getBoundingClientRect();
      const visibleBottom = window.innerHeight - kbHeight;
      const inputBottom = rect.bottom;

      if (inputBottom > visibleBottom - 20) {
        const scrollAmount = inputBottom - visibleBottom + 100; // 100px breathing room
        container.scrollBy({ top: scrollAmount, behavior: 'smooth' });
      }
    };

    if (Capacitor.isNativePlatform()) {
      // ── Native (iOS + Android) ───────────────────────────────────────────
      // `keyboardWillShow` fires BEFORE the keyboard is fully visible, giving
      // us time to scroll before the layout shifts.

      const showHandlePromise = Keyboard.addListener('keyboardWillShow', (info) => {
        keyboardHeightRef.current = info.keyboardHeight;
        const activeEl = document.activeElement as HTMLElement | null;
        if (
          activeEl &&
          (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA' || activeEl.tagName === 'SELECT') &&
          container.contains(activeEl)
        ) {
          // Small delay so the keyboard height is fully applied before we measure
          setTimeout(() => scrollFocusedIntoView(activeEl, info.keyboardHeight), 80);
        }
      });

      const hideHandlePromise = Keyboard.addListener('keyboardWillHide', () => {
        keyboardHeightRef.current = 0;
      });

      // Also listen for focus events — handles the case where the user taps a
      // different input while the keyboard is already open (keyboardWillShow
      // won't fire again in that case).
      const handleFocusIn = (e: FocusEvent) => {
        const target = e.target as HTMLElement;
        if (
          target &&
          (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT')
        ) {
          // Longer delay here: on focus-switch the keyboard height is already known
          setTimeout(() => scrollFocusedIntoView(target, keyboardHeightRef.current), 350);
        }
      };

      container.addEventListener('focusin', handleFocusIn);

      return () => {
        showHandlePromise.then((h) => h.remove());
        hideHandlePromise.then((h) => h.remove());
        container.removeEventListener('focusin', handleFocusIn);
      };
    } else {
      // ── Web fallback (visualViewport) ────────────────────────────────────
      const handleFocusIn = (e: FocusEvent) => {
        const target = e.target as HTMLElement;
        if (
          target &&
          (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT')
        ) {
          setTimeout(() => {
            const vv = window.visualViewport;
            if (!vv) {
              target.scrollIntoView({ behavior: 'smooth', block: 'center' });
              return;
            }
            scrollFocusedIntoView(target, window.innerHeight - vv.height);
          }, 400);
        }
      };

      const handleViewportResize = () => {
        const vv = window.visualViewport;
        const activeEl = document.activeElement as HTMLElement | null;
        if (
          vv &&
          activeEl &&
          (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA' || activeEl.tagName === 'SELECT') &&
          container.contains(activeEl)
        ) {
          setTimeout(() => scrollFocusedIntoView(activeEl, window.innerHeight - vv.height), 100);
        }
      };

      container.addEventListener('focusin', handleFocusIn);
      window.visualViewport?.addEventListener('resize', handleViewportResize);

      return () => {
        container.removeEventListener('focusin', handleFocusIn);
        window.visualViewport?.removeEventListener('resize', handleViewportResize);
      };
    }
  }, []);

  return containerRef;
}
