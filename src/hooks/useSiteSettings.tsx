import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface SiteSettings {
  logo_primary_url: string | null;
  logo_icon_url: string | null;
  favicon_url: string | null;
  apple_touch_icon_url: string | null;
  og_image_url: string | null;
}

export const useSiteSettings = () => {
  const [settings, setSettings] = useState<SiteSettings>({
    logo_primary_url: null,
    logo_icon_url: null,
    favicon_url: null,
    apple_touch_icon_url: null,
    og_image_url: null,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSettings = async () => {
      const { data } = await supabase
        .from("site_settings")
        .select("key, value")
        .in("key", [
          "logo_primary_url",
          "logo_icon_url",
          "favicon_url",
          "apple_touch_icon_url",
          "og_image_url",
        ]);

      if (data) {
        const newSettings: SiteSettings = {
          logo_primary_url: null,
          logo_icon_url: null,
          favicon_url: null,
          apple_touch_icon_url: null,
          og_image_url: null,
        };

        data.forEach((item) => {
          if (item.key in newSettings) {
            newSettings[item.key as keyof SiteSettings] = item.value;
          }
        });

        setSettings(newSettings);

        // Update favicon dynamically
        if (newSettings.favicon_url) {
          updateLinkTag("icon", newSettings.favicon_url);
        }

        // Update apple-touch-icon
        if (newSettings.apple_touch_icon_url) {
          updateLinkTag("apple-touch-icon", newSettings.apple_touch_icon_url);
        }

        // Update og:image
        if (newSettings.og_image_url) {
          updateMetaTag("og:image", newSettings.og_image_url);
        }
      }

      setLoading(false);
    };

    fetchSettings();
  }, []);

  return { settings, loading };
};

// Helper to update or create link tags
const updateLinkTag = (rel: string, href: string) => {
  let link = document.querySelector(`link[rel="${rel}"]`) as HTMLLinkElement;
  
  if (!link) {
    link = document.createElement("link");
    link.rel = rel;
    document.head.appendChild(link);
  }
  
  link.href = href;
};

// Helper to update or create meta tags
const updateMetaTag = (property: string, content: string) => {
  let meta = document.querySelector(`meta[property="${property}"]`) as HTMLMetaElement;
  
  if (!meta) {
    meta = document.createElement("meta");
    meta.setAttribute("property", property);
    document.head.appendChild(meta);
  }
  
  meta.content = content;
};

export default useSiteSettings;
