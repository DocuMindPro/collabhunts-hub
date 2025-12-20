import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { type PlanType, SUBSCRIPTION_PLANS } from "@/lib/stripe-mock";
import UpgradePrompt from "./UpgradePrompt";
import { Calendar, Clock, MessageSquare, ExternalLink } from "lucide-react";

interface BookingDialogProps {
  isOpen: boolean;
  onClose: () => void;
  service: {
    id: string;
    service_type: string;
    price_cents: number;
    delivery_days: number;
  } | null;
  creatorProfileId: string;
}

const BookingDialog = ({ isOpen, onClose, service, creatorProfileId }: BookingDialogProps) => {
  const [checkingSubscription, setCheckingSubscription] = useState(true);
  const [canContact, setCanContact] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen) {
      checkSubscription();
    }
  }, [isOpen]);

  const checkSubscription = async () => {
    setCheckingSubscription(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setCanContact(false);
        setCheckingSubscription(false);
        return;
      }

      // Check if admin
      const { data: adminCheck } = await supabase.rpc('has_role', {
        _user_id: user.id,
        _role: 'admin'
      });
      
      if (adminCheck) {
        setCanContact(true);
        setCheckingSubscription(false);
        return;
      }

      // Get brand profile and subscription
      const { data: brandProfile } = await supabase
        .from("brand_profiles")
        .select("id")
        .eq("user_id", user.id)
        .maybeSingle();

      if (!brandProfile) {
        setCanContact(false);
        setCheckingSubscription(false);
        return;
      }

      const { data: subscription } = await supabase
        .from("brand_subscriptions")
        .select("plan_type")
        .eq("brand_profile_id", brandProfile.id)
        .eq("status", "active")
        .maybeSingle();

      const planType = (subscription?.plan_type || "none") as PlanType;
      setCanContact(SUBSCRIPTION_PLANS[planType].canContactCreators);
    } catch (error) {
      console.error("Error checking subscription:", error);
      setCanContact(false);
    } finally {
      setCheckingSubscription(false);
    }
  };

  const handleGoToMessages = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Please login to message creators");
        navigate("/login");
        return;
      }

      let { data: brandProfile } = await supabase
        .from("brand_profiles")
        .select("id")
        .eq("user_id", user.id)
        .maybeSingle();

      if (!brandProfile) {
        toast.error("Please create a brand profile first");
        navigate("/brand-signup");
        return;
      }

      // Create or get conversation
      const { data: existingConv } = await supabase
        .from("conversations")
        .select("id")
        .eq("creator_profile_id", creatorProfileId)
        .eq("brand_profile_id", brandProfile.id)
        .maybeSingle();

      if (!existingConv) {
        await supabase.from("conversations").insert({
          creator_profile_id: creatorProfileId,
          brand_profile_id: brandProfile.id,
        });
      }

      toast.success("Conversation started! Discuss terms directly with the creator.");
      onClose();
      navigate("/brand-dashboard?tab=messages");
    } catch (error) {
      console.error("Error starting conversation:", error);
      toast.error("Failed to start conversation");
    }
  };

  if (!service) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Interested in {service.service_type.replace(/_/g, " ")}?</DialogTitle>
          <DialogDescription>
            Connect with the creator to discuss this service
          </DialogDescription>
        </DialogHeader>

        {checkingSubscription ? (
          <div className="py-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="text-sm text-muted-foreground mt-2">Checking subscription...</p>
          </div>
        ) : !canContact ? (
          <UpgradePrompt feature="contact" />
        ) : (
          <div className="space-y-4">
            <div className="bg-muted p-4 rounded-lg space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Service:</span>
                <span className="font-medium capitalize">{service.service_type.replace(/_/g, " ")}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Starting at:</span>
                <span className="font-medium">${(service.price_cents / 100).toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Est. Delivery:</span>
                <span className="font-medium">{service.delivery_days} days</span>
              </div>
            </div>

            <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
              <div className="flex items-start gap-3">
                <ExternalLink className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-amber-800 dark:text-amber-200">Booking handled offline</p>
                  <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
                    Message the creator to discuss project details, negotiate pricing, and arrange payment directly. All transactions are your responsibility.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" onClick={onClose} className="flex-1">
                Cancel
              </Button>
              <Button onClick={handleGoToMessages} className="flex-1 gradient-hero hover:opacity-90 gap-2">
                <MessageSquare className="h-4 w-4" />
                Message Creator
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default BookingDialog;