import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { 
  CreditCard, 
  CheckCircle, 
  Shield, 
  Loader2,
  Package,
  DollarSign,
  Calendar
} from "lucide-react";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { type OfferData } from "./OfferMessage";
import { PLATFORM_FEE_PERCENT, calculateDeposit } from "@/config/packages";
import MockPaymentDialog from "@/components/MockPaymentDialog";

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
  const [showPayment, setShowPayment] = useState(false);
  const [step, setStep] = useState<"review" | "payment" | "success">("review");

  const depositAmount = offerData.deposit_cents;
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

      // Calculate fees
      const platformFee = Math.round(offerData.price_cents * (PLATFORM_FEE_PERCENT / 100));

      // Create booking
      const { data: booking, error: bookingError } = await supabase
        .from("bookings")
        .insert({
          brand_profile_id: brandProfile.id,
          creator_profile_id: offer.creator_profile_id,
          package_type: offerData.package_type,
          total_price_cents: offerData.price_cents,
          deposit_amount_cents: depositAmount,
          platform_fee_cents: platformFee,
          event_date: offerData.event_date,
          event_time_start: offerData.event_time,
          message: offerData.notes,
          status: "pending", // Waiting for creator confirmation
          payment_status: "partial",
          escrow_status: "deposit_paid",
        })
        .select()
        .single();

      if (bookingError) throw bookingError;

      // Create escrow transaction for deposit
      const { error: escrowError } = await supabase
        .from("escrow_transactions")
        .insert({
          event_booking_id: booking.id,
          amount_cents: depositAmount,
          transaction_type: "deposit",
          status: "processed",
          processed_at: new Date().toISOString(),
        });

      if (escrowError) throw escrowError;

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
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      await supabase.from("messages").insert({
        conversation_id: conversationId,
        sender_id: currentUser?.id,
        content: `✅ I've accepted your offer and paid the deposit of $${(depositAmount / 100).toFixed(2)}. Looking forward to working together!`,
        message_type: "text",
      });

      setStep("success");
      toast.success("Offer accepted! Booking created successfully.");
      
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

  const handlePaymentSuccess = (paymentId: string) => {
    setShowPayment(false);
    handleAcceptOffer();
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-md">
          {step === "success" ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mb-4">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Booking Created!</h3>
              <p className="text-muted-foreground">
                The creator will be notified and can confirm your booking.
              </p>
            </div>
          ) : (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-primary" />
                  Accept Offer & Pay Deposit
                </DialogTitle>
                <DialogDescription>
                  Review the offer details and pay the 50% deposit to secure your booking.
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

                {/* Payment Breakdown */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Total Price</span>
                    <span>${(offerData.price_cents / 100).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Deposit (50%)</span>
                    <span className="font-medium">${(depositAmount / 100).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Remaining (paid on completion)</span>
                    <span>${((offerData.price_cents - depositAmount) / 100).toFixed(2)}</span>
                  </div>
                </div>

                <Separator />

                {/* Payment Due */}
                <div className="flex justify-between items-center">
                  <span className="font-semibold">Pay Now</span>
                  <div className="flex items-center gap-1">
                    <DollarSign className="h-5 w-5 text-primary" />
                    <span className="text-2xl font-bold text-primary">
                      {(depositAmount / 100).toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Security Note */}
                <div className="flex items-start gap-2 text-xs text-muted-foreground bg-primary/5 rounded-md p-3">
                  <Shield className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                  <p>
                    Your payment is held in escrow and only released to the creator after you confirm completion. 
                    If there's an issue, you can open a dispute.
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
                    onClick={() => setShowPayment(true)}
                    className="flex-1"
                    disabled={loading}
                  >
                    {loading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        <CreditCard className="h-4 w-4 mr-2" />
                        Pay ${(depositAmount / 100).toFixed(2)}
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Mock Payment Dialog */}
      <MockPaymentDialog
        isOpen={showPayment}
        onClose={() => setShowPayment(false)}
        onSuccess={handlePaymentSuccess}
        orderSummary={{
          type: 'booking',
          serviceType: offerData.package_type,
          priceCents: depositAmount,
          deliveryDays: 7,
        }}
      />
    </>
  );
};

export default AcceptOfferDialog;
