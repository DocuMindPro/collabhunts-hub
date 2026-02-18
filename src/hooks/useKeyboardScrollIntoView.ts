import { useEffect, useRef } from 'react';

/**
 * Attaches a focusin listener to a container div so that whenever the user
 * taps an input/textarea/select, it scrolls into the center of the visible
 * area — above the software keyboard on iOS/Android.
 */
export function useKeyboardScrollIntoView<T extends HTMLElement>() {
  const containerRef = useRef<T>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleFocusIn = (e: FocusEvent) => {
      const target = e.target as HTMLElement;
      if (
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.tagName === 'SELECT')
      ) {
        // Small delay so keyboard has time to open before we scroll
        setTimeout(() => {
          target.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 300);
      }
    };

    container.addEventListener('focusin', handleFocusIn);
    return () => container.removeEventListener('focusin', handleFocusIn);
  }, []);

  return containerRef;
}
