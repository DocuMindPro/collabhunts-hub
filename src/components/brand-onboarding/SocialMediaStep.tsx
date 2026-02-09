import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowRight, ArrowLeft, Instagram } from "lucide-react";

interface SocialMediaValue {
  facebook: string;
  instagram: string;
  tiktok: string;
}

interface SocialMediaStepProps {
  value: SocialMediaValue;
  onChange: (value: SocialMediaValue) => void;
  onNext: () => void;
  onBack: () => void;
  onSkip: () => void;
}

const validateUrl = (url: string, platform: "facebook" | "instagram" | "tiktok"): string | null => {
  if (!url.trim()) return null; // empty is valid (optional)
  const lower = url.toLowerCase();
  switch (platform) {
    case "facebook":
      if (!lower.includes("facebook.com/") && !lower.includes("fb.com/"))
        return "Must be a Facebook URL (facebook.com/ or fb.com/)";
      break;
    case "instagram":
      if (!lower.includes("instagram.com/"))
        return "Must be an Instagram URL (instagram.com/)";
      break;
    case "tiktok":
      if (!lower.includes("tiktok.com/@"))
        return "Must be a TikTok URL (tiktok.com/@)";
      break;
  }
  return null;
};

const FacebookIcon = () => (
  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
  </svg>
);

const TikTokIcon = () => (
  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
  </svg>
);

const SocialMediaStep = ({ value, onChange, onNext, onBack, onSkip }: SocialMediaStepProps) => {
  const [touched, setTouched] = useState({ facebook: false, instagram: false, tiktok: false });

  const errors = {
    facebook: touched.facebook ? validateUrl(value.facebook, "facebook") : null,
    instagram: touched.instagram ? validateUrl(value.instagram, "instagram") : null,
    tiktok: touched.tiktok ? validateUrl(value.tiktok, "tiktok") : null,
  };

  const hasErrors =
    validateUrl(value.facebook, "facebook") !== null ||
    validateUrl(value.instagram, "instagram") !== null ||
    validateUrl(value.tiktok, "tiktok") !== null;

  const fields = [
    {
      key: "facebook" as const,
      label: "Facebook",
      icon: <FacebookIcon />,
      placeholder: "https://facebook.com/yourbrand",
      color: "text-blue-600",
    },
    {
      key: "instagram" as const,
      label: "Instagram",
      icon: <Instagram className="h-5 w-5" />,
      placeholder: "https://instagram.com/yourbrand",
      color: "text-pink-500",
    },
    {
      key: "tiktok" as const,
      label: "TikTok",
      icon: <TikTokIcon />,
      placeholder: "https://tiktok.com/@yourbrand",
      color: "text-foreground",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold">Link your social media</h2>
        <p className="text-muted-foreground">
          Help creators find and connect with you (all optional)
        </p>
      </div>

      <div className="space-y-4">
        {fields.map((field) => (
          <div key={field.key} className="space-y-1.5">
            <Label className="flex items-center gap-2">
              <span className={field.color}>{field.icon}</span>
              {field.label}
            </Label>
            <Input
              type="url"
              placeholder={field.placeholder}
              value={value[field.key]}
              onChange={(e) => onChange({ ...value, [field.key]: e.target.value })}
              onBlur={() => setTouched((t) => ({ ...t, [field.key]: true }))}
            />
            {errors[field.key] && (
              <p className="text-sm text-destructive">{errors[field.key]}</p>
            )}
          </div>
        ))}
      </div>

      <div className="flex gap-3 pt-4">
        <Button variant="outline" onClick={onBack} className="gap-2">
          <ArrowLeft className="h-4 w-4" /> Back
        </Button>
        <Button variant="ghost" onClick={onSkip} className="flex-1">
          Skip
        </Button>
        <Button onClick={onNext} disabled={hasErrors} className="gap-2">
          Finish Setup <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default SocialMediaStep;
