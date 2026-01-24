import { Button } from "@/components/ui/button";
import { Zap, Lock, Sparkles, MessageCircle, Users, Filter, BadgeCheck, FolderOpen, Send } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

interface UpgradeBannerProps {
  variant?: "default" | "compact" | "inline";
  currentPlan?: string;
  targetFeature?: "chat" | "campaigns" | "crm" | "filters" | "badge" | "content_library" | "mass_message" | "unlimited_campaigns" | "more_storage";
  className?: string;
  onDismiss?: () => void;
}

const featureHighlights = {
  chat: {
    title: "Start chatting with creators",
    description: "Upgrade to Basic to message and negotiate with creators directly",
    icon: MessageCircle,
    plan: "Basic",
    price: "$10/mo"
  },
  campaigns: {
    title: "Post campaigns to attract creators",
    description: "Let creators come to you! Post campaigns and receive applications",
    icon: Users,
    plan: "Pro",
    price: "$49/mo"
  },
  crm: {
    title: "Save your favorite creators",
    description: "Build your creator network with folders, notes, and collaboration history",
    icon: FolderOpen,
    plan: "Pro",
    price: "$49/mo"
  },
  filters: {
    title: "Unlock advanced filters",
    description: "Filter by age, ethnicity, language and more to find perfect matches",
    icon: Filter,
    plan: "Pro",
    price: "$49/mo"
  },
  badge: {
    title: "Get verified badge",
    description: "Build trust with creators by becoming a verified business",
    icon: BadgeCheck,
    plan: "Pro",
    price: "$49/mo"
  },
  content_library: {
    title: "Store your content",
    description: "Save UGC content with usage rights tracking and easy re-downloads",
    icon: FolderOpen,
    plan: "Basic",
    price: "$10/mo"
  },
  mass_message: {
    title: "Send mass messages",
    description: "Reach multiple creators at once to find perfect matches faster",
    icon: Send,
    plan: "Pro",
    price: "$49/mo"
  },
  unlimited_campaigns: {
    title: "Unlimited campaigns",
    description: "Remove the 1 campaign/month limit and post as many as you need",
    icon: Users,
    plan: "Premium",
    price: "$99/mo"
  },
  more_storage: {
    title: "50 GB storage",
    description: "Get 5x more storage space for your content library",
    icon: FolderOpen,
    plan: "Premium",
    price: "$99/mo"
  }
};

const UpgradeBanner = ({ 
  variant = "default", 
  currentPlan = "none",
  targetFeature,
  className,
  onDismiss 
}: UpgradeBannerProps) => {
  const navigate = useNavigate();
  
  const feature = targetFeature ? featureHighlights[targetFeature] : null;

  if (variant === "inline") {
    return (
      <div className={cn(
        "relative overflow-hidden rounded-xl border border-primary/20 bg-gradient-to-r from-primary/5 via-primary/10 to-secondary/10 p-4",
        className
      )}>
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        
        <div className="relative flex items-center gap-4">
          {feature && (
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
              <feature.icon className="h-5 w-5 text-primary" />
            </div>
          )}
          
          <div className="flex-1 min-w-0">
            <p className="font-medium text-sm">
              {feature ? feature.title : "Unlock premium features"}
            </p>
            <p className="text-xs text-muted-foreground">
              {feature ? `${feature.plan} plan - ${feature.price}` : "Start at $10/mo"}
            </p>
          </div>
          
          <Button 
            size="sm"
            onClick={() => navigate('/brand-dashboard?tab=subscription')}
            className="flex-shrink-0 gap-1.5 bg-primary hover:bg-primary/90"
          >
            <Zap className="h-3.5 w-3.5" />
            Upgrade
          </Button>
        </div>
      </div>
    );
  }

  if (variant === "compact") {
    return (
      <div className={cn(
        "relative overflow-hidden rounded-lg border border-primary/30 bg-gradient-to-r from-primary/10 to-secondary/10 p-3",
        className
      )}>
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Lock className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium">
              {feature ? feature.title : "Upgrade to unlock"}
            </span>
          </div>
          <Button 
            size="sm" 
            variant="outline"
            onClick={() => navigate('/brand-dashboard?tab=subscription')}
            className="h-7 text-xs border-primary/30 hover:bg-primary/10"
          >
            See Plans
          </Button>
        </div>
      </div>
    );
  }

  // Default full banner
  return (
    <div className={cn(
      "relative overflow-hidden rounded-2xl border border-primary/20",
      className
    )}>
      {/* Animated gradient background */}
      <div className="absolute inset-0 bg-gradient-to-r from-primary/15 via-secondary/20 to-primary/15 animate-pulse" />
      <div className="absolute top-0 left-1/4 w-64 h-64 bg-primary/20 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-1/4 w-48 h-48 bg-secondary/20 rounded-full blur-3xl" />
      
      <div className="relative p-6 md:p-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary animate-pulse" />
              <span className="text-sm font-medium text-primary">
                {currentPlan === "none" ? "Free Plan" : `${currentPlan.charAt(0).toUpperCase() + currentPlan.slice(1)} Plan`}
              </span>
            </div>
            
            <h3 className="text-xl md:text-2xl font-bold">
              Unlock Premium Features
            </h3>
            
            <div className="grid grid-cols-2 gap-3">
              {currentPlan === "none" && (
                <div className="flex items-center gap-2 text-sm">
                  <Lock className="h-4 w-4 text-muted-foreground" />
                  <span>Chat with creators</span>
                </div>
              )}
              {(currentPlan === "none" || currentPlan === "basic") && (
                <>
                  <div className="flex items-center gap-2 text-sm">
                    <Lock className="h-4 w-4 text-muted-foreground" />
                    <span>Post campaigns</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Lock className="h-4 w-4 text-muted-foreground" />
                    <span>Save creators</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Lock className="h-4 w-4 text-muted-foreground" />
                    <span>Advanced filters</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Lock className="h-4 w-4 text-muted-foreground" />
                    <span>Verified badge</span>
                  </div>
                </>
              )}
            </div>
          </div>
          
          <div className="flex flex-col items-start md:items-end gap-3">
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Starting at</p>
              <p className="text-3xl font-bold text-primary">$10<span className="text-lg font-normal">/mo</span></p>
            </div>
            
            <Button 
              size="lg"
              onClick={() => navigate('/brand-dashboard?tab=subscription')}
              className="gap-2 bg-primary hover:bg-primary/90 shadow-lg shadow-primary/25"
            >
              <Zap className="h-5 w-5" />
              View Plans
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UpgradeBanner;
