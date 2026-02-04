import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Check, X, Gift, Sparkles, Users, Swords, Wand2 } from "lucide-react";
import { EVENT_PACKAGES, type PackageType } from "@/config/packages";

interface PackageStepProps {
  packageType: PackageType;
  onComplete: (data: { interested: boolean; price?: number; storyUpsellPrice?: number }) => void;
  onBack: () => void;
  currentStep: number;
  totalSteps: number;
}

const PACKAGE_ICONS: Record<PackageType, React.ReactNode> = {
  unbox_review: <Gift className="h-8 w-8" />,
  social_boost: <Sparkles className="h-8 w-8" />,
  meet_greet: <Users className="h-8 w-8" />,
  competition: <Swords className="h-8 w-8" />,
  custom: <Wand2 className="h-8 w-8" />
};

const PackageStep = ({ packageType, onComplete, onBack, currentStep, totalSteps }: PackageStepProps) => {
  const [interested, setInterested] = useState<boolean | null>(null);
  const [price, setPrice] = useState<string>("");
  const [storyUpsellPrice, setStoryUpsellPrice] = useState<string>("");

  const pkg = EVENT_PACKAGES[packageType];
  const isPKBattle = packageType === "competition";
  const isCustom = packageType === "custom";
  const hasStoryUpsell = pkg.upsells?.some(u => u.id === 'instagram_stories');

  const handleContinue = () => {
    if (interested === false) {
      onComplete({ interested: false });
      return;
    }
    
    if (isPKBattle || isCustom) {
      onComplete({ interested: true });
      return;
    }

    const priceValue = parseInt(price);
    if (!priceValue || priceValue < 10) {
      return; // Validation will show via input state
    }
    
    const storyPrice = storyUpsellPrice ? parseInt(storyUpsellPrice) : undefined;
    onComplete({ interested: true, price: priceValue, storyUpsellPrice: storyPrice });
  };

  // Get key deliverables from package phases
  const getDeliverables = () => {
    const deliverables: string[] = [];
    if (pkg.phases) {
      pkg.phases.forEach(phase => {
        phase.items.forEach(item => {
          if (deliverables.length < 4) {
            deliverables.push(item);
          }
        });
      });
    }
    return deliverables.length > 0 ? deliverables : pkg.includes.slice(0, 4);
  };

  return (
    <div className="space-y-6">
      {/* Progress indicator */}
      <div className="text-center text-sm text-muted-foreground">
        Step {currentStep} of {totalSteps}
      </div>

      {/* Package Icon */}
      <div className="flex justify-center">
        <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
          {PACKAGE_ICONS[packageType]}
        </div>
      </div>

      {/* Package Title */}
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-heading font-bold">{pkg.name}</h2>
        <p className="text-muted-foreground">{pkg.description}</p>
      </div>

      {/* What brands expect */}
      <div className="bg-muted/50 rounded-lg p-4 space-y-3">
        <p className="text-sm font-semibold text-foreground">What brands expect:</p>
        <ul className="space-y-2">
          {getDeliverables().map((item, idx) => (
            <li key={idx} className="flex items-start gap-2 text-sm text-muted-foreground">
              <Check className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
        {pkg.durationRange && (
          <p className="text-xs text-muted-foreground">
            Duration: {pkg.durationRange.min}-{pkg.durationRange.max} hours
          </p>
        )}
      </div>

      {/* PK Battle special note */}
      {isPKBattle && (
        <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 text-sm">
          <p className="text-foreground font-medium mb-1">💡 Note</p>
          <p className="text-muted-foreground">
            Pricing for Live PK Battles is handled by CollabHunts during event planning discussions with brands.
          </p>
        </div>
      )}

      {/* Question */}
      <div className="text-center">
        <p className="font-medium text-lg">
          {isPKBattle 
            ? "Are you available for PK battles?"
            : "Would you offer this service?"
          }
        </p>
      </div>

      {/* Yes/No Buttons */}
      {interested === null && (
        <div className="flex gap-3">
          <Button
            variant="outline"
            className="flex-1 h-12"
            onClick={() => {
              setInterested(false);
              onComplete({ interested: false });
            }}
          >
            <X className="h-4 w-4 mr-2" />
            {isPKBattle ? "No" : "No, skip"}
          </Button>
          <Button
            className="flex-1 h-12 gradient-hero hover:opacity-90"
            onClick={() => setInterested(true)}
          >
            <Check className="h-4 w-4 mr-2" />
            {isPKBattle ? "Yes" : "Yes, I'm interested"}
          </Button>
        </div>
      )}

      {/* Price Input (only if interested and not PK Battle/Custom) */}
      {interested === true && !isPKBattle && !isCustom && (
        <div className="space-y-4">
          <div className="p-4 border rounded-lg bg-background space-y-4">
            <div className="flex items-center gap-2 text-primary">
              <Check className="h-5 w-5" />
              <span className="font-medium">Great! Now set your price</span>
            </div>
            <div className="space-y-2">
              <Label htmlFor="price">Your Price (USD)</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                <Input
                  id="price"
                  type="number"
                  min="10"
                  placeholder="e.g., 200"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="pl-8"
                />
              </div>
              {price && parseInt(price) < 10 && (
                <p className="text-xs text-destructive">Minimum price is $10</p>
              )}
            </div>
            
            {/* Story Upsell Price */}
            {hasStoryUpsell && price && parseInt(price) >= 10 && (
              <div className="space-y-2 pt-3 border-t">
                <Label htmlFor="storyUpsell">Instagram Stories Upsell (Optional)</Label>
                <p className="text-xs text-muted-foreground">
                  Brands can add stories as an extra. Set your price for this add-on.
                </p>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                  <Input
                    id="storyUpsell"
                    type="number"
                    min="5"
                    placeholder="e.g., 15"
                    value={storyUpsellPrice}
                    onChange={(e) => setStoryUpsellPrice(e.target.value)}
                    className="pl-8"
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  💡 Suggested: $10-30 (low-effort upsell). Leave empty if you don't offer this.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Continue after price entered OR for PK Battle/Custom */}
      {interested === true && (isPKBattle || isCustom || (price && parseInt(price) >= 10)) && (
        <Button 
          className="w-full h-12 gradient-hero hover:opacity-90"
          onClick={handleContinue}
        >
          Continue
        </Button>
      )}

      {/* Change selection link */}
      {interested === true && !isPKBattle && (
        <button 
          className="w-full text-center text-sm text-muted-foreground hover:text-foreground"
          onClick={() => {
            setInterested(null);
            setPrice("");
          }}
        >
          Change my answer
        </button>
      )}

      {/* Back button */}
      <Button
        variant="ghost"
        className="w-full"
        onClick={onBack}
      >
        Back
      </Button>
    </div>
  );
};

export default PackageStep;
