import { Button } from "@/components/ui/button";
import { ArrowRight, ArrowLeft, Instagram, Youtube } from "lucide-react";
import { cn } from "@/lib/utils";

interface PlatformsStepProps {
  value: string[];
  onChange: (value: string[]) => void;
  onNext: () => void;
  onBack: () => void;
  onSkip: () => void;
}

const platforms = [
  { id: "Instagram", icon: Instagram, color: "from-purple-500 to-pink-500" },
  { id: "TikTok", icon: () => (
    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="currentColor">
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
    </svg>
  ), color: "from-black to-gray-800" },
  { id: "YouTube", icon: Youtube, color: "from-red-500 to-red-600" },
  { id: "Twitter", icon: () => (
    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
    </svg>
  ), color: "from-gray-800 to-black" },
  { id: "Twitch", icon: () => (
    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="currentColor">
      <path d="M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143l-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714z"/>
    </svg>
  ), color: "from-purple-600 to-purple-700" },
];

const PlatformsStep = ({ value, onChange, onNext, onBack, onSkip }: PlatformsStepProps) => {
  const togglePlatform = (platform: string) => {
    if (value.includes(platform)) {
      onChange(value.filter((p) => p !== platform));
    } else {
      onChange([...value, platform]);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold">Which platforms matter most?</h2>
        <p className="text-muted-foreground">
          We'll prioritize creators on these platforms
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {platforms.map((platform) => (
          <button
            key={platform.id}
            onClick={() => togglePlatform(platform.id)}
            className={cn(
              "flex flex-col items-center gap-2 p-4 rounded-xl border transition-all",
              value.includes(platform.id)
                ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                : "hover:border-primary/50 hover:bg-muted"
            )}
          >
            <div className={cn(
              "p-3 rounded-full bg-gradient-to-br text-white",
              platform.color
            )}>
              <platform.icon />
            </div>
            <span className="font-medium text-sm">{platform.id}</span>
          </button>
        ))}
      </div>

      <div className="flex gap-3 pt-4">
        <Button variant="outline" onClick={onBack} className="gap-2">
          <ArrowLeft className="h-4 w-4" /> Back
        </Button>
        <Button variant="ghost" onClick={onSkip} className="flex-1">
          Skip
        </Button>
        <Button onClick={onNext} disabled={value.length === 0} className="gap-2">
          Finish Setup <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default PlatformsStep;
