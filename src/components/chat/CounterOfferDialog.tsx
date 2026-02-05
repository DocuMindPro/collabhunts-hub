import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { 
  ArrowLeftRight, CalendarIcon, Clock, DollarSign, 
  Loader2, TrendingUp, TrendingDown 
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { EVENT_PACKAGES, type PackageType } from "@/config/packages";
import { type NegotiationData } from "./NegotiationMessage";

interface CounterOfferDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  conversationId: string;
  originalInquiry: NegotiationData;
  onCounterSent: () => void;
}

const CounterOfferDialog = ({
  open,
  onOpenChange,
  conversationId,
  originalInquiry,
  onCounterSent,
}: CounterOfferDialogProps) => {
  const [priceCents, setPriceCents] = useState(originalInquiry.proposed_budget_cents);
  const [eventDate, setEventDate] = useState<Date | undefined>(
    originalInquiry.preferred_date ? new Date(originalInquiry.preferred_date) : undefined
  );
  const [eventTime, setEventTime] = useState(originalInquiry.preferred_time || "19:00");
  const [durationHours, setDurationHours] = useState(originalInquiry.duration_hours || 2);
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);

  const packageConfig = EVENT_PACKAGES[originalInquiry.package_type as PackageType];
  const packageName = packageConfig?.name || originalInquiry.package_type.replace(/_/g, " ");
  const isEventPackage = ["social_boost", "meet_greet", "competition"].includes(originalInquiry.package_type);

  const originalPrice = originalInquiry.proposed_budget_cents / 100;
  const newPrice = priceCents / 100;
  const priceDiff = newPrice - originalPrice;
  const priceDiffPercent = ((priceDiff / originalPrice) * 100).toFixed(0);

  useEffect(() => {
    if (open) {
      setPriceCents(originalInquiry.proposed_budget_cents);
      setEventDate(originalInquiry.preferred_date ? new Date(originalInquiry.preferred_date) : undefined);
      setEventTime(originalInquiry.preferred_time || "19:00");
      setDurationHours(originalInquiry.duration_hours || 2);
      setNotes("");
    }
  }, [open, originalInquiry]);

  const handleSubmit = async () => {
    if (priceCents <= 0) {
      toast.error("Please set a valid price");
      return;
    }

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Create counter offer message
      const counterData: NegotiationData = {
        type: "counter_offer",
        message_id: "", // Will be set after insert
        parent_message_id: originalInquiry.message_id,
        package_type: originalInquiry.package_type,
        proposed_budget_cents: priceCents,
        preferred_date: eventDate ? format(eventDate, "yyyy-MM-dd") : originalInquiry.preferred_date,
        preferred_time: isEventPackage ? eventTime : undefined,
        duration_hours: isEventPackage ? durationHours : undefined,
        notes: notes || undefined,
        status: "pending",
        previous_price_cents: originalInquiry.proposed_budget_cents,
      };

      const messageContent = JSON.stringify(counterData);

      // Insert the counter offer message
      const { error: messageError } = await supabase
        .from("messages")
        .insert({
          conversation_id: conversationId,
          sender_id: user.id,
          content: messageContent,
          message_type: "negotiation",
          parent_message_id: originalInquiry.message_id,
          negotiation_status: "pending",
        });

      if (messageError) throw messageError;

      // Update original message status to "countered"
      await supabase
        .from("messages")
        .update({ negotiation_status: "countered" })
        .eq("id", originalInquiry.message_id);

      toast.success("Counter offer sent!");
      onCounterSent();
      onOpenChange(false);
    } catch (error: any) {
      console.error("Error sending counter offer:", error);
      toast.error(error.message || "Failed to send counter offer");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ArrowLeftRight className="h-5 w-5 text-primary" />
            Counter Offer
          </DialogTitle>
          <DialogDescription>
            Adjust the terms and send a counter proposal for {packageName}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Price */}
          <div className="space-y-2">
            <Label>Your Price (USD)</Label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="number"
                min={0}
                value={priceCents / 100}
                onChange={(e) => setPriceCents(Math.round(parseFloat(e.target.value || "0") * 100))}
                className="pl-9"
                placeholder="0.00"
              />
            </div>
            {priceDiff !== 0 && (
              <div className={`flex items-center gap-1 text-xs ${
                priceDiff > 0 ? "text-green-600" : "text-red-600"
              }`}>
                {priceDiff > 0 ? (
                  <TrendingUp className="h-3 w-3" />
                ) : (
                  <TrendingDown className="h-3 w-3" />
                )}
                <span>
                  {priceDiff > 0 ? "+" : ""}{priceDiffPercent}% from original ${originalPrice}
                </span>
              </div>
            )}
          </div>

          {/* Event Date & Time (for event packages) */}
          {isEventPackage && (
            <>
              <div className="space-y-2">
                <Label>Proposed Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !eventDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {eventDate ? format(eventDate, "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={eventDate}
                      onSelect={setEventDate}
                      disabled={(date) => date < new Date()}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Start Time</Label>
                  <Input
                    type="time"
                    value={eventTime}
                    onChange={(e) => setEventTime(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Duration (hours)</Label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="number"
                      min={1}
                      max={8}
                      value={durationHours}
                      onChange={(e) => setDurationHours(parseInt(e.target.value) || 2)}
                      className="pl-9"
                    />
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Notes */}
          <div className="space-y-2">
            <Label>Reason / Notes (optional)</Label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Explain your counter offer..."
              rows={3}
            />
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-2">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              className="flex-1"
              disabled={loading || priceCents <= 0}
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <ArrowLeftRight className="h-4 w-4 mr-2" />
                  Send Counter
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CounterOfferDialog;
