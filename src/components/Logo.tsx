import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { isNativePlatform, safeNativeAsync } from "@/lib/supabase-native";

interface LogoProps {
  className?: string;
  showText?: boolean;
  size?: "sm" | "md" | "lg";
}

const LOCAL_ICON = "/app-icon.png";

const Logo = ({ className = "", showText = true, size = "md" }: LogoProps) => {
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [iconUrl, setIconUrl] = useState<string | null>(null);
  const [fetched, setFetched] = useState(false);

  const sizes = {
    sm: { logoHeight: 32 },
    md: { logoHeight: 40 },
    lg: { logoHeight: 48 },
  };

  const { logoHeight } = sizes[size];

  useEffect(() => {
    const fetchLogos = async () => {
      const data = await safeNativeAsync(
        async () => {
          const result = await supabase
            .from("site_settings")
            .select("key, value")
            .in("key", ["logo_primary_url", "logo_icon_url"]);
          return result.data;
        },
        null
      );

      if (data) {
        const primary = data.find((d) => d.key === "logo_primary_url");
        const iconLogo = data.find((d) => d.key === "logo_icon_url");
        if (primary?.value) setLogoUrl(primary.value);
        if (iconLogo?.value) setIconUrl(iconLogo.value);
      }
      setFetched(true);
    };

    fetchLogos();
  }, []);

  // Don't render anything until we know what logo to show — prevents flicker/overlap
  if (!fetched) {
    return <div style={{ height: logoHeight, width: showText ? 120 : logoHeight }} className="flex-shrink-0" />;
  }

  const displayLogoUrl = showText ? logoUrl : (iconUrl || logoUrl);
  const src = displayLogoUrl || LOCAL_ICON;

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <img
        src={src}
        alt="Collab Hunts"
        style={{ height: logoHeight, width: "auto", maxWidth: showText ? 180 : logoHeight }}
        className="flex-shrink-0 object-contain"
      />
    </div>
  );
};

export default Logo;
