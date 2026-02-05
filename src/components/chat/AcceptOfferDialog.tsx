import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { 
  CheckCircle, 
  Loader2,
  Package,
  DollarSign,
  Calendar,
  FileText
} from "lucide-react";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { type OfferData } from "./OfferMessage";

interface AcceptOfferDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  offerData: OfferData;
  conversationId: string;
  onSuccess: () => void;
}

const AcceptOfferDialog = ({
  open,
  onOpenChange,
  offerData,
  conversationId,
  onSuccess,
}: AcceptOfferDialogProps) => {
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<"review" | "success">("review");

  const isEventPackage = ['social_boost', 'meet_greet', 'competition'].includes(offerData.package_type);

  const handleAcceptOffer = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Get brand profile
      const { data: brandProfile } = await supabase
        .from("brand_profiles")
        .select("id")
        .eq("user_id", user.id)
        .single();

      if (!brandProfile) throw new Error("Brand profile not found");

      // Get offer details to get creator profile
      const { data: offer, error: offerFetchError } = await supabase
        .from("booking_offers")
        .select("*, creator_profile_id")
        .eq("id", offerData.offer_id)
        .single();

      if (offerFetchError) throw offerFetchError;
      if (!offer) throw new Error("Offer not found");

      // Create booking record (no payment - just an agreement record)
      const { data: booking, error: bookingError } = await supabase
        .from("bookings")
        .insert({
          brand_profile_id: brandProfile.id,
          creator_profile_id: offer.creator_profile_id,
          package_type: offerData.package_type,
          total_price_cents: offerData.price_cents,
          event_date: offerData.event_date,
          event_time_start: offerData.event_time,
          message: offerData.notes,
          status: "confirmed", // Directly confirmed - no payment required
          payment_status: "pending", // Payment happens off-platform
        })
        .select()
        .single();

      if (bookingError) throw bookingError;

      // Update offer status
      const { error: offerUpdateError } = await supabase
        .from("booking_offers")
        .update({
          status: "accepted",
          accepted_at: new Date().toISOString(),
          booking_id: booking.id,
        })
        .eq("id", offerData.offer_id);

      if (offerUpdateError) throw offerUpdateError;

      // Send confirmation message
      await supabase.from("messages").insert({
        conversation_id: conversationId,
        sender_id: user.id,
        content: `✅ I've accepted your offer for ${offerData.package_name} at $${(offerData.price_cents / 100).toFixed(2)}. Let's discuss payment and next steps!`,
        message_type: "text",
      });

      setStep("success");
      toast.success("Agreement confirmed! You can now arrange payment directly with the creator.");
      
      // Close after a short delay to show success state
      setTimeout(() => {
        onSuccess();
      }, 1500);

    } catch (error: any) {
      console.error("Error accepting offer:", error);
      toast.error(error.message || "Failed to accept offer");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        {step === "success" ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mb-4">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Agreement Confirmed!</h3>
            <p className="text-muted-foreground">
              You can now arrange payment directly with the creator.
            </p>
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                Confirm Agreement
              </DialogTitle>
              <DialogDescription>
                Review the offer details and confirm to proceed with this collaboration.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              {/* Offer Summary */}
              <div className="bg-muted/50 rounded-lg p-4 space-y-3">
                <div className="flex items-center gap-3">
                  <Package className="h-5 w-5 text-primary" />
                  <span className="font-medium">{offerData.package_name}</span>
                </div>

                {isEventPackage && offerData.event_date && (
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>{format(new Date(offerData.event_date), "MMMM d, yyyy")}</span>
                    {offerData.event_time && <span>at {offerData.event_time}</span>}
                  </div>
                )}
              </div>

              <Separator />

              {/* Price */}
              <div className="flex justify-between items-center">
                <span className="font-semibold">Agreed Price</span>
                <div className="flex items-center gap-1">
                  <DollarSign className="h-5 w-5 text-primary" />
                  <span className="text-2xl font-bold text-primary">
                    {(offerData.price_cents / 100).toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Info Note */}
              <div className="flex items-start gap-2 text-xs text-muted-foreground bg-primary/5 rounded-md p-3">
                <FileText className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                <p>
                  By confirming, you agree to this collaboration. Payment will be arranged directly with the creator outside the platform.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-2">
                <Button
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  className="flex-1"
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleAcceptOffer}
                  className="flex-1"
                  disabled={loading}
                >
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Confirm Agreement
                    </>
                  )}
                </Button>
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default AcceptOfferDialog;
