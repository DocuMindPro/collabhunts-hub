import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface StatsUpdateBannerProps {
  creatorProfileId: string;
  onNavigateToProfile: () => void;
  onDismissed: () => void;
}

const StatsUpdateBanner = ({ creatorProfileId, onNavigateToProfile, onDismissed }: StatsUpdateBannerProps) => {
  const { toast } = useToast();
  const [confirming, setConfirming] = useState(false);

  const handleConfirmNoChanges = async () => {
    setConfirming(true);
    try {
      const { error } = await supabase
        .from("creator_profiles")
        .update({
          stats_last_confirmed_at: new Date().toISOString(),
          stats_update_required: false,
        })
        .eq("id", creatorProfileId);

      if (error) throw error;

      toast({
        title: "Stats Confirmed!",
        description: "Your account is now active. See you in 3 months!",
      });
      onDismissed();
    } catch (error) {
      console.error("Error confirming stats:", error);
      toast({
        title: "Error",
        description: "Failed to confirm stats. Please try again.",
        variant: "destructive",
      });
    } finally {
      setConfirming(false);
    }
  };

  return (
    <Alert className="border-amber-500/50 bg-amber-50 dark:bg-amber-950/20 mb-4">
      <AlertTriangle className="h-5 w-5 text-amber-600" />
      <AlertTitle className="text-amber-800 dark:text-amber-400 font-semibold">
        Account Inactive — Stats Update Required
      </AlertTitle>
      <AlertDescription className="mt-2">
        <p className="text-amber-700 dark:text-amber-300 text-sm mb-3">
          To keep your account active and visible to brands, please update your social media follower counts or confirm they haven't changed. This is required every 3 months.
        </p>
        <div className="flex flex-wrap gap-2">
          <Button size="sm" onClick={onNavigateToProfile}>
            Update Stats
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={handleConfirmNoChanges}
            disabled={confirming}
          >
            {confirming && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Confirm No Changes
          </Button>
        </div>
      </AlertDescription>
    </Alert>
  );
};

export default StatsUpdateBanner;
