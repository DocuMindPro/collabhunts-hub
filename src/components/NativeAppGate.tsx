import { useEffect, useState, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';
import { safeNativeAsync } from '@/lib/supabase-native';
import NativeLoadingScreen from './NativeLoadingScreen';
import NativeLogin from '@/pages/NativeLogin';
import NativeCreatorOnboarding from '@/pages/NativeCreatorOnboarding';
import NativeBrandOnboarding from '@/pages/NativeBrandOnboarding';
import NativeRolePicker from './NativeRolePicker';

interface CreatorProfile {
  id: string;
  display_name: string;
  status: string | null;
  bio: string | null;
  categories: string[] | null;
}

interface BrandProfile {
  id: string;
  company_name: string;
  registration_completed: boolean;
}

export type NativeRole = 'creator' | 'brand';

interface NativeAppGateProps {
  children: (role: NativeRole, brandProfile?: BrandProfile | null) => React.ReactNode;
}

/**
 * Authentication gate for native mobile apps.
 * Supports both Creator and Brand roles.
 *
 * Session persistence hardening:
 * - Uses INITIAL_SESSION event to avoid double-fetch on first load
 * - Handles TOKEN_REFRESHED to update user state without resetting profiles
 * - Calls refreshSession() when getSession() returns a user but no token
 * - Never clears profiles on TOKEN_REFRESHED (prevents false logout)
 * - Retry profile fetch with backoff to survive race conditions on signup
 */
export function NativeAppGate({ children }: NativeAppGateProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [creatorProfile, setCreatorProfile] = useState<CreatorProfile | null>(null);
  const [brandProfile, setBrandProfile] = useState<BrandProfile | null>(null);
  const [selectedRole, setSelectedRole] = useState<NativeRole | null>(null);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showBrandOnboarding, setShowBrandOnboarding] = useState(false);

  // Track whether initial session check has completed so the auth listener
  // doesn't re-run routing logic before profiles are first loaded.
  const initialCheckDone = useRef(false);

  // ── Profile fetching ──────────────────────────────────────────────────────

  const refetchProfiles = useCallback(async (userId: string) => {
    const [creator, brand] = await Promise.all([
      safeNativeAsync(async () => {
        const { data } = await supabase
          .from('creator_profiles')
          .select('id, display_name, status, bio, categories')
          .eq('user_id', userId)
          .maybeSingle();
        return data;
      }, null, 5000),
      safeNativeAsync(async () => {
        const { data } = await supabase
          .from('brand_profiles')
          .select('id, company_name, registration_completed')
          .eq('user_id', userId)
          .maybeSingle();
        return data;
      }, null, 5000),
    ]);

    setCreatorProfile(creator);
    setBrandProfile(brand);
    return { creator, brand };
  }, []);

  // ── Route resolution ──────────────────────────────────────────────────────

  /**
   * Decide what screen to show based on profiles.
   * Called after every profile fetch.
   */
  const resolveRoute = useCallback((
    creator: CreatorProfile | null,
    brand: BrandProfile | null,
    userType?: string,
  ) => {
    if (creator && !brand) {
      if (isCreatorProfileComplete(creator)) {
        setSelectedRole('creator');
        setShowOnboarding(false);
      } else {
        setShowOnboarding(true);
      }
    } else if (brand && !creator) {
      if (brand.registration_completed) {
        setSelectedRole('brand');
        setShowBrandOnboarding(false);
      } else {
        setShowBrandOnboarding(true);
      }
    } else if (creator && brand) {
      // Both profiles: let user pick (role picker handles this)
    } else {
      // No profiles — fall back to user_type metadata
      if (userType === 'brand') setShowBrandOnboarding(true);
      else if (userType === 'creator') setShowOnboarding(true);
    }
  }, []);

  // ── Onboarding completion handlers ────────────────────────────────────────

  const handleOnboardingComplete = useCallback(async () => {
    if (!user) return;
    const { creator } = await refetchProfiles(user.id);
    if (creator) {
      setSelectedRole('creator');
      setShowOnboarding(false);
    }
  }, [user, refetchProfiles]);

  const handleBrandOnboardingComplete = useCallback(async () => {
    if (!user) return;
    const { brand } = await refetchProfiles(user.id);
    if (brand) {
      setSelectedRole('brand');
      setShowBrandOnboarding(false);
    }
  }, [user, refetchProfiles]);

  // ── Failsafe ──────────────────────────────────────────────────────────────

  useEffect(() => {
    const failsafe = setTimeout(() => {
      if (isLoading) {
        console.warn('NativeAppGate: Failsafe timeout — forcing render');
        setIsLoading(false);
      }
    }, 10000);
    return () => clearTimeout(failsafe);
  }, [isLoading]);

  // ── Main auth effect ──────────────────────────────────────────────────────

  useEffect(() => {
    let mounted = true;

    /**
     * Attempt to get a valid session.
     * If the stored session exists but the token may be expired,
     * we proactively refresh it so the next DB call succeeds.
     */
    const getValidSession = async () => {
      const session = await safeNativeAsync(async () => {
        const { data } = await supabase.auth.getSession();
        return data.session;
      }, null, 6000);

      if (session?.user) {
        // Check if token expires in the next 60 seconds — refresh proactively
        const expiresAt = session.expires_at ?? 0;
        const nowSecs = Math.floor(Date.now() / 1000);
        if (expiresAt - nowSecs < 60) {
          console.log('NativeAppGate: Token near expiry, refreshing...');
          const refreshed = await safeNativeAsync(async () => {
            const { data } = await supabase.auth.refreshSession();
            return data.session;
          }, null, 8000);
          return refreshed ?? session;
        }
      }

      return session;
    };

    const checkAuthAndProfile = async () => {
      try {
        const session = await getValidSession();

        if (!mounted) return;

        if (!session?.user) {
          setUser(null);
          setCreatorProfile(null);
          setBrandProfile(null);
          setIsLoading(false);
          initialCheckDone.current = true;
          return;
        }

        setUser(session.user);
        const { creator, brand } = await refetchProfiles(session.user.id);

        if (!mounted) return;

        // If no profiles yet (brand signed up but profile creation pending),
        // retry once after 2 seconds to handle commit race condition
        if (!creator && !brand) {
          await new Promise(r => setTimeout(r, 2000));
          if (!mounted) return;
          const retried = await refetchProfiles(session.user.id);
          if (mounted) {
            resolveRoute(retried.creator, retried.brand, session.user.user_metadata?.user_type);
          }
        } else {
          resolveRoute(creator, brand, session.user.user_metadata?.user_type);
        }

        if (mounted) {
          setIsLoading(false);
          initialCheckDone.current = true;
        }
      } catch (error) {
        console.error('NativeAppGate: checkAuthAndProfile error:', error);
        if (mounted) {
          setIsLoading(false);
          initialCheckDone.current = true;
        }
      }
    };

    // ── Auth state listener ────────────────────────────────────────────────

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;

        console.log('NativeAppGate: auth event', event);

        if (event === 'SIGNED_OUT') {
          setUser(null);
          setCreatorProfile(null);
          setBrandProfile(null);
          setSelectedRole(null);
          setShowOnboarding(false);
          setShowBrandOnboarding(false);
          return;
        }

        if (event === 'TOKEN_REFRESHED' && session?.user) {
          // Only update the user object — do NOT clear profiles or reset routing.
          // A token refresh means the existing session is still valid.
          setUser(session.user);
          return;
        }

        if (event === 'INITIAL_SESSION') {
          // Handled by checkAuthAndProfile() below; skip duplicate processing
          return;
        }

        if (event === 'SIGNED_IN' && session?.user) {
          // Skip if initial check hasn't finished yet — it will handle routing
          if (!initialCheckDone.current) return;

          setUser(session.user);

          // Defer DB calls to avoid Supabase auth deadlock
          const userId = session.user.id;
          const userType = session.user.user_metadata?.user_type;
          setTimeout(async () => {
            if (!mounted) return;
            const { creator, brand } = await refetchProfiles(userId);

            if (!mounted) return;

            if (!creator && !brand) {
              // Retry after short delay — profile may not be committed yet
              setTimeout(async () => {
                if (!mounted) return;
                const retried = await refetchProfiles(userId);
                if (mounted) resolveRoute(retried.creator, retried.brand, userType);
              }, 1500);
            } else {
              resolveRoute(creator, brand, userType);
            }
          }, 0);
          return;
        }

        if (event === 'USER_UPDATED' && session?.user) {
          setUser(session.user);
          return;
        }
      }
    );

    checkAuthAndProfile();

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [refetchProfiles, resolveRoute]);

  // ── Auto-select role after initial profile load ───────────────────────────

  // This effect runs when the initial loading completes and handles the case
  // where profiles are loaded but no role has been selected yet.
  useEffect(() => {
    if (isLoading || !user) return;
    if (selectedRole || showOnboarding || showBrandOnboarding) return;

    const userType = user.user_metadata?.user_type;
    resolveRoute(creatorProfile, brandProfile, userType);
  }, [isLoading, user, creatorProfile, brandProfile, selectedRole, showOnboarding, showBrandOnboarding, resolveRoute]);

  // ── Creator profile completeness check ────────────────────────────────────

  const isCreatorProfileComplete = (profile: CreatorProfile) => {
    // Only require display_name and bio; categories are now collected during onboarding
    // but legacy profiles may not have them
    return !!(profile.display_name && profile.bio);
  };

  // ── Render ────────────────────────────────────────────────────────────────

  if (isLoading) return <NativeLoadingScreen />;
  if (!user) return <NativeLogin />;

  if (showOnboarding) {
    return <NativeCreatorOnboarding user={user} onComplete={handleOnboardingComplete} />;
  }

  if (showBrandOnboarding) {
    return <NativeBrandOnboarding user={user} onComplete={handleBrandOnboardingComplete} />;
  }

  if (!selectedRole) {
    return (
      <NativeRolePicker
        user={user}
        creatorProfile={creatorProfile}
        brandProfile={brandProfile}
        onSelectRole={setSelectedRole}
        onStartCreatorOnboarding={() => setShowOnboarding(true)}
        onStartBrandOnboarding={() => setShowBrandOnboarding(true)}
      />
    );
  }

  return <>{children(selectedRole, brandProfile)}</>;
}

export default NativeAppGate;
