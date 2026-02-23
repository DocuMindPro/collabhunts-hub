import { DollarSign, MessageCircle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface PricingRequestMessageProps {
  notes?: string;
  isOwn: boolean;
  onSendPricing?: () => void;
}

const PricingRequestMessage = ({ notes, isOwn, onSendPricing }: PricingRequestMessageProps) => {
  return (
    <Card className="max-w-[80%] border-primary/20 bg-primary/5 overflow-hidden">
      <div className="flex items-center gap-2 px-3 py-2 bg-primary/10 border-b border-primary/20">
        <DollarSign className="h-4 w-4 text-primary" />
        <span className="text-xs font-semibold text-primary">Pricing Requested</span>
      </div>
      <div className="p-3 space-y-2">
        <p className="text-sm text-muted-foreground">
          {isOwn
            ? "You requested pricing from this creator."
            : "This brand would like to know your rates."}
        </p>
        {notes && (
          <p className="text-sm italic text-muted-foreground/80">"{notes}"</p>
        )}
        {!isOwn && onSendPricing && (
          <Button size="sm" className="w-full gap-1.5 mt-1" onClick={onSendPricing}>
            <MessageCircle className="h-3.5 w-3.5" />
            Send My Pricing
          </Button>
        )}
      </div>
    </Card>
  );
};

export default PricingRequestMessage;

export const isPricingRequest = (content: string): boolean => {
  try {
    const parsed = JSON.parse(content);
    return parsed.type === "pricing_request";
  } catch {
    return false;
  }
};
