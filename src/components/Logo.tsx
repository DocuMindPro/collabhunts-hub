import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface LogoProps {
  className?: string;
  showText?: boolean;
  size?: "sm" | "md" | "lg";
}

const Logo = ({ className = "", showText = true, size = "md" }: LogoProps) => {
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [iconUrl, setIconUrl] = useState<string | null>(null);

  const sizes = {
    sm: { icon: 24, text: "text-lg" },
    md: { icon: 32, text: "text-xl" },
    lg: { icon: 40, text: "text-2xl" },
  };

  const { icon, text } = sizes[size];

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
          style={{ height: icon, width: "auto" }}
          className="flex-shrink-0 object-contain"
        />
        {showText && !logoUrl && (
          <span className={`font-heading font-bold bg-gradient-accent bg-clip-text text-transparent ${text}`}>
            CollabHunts
          </span>
        )}
      </div>
    );
  }

  // Fallback to SVG if no uploaded logo
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <svg
        width={icon}
        height={icon}
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="flex-shrink-0"
      >
        <defs>
          <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="hsl(var(--primary))" />
            <stop offset="100%" stopColor="hsl(var(--secondary))" />
          </linearGradient>
        </defs>
        <circle cx="20" cy="20" r="18" fill="url(#logoGradient)" />
        <circle cx="20" cy="20" r="8" stroke="white" strokeWidth="2" fill="none" />
        <circle cx="20" cy="20" r="3" fill="white" />
        <path
          d="M12 20 H8 M28 20 H32 M20 12 V8 M20 28 V32"
          stroke="white"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <circle cx="8" cy="20" r="2" fill="white" />
        <circle cx="32" cy="20" r="2" fill="white" />
        <circle cx="20" cy="8" r="2" fill="white" />
        <circle cx="20" cy="32" r="2" fill="white" />
      </svg>

      {showText && (
        <span className={`font-heading font-bold bg-gradient-accent bg-clip-text text-transparent ${text}`}>
          CollabHunts
        </span>
      )}
    </div>
  );
};

export default Logo;
