import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import { ExternalLink } from "lucide-react";

interface AdPlacementData {
  id: string;
  placement_id: string;
  advertiser_name: string | null;
  advertiser_type: string | null;
  image_url: string | null;
  link_url: string | null;
  link_type: string | null;
  target_creator_profile_id: string | null;
  is_active: boolean;
}

interface AdPlacementProps {
  placementId: string;
  className?: string;
  fallback?: React.ReactNode;
  showAdvertiseHere?: boolean;
}

const AdPlacement = ({ placementId, className = "", fallback, showAdvertiseHere = true }: AdPlacementProps) => {
  const [ad, setAd] = useState<AdPlacementData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAd = async () => {
      try {
        const now = new Date().toISOString();
        const { data, error } = await supabase
          .from("ad_placements")
          .select("*")
          .eq("placement_id", placementId)
          .eq("is_active", true)
          .or(`start_date.is.null,start_date.lte.${now}`)
          .or(`end_date.is.null,end_date.gte.${now}`)
          .maybeSingle();

        if (error) {
          console.error("Error fetching ad:", error);
          return;
        }

        setAd(data);
      } catch (error) {
        console.error("Error fetching ad:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAd();
  }, [placementId]);

  if (loading) {
    return null;
  }

  // No active ad - show fallback or "Advertise Here"
  if (!ad || !ad.is_active || !ad.image_url) {
    if (fallback) {
      return <>{fallback}</>;
    }
    
    if (showAdvertiseHere) {
      return (
        <a 
          href="mailto:advertise@collabhunts.com?subject=Advertising%20Inquiry" 
          className={`block ${className}`}
        >
          <div className="h-full bg-muted/50 border-2 border-dashed border-border rounded-lg p-6 flex flex-col items-center justify-center text-center hover:border-primary/50 hover:bg-muted transition-colors">
            <ExternalLink className="h-6 w-6 mb-2 text-muted-foreground" />
            <p className="font-medium text-muted-foreground">Advertise Here</p>
            <p className="text-xs text-muted-foreground mt-1">advertise@collabhunts.com</p>
          </div>
        </a>
      );
    }
    
    return null;
  }

  // Render active ad
  const AdContent = (
    <div className={`relative group ${className}`}>
      <img 
        src={ad.image_url} 
        alt={ad.advertiser_name || "Sponsored"} 
        className="w-full h-full object-cover rounded-lg"
      />
      <span className="absolute top-2 left-2 bg-background/80 backdrop-blur text-xs px-2 py-1 rounded text-muted-foreground">
        Sponsored
      </span>
      {ad.advertiser_name && (
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-3 rounded-b-lg">
          <p className="text-white text-sm font-medium">{ad.advertiser_name}</p>
        </div>
      )}
    </div>
  );

  // Handle different link types
  if (ad.link_type === "creator_profile" && ad.target_creator_profile_id) {
    return (
      <Link to={`/creator/${ad.target_creator_profile_id}`}>
        {AdContent}
      </Link>
    );
  }

  if (ad.link_url) {
    return (
      <a 
        href={ad.link_url} 
        target="_blank" 
        rel="noopener noreferrer"
      >
        {AdContent}
      </a>
    );
  }

  return AdContent;
};

export default AdPlacement;
