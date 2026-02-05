import { useState } from "react";
import { X, Send, Package, Calendar, Clock, DollarSign, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { EVENT_PACKAGES, type PackageType } from "@/config/packages";

interface PackageData {
  service_type: string;
  price_cents: number;
  delivery_days: number;
  duration_hours?: number;
}

export interface InquiryFormData {
  package_type: string;
  proposed_budget_cents: number;
  preferred_date?: string;
  preferred_time?: string;
  duration_hours?: number;
  notes?: string;
}

interface InquiryFormCardProps {
  packageData: PackageData;
  onSend: (data: InquiryFormData) => void;
  onDismiss: () => void;
  loading?: boolean;
}

const InquiryFormCard = ({ packageData, onSend, onDismiss, loading }: InquiryFormCardProps) => {
  const packageConfig = EVENT_PACKAGES[packageData.service_type as PackageType];
  const serviceName = packageConfig?.name || packageData.service_type.replace(/_/g, ' ');
  
  const isEventPackage = ['social_boost', 'meet_greet'].includes(packageData.service_type);
  const isHomePackage = packageData.service_type === 'unbox_review';
  const isManagedPackage = ['competition', 'custom'].includes(packageData.service_type);
  
  // Form state
  const [proposedBudget, setProposedBudget] = useState(packageData.price_cents / 100);
  const [preferredDate, setPreferredDate] = useState<Date | undefined>(undefined);
  const [preferredTime, setPreferredTime] = useState("19:00");
  const [durationHours, setDurationHours] = useState(packageData.duration_hours || packageConfig?.durationRange?.min || 2);
  const [notes, setNotes] = useState("");

  const handleSubmit = () => {
    const data: InquiryFormData = {
      package_type: packageData.service_type,
      proposed_budget_cents: Math.round(proposedBudget * 100),
      notes: notes || undefined,
    };

    if (isEventPackage && preferredDate) {
      data.preferred_date = format(preferredDate, "yyyy-MM-dd");
      data.preferred_time = preferredTime;
      data.duration_hours = durationHours;
    }

    onSend(data);
  };

  // Don't show form for managed packages
  if (isManagedPackage) {
    return (
      <Card className="mx-4 mb-2 border-primary/20 bg-primary/5 overflow-hidden">
        <div className="flex items-center justify-between px-3 py-2 bg-primary/10 border-b border-primary/20">
          <span className="text-xs font-medium text-primary">Contact CollabHunts</span>
          <Button
            variant="ghost"
            size="icon"
            className="h-5 w-5 text-muted-foreground hover:text-foreground"
            onClick={onDismiss}
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
        <div className="p-4 text-center space-y-2">
          <p className="text-sm text-muted-foreground">
            {serviceName} packages require consultation with our team.
          </p>
          <Button asChild size="sm">
            <a href="mailto:care@collabhunts.com">Contact Us</a>
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <Card className="mx-4 mb-2 border-primary/20 bg-primary/5 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 bg-primary/10 border-b border-primary/20">
        <span className="text-xs font-medium text-primary">Send Inquiry for {serviceName}</span>
        <Button
          variant="ghost"
          size="icon"
          className="h-5 w-5 text-muted-foreground hover:text-foreground"
          onClick={onDismiss}
        >
          <X className="h-3 w-3" />
        </Button>
      </div>

      {/* Form */}
      <div className="p-3 space-y-3">
        {/* Package Summary */}
        <div className="flex items-center gap-3 pb-2 border-b border-border/50">
          <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <Package className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="font-semibold text-sm">{serviceName}</p>
            <p className="text-xs text-muted-foreground">
              Starting at ${(packageData.price_cents / 100).toFixed(0)}
            </p>
          </div>
        </div>

        {/* Proposed Budget */}
        <div className="space-y-1.5">
          <Label className="text-xs">Your Budget (USD)</Label>
          <div className="relative">
            <DollarSign className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              type="number"
              min={0}
              value={proposedBudget}
              onChange={(e) => setProposedBudget(parseFloat(e.target.value) || 0)}
              className="pl-8 h-9"
              placeholder="0.00"
            />
          </div>
        </div>

        {/* Event Details (for event packages) */}
        {isEventPackage && (
          <>
            <div className="space-y-1.5">
              <Label className="text-xs">Preferred Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal h-9",
                      !preferredDate && "text-muted-foreground"
                    )}
                  >
                    <Calendar className="mr-2 h-3.5 w-3.5" />
                    {preferredDate ? format(preferredDate, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <CalendarComponent
                    mode="single"
                    selected={preferredDate}
                    onSelect={setPreferredDate}
                    disabled={(date) => date < new Date()}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1.5">
                <Label className="text-xs">Time</Label>
                <Input
                  type="time"
                  value={preferredTime}
                  onChange={(e) => setPreferredTime(e.target.value)}
                  className="h-9"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Duration (hours)</Label>
                <div className="relative">
                  <Clock className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                  <Input
                    type="number"
                    min={1}
                    max={8}
                    value={durationHours}
                    onChange={(e) => setDurationHours(parseInt(e.target.value) || 2)}
                    className="pl-8 h-9"
                  />
                </div>
              </div>
            </div>
          </>
        )}

        {/* Notes */}
        <div className="space-y-1.5">
          <Label className="text-xs flex items-center gap-1.5">
            <MessageSquare className="h-3 w-3" />
            What are you looking for?
          </Label>
          <Textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder={isHomePackage 
              ? "Describe the product and what you want covered..."
              : "Describe your event and what you need..."
            }
            rows={2}
            className="text-sm"
          />
        </div>

        {/* Submit */}
        <Button 
          className="w-full gap-1.5"
          onClick={handleSubmit}
          disabled={loading || proposedBudget <= 0 || (isEventPackage && !preferredDate)}
        >
          <Send className="h-3.5 w-3.5" />
          Send Inquiry
        </Button>
      </div>
    </Card>
  );
};

export default InquiryFormCard;
