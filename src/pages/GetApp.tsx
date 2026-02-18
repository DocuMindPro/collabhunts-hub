import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { QRCodeSVG } from "qrcode.react";
import { supabase } from "@/integrations/supabase/client";
import {
  Download, CheckCircle2, Smartphone, ChevronRight,
  Bell, MessageSquare, Zap, Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Logo from "@/components/Logo";

/* ─── Role-specific content ──────────────────────────────────── */
const roleContent = {
  brand: {
    emoji: "🎉",
    headline: (name: string | null) =>
      name ? `Welcome, ${name}! Your brand account is ready.` : "Your brand account is ready! 🎉",
    subtitle:
      "The full Collab Hunts experience — creator discovery, messaging, and bookings — is waiting in the app.",
    steps: [
      { icon: Users, text: "Complete your brand profile" },
      { icon: MessageSquare, text: "Browse creators and send your first message" },
      { icon: Bell, text: "Post an opportunity and receive applications" },
    ],
    accentLabel: "Brand account created",
  },
  creator: {
    emoji: "✨",
    headline: (name: string | null) =>
      name ? `You're in, ${name}! Your profile is under review.` : "Your creator profile is under review! ✨",
    subtitle:
      "We review all creator profiles before they go live. In the meantime, download the app so you're ready the moment you're approved.",
    steps: [
      { icon: Smartphone, text: "Set up your services and packages in the app" },
      { icon: Bell, text: "Get notified instantly when you're approved" },
      { icon: Zap, text: "Start receiving booking requests on day one" },
    ],
    accentLabel: "Creator profile submitted",
  },
  default: {
    emoji: "🚀",
    headline: (_: string | null) => "Account ready! Download the app to get started.",
    subtitle:
      "Your Collab Hunts workspace is in the app. Download it now to access all features.",
    steps: [
      { icon: Download, text: "Download the Android APK" },
      { icon: Smartphone, text: "Log in with your new account" },
      { icon: Zap, text: "Start collaborating" },
    ],
    accentLabel: "Account created",
  },
};

const GITHUB_REPO = "DocuMindPro/collabhunts-hub";

const GetApp = () => {
  const [userName, setUserName] = useState<string | null>(null);
  const [userType, setUserType] = useState<"brand" | "creator" | "default">("default");
  const [apkUrl, setApkUrl] = useState<string | null>(null);

  const downloadPageUrl = `${window.location.origin}/download`;

  useEffect(() => {
    // Resolve user info
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session?.user) return;
      const meta = session.user.user_metadata;
      const name = meta?.first_name || meta?.full_name?.split(" ")[0] || null;
      setUserName(name);

      const type = meta?.user_type;
      if (type === "brand" || type === "creator") {
        setUserType(type);
      } else {
        supabase
          .from("brand_profiles")
          .select("id")
          .eq("user_id", session.user.id)
          .maybeSingle()
          .then(({ data }) => setUserType(data ? "brand" : "creator"));
      }
    });

    // Try to grab latest APK URL for direct QR
    (async () => {
      try {
        const res = await fetch(
          `https://api.github.com/repos/${GITHUB_REPO}/releases?per_page=5`
        );
        if (res.ok) {
          const releases = await res.json();
          const withApk = releases.find((r: any) =>
            r.assets?.some((a: any) => a.name.endsWith(".apk"))
          );
          if (withApk) {
            const asset = withApk.assets.find((a: any) => a.name.endsWith(".apk"));
            setApkUrl(asset?.browser_download_url ?? null);
          }
        }
      } catch {
        // silently ignore — QR will fall back to download page
      }
    })();
  }, []);

  const content = roleContent[userType];
  const qrValue = apkUrl ?? downloadPageUrl;

  return (
    <div className="min-h-screen bg-background">

      {/* ── TOP STRIP ─────────────────────────────────────────────── */}
      <div className="h-1 bg-gradient-to-r from-primary via-accent to-primary" />

      <div className="container mx-auto px-4 py-10 max-w-4xl">

        {/* Logo */}
        <div className="flex justify-center mb-10">
          <Logo size="md" />
        </div>

        <div className="grid md:grid-cols-2 gap-8 items-start">

          {/* ── LEFT: success + steps ──────────────────────────────── */}
          <div className="flex flex-col gap-6">

            {/* Success banner */}
            <div className="rounded-2xl border border-border bg-card p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 shrink-0">
                  <CheckCircle2 className="h-7 w-7 text-primary" />
                </div>
                <div>
                  <span className="text-xs font-semibold uppercase tracking-wide text-primary">
                    {content.accentLabel}
                  </span>
                  <h1 className="text-xl font-heading font-bold text-foreground leading-tight mt-0.5">
                    {content.headline(userName)}
                  </h1>
                </div>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {content.subtitle}
              </p>
            </div>

            {/* Next steps */}
            <div className="rounded-2xl border border-border bg-card p-6">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-4">
                What to do next
              </p>
              <ol className="space-y-4">
                {content.steps.map(({ icon: Icon, text }, i) => (
                  <li key={i} className="flex items-center gap-4">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                      <Icon className="h-4 w-4 text-primary" />
                    </div>
                    <span className="text-sm text-foreground/80">{text}</span>
                  </li>
                ))}
              </ol>
            </div>

            {/* Back link */}
            <Button asChild variant="ghost" size="sm" className="self-start text-muted-foreground gap-1">
              <Link to="/">
                <ChevronRight className="h-3.5 w-3.5 rotate-180" />
                Back to homepage
              </Link>
            </Button>
          </div>

          {/* ── RIGHT: download panel ──────────────────────────────── */}
          <div className="flex flex-col gap-5 sticky top-6">

            {/* QR card (desktop only) */}
            <div className="hidden md:flex flex-col items-center gap-4 rounded-2xl border border-border bg-card p-6">
              <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <Smartphone className="h-4 w-4" />
                Scan with your phone camera
              </div>
              <div className="rounded-xl bg-card p-3 shadow-md ring-1 ring-border">
                <QRCodeSVG value={qrValue} size={170} level="H" includeMargin bgColor="#ffffff" fgColor="#000000" />
              </div>
              <p className="text-xs text-muted-foreground text-center">
                Points directly to the Android APK download
              </p>
            </div>

            {/* CTA buttons */}
            <div className="rounded-2xl border border-border bg-card p-6 flex flex-col gap-3">
              <p className="text-sm font-semibold text-foreground mb-1">Download the app</p>

              <Button asChild size="lg" className="w-full gap-2 gradient-hero hover:opacity-90">
                <Link to="/download">
                  <Download className="h-4 w-4" />
                  Download Collab Hunts
                </Link>
              </Button>

              {/* Platform indicators */}
              <div className="flex items-center gap-4 pt-1">
                <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
                  Android APK available
                </span>
                <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/40" />
                  iOS coming soon
                </span>
              </div>

              {/* iOS instructions */}
              <div className="rounded-xl bg-muted/50 p-4 mt-1">
                <p className="text-xs font-semibold text-muted-foreground mb-2 flex items-center gap-1.5">
                  iPhone users
                </p>
                <ol className="space-y-1.5">
                  {[
                    "Open collabhunts-hub.lovable.app in Safari",
                    "Tap the Share button (□↑)",
                    'Tap "Add to Home Screen"',
                    'Tap "Add" — done!',
                  ].map((s, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
                      <ChevronRight className="h-3.5 w-3.5 mt-0.5 shrink-0 text-primary" />
                      {s}
                    </li>
                  ))}
                </ol>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default GetApp;
