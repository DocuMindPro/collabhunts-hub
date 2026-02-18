import { useEffect, useRef } from 'react';

/**
 * Attaches a focusin listener to a container div so that whenever the user
 * taps an input/textarea/select, it scrolls into the visible area above the
 * software keyboard — using window.visualViewport for accurate positioning.
 *
 * On Android with Keyboard.resize='ionic', the visual viewport height shrinks
 * when the keyboard opens. We use that to calculate the exact scroll amount
 * needed to keep the focused input visible above the keyboard.
 */
export function useKeyboardScrollIntoView<T extends HTMLElement>() {
  const containerRef = useRef<T>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const scrollFocusedIntoView = (target: HTMLElement) => {
      const vv = window.visualViewport;

      if (!vv) {
        // Fallback: just scroll the element into view
        target.scrollIntoView({ behavior: 'smooth', block: 'center' });
        return;
      }

      const rect = target.getBoundingClientRect();
      // vv.height = visible area height above the keyboard
      const visibleBottom = vv.offsetTop + vv.height;
      const inputBottom = rect.bottom;
      const inputTop = rect.top;

      // If the input is hidden below the visible area, scroll it into view
      if (inputBottom > visibleBottom - 20) {
        const scrollAmount = inputBottom - visibleBottom + 100; // 100px padding above keyboard
        container.scrollBy({ top: scrollAmount, behavior: 'smooth' });
      } else if (inputTop < vv.offsetTop) {
        // Input is above the visible area — scroll up
        container.scrollBy({ top: inputTop - vv.offsetTop - 20, behavior: 'smooth' });
      }
    };

    const handleFocusIn = (e: FocusEvent) => {
      const target = e.target as HTMLElement;
      if (
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.tagName === 'SELECT')
      ) {
        // Longer delay so the keyboard has time to fully open before we measure
        setTimeout(() => scrollFocusedIntoView(target), 400);
      }
    };

    // Also listen to visualViewport resize (fires when keyboard opens/closes)
    // so that if the keyboard opens after focus was already set, we still reposition
    const handleViewportResize = () => {
      const activeEl = document.activeElement as HTMLElement | null;
      if (
        activeEl &&
        (activeEl.tagName === 'INPUT' ||
          activeEl.tagName === 'TEXTAREA' ||
          activeEl.tagName === 'SELECT') &&
        container.contains(activeEl)
      ) {
        // Small additional delay after viewport resize settles
        setTimeout(() => scrollFocusedIntoView(activeEl), 100);
      }
    };

    container.addEventListener('focusin', handleFocusIn);
    window.visualViewport?.addEventListener('resize', handleViewportResize);

    return () => {
      container.removeEventListener('focusin', handleFocusIn);
      window.visualViewport?.removeEventListener('resize', handleViewportResize);
    };
  }, []);

  return containerRef;
}
