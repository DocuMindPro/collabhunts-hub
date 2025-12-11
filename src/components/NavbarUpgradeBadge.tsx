import { Button } from "@/components/ui/button";
import { Zap } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

const NavbarUpgradeBadge = () => {
  const navigate = useNavigate();
  const [showBadge, setShowBadge] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkSubscription();
  }, []);

  const checkSubscription = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setIsLoading(false);
        return;
      }

      // Check if user has a brand profile
      const { data: brandProfile } = await supabase
        .from('brand_profiles')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (!brandProfile) {
        setIsLoading(false);
        return;
      }

      // Check subscription
      const { data: subscription } = await supabase
        .from('brand_subscriptions')
        .select('plan_type, status')
        .eq('brand_profile_id', brandProfile.id)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      // Show badge only for 'none' tier or no active subscription
      setShowBadge(!subscription || subscription.plan_type === 'none');
      setIsLoading(false);
    } catch (error) {
      console.error('Error checking subscription:', error);
      setIsLoading(false);
    }
  };

  if (isLoading || !showBadge) return null;

  return (
    <Button
      size="sm"
      onClick={() => navigate('/brand-dashboard?tab=subscription')}
      className={cn(
        "relative gap-1.5 bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90",
        "shadow-lg shadow-primary/25 animate-pulse hover:animate-none"
      )}
    >
      <Zap className="h-3.5 w-3.5" />
      <span className="hidden sm:inline">Upgrade</span>
      
      {/* Glow effect */}
      <span className="absolute inset-0 rounded-md bg-primary/20 blur-md -z-10" />
    </Button>
  );
};

export default NavbarUpgradeBadge;
