import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';
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
 */
export function NativeAppGate({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [creatorProfile, setCreatorProfile] = useState<CreatorProfile | null>(null);
  const [shouldRedirectToDashboard, setShouldRedirectToDashboard] = useState(false);

  useEffect(() => {
    let mounted = true;

    const checkAuthAndProfile = async () => {
      try {
        // Get current session
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!mounted) return;

        if (!session?.user) {
          setUser(null);
          setCreatorProfile(null);
          setIsLoading(false);
          return;
        }

        setUser(session.user);

        // Check for creator profile
        const { data: profile } = await supabase
          .from('creator_profiles')
          .select('id, display_name, status')
          .eq('user_id', session.user.id)
          .maybeSingle();

        if (!mounted) return;

        if (profile) {
          setCreatorProfile(profile);
          setShouldRedirectToDashboard(true);
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

        if (event === 'SIGNED_OUT') {
          setUser(null);
          setCreatorProfile(null);
          setShouldRedirectToDashboard(false);
        } else if (event === 'SIGNED_IN' && session?.user) {
          setUser(session.user);
          
          // Check for creator profile after sign in
          const { data: profile } = await supabase
            .from('creator_profiles')
            .select('id, display_name, status')
            .eq('user_id', session.user.id)
            .maybeSingle();

          if (mounted && profile) {
            setCreatorProfile(profile);
            setShouldRedirectToDashboard(true);
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

  // Logged in but no creator profile - redirect to signup
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

  // User has creator profile - redirect to dashboard
  if (shouldRedirectToDashboard) {
    return <Navigate to="/creator-dashboard" replace />;
  }

  // Render children (the routes)
  return <>{children}</>;
}

export default NativeAppGate;
