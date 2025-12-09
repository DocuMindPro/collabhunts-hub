import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { canUserUseCRM } from "@/lib/subscription-utils";
import { useNavigate } from "react-router-dom";

export const useSaveCreator = (creatorProfileId: string | undefined) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isSaved, setIsSaved] = useState(false);
  const [savedId, setSavedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [brandProfileId, setBrandProfileId] = useState<string | null>(null);
  const [canUseCRM, setCanUseCRM] = useState(false);

  useEffect(() => {
    if (creatorProfileId) {
      checkIfSaved();
    }
  }, [creatorProfileId]);

  const checkIfSaved = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      // Check CRM access
      const hasCRMAccess = await canUserUseCRM(user.id);
      setCanUseCRM(hasCRMAccess);

      // Get brand profile
      const { data: brandProfile } = await supabase
        .from("brand_profiles")
        .select("id")
        .eq("user_id", user.id)
        .maybeSingle();

      if (!brandProfile) {
        setLoading(false);
        return;
      }

      setBrandProfileId(brandProfile.id);

      // Check if already saved
      const { data: savedData } = await supabase
        .from("saved_creators")
        .select("id")
        .eq("brand_profile_id", brandProfile.id)
        .eq("creator_profile_id", creatorProfileId)
        .maybeSingle();

      if (savedData) {
        setIsSaved(true);
        setSavedId(savedData.id);
      } else {
        setIsSaved(false);
        setSavedId(null);
      }
    } catch (error) {
      console.error("Error checking saved status:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleSave = useCallback(async () => {
    if (!creatorProfileId) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Login Required",
          description: "Please login to save creators",
          variant: "destructive"
        });
        return;
      }

      // Check CRM access
      if (!canUseCRM) {
        toast({
          title: "Upgrade Required",
          description: "Upgrade to Pro to save creators and use the CRM features",
        });
        navigate("/brand-dashboard?tab=subscription");
        return;
      }

      let currentBrandProfileId = brandProfileId;

      if (!currentBrandProfileId) {
        const { data: brandProfile } = await supabase
          .from("brand_profiles")
          .select("id")
          .eq("user_id", user.id)
          .maybeSingle();

        if (!brandProfile) {
          toast({
            title: "Brand Profile Required",
            description: "Only brands can save creators",
            variant: "destructive"
          });
          return;
        }
        currentBrandProfileId = brandProfile.id;
        setBrandProfileId(currentBrandProfileId);
      }

      if (isSaved && savedId) {
        // Unsave
        const { error } = await supabase
          .from("saved_creators")
          .delete()
          .eq("id", savedId);

        if (error) throw error;

        setIsSaved(false);
        setSavedId(null);
        toast({ title: "Creator removed from saved" });
      } else {
        // Save
        const { data, error } = await supabase
          .from("saved_creators")
          .insert({
            brand_profile_id: currentBrandProfileId,
            creator_profile_id: creatorProfileId,
            folder_name: "Favorites"
          })
          .select("id")
          .single();

        if (error) throw error;

        setIsSaved(true);
        setSavedId(data.id);
        toast({ title: "Creator saved to Favorites!" });
      }
    } catch (error: any) {
      console.error("Error toggling save:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to save creator",
        variant: "destructive"
      });
    }
  }, [creatorProfileId, brandProfileId, isSaved, savedId, canUseCRM, toast, navigate]);

  return {
    isSaved,
    loading,
    toggleSave,
    hasBrandProfile: !!brandProfileId,
    canUseCRM
  };
};
