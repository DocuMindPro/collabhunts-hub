import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { FEATURING_TIERS, FeatureType, formatFeaturingPrice, getFeaturingTier, CREATOR_CATEGORIES } from "@/config/featuring-tiers";
import { Badge as BadgeIcon, Star, TrendingUp, Sparkles, Check, Loader2 } from "lucide-react";

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

const BoostProfileDialog = ({ open, onOpenChange, creatorProfileId, onSuccess }: BoostProfileDialogProps) => {
  const [selectedTier, setSelectedTier] = useState<FeatureType | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedDuration, setSelectedDuration] = useState<number>(1); // weeks
  const [isSubmitting, setIsSubmitting] = useState(false);

  const tier = selectedTier ? getFeaturingTier(selectedTier) : null;
  const totalPrice = tier ? tier.pricePerWeek * selectedDuration : 0;

  const handlePurchase = async () => {
    if (!selectedTier || !tier) return;
    
    if (selectedTier === 'category_boost' && !selectedCategory) {
      toast.error("Please select a category for the boost");
      return;
    }

    setIsSubmitting(true);
    try {
      const startDate = new Date();
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + (selectedDuration * 7));

      const { error } = await supabase
        .from("creator_featuring")
        .insert({
          creator_profile_id: creatorProfileId,
          feature_type: selectedTier,
          category: selectedTier === 'category_boost' ? selectedCategory : null,
          start_date: startDate.toISOString(),
          end_date: endDate.toISOString(),
          price_cents: totalPrice,
          is_active: true
        });

      if (error) throw error;

      // Update creator profile featuring status
      await supabase
        .from("creator_profiles")
        .update({ 
          is_featured: true,
          featuring_priority: selectedTier === 'auto_popup' ? 4 : 
                             selectedTier === 'homepage_spotlight' ? 3 :
                             selectedTier === 'category_boost' ? 2 : 1
        })
        .eq("id", creatorProfileId);

      toast.success("Profile boost activated!", {
        description: `Your ${tier.name} is now active for ${selectedDuration} week${selectedDuration > 1 ? 's' : ''}.`
      });
      
      onOpenChange(false);
      onSuccess?.();
    } catch (error) {
      console.error("Error purchasing featuring:", error);
      toast.error("Failed to activate boost. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Boost Your Profile</DialogTitle>
          <DialogDescription>
            Get more visibility and attract more brands to your profile
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {FEATURING_TIERS.map((tierOption) => {
              const Icon = iconMap[tierOption.icon as keyof typeof iconMap];
              const isSelected = selectedTier === tierOption.id;
              
              return (
                <Card 
                  key={tierOption.id}
                  className={`cursor-pointer transition-all ${
                    isSelected 
                      ? 'ring-2 ring-primary border-primary' 
                      : 'hover:border-primary/50'
                  }`}
                  onClick={() => setSelectedTier(tierOption.id)}
                >
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <Icon className="h-5 w-5 text-primary" />
                      {isSelected && (
                        <Badge variant="default" className="text-xs">Selected</Badge>
                      )}
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
                    <ul className="mt-2 space-y-1">
                      {tierOption.benefits.map((benefit, idx) => (
                        <li key={idx} className="text-xs text-muted-foreground flex items-start gap-1">
                          <Check className="h-3 w-3 text-primary mt-0.5 shrink-0" />
                          {benefit}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {selectedTier && (
            <div className="space-y-4 pt-4 border-t">
              {selectedTier === 'category_boost' && (
                <div className="space-y-2">
                  <Label>Select Category to Boost</Label>
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a category" />
                    </SelectTrigger>
                    <SelectContent>
                      {CREATOR_CATEGORIES.map((category) => (
                        <SelectItem key={category.value} value={category.value}>
                          {category.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="space-y-2">
                <Label>Duration</Label>
                <Select 
                  value={selectedDuration.toString()} 
                  onValueChange={(v) => setSelectedDuration(parseInt(v))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 Week</SelectItem>
                    <SelectItem value="2">2 Weeks</SelectItem>
                    <SelectItem value="4">4 Weeks (1 Month)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                <div>
                  <p className="text-sm text-muted-foreground">Total</p>
                  <p className="text-2xl font-bold">{formatFeaturingPrice(totalPrice)}</p>
                </div>
                <Button 
                  size="lg" 
                  onClick={handlePurchase}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    'Activate Boost'
                  )}
                </Button>
              </div>
              
              <p className="text-xs text-center text-muted-foreground">
                Payment will be processed off-platform. Contact support for payment details.
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BoostProfileDialog;
