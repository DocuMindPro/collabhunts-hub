import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Send, DollarSign, Clock, Loader2 } from "lucide-react";
import { format, addDays } from "date-fns";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { EVENT_PACKAGES, type PackageType } from "@/config/packages";

interface SendOfferDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  conversationId: string;
  creatorProfileId: string;
  brandProfileId: string;
  onOfferSent: () => void;
  prefillServiceType?: string;
  prefillPriceCents?: number;
}

interface CreatorService {
  id: string;
  service_type: string;
  price_cents: number;
  duration_hours: number | null;
  delivery_days: number | null;
}

const SendOfferDialog = ({
  open,
  onOpenChange,
  conversationId,
  creatorProfileId,
  brandProfileId,
  onOfferSent,
  prefillServiceType,
  prefillPriceCents,
}: SendOfferDialogProps) => {
  const [services, setServices] = useState<CreatorService[]>([]);
  const [selectedServiceType, setSelectedServiceType] = useState<string>("");
  const [priceCents, setPriceCents] = useState<number>(0);
  const [eventDate, setEventDate] = useState<Date | undefined>(undefined);
  const [eventTime, setEventTime] = useState<string>("19:00");
  const [durationHours, setDurationHours] = useState<number>(2);
  const [notes, setNotes] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [loadingServices, setLoadingServices] = useState(true);

  useEffect(() => {
    if (open) {
      fetchServices();
    }
  }, [open, creatorProfileId]);

  // Handle prefill when services are loaded
  useEffect(() => {
    if (prefillServiceType && services.length > 0) {
      // Try to match by service type (case-insensitive partial match)
      const service = services.find(s => 
        s.service_type.toLowerCase().includes(prefillServiceType.toLowerCase()) ||
        prefillServiceType.toLowerCase().includes(s.service_type.toLowerCase())
      );
      if (service) {
        setSelectedServiceType(service.service_type);
        setPriceCents(prefillPriceCents || service.price_cents);
        setDurationHours(service.duration_hours || 2);
      }
    }
  }, [prefillServiceType, prefillPriceCents, services]);

  const fetchServices = async () => {
    try {
      setLoadingServices(true);
      const { data, error } = await supabase
        .from("creator_services")
        .select("id, service_type, price_cents, duration_hours, delivery_days")
        .eq("creator_profile_id", creatorProfileId)
        .eq("is_active", true);

      if (error) throw error;
      setServices(data || []);
      
      // Auto-select first service if available
      if (data && data.length > 0) {
        setSelectedServiceType(data[0].service_type);
        setPriceCents(data[0].price_cents);
        setDurationHours(data[0].duration_hours || 2);
      }
    } catch (error) {
      console.error("Error fetching services:", error);
    } finally {
      setLoadingServices(false);
    }
  };

  const handleServiceChange = (serviceType: string) => {
    setSelectedServiceType(serviceType);
    const service = services.find(s => s.service_type === serviceType);
    if (service) {
      setPriceCents(service.price_cents);
      setDurationHours(service.duration_hours || 2);
    }
  };

  const handleSubmit = async () => {
    if (!selectedServiceType || priceCents <= 0) {
      toast.error("Please select a package and set a price");
      return;
    }

    if (isEventPackage && !eventDate) {
      toast.error("Please select an event date");
      return;
    }

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Create the offer
      const { data: offer, error: offerError } = await supabase
        .from("booking_offers")
        .insert({
          conversation_id: conversationId,
          creator_profile_id: creatorProfileId,
          brand_profile_id: brandProfileId,
          package_type: selectedServiceType,
          price_cents: priceCents,
          event_date: eventDate ? format(eventDate, "yyyy-MM-dd") : null,
          event_time_start: isEventPackage ? eventTime : null,
          duration_hours: isEventPackage ? durationHours : null,
          notes: notes || null,
          status: "pending",
        })
        .select()
        .single();

      if (offerError) throw offerError;

      // Create a message linking to the offer
      const packageName = EVENT_PACKAGES[selectedServiceType as PackageType]?.name || selectedServiceType;
      
      const messageContent = JSON.stringify({
        type: "offer",
        offer_id: offer.id,
        package_type: selectedServiceType,
        package_name: packageName,
        price_cents: priceCents,
        event_date: eventDate ? format(eventDate, "yyyy-MM-dd") : null,
        event_time: isEventPackage ? eventTime : null,
        duration_hours: isEventPackage ? durationHours : null,
        notes: notes || null,
      });

      const { error: messageError } = await supabase
        .from("messages")
        .insert({
          conversation_id: conversationId,
          sender_id: user.id,
          content: messageContent,
          message_type: "offer",
          offer_id: offer.id,
        });

      if (messageError) throw messageError;

      toast.success("Offer sent successfully!");
      onOfferSent();
      onOpenChange(false);
      resetForm();
    } catch (error: any) {
      console.error("Error sending offer:", error);
      toast.error(error.message || "Failed to send offer");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setSelectedServiceType("");
    setPriceCents(0);
    setEventDate(undefined);
    setEventTime("19:00");
    setDurationHours(2);
    setNotes("");
  };

  const isEventPackage = selectedServiceType && 
    ['social_boost', 'meet_greet', 'competition'].includes(selectedServiceType);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Send className="h-5 w-5 text-primary" />
            Send Offer
          </DialogTitle>
        </DialogHeader>

        {loadingServices ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : services.length === 0 ? (
          <div className="text-center py-6">
            <p className="text-muted-foreground">You need to set up your packages first.</p>
            <Button className="mt-4" onClick={() => onOpenChange(false)}>
              Go to Services
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Package Selection */}
            <div className="space-y-2">
              <Label>Package</Label>
              <Select value={selectedServiceType} onValueChange={handleServiceChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a package" />
                </SelectTrigger>
                <SelectContent>
                  {services.map((service) => {
                    const pkg = EVENT_PACKAGES[service.service_type as PackageType];
                    return (
                      <SelectItem key={service.id} value={service.service_type}>
                        {pkg?.name || service.service_type}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>

            {/* Price */}
            <div className="space-y-2">
              <Label>Price (USD)</Label>
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
            </div>

            {/* Event Date (for event packages) */}
            {isEventPackage && (
              <>
                <div className="space-y-2">
                  <Label>Event Date</Label>
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
              <Label>Notes (optional)</Label>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add any details about this offer..."
                rows={3}
              />
            </div>

            {/* Summary */}
            {priceCents > 0 && (
              <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                <p className="text-sm font-medium">Offer Summary</p>
                <div className="text-sm text-muted-foreground space-y-1">
                  <div className="flex justify-between">
                    <span>Total Price:</span>
                    <span className="font-medium text-foreground">${(priceCents / 100).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span>Payment arranged directly with brand</span>
                  </div>
                </div>
              </div>
            )}

            {/* Submit */}
            <Button
              onClick={handleSubmit}
              disabled={loading || !selectedServiceType || priceCents <= 0}
              className="w-full"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Send Offer
                </>
              )}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default SendOfferDialog;
