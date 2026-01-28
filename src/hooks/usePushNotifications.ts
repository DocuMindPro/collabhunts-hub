import { useEffect, useCallback, useState } from 'react';
import { Capacitor } from '@capacitor/core';
import { PushNotifications, Token, PushNotificationSchema, ActionPerformed } from '@capacitor/push-notifications';
import { supabase } from '@/integrations/supabase/client';
import { registerPushToken, unregisterPushToken, Platform } from '@/lib/push-service';
import { toast } from 'sonner';

/**
 * Native-safe navigation function that uses hash-based routing
 * This avoids React Router context issues on native platforms
 */
const navigateNative = (path: string) => {
  try {
    // Use hash-based navigation for native platforms
    if (Capacitor.isNativePlatform()) {
      window.location.hash = path;
    } else {
      window.location.href = path;
    }
  } catch (error) {
    console.warn('Navigation failed:', error);
  }
};

/**
 * IMPORTANT: Push notifications require Firebase to be configured on Android.
 * Without Firebase, calling PushNotifications methods will crash the app at the native level.
 * This hook is designed to fail gracefully when Firebase is not available.
 */
export function usePushNotifications() {
  const [isRegistered, setIsRegistered] = useState(false);
  const [currentToken, setCurrentToken] = useState<string | null>(null);
  // Default to FALSE - only set true after we verify push is actually available
  const [isAvailable, setIsAvailable] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [safetyCheckComplete, setSafetyCheckComplete] = useState(false);

  const getPlatform = (): Platform => {
    try {
      const platform = Capacitor.getPlatform();
      return platform === 'ios' ? 'ios' : 'android';
    } catch {
      return 'android';
    }
  };

  /**
   * Safely check if push notifications are available without crashing
   * Uses Promise.race with timeout to prevent hangs
   */
  const checkPushAvailability = useCallback(async (): Promise<boolean> => {
    if (!Capacitor.isNativePlatform()) {
      console.log('Push notifications: Not a native platform, skipping');
      return false;
    }

    try {
      console.log('Push notifications: Checking availability...');
      
      // Create a timeout promise that resolves to null after 2 seconds
      const timeoutPromise = new Promise<null>((resolve) => 
        setTimeout(() => {
          console.log('Push notifications: Availability check timed out');
          resolve(null);
        }, 2000)
      );
      
      // Race the actual check against the timeout
      const checkPromise = PushNotifications.checkPermissions();
      const result = await Promise.race([checkPromise, timeoutPromise]);
      
      if (result === null) {
        // Timeout occurred - plugin likely not configured
        console.log('Push notifications: Not available (timeout)');
        return false;
      }
      
      console.log('Push notifications: Available, permission status:', result.receive);
      return true;
    } catch (error) {
      console.warn('Push notifications: Not available (error):', error);
      return false;
    }
  }, []);

  const requestPermissions = useCallback(async () => {
    // Don't attempt if not marked as available
    if (!isAvailable) {
      console.log('Push notifications: Skipping permission request - not available');
      return false;
    }

    if (!Capacitor.isNativePlatform()) {
      return false;
    }

    try {
      const permStatus = await PushNotifications.checkPermissions();
      
      if (permStatus.receive === 'prompt') {
        const result = await PushNotifications.requestPermissions();
        return result.receive === 'granted';
      }
      
      return permStatus.receive === 'granted';
    } catch (error) {
      console.warn('Error requesting push permissions:', error);
      setIsAvailable(false);
      return false;
    }
  }, [isAvailable]);

  const registerDevice = useCallback(async () => {
    // Don't attempt if not marked as available
    if (!isAvailable) {
      console.log('Push notifications: Skipping registration - not available');
      return;
    }

    if (!Capacitor.isNativePlatform()) {
      return;
    }

    try {
      const hasPermission = await requestPermissions();
      if (!hasPermission) {
        console.log('Push notification permission denied or unavailable');
        return;
      }

      await PushNotifications.register();
    } catch (error) {
      console.warn('Push notifications not available (Firebase may not be configured):', error);
      setIsAvailable(false);
    }
  }, [isAvailable, requestPermissions]);

  const unregisterDevice = useCallback(async () => {
    if (currentToken) {
      try {
        await unregisterPushToken(currentToken);
        setCurrentToken(null);
        setIsRegistered(false);
      } catch (error) {
        console.warn('Failed to unregister push token:', error);
      }
    }
  }, [currentToken]);

  const handleNotificationTap = useCallback((notification: PushNotificationSchema) => {
    try {
      const data = notification.data;
      
      // Navigate based on notification type using native-safe navigation
      if (data?.notification_type) {
        switch (data.notification_type) {
          case 'new_message':
            navigateNative('/creator-dashboard?tab=messages');
            break;
          case 'creator_new_booking':
          case 'creator_booking_accepted':
          case 'creator_revision_requested':
          case 'creator_delivery_confirmed':
            navigateNative('/creator-dashboard?tab=bookings');
            break;
          case 'creator_application_accepted':
            navigateNative('/creator-dashboard?tab=campaigns');
            break;
          case 'creator_dispute_opened':
            navigateNative('/creator-dashboard?tab=bookings');
            break;
          case 'creator_profile_approved':
            navigateNative('/creator-dashboard?tab=profile');
            break;
          default:
            navigateNative('/creator-dashboard');
        }
      } else if (data?.link) {
        navigateNative(data.link);
      } else {
        navigateNative('/creator-dashboard');
      }
    } catch (error) {
      console.warn('Error handling notification tap:', error);
    }
  }, []);

  // Step 1: Safety check - verify push notifications are available before doing anything
  useEffect(() => {
    // Skip on non-native platforms
    if (!Capacitor.isNativePlatform()) {
      console.log('Push notifications: Web platform, disabling');
      setSafetyCheckComplete(true);
      setIsInitialized(true);
      return;
    }

    let mounted = true;

    const performSafetyCheck = async () => {
      try {
        const available = await checkPushAvailability();
        if (mounted) {
          setIsAvailable(available);
          setSafetyCheckComplete(true);
          console.log('Push notifications: Safety check complete, available:', available);
        }
      } catch (error) {
        console.warn('Push notifications: Safety check failed:', error);
        if (mounted) {
          setIsAvailable(false);
          setSafetyCheckComplete(true);
        }
      }
    };

    // Delay the safety check significantly to let the app stabilize
    // This prevents crashes during initial app load
    const timer = setTimeout(performSafetyCheck, 3000);

    return () => {
      mounted = false;
      clearTimeout(timer);
    };
  }, [checkPushAvailability]);

  // Step 2: Initialize listeners only after safety check passes and push is available
  useEffect(() => {
    // Wait for safety check to complete
    if (!safetyCheckComplete) {
      return;
    }

    // If push isn't available, mark as initialized and exit
    if (!isAvailable) {
      console.log('Push notifications: Not available, skipping listener setup');
      setIsInitialized(true);
      return;
    }

    if (!Capacitor.isNativePlatform()) {
      setIsInitialized(true);
      return;
    }

    let registrationCleanup: (() => void) | undefined;
    let errorCleanup: (() => void) | undefined;
    let foregroundCleanup: (() => void) | undefined;
    let actionCleanup: (() => void) | undefined;
    let authSubscription: { unsubscribe: () => void } | undefined;

    const initializePushNotifications = async () => {
      try {
        console.log('Push notifications: Setting up listeners...');

        // Listen for successful registration
        const registrationListener = await PushNotifications.addListener(
          'registration',
          async (token: Token) => {
            try {
              console.log('Push registration success:', token.value);
              
              const { data: { user } } = await supabase.auth.getUser();
              if (user) {
                const platform = getPlatform();
                const success = await registerPushToken(user.id, token.value, platform);
                
                if (success) {
                  setCurrentToken(token.value);
                  setIsRegistered(true);
                  console.log('Device token registered successfully');
                }
              }
            } catch (error) {
              console.warn('Failed to register push token:', error);
            }
          }
        );
        registrationCleanup = () => registrationListener.remove();

        // Listen for registration errors
        const errorListener = await PushNotifications.addListener(
          'registrationError',
          (error) => {
            console.warn('Push registration error (Firebase may not be configured):', error);
            setIsAvailable(false);
          }
        );
        errorCleanup = () => errorListener.remove();

        // Listen for push notifications received while app is in foreground
        const foregroundListener = await PushNotifications.addListener(
          'pushNotificationReceived',
          (notification: PushNotificationSchema) => {
            console.log('Push notification received:', notification);
            
            toast(notification.title || 'New Notification', {
              description: notification.body,
              action: {
                label: 'View',
                onClick: () => handleNotificationTap(notification),
              },
            });
          }
        );
        foregroundCleanup = () => foregroundListener.remove();

        // Listen for notification tap actions
        const actionListener = await PushNotifications.addListener(
          'pushNotificationActionPerformed',
          (action: ActionPerformed) => {
            console.log('Push notification action performed:', action);
            handleNotificationTap(action.notification);
          }
        );
        actionCleanup = () => actionListener.remove();

        // Auto-register when user is authenticated
        const checkAndRegister = async () => {
          try {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
              registerDevice();
            }
          } catch (error) {
            console.warn('Failed to check user for push registration:', error);
          }
        };

        checkAndRegister();

        // Listen for auth state changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
          if (event === 'SIGNED_IN' && session?.user) {
            registerDevice();
          } else if (event === 'SIGNED_OUT') {
            unregisterDevice();
          }
        });
        authSubscription = subscription;

        setIsInitialized(true);
        console.log('Push notifications: Initialization complete');

      } catch (error) {
        console.warn('Push notification initialization failed (Firebase may not be configured):', error);
        setIsAvailable(false);
        setIsInitialized(true);
      }
    };

    initializePushNotifications();

    return () => {
      registrationCleanup?.();
      errorCleanup?.();
      foregroundCleanup?.();
      actionCleanup?.();
      authSubscription?.unsubscribe();
    };
  }, [safetyCheckComplete, isAvailable, registerDevice, unregisterDevice, handleNotificationTap]);

  return {
    isRegistered,
    isAvailable,
    currentToken,
    requestPermissions,
    registerDevice,
    unregisterDevice,
  };
}
