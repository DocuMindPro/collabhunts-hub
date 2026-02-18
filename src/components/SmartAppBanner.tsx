import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Capacitor } from "@capacitor/core";
import { X, Smartphone, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

const DISMISS_KEY = "app_banner_dismissed";
const DISMISS_DAYS = 7;

const SmartAppBanner = () => {
  const isNative = Capacitor.isNativePlatform();
  const [dismissed, setDismissed] = useState(true); // default hidden to prevent flash
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    // Check dismiss state
    const dismissedAt = localStorage.getItem(DISMISS_KEY);
    if (dismissedAt) {
      const days = (Date.now() - parseInt(dismissedAt)) / (1000 * 60 * 60 * 24);
      setDismissed(days < DISMISS_DAYS);
    } else {
      setDismissed(false);
    }

    // Track auth state to show stronger CTA for logged-in users
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setIsLoggedIn(!!session?.user);
    });
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsLoggedIn(!!session?.user);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleDismiss = () => {
    localStorage.setItem(DISMISS_KEY, Date.now().toString());
    setDismissed(true);
  };

  // Never show on native app
  if (isNative || dismissed) return null;

  return (
    <div className="sticky top-0 z-50 flex items-center gap-3 bg-primary px-3 py-2.5 text-primary-foreground shadow-md">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary-foreground/20">
        <Smartphone className="h-5 w-5" />
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold leading-tight truncate">Collab Hunts</p>
        <p className="text-xs opacity-80 leading-tight">
          {isLoggedIn ? "Your workspace is in the app" : "Better on the app"}
        </p>
      </div>

      <Button
        asChild
        size="sm"
        variant="secondary"
        className="shrink-0 h-8 text-xs font-semibold px-3 gap-1.5"
      >
        {isLoggedIn ? (
          <Link to="/get-app">
            <Download className="h-3.5 w-3.5" />
            Get the App
          </Link>
        ) : (
          <Link to="/download">Get the App</Link>
        )}
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
