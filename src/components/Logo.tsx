import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import collabhuntsIcon from "@/assets/collabhunts-icon.png";
import collabhuntsLogo from "@/assets/collabhunts-logo.png";

interface LogoProps {
  className?: string;
  showText?: boolean;
  size?: "sm" | "md" | "lg";
}

const Logo = ({ className = "", showText = true, size = "md" }: LogoProps) => {
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [iconUrl, setIconUrl] = useState<string | null>(null);

  // Larger heights for uploaded logos to be readable
  const sizes = {
    sm: { icon: 28, logoHeight: 32, text: "text-lg" },
    md: { icon: 36, logoHeight: 40, text: "text-xl" },
    lg: { icon: 44, logoHeight: 48, text: "text-2xl" },
  };

  const { icon, logoHeight, text } = sizes[size];
  useEffect(() => {
    const fetchLogos = async () => {
      const { data } = await supabase
        .from("site_settings")
        .select("key, value")
        .in("key", ["logo_primary_url", "logo_icon_url"]);

      if (data) {
        const primary = data.find((d) => d.key === "logo_primary_url");
        const iconLogo = data.find((d) => d.key === "logo_icon_url");
        if (primary?.value) setLogoUrl(primary.value);
        if (iconLogo?.value) setIconUrl(iconLogo.value);
      }
    };

    fetchLogos();
  }, []);

  // Use uploaded logo if available
  const displayLogoUrl = showText ? logoUrl : (iconUrl || logoUrl);

  if (displayLogoUrl) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <img
          src={displayLogoUrl}
          alt="CollabHunts"
          style={{ height: logoHeight, width: "auto", maxWidth: showText ? 180 : logoHeight }}
          className="flex-shrink-0 object-contain"
        />
        {/* Show text if using icon-only logo */}
        {showText && iconUrl && !logoUrl && (
          <span className={`font-heading font-bold bg-gradient-accent bg-clip-text text-transparent ${text}`}>
            CollabHunts
          </span>
        )}
      </div>
    );
  }

  // Fallback to generated logo
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {showText ? (
        <img
          src={collabhuntsLogo}
          alt="CollabHunts"
          style={{ height: logoHeight, width: "auto" }}
          className="flex-shrink-0 object-contain"
        />
      ) : (
        <img
          src={collabhuntsIcon}
          alt="CollabHunts"
          style={{ height: icon, width: icon }}
          className="flex-shrink-0 object-contain"
        />
      )}
    </div>
  );
};

export default Logo;
