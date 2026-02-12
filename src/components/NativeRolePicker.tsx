import { User } from '@supabase/supabase-js';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Mic2, Building2, LogOut } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { NativeAppLogo } from '@/components/NativeAppLogo';

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

interface NativeRolePickerProps {
  user: User;
  creatorProfile: CreatorProfile | null;
  brandProfile: BrandProfile | null;
  onSelectRole: (role: 'creator' | 'brand') => void;
  onStartCreatorOnboarding: () => void;
  onStartBrandOnboarding: () => void;
}

/**
 * Role selection screen shown when user has both profiles or neither.
 * Lets them pick Creator or Brand mode for the native app.
 */
export function NativeRolePicker({
  user,
  creatorProfile,
  brandProfile,
  onSelectRole,
  onStartCreatorOnboarding,
  onStartBrandOnboarding,
}: NativeRolePickerProps) {
  const hasBoth = !!creatorProfile && !!brandProfile;
  const hasNeither = !creatorProfile && !brandProfile;

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    toast.success('Signed out');
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="flex-1 flex flex-col items-center justify-center p-6">
        {/* App Logo */}
        <div className="mb-6">
          <NativeAppLogo size="md" />
        </div>

        <h1 className="text-2xl font-bold text-foreground mb-2">
          {hasBoth ? 'Continue as...' : 'Get Started'}
        </h1>
        <p className="text-muted-foreground text-center mb-8 max-w-xs">
          {hasBoth
            ? 'Choose how you want to use the app'
            : 'Select your role to get started'}
        </p>

        <div className="w-full max-w-sm space-y-4">
          {/* Creator option */}
          {creatorProfile ? (
            <Card
              className="cursor-pointer border-2 hover:border-primary transition-colors"
              onClick={() => onSelectRole('creator')}
            >
              <CardContent className="flex items-center gap-4 p-5">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Mic2 className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-foreground">Creator</p>
                  <p className="text-sm text-muted-foreground">
                    {creatorProfile.display_name}
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card
              className="cursor-pointer border-2 border-dashed hover:border-primary transition-colors"
              onClick={onStartCreatorOnboarding}
            >
              <CardContent className="flex items-center gap-4 p-5">
                <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center flex-shrink-0">
                  <Mic2 className="h-6 w-6 text-muted-foreground" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-foreground">Become a Creator</p>
                  <p className="text-sm text-muted-foreground">Set up your profile</p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Brand option */}
          {brandProfile ? (
            <Card
              className="cursor-pointer border-2 hover:border-primary transition-colors"
              onClick={() => onSelectRole('brand')}
            >
              <CardContent className="flex items-center gap-4 p-5">
                <div className="w-12 h-12 rounded-xl bg-accent/50 flex items-center justify-center flex-shrink-0">
                  <Building2 className="h-6 w-6 text-accent-foreground" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-foreground">Brand / Venue</p>
                  <p className="text-sm text-muted-foreground">
                    {brandProfile.company_name}
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card
              className="cursor-pointer border-2 border-dashed hover:border-primary transition-colors"
              onClick={onStartBrandOnboarding}
            >
              <CardContent className="flex items-center gap-4 p-5">
                <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center flex-shrink-0">
                  <Building2 className="h-6 w-6 text-muted-foreground" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-foreground">Brand / Venue</p>
                  <p className="text-sm text-muted-foreground">
                    Set up your brand profile
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

      {/* Sign out */}
        <Button
          variant="ghost"
          className="mt-8 text-muted-foreground"
          onClick={handleSignOut}
        >
          <LogOut className="h-4 w-4 mr-2" />
          Sign Out
        </Button>

        <p className="mt-4 text-xs text-muted-foreground/60">v1.0.0 (build 1)</p>
      </div>
    </div>
  );
}

export default NativeRolePicker;
