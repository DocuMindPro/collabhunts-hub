import { useEffect, useState, useCallback } from 'react';
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
 */
export function NativeAppGate({ children }: NativeAppGateProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [creatorProfile, setCreatorProfile] = useState<CreatorProfile | null>(null);
  const [brandProfile, setBrandProfile] = useState<BrandProfile | null>(null);
  const [selectedRole, setSelectedRole] = useState<NativeRole | null>(null);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showBrandOnboarding, setShowBrandOnboarding] = useState(false);

  const refetchProfiles = useCallback(async (userId: string) => {
    const [creator, brand] = await Promise.all([
      safeNativeAsync(async () => {
        const { data } = await supabase
          .from('creator_profiles')
          .select('id, display_name, status')
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

  // After onboarding completes, refetch and auto-select creator
  const handleOnboardingComplete = useCallback(async () => {
    if (!user) return;
    const { creator } = await refetchProfiles(user.id);
    if (creator) {
      setSelectedRole('creator');
      setShowOnboarding(false);
    }
  }, [user, refetchProfiles]);

  // After brand onboarding completes, refetch and auto-select brand
  const handleBrandOnboardingComplete = useCallback(async () => {
    if (!user) return;
    const { brand } = await refetchProfiles(user.id);
    if (brand) {
      setSelectedRole('brand');
      setShowBrandOnboarding(false);
    }
  }, [user, refetchProfiles]);

  // Failsafe timeout
  useEffect(() => {
    const failsafe = setTimeout(() => {
      if (isLoading) {
        console.warn('NativeAppGate: Failsafe timeout reached');
        setIsLoading(false);
      }
    }, 10000);
    return () => clearTimeout(failsafe);
  }, [isLoading]);

  useEffect(() => {
    let mounted = true;

    const checkAuthAndProfile = async () => {
      try {
        const session = await safeNativeAsync(
          async () => {
            const { data } = await supabase.auth.getSession();
            return data.session;
          },
          null,
          5000
        );

        if (!mounted) return;

        if (!session?.user) {
          setUser(null);
          setCreatorProfile(null);
          setBrandProfile(null);
          setIsLoading(false);
          return;
        }

        setUser(session.user);
        await refetchProfiles(session.user.id);

        if (mounted) setIsLoading(false);
      } catch (error) {
        console.error('NativeAppGate: Error:', error);
        if (mounted) setIsLoading(false);
      }
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;

        if (event === 'SIGNED_OUT') {
          setUser(null);
          setCreatorProfile(null);
          setBrandProfile(null);
          setSelectedRole(null);
          setShowOnboarding(false);
          setShowBrandOnboarding(false);
        } else if (event === 'SIGNED_IN' && session?.user) {
          setUser(session.user);
          const { creator, brand } = await refetchProfiles(session.user.id);

          // Auto-select role if only one profile exists
          if (mounted) {
            if (creator && !brand) setSelectedRole('creator');
            else if (brand && !creator) setSelectedRole('brand');
            // If both or neither, user will pick via NativeRolePicker
          }
        }
      }
    );

    checkAuthAndProfile();

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [refetchProfiles]);

  // Auto-select role when profiles load (after initial check)
  useEffect(() => {
    if (isLoading || !user) return;
    if (selectedRole) return; // Already picked

    if (creatorProfile && !brandProfile) {
      setSelectedRole('creator');
    } else if (brandProfile && !creatorProfile) {
      setSelectedRole('brand');
    }
  }, [isLoading, user, creatorProfile, brandProfile, selectedRole]);

  if (isLoading) return <NativeLoadingScreen />;
  if (!user) return <NativeLogin />;

  // Show onboarding if user chose to create a creator profile
  if (showOnboarding) {
    return <NativeCreatorOnboarding user={user} onComplete={handleOnboardingComplete} />;
  }

  // Show brand onboarding if user chose to create a brand profile
  if (showBrandOnboarding) {
    return <NativeBrandOnboarding user={user} onComplete={handleBrandOnboardingComplete} />;
  }

  // Need role selection (both profiles, or neither)
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
