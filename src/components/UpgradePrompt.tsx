import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Lock, Zap } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface UpgradePromptProps {
  feature: "contact" | "campaigns" | "filters" | "crm";
  className?: string;
  inline?: boolean;
}

const featureMessages = {
  contact: {
    title: "Upgrade to Contact Creators",
    description: "Chat and negotiate with creators before hiring. Upgrade to Pro to unlock messaging.",
    cta: "Upgrade to Pro - $99/mo"
  },
  campaigns: {
    title: "Upgrade to Post Campaigns",
    description: "Post campaigns to attract creators. Upgrade to Pro for 1 campaign/month or Premium for unlimited.",
    cta: "View Plans"
  },
  filters: {
    title: "Unlock Advanced Filters",
    description: "Filter creators by age, ethnicity, language and more. Upgrade to Pro to access advanced filters.",
    cta: "Upgrade to Pro - $99/mo"
  },
  crm: {
    title: "Upgrade for Creator CRM",
    description: "Save your favorite creators, organize them in folders, and add private notes. Upgrade to Pro to unlock.",
    cta: "Upgrade to Pro - $99/mo"
  }
};

const UpgradePrompt = ({ feature, className = "", inline = false }: UpgradePromptProps) => {
  const navigate = useNavigate();
  const message = featureMessages[feature];

  if (inline) {
    return (
      <div className={`flex items-center gap-3 p-4 bg-muted/50 rounded-lg border border-dashed ${className}`}>
        <Lock className="h-5 w-5 text-muted-foreground flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium">{message.title}</p>
          <p className="text-xs text-muted-foreground">{message.description}</p>
        </div>
        <Button 
          size="sm" 
          onClick={() => navigate('/brand-dashboard?tab=subscription')}
          className="flex-shrink-0 gap-1"
        >
          <Zap className="h-3 w-3" />
          Upgrade
        </Button>
      </div>
    );
  }

  return (
    <Card className={className}>
      <CardHeader className="text-center">
        <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-2">
          <Lock className="h-6 w-6 text-primary" />
        </div>
        <CardTitle>{message.title}</CardTitle>
        <CardDescription>{message.description}</CardDescription>
      </CardHeader>
      <CardContent className="text-center">
        <Button 
          onClick={() => navigate('/brand-dashboard?tab=subscription')}
          className="gap-2"
        >
          <Zap className="h-4 w-4" />
          {message.cta}
        </Button>
      </CardContent>
    </Card>
  );
};

export default UpgradePrompt;
