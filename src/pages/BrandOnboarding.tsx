import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import OnboardingProgress from "@/components/brand-onboarding/OnboardingProgress";
import IntentStep from "@/components/brand-onboarding/IntentStep";
import BudgetStep from "@/components/brand-onboarding/BudgetStep";
import CategoriesStep from "@/components/brand-onboarding/CategoriesStep";
import PlatformsStep from "@/components/brand-onboarding/PlatformsStep";
import SocialMediaStep from "@/components/brand-onboarding/SocialMediaStep";

const BrandOnboarding = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [brandProfileId, setBrandProfileId] = useState<string | null>(null);
  
  const [preferences, setPreferences] = useState({
    intent: "",
    budget: "",
    categories: [] as string[],
    platforms: [] as string[],
    socialMedia: { facebook: "", instagram: "", tiktok: "" },
  });

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/login");
        return;
      }

      const { data: brandProfile } = await supabase
        .from("brand_profiles")
        .select("id, onboarding_completed")
        .eq("user_id", user.id)
        .single();

      if (!brandProfile) {
        navigate("/brand-signup");
        return;
      }

      if (brandProfile.onboarding_completed) {
        navigate("/brand-dashboard");
        return;
      }

      setBrandProfileId(brandProfile.id);
    };

    checkAuth();
  }, [navigate]);

  const savePreferences = async () => {
    if (!brandProfileId) return;
    
    setLoading(true);
    try {
      const { error } = await supabase
        .from("brand_profiles")
        .update({
          marketing_intent: preferences.intent || null,
          monthly_budget_range: preferences.budget || null,
          preferred_categories: preferences.categories,
          preferred_platforms: preferences.platforms,
          facebook_url: preferences.socialMedia.facebook || null,
          instagram_url: preferences.socialMedia.instagram || null,
          tiktok_url: preferences.socialMedia.tiktok || null,
          onboarding_completed: true,
        })
        .eq("id", brandProfileId);

      if (error) throw error;

      toast({
        title: "Setup complete!",
        description: "We've personalized your experience.",
      });

      // Navigate to welcome page with preferences
      const params = new URLSearchParams();
      if (preferences.categories.length > 0) {
        params.set("categories", preferences.categories.join(","));
      }
      if (preferences.platforms.length > 0) {
        params.set("platforms", preferences.platforms.join(","));
      }
      
      navigate(`/brand-welcome?${params.toString()}`);
    } catch (error) {
      console.error("Error saving preferences:", error);
      toast({
        title: "Error",
        description: "Failed to save preferences. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = async () => {
    if (!brandProfileId) return;
    
    setLoading(true);
    try {
      await supabase
        .from("brand_profiles")
        .update({ onboarding_completed: true })
        .eq("id", brandProfileId);
      
      navigate("/brand-dashboard");
    } catch (error) {
      console.error("Error skipping onboarding:", error);
      navigate("/brand-dashboard");
    } finally {
      setLoading(false);
    }
  };

  const totalSteps = 5;

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        <Card className="p-6 sm:p-8">
          <div className="mb-8">
            <OnboardingProgress currentStep={step} totalSteps={totalSteps} />
          </div>

          {step === 1 && (
            <IntentStep
              value={preferences.intent}
              onChange={(intent) => setPreferences({ ...preferences, intent })}
              onNext={() => setStep(2)}
              onSkip={handleSkip}
            />
          )}

          {step === 2 && (
            <BudgetStep
              value={preferences.budget}
              onChange={(budget) => setPreferences({ ...preferences, budget })}
              onNext={() => setStep(3)}
              onBack={() => setStep(1)}
              onSkip={handleSkip}
            />
          )}

          {step === 3 && (
            <CategoriesStep
              value={preferences.categories}
              onChange={(categories) => setPreferences({ ...preferences, categories })}
              onNext={() => setStep(4)}
              onBack={() => setStep(2)}
              onSkip={handleSkip}
            />
          )}

          {step === 4 && (
            <PlatformsStep
              value={preferences.platforms}
              onChange={(platforms) => setPreferences({ ...preferences, platforms })}
              onNext={() => setStep(5)}
              onBack={() => setStep(3)}
              onSkip={handleSkip}
            />
          )}

          {step === 5 && (
            <SocialMediaStep
              value={preferences.socialMedia}
              onChange={(socialMedia) => setPreferences({ ...preferences, socialMedia })}
              onNext={savePreferences}
              onBack={() => setStep(4)}
              onSkip={handleSkip}
            />
          )}
        </Card>

        <p className="text-center text-sm text-muted-foreground mt-4">
          You can always update these preferences later in settings
        </p>
      </div>
    </div>
  );
};

export default BrandOnboarding;
