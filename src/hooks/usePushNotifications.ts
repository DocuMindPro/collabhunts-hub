import { useEffect, useCallback, useState } from 'react';
import { Capacitor } from '@capacitor/core';
import { PushNotifications, Token, PushNotificationSchema, ActionPerformed } from '@capacitor/push-notifications';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { registerPushToken, unregisterPushToken, updatePushToken, Platform } from '@/lib/push-service';
import { toast } from 'sonner';

export function usePushNotifications() {
  const navigate = useNavigate();
  const [isRegistered, setIsRegistered] = useState(false);
  const [currentToken, setCurrentToken] = useState<string | null>(null);
  const [isAvailable, setIsAvailable] = useState(true);

  const getPlatform = (): Platform => {
    const platform = Capacitor.getPlatform();
    return platform === 'ios' ? 'ios' : 'android';
  };

  const requestPermissions = useCallback(async () => {
    if (!Capacitor.isNativePlatform()) {
      console.log('Push notifications only work on native platforms');
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
  }, []);

  const registerDevice = useCallback(async () => {
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
      // Gracefully handle missing Firebase configuration - app continues normally
    }
  }, [requestPermissions]);

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
    const data = notification.data;
    
    // Navigate based on notification type
    if (data?.notification_type) {
      switch (data.notification_type) {
        case 'new_message':
          navigate('/creator-dashboard?tab=messages');
          break;
        case 'creator_new_booking':
        case 'creator_booking_accepted':
        case 'creator_revision_requested':
        case 'creator_delivery_confirmed':
          navigate('/creator-dashboard?tab=bookings');
          break;
        case 'creator_application_accepted':
          navigate('/creator-dashboard?tab=campaigns');
          break;
        case 'creator_dispute_opened':
          navigate('/creator-dashboard?tab=bookings');
          break;
        case 'creator_profile_approved':
          navigate('/creator-dashboard?tab=profile');
          break;
        default:
          navigate('/creator-dashboard');
      }
    } else if (data?.link) {
      navigate(data.link);
    } else {
      navigate('/creator-dashboard');
    }
  }, [navigate]);

  useEffect(() => {
    if (!Capacitor.isNativePlatform()) {
      return;
    }

    let registrationCleanup: (() => void) | undefined;
    let errorCleanup: (() => void) | undefined;
    let foregroundCleanup: (() => void) | undefined;
    let actionCleanup: (() => void) | undefined;
    let authSubscription: { unsubscribe: () => void } | undefined;

    const initializePushNotifications = async () => {
      try {
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
            // Don't show toast - just log and continue
          }
        );
        errorCleanup = () => errorListener.remove();

        // Listen for push notifications received while app is in foreground
        const foregroundListener = await PushNotifications.addListener(
          'pushNotificationReceived',
          (notification: PushNotificationSchema) => {
            console.log('Push notification received:', notification);
            
            // Show in-app notification
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

      } catch (error) {
        console.warn('Push notification initialization failed (Firebase may not be configured):', error);
        setIsAvailable(false);
        // App continues normally without push notifications
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
  }, [registerDevice, unregisterDevice, handleNotificationTap]);

  return {
    isRegistered,
    isAvailable,
    currentToken,
    requestPermissions,
    registerDevice,
    unregisterDevice,
  };
}
