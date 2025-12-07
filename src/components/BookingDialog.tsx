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
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { calculatePlatformFee, type PlanType, SUBSCRIPTION_PLANS } from "@/lib/stripe-mock";
import UpgradePrompt from "./UpgradePrompt";

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
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [checkingSubscription, setCheckingSubscription] = useState(true);
  const [canContact, setCanContact] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
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
        setIsAdmin(true);
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

      const planType = (subscription?.plan_type || "basic") as PlanType;
      setCanContact(SUBSCRIPTION_PLANS[planType].canContactCreators);
    } catch (error) {
      console.error("Error checking subscription:", error);
      setCanContact(false);
    } finally {
      setCheckingSubscription(false);
    }
  };

  const handleSubmit = async () => {
    if (!service) return;

    try {
      setLoading(true);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Please login to book services");
        navigate("/login");
        return;
      }

      // Check if user is admin
      const { data: adminCheck } = await supabase.rpc('has_role', {
        _user_id: user.id,
        _role: 'admin'
      });

      let { data: brandProfile } = await supabase
        .from("brand_profiles")
        .select("id")
        .eq("user_id", user.id)
        .maybeSingle();

      // If admin without brand profile, auto-create one
      if (adminCheck && !brandProfile) {
        const { data: newBrandProfile, error: createError } = await supabase
          .from("brand_profiles")
          .insert({
            user_id: user.id,
            company_name: "CollabHunts Admin"
          })
          .select("id")
          .single();

        if (createError) {
          console.error("Error creating admin brand profile:", createError);
          toast.error("Failed to create admin profile");
          return;
        }
        brandProfile = newBrandProfile;
      }

      if (!brandProfile) {
        toast.error("Please create a brand profile first");
        navigate("/brand-signup");
        return;
      }

      // Get brand's subscription to calculate platform fee
      const { data: subscription } = await supabase
        .from("brand_subscriptions")
        .select("plan_type")
        .eq("brand_profile_id", brandProfile.id)
        .eq("status", "active")
        .maybeSingle();

      const planType = (subscription?.plan_type || "basic") as PlanType;
      
      // Double-check subscription allows contact (unless admin)
      if (!adminCheck && !SUBSCRIPTION_PLANS[planType].canContactCreators) {
        toast.error("Please upgrade your subscription to book services");
        navigate("/brand-dashboard?tab=subscription");
        return;
      }

      const platformFeeCents = calculatePlatformFee(service.price_cents, planType);

      // Create booking
      const { error: bookingError } = await supabase
        .from("bookings")
        .insert({
          creator_profile_id: creatorProfileId,
          brand_profile_id: brandProfile.id,
          service_id: service.id,
          total_price_cents: service.price_cents,
          platform_fee_cents: platformFeeCents,
          message: message.trim() || null,
          status: "pending",
        });

      if (bookingError) throw bookingError;

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

      toast.success("Booking request sent successfully!");
      onClose();
      setMessage("");
      navigate("/brand-dashboard");
    } catch (error) {
      console.error("Error creating booking:", error);
      toast.error("Failed to send booking request");
    } finally {
      setLoading(false);
    }
  };

  if (!service) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Book {service.service_type.replace(/_/g, " ")}</DialogTitle>
          <DialogDescription>
            Send a booking request to the creator
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
                <span className="text-sm text-muted-foreground">Price:</span>
                <span className="font-semibold">${(service.price_cents / 100).toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Delivery:</span>
                <span className="font-medium">{service.delivery_days} days</span>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Message (Optional)</label>
              <Textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Tell the creator about your campaign..."
                rows={4}
              />
            </div>

            <div className="flex gap-2">
              <Button variant="outline" onClick={onClose} className="flex-1">
                Cancel
              </Button>
              <Button onClick={handleSubmit} disabled={loading} className="flex-1 gradient-hero hover:opacity-90">
                {loading ? "Sending..." : "Send Request"}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default BookingDialog;
