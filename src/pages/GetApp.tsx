import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { QRCodeSVG } from "qrcode.react";
import { supabase } from "@/integrations/supabase/client";
import { Download, CheckCircle, Smartphone, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import Logo from "@/components/Logo";

const GetApp = () => {
  const [userName, setUserName] = useState<string | null>(null);
  const [userType, setUserType] = useState<"brand" | "creator" | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session?.user) return;
      const meta = session.user.user_metadata;
      const name =
        meta?.first_name ||
        meta?.full_name?.split(" ")[0] ||
        null;
      setUserName(name);

      // Detect role
      const type = meta?.user_type;
      if (type === "brand" || type === "creator") {
        setUserType(type);
      } else {
        // Fall back to checking profiles
        supabase
          .from("brand_profiles")
          .select("id")
          .eq("user_id", session.user.id)
          .maybeSingle()
          .then(({ data }) => {
            if (data) {
              setUserType("brand");
            } else {
              setUserType("creator");
            }
          });
      }
    });
  }, []);

  const downloadUrl = `${window.location.origin}/download`;

  const brandNextSteps = [
    "Complete your brand profile in the app",
    "Browse creators and send your first message",
    "Post an opportunity and receive applications",
  ];

  const creatorNextSteps = [
    "Set up your creator profile and services",
    "Browse open brand opportunities",
    "Receive and manage booking requests",
  ];

  const nextSteps = userType === "brand" ? brandNextSteps : creatorNextSteps;

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4 py-16">
      {/* Logo */}
      <div className="mb-8">
        <Logo size="lg" />
      </div>

      {/* Success card */}
      <div className="w-full max-w-lg bg-card border border-border rounded-2xl shadow-xl overflow-hidden">
        <div className="h-1.5 bg-gradient-to-r from-primary via-accent to-primary" />

        <div className="p-8 text-center">
          {/* Success icon */}
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/20">
            <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
          </div>

          <h1 className="text-2xl font-heading font-bold text-foreground mb-2">
            {userName
              ? `You're in, ${userName}! 🎉`
              : "Account ready! 🎉"}
          </h1>
          <p className="text-muted-foreground text-sm mb-6">
            {userType === "brand"
              ? "Your brand account has been created. The full Collab Hunts experience — messaging, bookings, and creator discovery — is waiting in the app."
              : userType === "creator"
              ? "Your creator account is being reviewed. In the meantime, download the app so you're ready the moment you're approved."
              : "Your account is ready. Download the app to access your full workspace."}
          </p>

          {/* Next steps */}
          <div className="bg-muted/60 rounded-xl p-4 mb-6 text-left">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
              Next steps in the app
            </p>
            <ul className="space-y-2.5">
              {nextSteps.map((step, i) => (
                <li key={i} className="flex items-start gap-2.5 text-sm text-foreground/80">
                  <Star className="h-4 w-4 text-primary mt-0.5 shrink-0" fill="currentColor" />
                  {step}
                </li>
              ))}
            </ul>
          </div>

          {/* QR Code for desktop */}
          <div className="hidden md:flex flex-col items-center gap-3 mb-6 p-4 bg-muted rounded-xl">
            <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground uppercase tracking-wide">
              <Smartphone className="h-3.5 w-3.5" />
              Scan with your phone to download
            </div>
            <QRCodeSVG value={downloadUrl} size={140} className="rounded-lg" />
          </div>

          {/* CTA */}
          <div className="space-y-3">
            <Button asChild size="lg" className="w-full gap-2 gradient-hero hover:opacity-90">
              <Link to="/download">
                <Download className="h-4 w-4" />
                Download Collab Hunts
              </Link>
            </Button>
            <Button asChild variant="ghost" size="sm" className="w-full text-muted-foreground">
              <Link to="/">Back to homepage</Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Platform badges */}
      <div className="mt-6 flex items-center gap-4 text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
          Android APK available now
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/50" />
          iOS coming soon
        </span>
      </div>
    </div>
  );
};

export default GetApp;
