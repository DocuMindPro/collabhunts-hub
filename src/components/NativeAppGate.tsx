import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';
import { safeNativeAsync } from '@/lib/supabase-native';
import NativeLoadingScreen from './NativeLoadingScreen';
import NativeLogin from '@/pages/NativeLogin';

interface CreatorProfile {
  id: string;
  display_name: string;
  status: string | null;
}

/**
 * Authentication gate for native mobile apps.
 * 
 * This component:
 * 1. Shows a loading screen while checking auth status
 * 2. If not logged in: Shows the native login screen
 * 3. If logged in but no creator profile: Shows onboarding prompt
 * 4. If logged in with creator profile: Renders children (dashboard routes)
 * 
 * All Supabase calls use safeNativeAsync with 5-second timeouts to prevent
 * hanging on Android WebView where network requests can fail silently.
 */
export function NativeAppGate({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [creatorProfile, setCreatorProfile] = useState<CreatorProfile | null>(null);

  // Failsafe: If still loading after 10 seconds, force show login screen
  useEffect(() => {
    const failsafe = setTimeout(() => {
      if (isLoading) {
        console.warn('NativeAppGate: Failsafe timeout reached, showing login screen');
        setIsLoading(false);
      }
    }, 10000);
    return () => clearTimeout(failsafe);
  }, [isLoading]);

  useEffect(() => {
    let mounted = true;

    const checkAuthAndProfile = async () => {
      try {
        // Get current session with timeout protection
        const session = await safeNativeAsync(
          async () => {
            const { data } = await supabase.auth.getSession();
            return data.session;
          },
          null, // fallback: no session
          5000  // 5 second timeout
        );
        
        if (!mounted) return;

        if (!session?.user) {
          console.log('NativeAppGate: No session found, showing login');
          setUser(null);
          setCreatorProfile(null);
          setIsLoading(false);
          return;
        }

        setUser(session.user);
        console.log('NativeAppGate: User found, checking creator profile');

        // Check for creator profile with timeout protection
        const profile = await safeNativeAsync(
          async () => {
            const { data } = await supabase
              .from('creator_profiles')
              .select('id, display_name, status')
              .eq('user_id', session.user.id)
              .maybeSingle();
            return data;
          },
          null, // fallback: no profile
          5000  // 5 second timeout
        );

        if (!mounted) return;

        if (profile) {
          console.log('NativeAppGate: Creator profile found');
          setCreatorProfile(profile);
        } else {
          console.log('NativeAppGate: No creator profile found');
        }

        setIsLoading(false);
      } catch (error) {
        console.error('NativeAppGate: Error checking auth:', error);
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;

        console.log('NativeAppGate: Auth state changed:', event);

        if (event === 'SIGNED_OUT') {
          setUser(null);
          setCreatorProfile(null);
        } else if (event === 'SIGNED_IN' && session?.user) {
          setUser(session.user);
          
          // Check for creator profile after sign in with timeout
          const profile = await safeNativeAsync(
            async () => {
              const { data } = await supabase
                .from('creator_profiles')
                .select('id, display_name, status')
                .eq('user_id', session.user.id)
                .maybeSingle();
              return data;
            },
            null,
            5000
          );

          if (mounted && profile) {
            setCreatorProfile(profile);
          }
        }
      }
    );

    checkAuthAndProfile();

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  // Show loading screen while checking auth
  if (isLoading) {
    return <NativeLoadingScreen />;
  }

  // Not logged in - show native login
  if (!user) {
    return <NativeLogin />;
  }

  // Logged in but no creator profile - show signup prompt
  if (!creatorProfile) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
        <div className="w-20 h-20 bg-primary rounded-2xl flex items-center justify-center mb-6">
          <span className="text-3xl font-bold text-primary-foreground">CH</span>
        </div>
        <h1 className="text-xl font-bold text-foreground mb-2">
          Create Your Creator Profile
        </h1>
        <p className="text-muted-foreground text-center mb-6">
          You need a creator profile to use this app. Please create one on our website.
        </p>
        <button
          onClick={async () => {
            await supabase.auth.signOut();
          }}
          className="bg-primary text-primary-foreground px-6 py-3 rounded-lg font-medium"
        >
          Sign Out
        </button>
      </div>
    );
  }

  // User has creator profile - render routes (Routes in App.tsx handle /creator-dashboard)
  return <>{children}</>;
}

export default NativeAppGate;
