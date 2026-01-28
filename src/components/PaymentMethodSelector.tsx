import { useState } from "react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  CreditCard,
  Banknote,
  Building,
  Smartphone,
  Landmark,
  Clock,
  Info,
} from "lucide-react";
import { PAYMENT_METHODS, type PaymentMethod } from "@/config/lebanese-market";

interface PaymentMethodSelectorProps {
  selectedMethod: PaymentMethod | null;
  onMethodChange: (method: PaymentMethod) => void;
  disabled?: boolean;
}

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  'credit-card': CreditCard,
  'banknote': Banknote,
  'building': Building,
  'smartphone': Smartphone,
  'landmark': Landmark,
};

const PaymentMethodSelector = ({
  selectedMethod,
  onMethodChange,
  disabled = false,
}: PaymentMethodSelectorProps) => {
  const selectedConfig = PAYMENT_METHODS.find(m => m.id === selectedMethod);

  return (
    <div className="space-y-4">
      <Label className="text-base font-semibold">Payment Method</Label>
      
      <RadioGroup
        value={selectedMethod || ""}
        onValueChange={(value) => onMethodChange(value as PaymentMethod)}
        disabled={disabled}
        className="space-y-3"
      >
        {PAYMENT_METHODS.filter(m => m.available).map((method) => {
          const Icon = iconMap[method.icon] || CreditCard;
          
          return (
            <Card
              key={method.id}
              className={`cursor-pointer transition-all ${
                selectedMethod === method.id
                  ? "border-primary bg-primary/5"
                  : "hover:border-primary/50"
              } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
              onClick={() => !disabled && onMethodChange(method.id)}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  <RadioGroupItem
                    value={method.id}
                    id={method.id}
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Icon className="h-4 w-4 text-primary" />
                      <Label
                        htmlFor={method.id}
                        className="font-medium cursor-pointer"
                      >
                        {method.name}
                      </Label>
                      {method.requiresVerification && (
                        <Badge variant="outline" className="text-xs">
                          Requires Approval
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      {method.description}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {method.processingTime}
                      </span>
                      <span>{method.fees}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </RadioGroup>

      {selectedConfig?.requiresVerification && (
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            {selectedMethod === 'cod' && (
              <>
                <strong>Cash on Event Day:</strong> You'll pay the creator directly at the venue.
                The venue must approve this payment method. A verification call may be required.
              </>
            )}
            {selectedMethod === 'omt' && (
              <>
                <strong>OMT Transfer:</strong> After booking confirmation, you'll receive OMT 
                transfer instructions. Please complete the transfer within 24 hours.
              </>
            )}
            {selectedMethod === 'whish' && (
              <>
                <strong>Whish Money:</strong> You'll receive a Whish payment request after
                booking confirmation. Payment must be completed within 24 hours.
              </>
            )}
            {selectedMethod === 'bank_transfer' && (
              <>
                <strong>Bank Transfer:</strong> Bank details will be provided after booking.
                Please include the booking reference in your transfer memo.
              </>
            )}
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default PaymentMethodSelector;
