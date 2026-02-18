import { useState, useEffect } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Button } from "@/components/ui/button";
import {
  Smartphone, Apple, Download as DownloadIcon, ExternalLink,
  Shield, AlertTriangle, Bell, MessageSquare, Zap, WifiOff,
  CheckCircle2, ChevronRight, Star,
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Logo from "@/components/Logo";

const GITHUB_REPO = "DocuMindPro/collabhunts-hub";
const APP_URL = "https://collabhunts-hub.lovable.app";

interface GitHubRelease {
  tag_name: string;
  name: string;
  published_at: string;
  assets: Array<{
    name: string;
    browser_download_url: string;
    size: number;
  }>;
}

/* ─── Feature highlights ─────────────────────────────────────── */
const appFeatures = [
  {
    icon: Bell,
    label: "Instant Notifications",
    desc: "Know the moment a brand books you or a creator responds.",
    badge: "App exclusive",
  },
  {
    icon: MessageSquare,
    label: "Real-Time Messaging",
    desc: "Typing indicators, instant delivery — no refreshing required.",
    badge: "App exclusive",
  },
  {
    icon: Zap,
    label: "One-Tap Actions",
    desc: "Accept bookings, apply to opportunities, and manage your profile at speed.",
  },
  {
    icon: WifiOff,
    label: "Offline Access",
    desc: "Browse creator profiles and your dashboard even without signal.",
  },
];

/* ─── Social proof ───────────────────────────────────────────── */
const stats = [
  { value: "500+", label: "Brands" },
  { value: "2 000+", label: "Creators" },
  { value: "4.8 ★", label: "Avg rating" },
];

const Download = () => {
  const [latestRelease, setLatestRelease] = useState<GitHubRelease | null>(null);
  const [loading, setLoading] = useState(true);
  const [apkError, setApkError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(
          `https://api.github.com/repos/${GITHUB_REPO}/releases?per_page=5`
        );
        if (res.ok) {
          const releases: GitHubRelease[] = await res.json();
          const withApk = releases.find((r) =>
            r.assets.some((a) => a.name.endsWith(".apk"))
          );
          if (withApk) setLatestRelease(withApk);
          else setApkError("Build in progress — check back shortly.");
        } else {
          setApkError("Could not fetch release info.");
        }
      } catch {
        setApkError("Could not connect to GitHub. Try again later.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const apkAsset = latestRelease?.assets.find((a) => a.name.endsWith(".apk"));
  const apkUrl = apkAsset?.browser_download_url;
  const apkSize = apkAsset ? (apkAsset.size / (1024 * 1024)).toFixed(1) : null;

  /* ── Hero QR value: direct APK if available, else app URL ── */
  const heroQrValue = apkUrl ?? APP_URL;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      {/* ── HERO ─────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden border-b border-border">
        {/* subtle radial glow */}
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="h-[600px] w-[600px] rounded-full bg-primary/5 blur-3xl" />
        </div>

        <div className="relative container mx-auto px-4 py-20 md:py-28 flex flex-col items-center text-center gap-6">
          <Logo size="lg" />

          <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/5 px-4 py-1.5 text-xs font-semibold text-primary">
            <Star className="h-3 w-3 fill-primary" />
            Android app available now
          </div>

          <h1 className="text-4xl md:text-6xl font-heading font-bold text-foreground leading-tight max-w-2xl">
            Your creator workspace,
            <span className="text-primary"> in your pocket</span>
          </h1>

          <p className="max-w-xl text-muted-foreground text-lg">
            Download Collab Hunts and manage bookings, messages, and
            opportunities — all from your phone.
          </p>

          {/* Social proof */}
          <div className="flex items-center gap-8 mt-2">
            {stats.map((s) => (
              <div key={s.label} className="text-center">
                <p className="text-2xl font-bold text-foreground">{s.value}</p>
                <p className="text-xs text-muted-foreground">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Primary download CTA */}
          <div className="flex flex-col sm:flex-row gap-3 mt-4">
            {loading ? (
              <Button size="lg" disabled className="gap-2 min-w-[200px]">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                Checking for build…
              </Button>
            ) : apkUrl ? (
              <Button asChild size="lg" className="gap-2 gradient-hero hover:opacity-90">
                <a href={apkUrl} download>
                  <DownloadIcon className="h-5 w-5" />
                  Download Android APK
                  {apkSize && (
                    <span className="opacity-70 text-xs">· {apkSize} MB</span>
                  )}
                </a>
              </Button>
            ) : (
              <Button size="lg" disabled className="gap-2">
                <AlertTriangle className="h-4 w-4" />
                Build coming soon
              </Button>
            )}

            <Button asChild size="lg" variant="outline" className="gap-2">
              <a href={APP_URL} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-4 w-4" />
                Open as Web App
              </a>
            </Button>
          </div>

          {/* Version tag */}
          {latestRelease && (
            <p className="text-xs text-muted-foreground">
              Latest build: {latestRelease.tag_name} ·{" "}
              {new Date(latestRelease.published_at).toLocaleDateString()}
            </p>
          )}
        </div>
      </section>

      <main className="flex-1 container mx-auto px-4 py-16 space-y-20 max-w-5xl">

        {/* ── FEATURE GRID ─────────────────────────────────────────── */}
        <section>
          <h2 className="text-2xl md:text-3xl font-heading font-bold text-center mb-3">
            Everything you need, faster on mobile
          </h2>
          <p className="text-muted-foreground text-center mb-10">
            The web experience is great — but the app is where the magic happens.
          </p>
          <div className="grid sm:grid-cols-2 gap-5">
            {appFeatures.map(({ icon: Icon, label, desc, badge }) => (
              <div
                key={label}
                className="relative rounded-2xl border border-border bg-card p-6 flex gap-4"
              >
                {badge && (
                  <span className="absolute top-4 right-4 text-[10px] font-bold uppercase tracking-wider bg-primary text-primary-foreground px-2 py-0.5 rounded-full">
                    {badge}
                  </span>
                )}
                <div className="shrink-0 flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10">
                  <Icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-semibold text-foreground mb-1">{label}</p>
                  <p className="text-sm text-muted-foreground">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── DOWNLOAD CARDS ───────────────────────────────────────── */}
        <section>
          <h2 className="text-2xl md:text-3xl font-heading font-bold text-center mb-10">
            Get the app on your device
          </h2>

          <div className="grid md:grid-cols-2 gap-8">

            {/* Android */}
            <div className="rounded-2xl border border-border bg-card overflow-hidden">
              <div className="flex items-center gap-3 border-b border-border px-6 py-4 bg-muted/40">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                  <Smartphone className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-semibold text-foreground">Android</p>
                  <p className="text-xs text-muted-foreground">Native APK · Recommended</p>
                </div>
                <span className="ml-auto text-[10px] font-bold uppercase bg-green-500/10 text-green-600 dark:text-green-400 border border-green-500/20 px-2 py-0.5 rounded-full">
                  Available now
                </span>
              </div>

              <div className="p-6 flex flex-col items-center gap-6">
                {/* QR */}
                {loading ? (
                  <div className="flex h-44 w-44 items-center justify-center rounded-xl bg-muted">
                    <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                  </div>
                ) : apkError ? (
                  <Alert className="w-full">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>{apkError}</AlertDescription>
                  </Alert>
                ) : (
                  <div className="rounded-xl bg-card p-3 shadow-md ring-1 ring-border">
                    <QRCodeSVG value={heroQrValue} size={160} level="H" includeMargin bgColor="#ffffff" fgColor="#000000" />
                  </div>
                )}

                {apkUrl && (
                  <Button asChild size="lg" className="w-full gap-2 gradient-hero hover:opacity-90">
                    <a href={apkUrl} download>
                      <DownloadIcon className="h-4 w-4" />
                      Download APK
                      {apkSize && <span className="opacity-70 text-xs">· {apkSize} MB</span>}
                    </a>
                  </Button>
                )}

                {/* Steps */}
                <div className="w-full rounded-xl bg-muted/50 p-4">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3 flex items-center gap-1.5">
                    <Shield className="h-3.5 w-3.5" />
                    Installation steps
                  </p>
                  <ol className="space-y-2">
                    {[
                      "Scan the QR code or tap Download APK",
                      "Open Settings → Security → Unknown Sources",
                      'Enable "Install from Unknown Sources" for your browser',
                      "Open the downloaded .apk file",
                      'Tap "Install" when prompted',
                    ].map((step, i) => (
                      <li key={i} className="flex items-start gap-2.5 text-sm text-muted-foreground">
                        <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[11px] font-bold text-primary">
                          {i + 1}
                        </span>
                        {step}
                      </li>
                    ))}
                  </ol>
                </div>
              </div>
            </div>

            {/* iOS / PWA */}
            <div className="flex flex-col gap-6">

              {/* iOS */}
              <div className="flex-1 rounded-2xl border border-border bg-card overflow-hidden">
                <div className="flex items-center gap-3 border-b border-border px-6 py-4 bg-muted/40">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted">
                    <Apple className="h-5 w-5 text-foreground/70" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">iPhone / iPad</p>
                    <p className="text-xs text-muted-foreground">Add to Home Screen</p>
                  </div>
                  <span className="ml-auto text-[10px] font-bold uppercase bg-muted text-muted-foreground border border-border px-2 py-0.5 rounded-full">
                    Coming soon
                  </span>
                </div>
                <div className="p-6">
                  <p className="text-sm text-muted-foreground mb-4">
                    While the native iOS app is in review, iPhone users can install
                    the web app directly from Safari — it works just like a native app.
                  </p>
                  <ol className="space-y-2">
                    {[
                      "Open collabhunts-hub.lovable.app in Safari",
                      'Tap the Share button (□↑)',
                      'Scroll down → tap "Add to Home Screen"',
                      'Tap "Add" — done!',
                    ].map((step, i) => (
                      <li key={i} className="flex items-start gap-2.5 text-sm text-muted-foreground">
                        <ChevronRight className="h-4 w-4 mt-0.5 shrink-0 text-primary" />
                        {step}
                      </li>
                    ))}
                  </ol>
                  <Button asChild variant="outline" className="w-full gap-2 mt-5">
                    <a href={APP_URL} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-4 w-4" />
                      Open in Safari
                    </a>
                  </Button>
                </div>
              </div>

              {/* Desktop QR */}
              <div className="rounded-2xl border border-border bg-card p-6 flex gap-5 items-center">
                <div className="rounded-lg bg-white p-2 shadow-sm shrink-0">
                  <QRCodeSVG value={APP_URL} size={90} level="H" />
                </div>
                <div>
                  <p className="font-semibold text-foreground mb-1">On a desktop?</p>
                  <p className="text-sm text-muted-foreground">
                    Scan this QR code with your phone camera to open Collab Hunts instantly.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── REASSURANCE ──────────────────────────────────────────── */}
        <section className="rounded-2xl border border-border bg-card p-8 text-center">
          <CheckCircle2 className="h-10 w-10 text-primary mx-auto mb-4" />
          <h2 className="text-xl font-heading font-bold mb-2">Safe to install</h2>
          <p className="text-muted-foreground max-w-xl mx-auto text-sm">
            The Collab Hunts APK is built directly from our open-source GitHub
            repository using automated CI/CD pipelines. You can inspect every
            build at{" "}
            <a
              href={`https://github.com/${GITHUB_REPO}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary underline"
            >
              github.com/{GITHUB_REPO}
            </a>
            .
          </p>
        </section>

      </main>

      <Footer />
    </div>
  );
};

export default Download;
