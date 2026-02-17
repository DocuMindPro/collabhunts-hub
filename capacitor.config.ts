import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.f0d3858ae7f2489288d232504acaef78',
  appName: 'Collab Hunts',
  webDir: 'dist',
  plugins: {
    PushNotifications: {
      presentationOptions: ['badge', 'sound', 'alert'],
    },
    SplashScreen: {
      // Show splash screen for 2 seconds while app loads
      launchShowDuration: 2000,
      launchAutoHide: true,
      // Clean branded orange background — no image crop issues
      backgroundColor: '#F97316',
      showSpinner: false,
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
