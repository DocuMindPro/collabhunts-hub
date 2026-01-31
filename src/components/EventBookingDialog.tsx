import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { CalendarIcon, Clock, Users, MapPin, Loader2, CheckCircle, Sparkles } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import {
  EVENT_PACKAGES,
  PACKAGE_ORDER,
  type PackageType,
  formatPriceRange,
  formatPrice,
  calculatePlatformFee,
  calculateDeposit,
  calculateUpsellsTotal,
  PLATFORM_FEE_PERCENT,
  DEPOSIT_PERCENT,
} from "@/config/packages";
import PaymentMethodSelector from "@/components/PaymentMethodSelector";
import WhatsAppButton from "@/components/WhatsAppButton";
import { type PaymentMethod, WHATSAPP_CONFIG, formatDualCurrency } from "@/config/lebanese-market";

interface EventBookingDialogProps {
  isOpen: boolean;
  onClose: () => void;
  creatorProfileId: string;
  creatorName: string;
  creatorServices?: Array<{
    id: string;
    service_type: string;
    price_cents: number;
    duration_hours?: number;
  }>;
}

const TIME_SLOTS = [
  "09:00", "10:00", "11:00", "12:00", "13:00", "14:00",
  "15:00", "16:00", "17:00", "18:00", "19:00", "20:00", "21:00"
];

