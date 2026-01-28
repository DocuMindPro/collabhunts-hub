import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.f0d3858ae7f2489288d232504acaef78',
  appName: 'CollabHunts Creators',
  webDir: 'dist',
  plugins: {
    PushNotifications: {
      presentationOptions: ['badge', 'sound', 'alert'],
    },
    SplashScreen: {
      // Show splash screen for 2 seconds while app loads
      launchShowDuration: 2000,
      launchAutoHide: true,
      // Branded colors matching the app
      backgroundColor: '#1a1a2e',
      showSpinner: true,
      spinnerColor: '#F97316',
      // Android-specific splash settings
      androidScaleType: 'CENTER_CROP',
    },
    StatusBar: {
      backgroundColor: '#F97316',
      style: 'LIGHT',
    },
    Keyboard: {
      resize: 'body',
      resizeOnFullScreen: true,
    },
  },
};

export default config;
