

## Option A: Local Build Configuration

This plan removes the server URL so your Android app runs from locally built files, while you continue developing through Lovable.

---

### What I'll Change

**File: `capacitor.config.ts`**
- Remove the `server` block (lines 7-10) that points to the private preview URL
- Keep all plugin configurations intact

---

### Your Ongoing Development Workflow

Here's how you'll continue developing with Lovable while testing on Android:

```text
┌─────────────────────────────────────────────────────────────────┐
│                    YOUR DEVELOPMENT CYCLE                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  1. MAKE CHANGES IN LOVABLE (web browser)                       │
│     └── Edit code, add features, fix bugs                       │
│                                                                  │
│  2. PULL CHANGES LOCALLY (Command Prompt)                       │
│     └── cd Desktop\collabhunts-hub                              │
│     └── git pull                                                │
│                                                                  │
│  3. REBUILD & SYNC (Command Prompt)                             │
│     └── npm run build                                           │
│     └── npx cap sync                                            │
│                                                                  │
│  4. TEST ON ANDROID (Android Studio)                            │
│     └── Click green play button                                 │
│                                                                  │
│  5. REPEAT from Step 1                                          │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

### Commands Summary

After I make the config change, you'll run these commands **once**:

```bash
cd Desktop\collabhunts-hub
git pull
npm run build
npx cap sync
```

Then click the **green play button** in Android Studio.

**For future changes made in Lovable**, just repeat steps 2-4:
```bash
git pull
npm run build
npx cap sync
# Then click play in Android Studio
```

---

### Technical Details

The updated `capacitor.config.ts` will look like:

```typescript
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
      launchShowDuration: 2000,
      launchAutoHide: true,
      backgroundColor: '#F97316',
      androidSplashResourceName: 'splash',
      androidScaleType: 'CENTER_CROP',
      showSpinner: false,
      splashFullScreen: true,
      splashImmersive: true,
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
```

