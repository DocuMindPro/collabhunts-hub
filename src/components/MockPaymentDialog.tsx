import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { CreditCard, Lock, CheckCircle, AlertCircle } from "lucide-react";
import { confirmMockPayment, type MockCardDetails } from "@/lib/stripe-mock";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

interface BookingOrderSummary {
  type: 'booking';
  serviceType: string;
  priceCents: number;
  deliveryDays: number;
}

interface SubscriptionOrderSummary {
  type: 'subscription';
  planName: string;
  priceCents: number;
}

type OrderSummary = BookingOrderSummary | SubscriptionOrderSummary;

interface MockPaymentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (paymentId: string) => void;
  orderSummary: OrderSummary;
}

const MockPaymentDialog = ({ isOpen, onClose, onSuccess, orderSummary }: MockPaymentDialogProps) => {
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [cardholderName, setCardholderName] = useState("");
  const [processing, setProcessing] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<"idle" | "processing" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [autoReleaseAccepted, setAutoReleaseAccepted] = useState(false);

  const isBooking = orderSummary.type === 'booking';
  const isSubscription = orderSummary.type === 'subscription';

  // Field-level validation helpers
  const isCardholderValid = cardholderName.trim().length > 0;
  const isCardNumberValid = cardNumber.replace(/\s/g, "").length === 16;
  const isExpiryValid = expiry.length === 5 && expiry.includes("/");
  const isCvvValid = cvv.length >= 3;

  const formatCardNumber = (value: string) => {
    const numbers = value.replace(/\D/g, "");
    const groups = numbers.match(/.{1,4}/g);
    return groups ? groups.join(" ").substr(0, 19) : "";
  };

  const formatExpiry = (value: string) => {
    const numbers = value.replace(/\D/g, "");
    if (numbers.length >= 2) {
      return numbers.substr(0, 2) + "/" + numbers.substr(2, 2);
    }
    return numbers;
  };

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCardNumber(formatCardNumber(e.target.value));
  };

  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setExpiry(formatExpiry(e.target.value));
  };

  const handleCvvChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCvv(e.target.value.replace(/\D/g, "").substr(0, 3));
  };

  const totalCents = orderSummary.priceCents;

  const handlePayment = async () => {
    // Better validation with specific field errors
    const errors: string[] = [];
    
    if (!cardholderName.trim()) errors.push("Cardholder name");
    if (cardNumber.replace(/\s/g, "").length !== 16) errors.push("Card number (16 digits)");
    if (expiry.length !== 5 || !expiry.includes("/")) errors.push("Expiry date (MM/YY)");
    if (cvv.length < 3) errors.push("CVV (3 digits)");
    
    if (errors.length > 0) {
      setErrorMessage(`Missing or invalid: ${errors.join(", ")}`);
      return;
    }

    // For bookings, require both checkboxes. For subscriptions, only terms
    if (!termsAccepted || (isBooking && !autoReleaseAccepted)) {
      setErrorMessage("Please accept all terms and conditions");
      return;
    }

    setProcessing(true);
    setPaymentStatus("processing");
    setErrorMessage("");

    const cardDetails: MockCardDetails = {
      cardNumber: cardNumber.replace(/\s/g, ""),
      expiry,
      cvv,
      cardholderName,
    };

    try {
      const result = await confirmMockPayment(totalCents, cardDetails);

      if (result.success) {
        setPaymentStatus("success");
        // Wait for success animation
        setTimeout(() => {
          onSuccess(result.paymentId);
        }, 1500);
      } else {
        setPaymentStatus("error");
        setErrorMessage(result.error || "Payment failed");
        setProcessing(false);
      }
    } catch (error) {
      setPaymentStatus("error");
      setErrorMessage("An unexpected error occurred");
      setProcessing(false);
    }
  };

  const resetForm = () => {
    setCardNumber("");
    setExpiry("");
    setCvv("");
    setCardholderName("");
    setPaymentStatus("idle");
    setErrorMessage("");
    setProcessing(false);
    setTermsAccepted(false);
    setAutoReleaseAccepted(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Complete Payment
          </DialogTitle>
          <DialogDescription>
            Enter your card details to complete the booking
          </DialogDescription>
        </DialogHeader>

        {paymentStatus === "success" ? (
          <div className="py-8 text-center space-y-4">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto animate-pulse">
              <CheckCircle className="h-10 w-10 text-green-600" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">Payment Successful!</h3>
              <p className="text-sm text-muted-foreground">
                {isSubscription 
                  ? "Your subscription is now active!" 
                  : "Your booking request is being processed..."}
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Order Summary */}
            <div className="bg-muted p-4 rounded-lg space-y-2">
              {isBooking ? (
                <>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Service:</span>
                    <span className="capitalize">{orderSummary.serviceType.replace(/_/g, " ")}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Delivery:</span>
                    <span>{orderSummary.deliveryDays} days</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Service Price:</span>
                    <span>${(orderSummary.priceCents / 100).toFixed(2)}</span>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Plan:</span>
                    <span className="font-medium">{orderSummary.planName}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Billing:</span>
                    <span>Monthly</span>
                  </div>
                </>
              )}
              <div className="border-t pt-2 mt-2 flex justify-between font-semibold">
                <span>Total:</span>
                <span className="text-primary">${(totalCents / 100).toFixed(2)}</span>
              </div>
            </div>

            {/* Card Form */}
            <div className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor="cardholderName">Cardholder Name</Label>
                <div className="relative">
                  <Input
                    id="cardholderName"
                    placeholder="John Doe"
                    value={cardholderName}
                    onChange={(e) => setCardholderName(e.target.value)}
                    disabled={processing}
                    className={cn("pr-8", cardholderName && (isCardholderValid ? "border-green-500" : "border-destructive"))}
                  />
                  {cardholderName && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      {isCardholderValid ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : (
                        <AlertCircle className="h-4 w-4 text-destructive" />
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="cardNumber">Card Number</Label>
                <div className="relative">
                  <Input
                    id="cardNumber"
                    placeholder="4242 4242 4242 4242"
                    value={cardNumber}
                    onChange={handleCardNumberChange}
                    disabled={processing}
                    className={cn("pl-10 pr-8", cardNumber && (isCardNumberValid ? "border-green-500" : "border-destructive"))}
                  />
                  <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  {cardNumber && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      {isCardNumberValid ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : (
                        <AlertCircle className="h-4 w-4 text-destructive" />
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="expiry">Expiry Date</Label>
                  <div className="relative">
                    <Input
                      id="expiry"
                      placeholder="MM/YY"
                      value={expiry}
                      onChange={handleExpiryChange}
                      disabled={processing}
                      maxLength={5}
                      className={cn("pr-8", expiry && (isExpiryValid ? "border-green-500" : "border-destructive"))}
                    />
                    {expiry && (
                      <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        {isExpiryValid ? (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        ) : (
                          <AlertCircle className="h-4 w-4 text-destructive" />
                        )}
                      </div>
                    )}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cvv">CVV</Label>
                  <div className="relative">
                    <Input
                      id="cvv"
                      placeholder="123"
                      value={cvv}
                      onChange={handleCvvChange}
                      disabled={processing}
                      maxLength={3}
                      className={cn("pr-8", cvv && (isCvvValid ? "border-green-500" : "border-destructive"))}
                    />
                    {cvv && (
                      <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        {isCvvValid ? (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        ) : (
                          <AlertCircle className="h-4 w-4 text-destructive" />
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Error Message */}
            {errorMessage && (
              <div className="flex items-center gap-2 text-destructive text-sm bg-destructive/10 p-3 rounded-lg">
                <AlertCircle className="h-4 w-4 shrink-0" />
                {errorMessage}
              </div>
            )}

            {/* Terms Acceptance */}
            <div className="space-y-3 p-3 bg-muted/50 rounded-lg">
              <div className="flex items-start gap-3">
                <Checkbox 
                  id="payment-terms" 
                  checked={termsAccepted} 
                  onCheckedChange={(checked) => setTermsAccepted(checked === true)}
                  disabled={processing}
                />
                <label htmlFor="payment-terms" className="text-xs leading-tight cursor-pointer">
                  I agree to the{" "}
                  <Link to="/terms" target="_blank" className="text-primary hover:underline">
                    Terms of Service
                  </Link>{" "}
                  and{" "}
                  <Link to="/privacy" target="_blank" className="text-primary hover:underline">
                    Privacy Policy
                  </Link>
                </label>
              </div>
              {isBooking && (
                <div className="flex items-start gap-3">
                  <Checkbox 
                    id="auto-release" 
                    checked={autoReleaseAccepted} 
                    onCheckedChange={(checked) => setAutoReleaseAccepted(checked === true)}
                    disabled={processing}
                  />
                  <label htmlFor="auto-release" className="text-xs leading-tight cursor-pointer">
                    I understand payment will auto-release to the creator after 72 hours if I don't approve or dispute the deliverables
                  </label>
                </div>
              )}
            </div>

            {/* Test Card Info */}
            <div className="text-xs text-muted-foreground bg-muted/50 p-3 rounded-lg">
              <p className="font-medium mb-1">Test Cards:</p>
              <p>✓ Success: 4242 4242 4242 4242</p>
              <p>✗ Decline: 4000 0000 0000 0002</p>
            </div>

            {/* Security Badge */}
            <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
              <Lock className="h-3 w-3" />
              <span>Secured by Stripe</span>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleClose} disabled={processing} className="flex-1">
                Cancel
              </Button>
              <Button
                onClick={handlePayment}
                disabled={processing}
                className="flex-1 gradient-hero hover:opacity-90"
              >
                {processing ? (
                  <span className="flex items-center gap-2">
                    <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Processing...
                  </span>
                ) : (
                  `Pay $${(totalCents / 100).toFixed(2)}`
                )}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default MockPaymentDialog;
