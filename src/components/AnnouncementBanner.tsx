import { useState, useEffect } from "react";
import { X, ExternalLink } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Capacitor } from "@capacitor/core";

type BannerStyle = "info" | "warning" | "success" | "promo";

const safeUrl = (url: string) => {
  if (!url) return "";
  const trimmed = url.trim();
  if (trimmed.match(/^https?:\/\//)) return trimmed;
  return `https://${trimmed}`;
};

const styleClasses: Record<BannerStyle, string> = {
  info: "bg-primary/90 text-primary-foreground",
  warning: "bg-amber-500 text-white",
  success: "bg-emerald-600 text-white",
  promo: "bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white",
};

const AnnouncementBanner = () => {
  const [enabled, setEnabled] = useState(false);
  const [text, setText] = useState("");
  const [link, setLink] = useState("");
  const [linkText, setLinkText] = useState("");
  const [style, setStyle] = useState<BannerStyle>("info");
  const [updatedAt, setUpdatedAt] = useState("");
  const [dismissed, setDismissed] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (Capacitor.isNativePlatform()) {
      setLoading(false);
      return;
    }

    const fetchAnnouncement = async () => {
      const { data } = await supabase
        .from("site_settings")
        .select("key, value, updated_at")
        .in("key", ["announcement_enabled", "announcement_text", "announcement_link", "announcement_link_text", "announcement_style"]);

      if (data) {
        const settings: Record<string, string> = {};
        let latestUpdatedAt = "";
        data.forEach(item => {
          settings[item.key] = item.value || "";
          if (item.updated_at && item.updated_at > latestUpdatedAt) {
            latestUpdatedAt = item.updated_at;
          }
        });

        const isEnabled = settings.announcement_enabled === "true";
        const announcementText = settings.announcement_text || "";

        setEnabled(isEnabled);
        setText(announcementText);
        setLink(settings.announcement_link || "");
        setLinkText(settings.announcement_link_text || "");
        setStyle((settings.announcement_style || "info") as BannerStyle);
        setUpdatedAt(latestUpdatedAt);

        if (isEnabled && announcementText && latestUpdatedAt) {
          if (localStorage.getItem(`announcement_dismissed_${latestUpdatedAt}`) === "true") {
            setDismissed(true);
          }
        }
      }

      setLoading(false);
    };

    fetchAnnouncement();
  }, []);

  const handleDismiss = () => {
    setDismissed(true);
    if (updatedAt) {
      localStorage.setItem(`announcement_dismissed_${updatedAt}`, "true");
    }
  };

  if (loading || !enabled || !text || dismissed || Capacitor.isNativePlatform()) {
    return null;
  }

  return (
    <div className={`relative w-full py-2.5 px-4 text-center text-sm font-medium ${styleClasses[style]}`}>
      <div className="max-w-7xl mx-auto flex items-center justify-center gap-2">
        <span>{text}</span>
        {link && (
          <a
            href={safeUrl(link)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 underline underline-offset-2 hover:opacity-80 font-semibold"
          >
            {linkText || "Learn More"}
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        )}
      </div>
      <button
        onClick={handleDismiss}
        className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-white/20 transition-colors"
        aria-label="Dismiss announcement"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
};

export default AnnouncementBanner;