const EventBookingDialog = ({
  isOpen,
  onClose,
  creatorProfileId,
  creatorName,
  creatorServices = [],
}: EventBookingDialogProps) => {
  const { toast } = useToast();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [venueProfile, setVenueProfile] = useState<any>(null);

  // Form state
  const [selectedPackage, setSelectedPackage] = useState<PackageType | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<string>("");
  const [selectedUpsells, setSelectedUpsells] = useState<string[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [startTime, setStartTime] = useState<string>("");
  const [endTime, setEndTime] = useState<string>("");
  const [eventMessage, setEventMessage] = useState("");
  const [customPrice, setCustomPrice] = useState("");
  const [expectedAttendees, setExpectedAttendees] = useState("");
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod | null>(null);

  useEffect(() => {
    if (isOpen) {
      fetchVenueProfile();
    }
  }, [isOpen]);

  // Auto-set end time based on package duration
  useEffect(() => {
    if (selectedPackage && startTime) {
      const pkg = EVENT_PACKAGES[selectedPackage];
      if (pkg.durationRange) {
        const [hours] = startTime.split(":").map(Number);
        const endHour = hours + pkg.durationRange.max;
        if (endHour <= 23) {
          setEndTime(`${String(endHour).padStart(2, "0")}:00`);
        }
      }
    }
  }, [selectedPackage, startTime]);

  // Reset variant when package changes
  useEffect(() => {
    setSelectedVariant("");
    setSelectedUpsells([]);
  }, [selectedPackage]);

  const fetchVenueProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from("brand_profiles")
        .select("*")
        .eq("user_id", user.id)
        .single();

      setVenueProfile(data);
    } catch (error) {
      console.error("Error fetching venue profile:", error);
    }
  };

  const getEstimatedPrice = (): number => {
    if (customPrice) return parseInt(customPrice) * 100;
    if (!selectedPackage) return 0;
    const pkg = EVENT_PACKAGES[selectedPackage];
    if (!pkg.priceRange) return 0;
    const basePrice = pkg.priceRange.min;
    const upsellsTotal = calculateUpsellsTotal(selectedUpsells, selectedPackage);
    return basePrice + upsellsTotal;
  };

  const handleUpsellToggle = (upsellId: string) => {
    setSelectedUpsells(prev => 
      prev.includes(upsellId) 
        ? prev.filter(id => id !== upsellId)
        : [...prev, upsellId]
    );
  };

  const handleSubmitBooking = async () => {
    if (!selectedPackage || !selectedDate || !startTime || !venueProfile || !selectedPaymentMethod) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields including payment method",
        variant: "destructive",
      });
      return;
    }

    // Check if variant selection is required
    const pkg = EVENT_PACKAGES[selectedPackage];
    if (pkg.variants && pkg.variants.length > 0 && !selectedVariant) {
      toast({
        title: "Missing Information",
        description: "Please select a competition type",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const estimatedPrice = getEstimatedPrice();
      const depositAmount = calculateDeposit(estimatedPrice);
      const platformFee = calculatePlatformFee(estimatedPrice);

      const { data: booking, error } = await supabase
        .from("bookings")
        .insert({
          brand_profile_id: venueProfile.id,
          creator_profile_id: creatorProfileId,
          package_type: selectedPackage,
          event_date: format(selectedDate, "yyyy-MM-dd"),
          event_time_start: startTime,
          event_time_end: endTime || null,
          message: eventMessage,
          total_price_cents: estimatedPrice,
          deposit_amount_cents: depositAmount,
          platform_fee_cents: platformFee,
          max_capacity: expectedAttendees ? parseInt(expectedAttendees) : null,
          status: "pending",
          escrow_status: "pending_deposit",
          payment_status: "pending",
          venue_id: venueProfile.id,
          event_type: selectedPackage,
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Booking Request Sent!",
        description: "The creator will review your request and respond soon.",
      });

      setStep(3); // Success step
    } catch (error: any) {
      console.error("Error creating booking:", error);
      toast({
        title: "Booking Failed",
        description: error.message || "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setStep(1);
    setSelectedPackage(null);
    setSelectedVariant("");
    setSelectedUpsells([]);
    setSelectedDate(undefined);
    setStartTime("");
    setEndTime("");
    setEventMessage("");
    setCustomPrice("");
    setExpectedAttendees("");
    setSelectedPaymentMethod(null);
    onClose();
  };

  const estimatedPrice = getEstimatedPrice();
  const depositAmount = calculateDeposit(estimatedPrice);
  const currentPackage = selectedPackage ? EVENT_PACKAGES[selectedPackage] : null;
  const upsellsTotal = selectedPackage ? calculateUpsellsTotal(selectedUpsells, selectedPackage) : 0;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {step === 3 ? "Booking Submitted!" : `Book ${creatorName} for an Event`}
          </DialogTitle>
          <DialogDescription>
            {step === 1 && "Choose a package type for your event"}
            {step === 2 && "Select date, time, and event details"}
            {step === 3 && "Your booking request has been sent to the creator"}
          </DialogDescription>
        </DialogHeader>

        {/* Step 1: Package Selection */}
        {step === 1 && (
          <div className="space-y-4">
            <div className="grid gap-3">
              {PACKAGE_ORDER.map((pkgType) => {
                const pkg = EVENT_PACKAGES[pkgType];
                const isSelected = selectedPackage === pkgType;

                return (
                  <Card
                    key={pkgType}
                    className={cn(
                      "cursor-pointer transition-all hover:border-primary",
                      isSelected && "border-primary bg-primary/5"
                    )}
                    onClick={() => setSelectedPackage(pkgType)}
                  >
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h4 className="font-semibold">{pkg.name}</h4>
                          <p className="text-sm text-muted-foreground mt-1">
                            {pkg.description}
                          </p>
                          <div className="flex flex-wrap gap-2 mt-2">
                            {pkg.durationRange && (
                              <span className="text-xs bg-muted px-2 py-1 rounded">
                                <Clock className="h-3 w-3 inline mr-1" />
                                {pkg.durationRange.min === pkg.durationRange.max 
                                  ? `${pkg.durationRange.min}h` 
                                  : `${pkg.durationRange.min}-${pkg.durationRange.max}h`}
                              </span>
                            )}
                            {pkg.variants && pkg.variants.length > 0 && (
                              <span className="text-xs bg-accent/10 text-accent px-2 py-1 rounded">
                                {pkg.variants.length} options
                              </span>
                            )}
                            {pkg.upsells && pkg.upsells.length > 0 && (
                              <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded flex items-center gap-1">
                                <Sparkles className="h-3 w-3" />
                                Add-ons
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="font-bold text-primary">
                            {formatPriceRange(pkg.priceRange)}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            <Button
              onClick={() => setStep(2)}
              disabled={!selectedPackage}
              className="w-full"
            >
              Continue
            </Button>
          </div>
        )}

        {/* Step 2: Date & Details */}
        {step === 2 && selectedPackage && currentPackage && (
          <div className="space-y-6">
            {/* Variant Selection (for competition package) */}
            {currentPackage.variants && currentPackage.variants.length > 0 && (
              <div className="space-y-3">
                <Label className="text-base font-semibold">Choose Competition Type *</Label>
                <RadioGroup value={selectedVariant} onValueChange={setSelectedVariant}>
                  {currentPackage.variants.map((variant, index) => (
                    <div 
                      key={variant.id}
                      className={cn(
                        "flex items-start space-x-3 p-4 rounded-lg border transition-colors",
                        selectedVariant === variant.id 
                          ? "border-primary bg-primary/5" 
                          : "border-border hover:border-primary/50"
                      )}
                    >
                      <RadioGroupItem value={variant.id} id={variant.id} className="mt-1" />
                      <label htmlFor={variant.id} className="flex-1 cursor-pointer">
                        <p className="font-medium">
                          Option {String.fromCharCode(65 + index)}: {variant.name}
                        </p>
                        <p className="text-sm text-muted-foreground mt-1">
                          {variant.description}
                        </p>
                        {variant.includes && variant.includes.length > 0 && (
                          <ul className="mt-2 space-y-1">
                            {variant.includes.map((item, i) => (
                              <li key={i} className="text-xs text-muted-foreground flex items-start gap-1.5">
                                <CheckCircle className="h-3 w-3 text-primary mt-0.5 shrink-0" />
                                {item}
                              </li>
                            ))}
                          </ul>
                        )}
                      </label>
                    </div>
                  ))}
                </RadioGroup>
              </div>
            )}

            {/* Upsells Selection */}
            {currentPackage.upsells && currentPackage.upsells.length > 0 && (
              <div className="space-y-3">
                <Label className="text-base font-semibold flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-primary" />
                  Add-ons (Optional)
                </Label>
                <div className="space-y-2">
                  {currentPackage.upsells.map((upsell) => (
                    <div 
                      key={upsell.id}
                      className={cn(
                        "flex items-center space-x-3 p-3 rounded-lg border transition-colors",
                        selectedUpsells.includes(upsell.id) 
                          ? "border-primary bg-primary/5" 
                          : "border-border hover:border-primary/50"
                      )}
                    >
                      <Checkbox 
                        id={upsell.id}
                        checked={selectedUpsells.includes(upsell.id)}
                        onCheckedChange={() => handleUpsellToggle(upsell.id)}
                      />
                      <label htmlFor={upsell.id} className="flex-1 cursor-pointer">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium text-sm">{upsell.name}</p>
                            <p className="text-xs text-muted-foreground">{upsell.description}</p>
                          </div>
                          <span className="text-sm font-semibold text-primary">
                            +{formatPrice(upsell.priceCents)}
                          </span>
                        </div>
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Date Selection */}
            <div className="space-y-2">
              <Label>Event Date *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !selectedDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {selectedDate ? format(selectedDate, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    disabled={(date) => date < new Date()}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Time Selection */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Start Time *</Label>
                <Select value={startTime} onValueChange={setStartTime}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select time" />
                  </SelectTrigger>
                  <SelectContent>
                    {TIME_SLOTS.map((time) => (
                      <SelectItem key={time} value={time}>
                        {time}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>End Time</Label>
                <Select value={endTime} onValueChange={setEndTime}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select time" />
                  </SelectTrigger>
                  <SelectContent>
                    {TIME_SLOTS.map((time) => (
                      <SelectItem key={time} value={time}>
                        {time}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Expected Attendees */}
            <div className="space-y-2">
              <Label>Expected Attendees</Label>
              <Input
                type="number"
                placeholder="e.g., 50"
                value={expectedAttendees}
                onChange={(e) => setExpectedAttendees(e.target.value)}
              />
            </div>

            {/* Custom Price (for custom packages) */}
            {selectedPackage === "custom" && (
              <div className="space-y-2">
                <Label>Your Budget (USD)</Label>
                <Input
                  type="number"
                  placeholder="e.g., 1000"
                  value={customPrice}
                  onChange={(e) => setCustomPrice(e.target.value)}
                />
              </div>
            )}

            {/* Message */}
            <div className="space-y-2">
              <Label>Message to Creator</Label>
              <Textarea
                placeholder="Describe your event, venue, and any special requirements..."
                value={eventMessage}
                onChange={(e) => setEventMessage(e.target.value)}
                rows={4}
              />
            </div>

            {/* Payment Method Selection */}
            <PaymentMethodSelector
              selectedMethod={selectedPaymentMethod}
              onMethodChange={setSelectedPaymentMethod}
            />

            {/* Price Summary */}
            {estimatedPrice > 0 && (
              <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                <h4 className="font-semibold">Estimated Cost</h4>
                <div className="flex justify-between text-sm">
                  <span>Base Package Price</span>
                  <div className="text-right">
                    <span>${((estimatedPrice - upsellsTotal) / 100).toFixed(0)}</span>
                    <span className="text-xs text-muted-foreground ml-2">
                      (~{formatDualCurrency(estimatedPrice - upsellsTotal).lbp})
                    </span>
                  </div>
                </div>
                {upsellsTotal > 0 && (
                  <div className="flex justify-between text-sm">
                    <span>Add-ons ({selectedUpsells.length})</span>
                    <div className="text-right">
                      <span>+${(upsellsTotal / 100).toFixed(0)}</span>
                      <span className="text-xs text-muted-foreground ml-2">
                        (~{formatDualCurrency(upsellsTotal).lbp})
                      </span>
                    </div>
                  </div>
                )}
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Platform Fee ({PLATFORM_FEE_PERCENT}%)</span>
                  <span>Included</span>
                </div>
                <div className="border-t pt-2 flex justify-between font-semibold">
                  <span>Deposit ({DEPOSIT_PERCENT}%)</span>
                  <div className="text-right">
                    <span>${(depositAmount / 100).toFixed(0)}</span>
                    <span className="text-xs text-muted-foreground ml-2">
                      (~{formatDualCurrency(depositAmount).lbp})
                    </span>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Deposit held in escrow until event completion
                </p>
              </div>
            )}

            {/* Venue Info */}
            {venueProfile && (
              <div className="bg-muted/50 rounded-lg p-4">
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Your Location
                </h4>
                <p className="text-sm">{venueProfile.venue_name || venueProfile.company_name}</p>
                {venueProfile.venue_address && (
                  <p className="text-sm text-muted-foreground">{venueProfile.venue_address}</p>
                )}
              </div>
            )}

            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setStep(1)} className="flex-1">
                Back
              </Button>
              <Button
                onClick={handleSubmitBooking}
                disabled={!selectedDate || !startTime || !selectedPaymentMethod || isSubmitting}
                className="flex-1"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  "Send Booking Request"
                )}
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Success */}
        {step === 3 && (
          <div className="text-center py-8">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Request Sent!</h3>
            <p className="text-muted-foreground mb-6">
              {creatorName} will review your booking request and respond within 48 hours.
            </p>
            <div className="flex gap-3 justify-center">
              <Button variant="outline" onClick={handleClose}>
                Close
              </Button>
              <Button onClick={() => navigate("/brand-dashboard?tab=bookings")}>
                View My Bookings
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default EventBookingDialog;
