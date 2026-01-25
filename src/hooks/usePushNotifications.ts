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
      console.error('Error requesting push permissions:', error);
      return false;
    }
  }, []);

  const registerDevice = useCallback(async () => {
    if (!Capacitor.isNativePlatform()) {
      return;
    }

    const hasPermission = await requestPermissions();
    if (!hasPermission) {
      console.log('Push notification permission denied');
      return;
    }

    try {
      await PushNotifications.register();
    } catch (error) {
      console.error('Error registering for push notifications:', error);
    }
  }, [requestPermissions]);

  const unregisterDevice = useCallback(async () => {
    if (currentToken) {
      await unregisterPushToken(currentToken);
      setCurrentToken(null);
      setIsRegistered(false);
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

    // Listen for successful registration
    const registrationListener = PushNotifications.addListener(
      'registration',
      async (token: Token) => {
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
      }
    );

    // Listen for registration errors
    const errorListener = PushNotifications.addListener(
      'registrationError',
      (error) => {
        console.error('Push registration error:', error);
        toast.error('Failed to enable push notifications');
      }
    );

    // Listen for push notifications received while app is in foreground
    const foregroundListener = PushNotifications.addListener(
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

    // Listen for notification tap actions
    const actionListener = PushNotifications.addListener(
      'pushNotificationActionPerformed',
      (action: ActionPerformed) => {
        console.log('Push notification action performed:', action);
        handleNotificationTap(action.notification);
      }
    );

    // Auto-register when user is authenticated
    const checkAndRegister = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        registerDevice();
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

    return () => {
      registrationListener.then(l => l.remove());
      errorListener.then(l => l.remove());
      foregroundListener.then(l => l.remove());
      actionListener.then(l => l.remove());
      subscription.unsubscribe();
    };
  }, [registerDevice, unregisterDevice, handleNotificationTap]);

  return {
    isRegistered,
    currentToken,
    requestPermissions,
    registerDevice,
    unregisterDevice,
  };
}
