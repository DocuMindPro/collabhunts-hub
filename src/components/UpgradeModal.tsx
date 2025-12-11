import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Zap, Lock, Check, MessageCircle, Users, Filter, BadgeCheck, FolderOpen, Star } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  feature: "chat" | "campaigns" | "crm" | "filters" | "badge" | "content_library" | "post_booking" | "mass_message" | "unlimited_campaigns" | "more_storage";
  creatorName?: string;
  currentPlan?: string;
}

const featureConfig = {
  chat: {
    title: "Upgrade to Chat with Creators",
    description: "Start conversations, negotiate rates, and build relationships with creators.",
    icon: MessageCircle,
    plan: "Basic",
    price: 39,
    benefits: [
      "Unlimited messaging with creators",
      "Negotiate rates before booking",
      "10 GB content library storage",
      "15% marketplace fee"
    ]
  },
  campaigns: {
    title: "Post Campaigns to Attract Creators",
    description: "Let creators come to you! Post campaigns and receive applications from interested creators.",
    icon: Users,
    plan: "Pro",
    price: 99,
    benefits: [
      "Post 1 campaign per month",
      "Receive creator applications",
      "Advanced creator filters",
      "Verified business badge"
    ]
  },
  crm: {
    title: "Build Your Creator Network",
    description: "Save favorite creators, add notes, and track your collaboration history.",
    icon: FolderOpen,
    plan: "Pro",
    price: 99,
    benefits: [
      "Save unlimited creators",
      "Organize with folders",
      "Add private notes",
      "Track collaboration history"
    ]
  },
  filters: {
    title: "Unlock Advanced Filters",
    description: "Find the perfect creators with powerful filtering options.",
    icon: Filter,
    plan: "Pro",
    price: 99,
    benefits: [
      "Filter by age range",
      "Filter by ethnicity",
      "Filter by language",
      "Filter by gender"
    ]
  },
  badge: {
    title: "Get Verified Badge",
    description: "Build trust with creators by becoming a verified business.",
    icon: BadgeCheck,
    plan: "Pro",
    price: 99,
    benefits: [
      "Blue checkmark badge",
      "Increased creator trust",
      "Priority in creator searches",
      "Professional brand image"
    ]
  },
  content_library: {
    title: "Store Your Content",
    description: "Save UGC content with usage rights tracking and easy re-downloads.",
    icon: FolderOpen,
    plan: "Basic",
    price: 39,
    benefits: [
      "10 GB storage included",
      "Track usage rights",
      "Download anytime",
      "Organize with folders"
    ]
  },
  post_booking: {
    title: "Save This Creator?",
    description: "Want to work with this creator again? Save them to your network!",
    icon: Star,
    plan: "Pro",
    price: 99,
    benefits: [
      "Save to your creator network",
      "Add private notes",
      "Get notified of availability",
      "Track collaboration history"
    ]
  },
  mass_message: {
    title: "Send Mass Messages",
    description: "Reach multiple creators at once to find the perfect match for your campaigns.",
    icon: MessageCircle,
    plan: "Pro",
    price: 99,
    benefits: [
      "Message up to 50 creators/day",
      "Save message templates",
      "Filter by criteria first",
      "Track message history"
    ]
  },
  unlimited_campaigns: {
    title: "Unlock Unlimited Campaigns",
    description: "Remove campaign limits and post as many campaigns as you need.",
    icon: Users,
    plan: "Premium",
    price: 299,
    benefits: [
      "Post unlimited campaigns",
      "50 GB content storage",
      "100 mass messages/day",
      "Priority support"
    ]
  },
  more_storage: {
    title: "Get More Storage",
    description: "Running low on space? Upgrade to Premium for 5x more storage.",
    icon: FolderOpen,
    plan: "Premium",
    price: 299,
    benefits: [
      "50 GB content storage",
      "Unlimited campaigns",
      "100 mass messages/day",
      "Priority support"
    ]
  }
};

const UpgradeModal = ({ isOpen, onClose, feature, creatorName, currentPlan }: UpgradeModalProps) => {
  const navigate = useNavigate();
  const config = featureConfig[feature];

  const handleUpgrade = () => {
    onClose();
    navigate('/brand-dashboard?tab=subscription');
  };

  // Show different button text based on current plan and target
  const getButtonText = () => {
    if (config.plan === "Premium" && currentPlan === "pro") {
      return `Upgrade to Premium - $${config.price}/mo`;
    }
    return `Upgrade to ${config.plan} - $${config.price}/mo`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="mx-auto w-16 h-16 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center mb-4">
            <config.icon className="h-8 w-8 text-primary" />
          </div>
          <DialogTitle className="text-center text-xl">
            {feature === "post_booking" && creatorName 
              ? `Save ${creatorName}?`
              : config.title
            }
          </DialogTitle>
          <DialogDescription className="text-center">
            {config.description}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="bg-muted/50 rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-medium">{config.plan} Plan</span>
              <span className="text-2xl font-bold text-primary">
                ${config.price}<span className="text-sm font-normal text-muted-foreground">/mo</span>
              </span>
            </div>
            
            <div className="space-y-2">
              {config.benefits.map((benefit, index) => (
                <div key={index} className="flex items-center gap-2 text-sm">
                  <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                  <span>{benefit}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <Button 
            onClick={handleUpgrade}
            className="w-full gap-2 bg-primary hover:bg-primary/90"
          >
            <Zap className="h-4 w-4" />
            {getButtonText()}
          </Button>
          <Button 
            variant="ghost" 
            onClick={onClose}
            className="w-full text-muted-foreground"
          >
            Maybe Later
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default UpgradeModal;
