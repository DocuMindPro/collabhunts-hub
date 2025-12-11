import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Lock, Zap, Sparkles, MessageCircle, Users, Filter, BadgeCheck, FolderOpen, Mail, HardDrive, Crown, Megaphone } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

interface UpgradePromptProps {
  feature: "contact" | "campaigns" | "filters" | "crm" | "content_library" | "badge" | "unlimited_campaigns" | "more_storage" | "mass_message";
  className?: string;
  inline?: boolean;
  targetTier?: "basic" | "pro" | "premium";
}

const featureMessages = {
  contact: {
    title: "Upgrade to Message Creators",
    description: "Chat and negotiate with creators before hiring. Subscribe to Basic ($39/mo) to unlock messaging.",
    cta: "Upgrade to Basic - $39/mo",
    icon: MessageCircle,
    gradient: "from-blue-500/20 to-purple-500/20"
  },
  campaigns: {
    title: "Upgrade to Post Campaigns",
    description: "Post campaigns to attract creators. Subscribe to Pro ($99/mo) for campaigns or Premium for unlimited.",
    cta: "Upgrade to Pro - $99/mo",
    icon: Users,
    gradient: "from-orange-500/20 to-red-500/20"
  },
  filters: {
    title: "Unlock Advanced Filters",
    description: "Filter creators by age, ethnicity, language and more. Subscribe to Pro ($99/mo) to access advanced filters.",
    cta: "Upgrade to Pro - $99/mo",
    icon: Filter,
    gradient: "from-green-500/20 to-teal-500/20"
  },
  crm: {
    title: "Upgrade for Creator CRM",
    description: "Save your favorite creators, organize them in folders, and add private notes. Subscribe to Pro ($99/mo) to unlock.",
    cta: "Upgrade to Pro - $99/mo",
    icon: FolderOpen,
    gradient: "from-purple-500/20 to-pink-500/20"
  },
  content_library: {
    title: "Upgrade for Content Library",
    description: "Store your UGC content, track usage rights, and re-download files anytime. Basic includes 10 GB, Premium includes 50 GB.",
    cta: "Upgrade to Basic - $39/mo",
    icon: FolderOpen,
    gradient: "from-cyan-500/20 to-blue-500/20"
  },
  badge: {
    title: "Upgrade for Verified Badge",
    description: "Get a verified business badge to build trust with creators. Subscribe to Pro ($99/mo) or Premium to apply for verification.",
    cta: "Upgrade to Pro - $99/mo",
    icon: BadgeCheck,
    gradient: "from-amber-500/20 to-orange-500/20"
  },
  unlimited_campaigns: {
    title: "Unlock Unlimited Campaigns",
    description: "You've hit your monthly campaign limit! Upgrade to Premium ($199/mo) for unlimited campaigns and more.",
    cta: "Upgrade to Premium - $199/mo",
    icon: Crown,
    gradient: "from-amber-500/20 to-yellow-500/20"
  },
  more_storage: {
    title: "Need More Storage?",
    description: "You're running low on storage! Upgrade to Premium ($199/mo) for 50 GB storage (vs 10 GB on Pro).",
    cta: "Upgrade to Premium - $199/mo",
    icon: HardDrive,
    gradient: "from-purple-500/20 to-indigo-500/20"
  },
  mass_message: {
    title: "Unlock Campaign Invitations",
    description: "Invite multiple creators to your campaigns at once. Pro includes 50/day, Premium includes 100/day.",
    cta: "Upgrade to Pro - $99/mo",
    icon: Megaphone,
    gradient: "from-teal-500/20 to-cyan-500/20"
  }
};

const UpgradePrompt = ({ feature, className = "", inline = false, targetTier }: UpgradePromptProps) => {
  const navigate = useNavigate();
  const message = featureMessages[feature];
  const Icon = message.icon;

  // Override CTA text based on target tier
  let ctaText = message.cta;
  if (targetTier === "premium") {
    ctaText = "Upgrade to Premium - $199/mo";
  } else if (targetTier === "pro") {
    ctaText = "Upgrade to Pro - $99/mo";
  } else if (targetTier === "basic") {
    ctaText = "Upgrade to Basic - $39/mo";
  }

  if (inline) {
    return (
      <div className={cn(
        "relative overflow-hidden flex items-center gap-3 p-4 rounded-xl border border-primary/20",
        `bg-gradient-to-r ${message.gradient}`,
        className
      )}>
        <div className="absolute top-0 right-0 w-24 h-24 bg-primary/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
        <div className="relative flex-shrink-0 w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
          <Icon className="h-5 w-5 text-primary" />
        </div>
        <div className="relative flex-1 min-w-0">
          <p className="text-sm font-semibold">{message.title}</p>
          <p className="text-xs text-muted-foreground line-clamp-2">{message.description}</p>
        </div>
        <Button 
          size="sm" 
          onClick={() => navigate('/brand-dashboard?tab=subscription')}
          className="relative flex-shrink-0 gap-1.5 bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20"
        >
          <Zap className="h-3.5 w-3.5" />
          Upgrade
        </Button>
      </div>
    );
  }

  return (
    <Card className={cn("relative overflow-hidden", className)}>
      {/* Animated gradient background */}
      <div className={cn("absolute inset-0 bg-gradient-to-br", message.gradient, "opacity-50")} />
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl" />
      
      <CardHeader className="relative text-center">
        <div className="mx-auto w-16 h-16 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center mb-3 shadow-lg">
          <Icon className="h-8 w-8 text-primary" />
        </div>
        <CardTitle className="text-xl">{message.title}</CardTitle>
        <CardDescription className="text-sm">{message.description}</CardDescription>
      </CardHeader>
      <CardContent className="relative text-center pb-6">
        <Button 
          onClick={() => navigate('/brand-dashboard?tab=subscription')}
          size="lg"
          className="gap-2 bg-primary hover:bg-primary/90 shadow-lg shadow-primary/25"
        >
          <Zap className="h-4 w-4" />
          {ctaText}
        </Button>
      </CardContent>
    </Card>
  );
};

export default UpgradePrompt;