/**
 * Feature flags for native mobile platforms (iOS/Android)
 * 
 * These flags control which native features are enabled.
 * Some features require additional configuration (like Firebase for push notifications)
 * and should remain disabled until that configuration is complete.
 */
export const NATIVE_FEATURES = {
  /**
   * Push Notifications
   * 
   * IMPORTANT: Set this to true ONLY after Firebase is configured for your Android app.
   * Without Firebase configuration, the @capacitor/push-notifications plugin will crash
   * the app when any of its methods are called.
   * 
   * To enable:
   * 1. Create a Firebase project
   * 2. Add google-services.json to android/app/
   * 3. Configure Firebase in build.gradle files
   * 4. Set this to true
   * 5. Rebuild the app
   */
  PUSH_NOTIFICATIONS_ENABLED: false,
};
