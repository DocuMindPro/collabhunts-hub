import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { FEATURING_TIERS, FeatureType, formatFeaturingPrice } from "@/config/featuring-tiers";
import { Badge as BadgeIcon, Star, TrendingUp, Sparkles, Check, Loader2, Bell } from "lucide-react";

const iconMap = {
  Badge: BadgeIcon,
  Star: Star,
  TrendingUp: TrendingUp,
  Sparkles: Sparkles
};

interface BoostProfileDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  creatorProfileId: string;
  onSuccess?: () => void;
}

const BoostProfileDialog = ({ open, onOpenChange, creatorProfileId }: BoostProfileDialogProps) => {
  const [submitting, setSubmitting] = useState<string | null>(null);

  const handleInterest = async (featureType: FeatureType) => {
    setSubmitting(featureType);
    try {
      const { error } = await supabase
        .from("boost_interest_requests")
        .insert({
          creator_profile_id: creatorProfileId,
          feature_type: featureType,
        });

      if (error) throw error;

      toast.success("We've noted your interest!", {
        description: "Our team will review and reach out to you soon."
      });
      onOpenChange(false);
    } catch (error: any) {
      console.error("Error submitting boost interest:", error);
      toast.error("Could not submit your interest. Please try again.");
    } finally {
      setSubmitting(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Boost Your Profile</DialogTitle>
          <DialogDescription>
            Self-service boosts are coming soon! Let us know which option interests you and our team will reach out.
          </DialogDescription>
        </DialogHeader>

        <div className="rounded-lg border border-primary/20 bg-primary/5 p-4 mb-4">
          <div className="flex items-center gap-2 text-primary font-medium text-sm">
            <Bell className="h-4 w-4" />
            Coming Soon — Express your interest below
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Click "I'm Interested" on any package and our team will be notified to set it up for you.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {FEATURING_TIERS.map((tierOption) => {
            const Icon = iconMap[tierOption.icon as keyof typeof iconMap];
            const isSubmitting = submitting === tierOption.id;

            return (
              <Card key={tierOption.id} className="relative">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <Icon className="h-5 w-5 text-primary" />
                    <Badge variant="secondary" className="text-xs">Coming Soon</Badge>
                  </div>
                  <CardTitle className="text-base">{tierOption.name}</CardTitle>
                  <CardDescription className="text-xs">
                    {tierOption.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-lg font-bold text-primary">
                    {formatFeaturingPrice(tierOption.pricePerWeek)}/week
                  </p>
                  <ul className="mt-2 space-y-1 mb-3">
                    {tierOption.benefits.map((benefit, idx) => (
                      <li key={idx} className="text-xs text-muted-foreground flex items-start gap-1">
                        <Check className="h-3 w-3 text-primary mt-0.5 shrink-0" />
                        {benefit}
                      </li>
                    ))}
                  </ul>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    disabled={isSubmitting}
                    onClick={() => handleInterest(tierOption.id)}
                  >
                    {isSubmitting ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <Bell className="h-4 w-4 mr-2" />
                    )}
                    I'm Interested
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BoostProfileDialog;
