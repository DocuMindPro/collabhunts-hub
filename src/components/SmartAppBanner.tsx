import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Capacitor } from "@capacitor/core";
import { X, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";

const DISMISS_KEY = "app_banner_dismissed";
const DISMISS_DAYS = 7;

const SmartAppBanner = () => {
  const isMobile = useIsMobile();
  const isNative = Capacitor.isNativePlatform();
  const [dismissed, setDismissed] = useState(true); // default hidden to prevent flash

  useEffect(() => {
    const dismissedAt = localStorage.getItem(DISMISS_KEY);
    if (dismissedAt) {
      const days = (Date.now() - parseInt(dismissedAt)) / (1000 * 60 * 60 * 24);
      setDismissed(days < DISMISS_DAYS);
    } else {
      setDismissed(false);
    }
  }, []);

  const handleDismiss = () => {
    localStorage.setItem(DISMISS_KEY, Date.now().toString());
    setDismissed(true);
  };

  if (!isMobile || isNative || dismissed) return null;

  return (
    <div className="sticky top-0 z-50 flex items-center gap-3 bg-primary px-3 py-2.5 text-primary-foreground shadow-md">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary-foreground/20">
        <Smartphone className="h-5 w-5" />
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold leading-tight truncate">Collab Hunts</p>
        <p className="text-xs opacity-80 leading-tight">Better on the app</p>
      </div>

      <Button
        asChild
        size="sm"
        variant="secondary"
        className="shrink-0 h-8 text-xs font-semibold px-3"
      >
        <Link to="/download">Get the App</Link>
      </Button>

      <button
        onClick={handleDismiss}
        className="shrink-0 p-1 rounded-full hover:bg-primary-foreground/20 transition-colors"
        aria-label="Dismiss banner"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
};

export default SmartAppBanner;
