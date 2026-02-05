import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import {
  CreditCard,
  Loader2,
  CheckCircle,
  AlertCircle,
  Lock,
  Sparkles,
} from "lucide-react";
import { confirmMockPayment, formatPrice, type MockCardDetails } from "@/lib/stripe-mock";

interface LineItem {
  label: string;
  amountCents: number;
  isOptional?: boolean;
  isSelected?: boolean;
  onToggle?: (selected: boolean) => void;
  description?: string;
}

interface MockPaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  lineItems: LineItem[];
  onSuccess: (paymentId: string, selectedItems: string[]) => void;
  onCancel?: () => void;
}

const MockPaymentDialog = ({
  open,
  onOpenChange,
  title,
  description,
  lineItems,
  onSuccess,
  onCancel,
}: MockPaymentDialogProps) => {
  const [step, setStep] = useState<"review" | "payment" | "processing" | "success">("review");
  const [error, setError] = useState<string | null>(null);
  const [cardDetails, setCardDetails] = useState<MockCardDetails>({
    cardNumber: "",
    expiry: "",
    cvv: "",
    cardholderName: "",
  });
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [paymentId, setPaymentId] = useState<string>("");

  // Calculate total from selected items
  const totalCents = lineItems.reduce((sum, item) => {
    if (item.isOptional && !item.isSelected) return sum;
    return sum + item.amountCents;
  }, 0);

  const selectedItemLabels = lineItems
    .filter((item) => !item.isOptional || item.isSelected)
    .map((item) => item.label);

  const formatCardNumber = (value: string) => {
    const digits = value.replace(/\D/g, "").slice(0, 16);
    return digits.replace(/(.{4})/g, "$1 ").trim();
  };

  const formatExpiry = (value: string) => {
    const digits = value.replace(/\D/g, "").slice(0, 4);
    if (digits.length >= 3) {
      return `${digits.slice(0, 2)}/${digits.slice(2)}`;
    }
    return digits;
  };

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCardDetails((prev) => ({
      ...prev,
      cardNumber: formatCardNumber(e.target.value),
    }));
  };

  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCardDetails((prev) => ({
      ...prev,
      expiry: formatExpiry(e.target.value),
    }));
  };

  const validateCard = (): string | null => {
    const cleanCardNumber = cardDetails.cardNumber.replace(/\s/g, "");
    if (cleanCardNumber.length !== 16) return "Card number must be 16 digits";
    if (!cardDetails.expiry.match(/^\d{2}\/\d{2}$/)) return "Invalid expiry format (MM/YY)";
    if (cardDetails.cvv.length !== 3) return "CVV must be 3 digits";
    if (!cardDetails.cardholderName.trim()) return "Cardholder name is required";
    if (!termsAccepted) return "Please accept the terms";
    return null;
  };

  const handleProceedToPayment = () => {
    setStep("payment");
    setError(null);
  };

  const handleSubmitPayment = async () => {
    const validationError = validateCard();
    if (validationError) {
      setError(validationError);
      return;
    }

    setStep("processing");
    setError(null);

    try {
      const result = await confirmMockPayment(totalCents, cardDetails);
      
      if (result.success) {
        setPaymentId(result.paymentId);
        setStep("success");
        setTimeout(() => {
          onSuccess(result.paymentId, selectedItemLabels);
        }, 1500);
      } else {
        setError(result.error || "Payment failed");
        setStep("payment");
      }
    } catch (err) {
      setError("An unexpected error occurred");
      setStep("payment");
    }
  };

  const handleClose = () => {
    if (step !== "processing") {
      setStep("review");
      setError(null);
      setCardDetails({ cardNumber: "", expiry: "", cvv: "", cardholderName: "" });
      setTermsAccepted(false);
      onOpenChange(false);
      onCancel?.();
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        {step === "success" ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mb-4">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Payment Successful!</h3>
            <p className="text-muted-foreground text-sm">
              Your payment of {formatPrice(totalCents)} has been processed.
            </p>
          </div>
        ) : step === "processing" ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
            <h3 className="text-lg font-semibold mb-2">Processing Payment...</h3>
            <p className="text-muted-foreground text-sm">
              Please wait while we process your payment.
            </p>
          </div>
        ) : step === "payment" ? (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-primary" />
                Payment Details
              </DialogTitle>
              <DialogDescription>
                Enter your card information to complete the payment.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              {/* Amount */}
              <div className="bg-muted/50 rounded-lg p-4 flex justify-between items-center">
                <span className="font-medium">Total Amount</span>
                <span className="text-2xl font-bold text-primary">
                  {formatPrice(totalCents)}
                </span>
              </div>

              {/* Card Form */}
              <div className="space-y-3">
                <div className="space-y-2">
                  <Label htmlFor="cardNumber">Card Number</Label>
                  <Input
                    id="cardNumber"
                    placeholder="4242 4242 4242 4242"
                    value={cardDetails.cardNumber}
                    onChange={handleCardNumberChange}
                    className="font-mono"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="expiry">Expiry Date</Label>
                    <Input
                      id="expiry"
                      placeholder="MM/YY"
                      value={cardDetails.expiry}
                      onChange={handleExpiryChange}
                      maxLength={5}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cvv">CVV</Label>
                    <Input
                      id="cvv"
                      placeholder="123"
                      value={cardDetails.cvv}
                      onChange={(e) =>
                        setCardDetails((prev) => ({
                          ...prev,
                          cvv: e.target.value.replace(/\D/g, "").slice(0, 3),
                        }))
                      }
                      maxLength={3}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cardholderName">Cardholder Name</Label>
                  <Input
                    id="cardholderName"
                    placeholder="John Doe"
                    value={cardDetails.cardholderName}
                    onChange={(e) =>
                      setCardDetails((prev) => ({
                        ...prev,
                        cardholderName: e.target.value,
                      }))
                    }
                  />
                </div>
              </div>

              {/* Terms */}
              <div className="flex items-start space-x-2">
                <Checkbox
                  id="terms"
                  checked={termsAccepted}
                  onCheckedChange={(checked) => setTermsAccepted(!!checked)}
                />
                <label htmlFor="terms" className="text-xs text-muted-foreground leading-tight cursor-pointer">
                  I agree to the terms of service and authorize this payment.
                </label>
              </div>

              {/* Error */}
              {error && (
                <div className="flex items-center gap-2 text-destructive text-sm bg-destructive/10 rounded-md p-3">
                  <AlertCircle className="h-4 w-4 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Test Card Hint */}
              <div className="text-xs text-muted-foreground bg-muted/50 rounded-md p-2 flex items-start gap-2">
                <Lock className="h-3 w-3 mt-0.5 flex-shrink-0" />
                <span>Use test card: 4242 4242 4242 4242, any future date, any 3-digit CVV</span>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setStep("review")} className="flex-1">
                  Back
                </Button>
                <Button onClick={handleSubmitPayment} className="flex-1">
                  Pay {formatPrice(totalCents)}
                </Button>
              </div>
            </div>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>{title}</DialogTitle>
              {description && <DialogDescription>{description}</DialogDescription>}
            </DialogHeader>

            <div className="space-y-4">
              {/* Line Items */}
              <div className="space-y-3">
                {lineItems.map((item, index) => (
                  <div key={index}>
                    {item.isOptional ? (
                      <div
                        className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                          item.isSelected
                            ? "border-primary bg-primary/5"
                            : "hover:bg-muted/50"
                        }`}
                        onClick={() => item.onToggle?.(!item.isSelected)}
                      >
                        <div className="flex items-start gap-3">
                          <Checkbox
                            checked={item.isSelected}
                            onCheckedChange={(checked) => item.onToggle?.(!!checked)}
                          />
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <Sparkles className="h-4 w-4 text-amber-500" />
                              <span className="font-medium">{item.label}</span>
                            </div>
                            {item.description && (
                              <p className="text-sm text-muted-foreground mt-1">
                                {item.description}
                              </p>
                            )}
                          </div>
                          <span className="font-semibold text-primary">
                            +{formatPrice(item.amountCents)}
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className="flex justify-between items-center py-2">
                        <span>{item.label}</span>
                        <span className="font-medium">{formatPrice(item.amountCents)}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <Separator />

              {/* Total */}
              <div className="flex justify-between items-center">
                <span className="font-semibold">Total</span>
                <span className="text-2xl font-bold text-primary">
                  {formatPrice(totalCents)}
                </span>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <Button variant="outline" onClick={handleClose} className="flex-1">
                  Cancel
                </Button>
                <Button onClick={handleProceedToPayment} className="flex-1">
                  Continue to Payment
                </Button>
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default MockPaymentDialog;
