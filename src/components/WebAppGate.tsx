import { Link } from "react-router-dom";
import { QRCodeSVG } from "qrcode.react";
import { Smartphone, Download, ArrowRight, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import Logo from "@/components/Logo";

interface WebAppGateProps {
  /** The route the user was trying to reach — shown in the headline */
  featureName?: string;
}

const WebAppGate = ({ featureName }: WebAppGateProps) => {
  const downloadUrl = `${window.location.origin}/download`;

  const features = [
    "Real-time messaging & notifications",
    "Instant booking management",
    "Opportunity alerts & applications",
    "Offline access to your profile",
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4 py-16">
      {/* Logo */}
      <div className="mb-8">
        <Logo size="lg" />
      </div>

      {/* Main card */}
      <div className="w-full max-w-lg bg-card border border-border rounded-2xl shadow-xl overflow-hidden">
        {/* Top accent strip */}
        <div className="h-1.5 bg-gradient-to-r from-primary via-accent to-primary" />

        <div className="p-8 text-center">
          {/* Icon */}
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
            <Smartphone className="h-8 w-8 text-primary" />
          </div>

          <h1 className="text-2xl font-heading font-bold text-foreground mb-2">
            {featureName
              ? `${featureName} lives in the app`
              : "Your workspace is in the app"}
          </h1>
          <p className="text-muted-foreground text-sm mb-8">
            Download Collab Hunts to access your dashboard, messages, bookings,
            and everything else — with a far better mobile experience.
          </p>

          {/* Feature list */}
          <ul className="text-left space-y-2.5 mb-8">
            {features.map((f) => (
              <li key={f} className="flex items-center gap-3 text-sm text-foreground/80">
                <Star className="h-4 w-4 text-primary shrink-0" fill="currentColor" />
                {f}
              </li>
            ))}
          </ul>

          {/* QR Code — visible on desktop */}
          <div className="hidden md:flex flex-col items-center gap-3 mb-6 p-4 bg-muted rounded-xl">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Scan to download
            </p>
            <QRCodeSVG
              value={downloadUrl}
              size={140}
              className="rounded-lg"
            />
            <p className="text-xs text-muted-foreground">{downloadUrl}</p>
          </div>

          {/* CTA buttons */}
          <div className="space-y-3">
            <Button asChild size="lg" className="w-full gap-2 gradient-hero hover:opacity-90">
              <Link to="/download">
                <Download className="h-4 w-4" />
                Download the App
              </Link>
            </Button>
            <Button asChild variant="ghost" size="sm" className="w-full text-muted-foreground gap-1">
              <Link to="/">
                Back to Home
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
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

export default WebAppGate;
