/**
 * Native-safe Supabase utilities
 * Adds timeout handling for Supabase calls on native platforms
 * to prevent UI from hanging when network requests are slow/failing
 */
import { Capacitor } from '@capacitor/core';

const NATIVE_TIMEOUT_MS = 5000; // 5 second timeout on native

/**
 * Wraps a promise with a timeout that returns a fallback value on native platforms.
 * On web, returns the original promise without modification.
 * 
 * IMPORTANT: Make sure to call the Supabase query before passing it.
 * Example: withNativeTimeout(supabase.from('table').select().then(r => r), fallback)
 */
export async function withNativeTimeout<T>(
  promise: Promise<T>,
  fallback: T,
  timeoutMs: number = NATIVE_TIMEOUT_MS
): Promise<T> {
  if (!Capacitor.isNativePlatform()) {
    return promise; // No timeout on web
  }

  return Promise.race([
    promise,
    new Promise<T>((resolve) => {
      setTimeout(() => {
        console.warn('[Native] Request timed out after', timeoutMs, 'ms, using fallback');
        resolve(fallback);
      }, timeoutMs);
    }),
  ]);
}

/**
 * Check if we're running on a native platform
 */
export const isNativePlatform = (): boolean => {
  return Capacitor.isNativePlatform();
};

/**
 * Defer Supabase calls on native platform to allow UI to render first.
 * Returns true if the call should be deferred.
 */
export const shouldDeferSupabaseCall = (): boolean => {
  return Capacitor.isNativePlatform();
};

/**
 * Safe wrapper for async operations that might hang on native.
 * Returns fallback on timeout or error.
 */
export async function safeNativeAsync<T>(
  asyncFn: () => Promise<T>,
  fallback: T,
  timeoutMs: number = NATIVE_TIMEOUT_MS
): Promise<T> {
  if (!Capacitor.isNativePlatform()) {
    try {
      return await asyncFn();
    } catch (error) {
      console.warn('[safeNativeAsync] Error:', error);
      return fallback;
    }
  }

  try {
    return await Promise.race([
      asyncFn(),
      new Promise<T>((resolve) => {
        setTimeout(() => {
          console.warn('[Native] Async operation timed out, using fallback');
          resolve(fallback);
        }, timeoutMs);
      }),
    ]);
  } catch (error) {
    console.warn('[Native] Async operation failed:', error);
    return fallback;
  }
}
