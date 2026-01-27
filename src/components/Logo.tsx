import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { isNativePlatform, safeNativeAsync } from "@/lib/supabase-native";

interface LogoProps {
  className?: string;
  showText?: boolean;
  size?: "sm" | "md" | "lg";
}

const Logo = ({ className = "", showText = true, size = "md" }: LogoProps) => {
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [iconUrl, setIconUrl] = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const isNative = isNativePlatform();

  const sizes = {
    sm: { icon: 28, logoHeight: 32, text: "text-lg" },
    md: { icon: 36, logoHeight: 40, text: "text-xl" },
    lg: { icon: 44, logoHeight: 48, text: "text-2xl" },
  };

  const { logoHeight, text } = sizes[size];

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
      setIsLoaded(true);
    };

    fetchLogos();
  }, []);

  const displayLogoUrl = showText ? logoUrl : (iconUrl || logoUrl);

  // Show database logo once loaded
  if (displayLogoUrl) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <img
          src={displayLogoUrl}
          alt="CollabHunts"
          style={{ height: logoHeight, width: "auto", maxWidth: showText ? 180 : logoHeight }}
          className="flex-shrink-0 object-contain"
        />
      </div>
    );
  }

  // On native or after loading check: show text fallback immediately
  // This ensures the UI never appears blank
  if (isLoaded || isNative) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <span className={`font-heading font-bold bg-gradient-accent bg-clip-text text-transparent ${text} whitespace-nowrap`}>
          CollabHunts
        </span>
      </div>
    );
  }

  // Show text fallback while loading on web (prevents flash)
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <span className={`font-heading font-bold bg-gradient-accent bg-clip-text text-transparent ${text} whitespace-nowrap`}>
        CollabHunts
      </span>
    </div>
  );
};

export default Logo;
