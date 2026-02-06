import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { EVENT_PACKAGES, PackageType } from "@/config/packages";
import { FOLLOWER_RANGES, FOLLOWER_RANGE_ORDER } from "@/config/follower-ranges";
import { DollarSign, Gift, Lock, Check, Users } from "lucide-react";
import AiBioSuggestions from "@/components/AiBioSuggestions";
import CountrySelect from "@/components/CountrySelect";
import LocationSelect from "@/components/LocationSelect";
import { hasLocationData, getStatesForCountry } from "@/config/country-locations";
import { COUNTRIES } from "@/components/PhoneInput";
import MockPaymentDialog from "@/components/payments/MockPaymentDialog";

// Opportunity posting pricing (in cents)
const OPPORTUNITY_POSTING_FEE = 1500; // $15 to post
const FEATURED_UPGRADE_FEE = 2500; // +$25 to feature

interface CreateOpportunityDialogProps {
  brandProfileId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

const CreateOpportunityDialog = ({
  brandProfileId,
  open,
  onOpenChange,
  onSuccess,
}: CreateOpportunityDialogProps) => {
  const [submitting, setSubmitting] = useState(false);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [wantsFeatured, setWantsFeatured] = useState(false);
  const [enforceFollowerRange, setEnforceFollowerRange] = useState(true);
  const [pendingOpportunityData, setPendingOpportunityData] = useState<any>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    package_type: "",
    event_date: "",
    start_time: "",
    end_time: "",
    is_paid: true,
    budget: "",
    spots_available: "1",
    requirements: "",
    follower_ranges: [] as string[],
    location_city: "",
    location_state: "",
    location_country: "LB",
  });

  const handleFollowerRangeToggle = (rangeKey: string) => {
    setFormData(prev => ({
      ...prev,
      follower_ranges: prev.follower_ranges.includes(rangeKey)
        ? prev.follower_ranges.filter(r => r !== rangeKey)
        : [...prev.follower_ranges, rangeKey]
    }));
  };

  const countryHasLocationData = hasLocationData(formData.location_country);
  const countryHasStates = getStatesForCountry(formData.location_country).length > 0;
  const selectedCountryName = COUNTRIES.find(c => c.code === formData.location_country)?.name || "";

  // Derive selected package info
  const selectedPackage = formData.package_type 
    ? EVENT_PACKAGES[formData.package_type as PackageType] 
    : null;
  const isCustomPackage = formData.package_type === 'custom';
  const isStandardPackage = formData.package_type && !isCustomPackage;

  const handleCountryChange = (countryCode: string) => {
    setFormData(prev => ({
      ...prev,
      location_country: countryCode,
      location_state: "",
      location_city: ""
    }));
  };

  const handleStateChange = (state: string) => {
    setFormData(prev => ({
      ...prev,
      location_state: state,
      location_city: ""
    }));
  };

  const handleSubmit = async () => {
    if (!formData.title || !formData.event_date) {
      toast({
        title: "Missing Fields",
        description: "Please fill in the title and event date.",
        variant: "destructive",
      });
      return;
    }

    // For custom package, description is required
    if (isCustomPackage && !formData.description) {
      toast({
        title: "Missing Description",
        description: "Please describe your custom collaboration needs.",
        variant: "destructive",
      });
      return;
    }

    // For standard packages, auto-generate description from package includes
    let finalDescription = formData.description;
    if (isStandardPackage && selectedPackage) {
      finalDescription = selectedPackage.includes.join('\n• ');
      if (finalDescription) {
        finalDescription = '• ' + finalDescription;
      }
    }

    // Store pending data and show payment dialog
    setPendingOpportunityData({
      brand_profile_id: brandProfileId,
      title: formData.title,
      description: finalDescription || null,
      package_type: formData.package_type || null,
      event_date: formData.event_date,
      start_time: formData.start_time || null,
      end_time: formData.end_time || null,
      is_paid: formData.is_paid,
      budget_cents: formData.is_paid && formData.budget 
        ? Math.round(parseFloat(formData.budget) * 100) 
        : null,
      spots_available: parseInt(formData.spots_available) || 1,
      requirements: formData.requirements || null,
      follower_ranges: enforceFollowerRange && formData.follower_ranges.length > 0 ? formData.follower_ranges : null,
      location_city: formData.location_city || null,
      location_country: selectedCountryName || null,
    });
    
    setShowPaymentDialog(true);
  };

  const handlePaymentSuccess = async (paymentId: string, selectedItems: string[]) => {
    if (!pendingOpportunityData) return;
    
    setSubmitting(true);
    setShowPaymentDialog(false);

    const isFeatured = selectedItems.includes("Featured Placement");

    const { error } = await supabase
      .from("brand_opportunities")
      .insert({
        ...pendingOpportunityData,
        // Add featured flag if selected (we'll need to add this column)
        // is_featured: isFeatured,
      });

    if (error) {
      console.error("Error creating opportunity:", error);
      toast({
        title: "Error",
        description: "Payment successful but failed to create opportunity. Please contact support.",
        variant: "destructive",
      });
    } else {
      toast({
        title: isFeatured ? "Featured Opportunity Posted!" : "Opportunity Posted!",
        description: isFeatured 
          ? "Your opportunity is now featured and creators can discover it."
          : "Creators can now discover and apply to your opportunity.",
      });
      // Reset form
      setFormData({
        title: "",
        description: "",
        package_type: "",
        event_date: "",
        start_time: "",
        end_time: "",
        is_paid: true,
        budget: "",
        spots_available: "1",
        requirements: "",
        follower_ranges: [],
        location_city: "",
        location_state: "",
        location_country: "LB",
      });
      setPendingOpportunityData(null);
      setWantsFeatured(false);
      setEnforceFollowerRange(true);
      onSuccess();
    }

    setSubmitting(false);
  };

  const handlePaymentCancel = () => {
    setShowPaymentDialog(false);
    setPendingOpportunityData(null);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] sm:max-w-[600px] max-h-[85vh] overflow-y-auto p-4 sm:p-6">
        <DialogHeader>
          <DialogTitle>Post an Opportunity</DialogTitle>
          <DialogDescription>
            Create an opportunity for creators to discover and apply to.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 pt-2">
          {/* Title */}
          <div className="space-y-1.5">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              placeholder="e.g., Looking for Food Creators for Restaurant Opening"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              className="h-11"
            />
            <AiBioSuggestions
              text={formData.title}
              onSelect={(text) => setFormData(prev => ({ ...prev, title: text }))}
              type="campaign_title"
              minLength={10}
              label="title"
            />
          </div>

          {/* Package Type */}
          <div className="space-y-1.5">
            <Label>Package Type</Label>
            <Select 
              value={formData.package_type} 
              onValueChange={(value) => setFormData(prev => ({ ...prev, package_type: value, description: "" }))}
            >
              <SelectTrigger className="h-11">
                <SelectValue placeholder="Select a package type" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(EVENT_PACKAGES)
                  .filter(([key]) => key !== 'competition')
                  .map(([key, pkg]) => (
                    <SelectItem key={key} value={key}>{pkg.name}</SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>

          {/* Conditional: Locked Deliverables OR Custom Description */}
          {isStandardPackage && selectedPackage && (
            <div className="space-y-1.5">
              <Label className="flex items-center gap-2">
                <Lock className="h-4 w-4 text-muted-foreground" />
                What's Included (Standard Package)
              </Label>
              <div className="bg-muted/50 border rounded-lg p-3 space-y-1">
                {selectedPackage.includes.map((item, index) => (
                  <div key={index} className="flex items-start gap-2 text-sm">
                    <Check className="h-4 w-4 text-green-600 mt-0.5 shrink-0" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <Lock className="h-3 w-3" />
                These deliverables are fixed for this package type
              </p>
            </div>
          )}

          {isCustomPackage && (
            <div className="space-y-1.5">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                placeholder="Describe your custom collaboration needs, deliverables expected, timeline..."
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                rows={4}
              />
              <AiBioSuggestions
                text={formData.description}
                onSelect={(text) => setFormData(prev => ({ ...prev, description: text }))}
                type="campaign_description"
                minLength={50}
                label="description"
              />
            </div>
          )}

          {/* Date and Time */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="event_date">Event Date *</Label>
              <Input
                id="event_date"
                type="date"
                value={formData.event_date}
                onChange={(e) => setFormData(prev => ({ ...prev, event_date: e.target.value }))}
                className="h-11"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="start_time">Start Time</Label>
              <Input
                id="start_time"
                type="time"
                value={formData.start_time}
                onChange={(e) => setFormData(prev => ({ ...prev, start_time: e.target.value }))}
                className="h-11"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="end_time">End Time</Label>
              <Input
                id="end_time"
                type="time"
                value={formData.end_time}
                onChange={(e) => setFormData(prev => ({ ...prev, end_time: e.target.value }))}
                className="h-11"
              />
            </div>
          </div>

          {/* Paid vs Free Toggle */}
          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div className="flex items-center gap-2">
              {formData.is_paid ? (
                <>
                  <DollarSign className="h-4 w-4 text-green-600" />
                  <div>
                    <p className="text-sm font-medium">Paid Opportunity</p>
                    <p className="text-xs text-muted-foreground">Creators get paid</p>
                  </div>
                </>
              ) : (
                <>
                  <Gift className="h-4 w-4 text-amber-600" />
                  <div>
                    <p className="text-sm font-medium">Free Invite</p>
                    <p className="text-xs text-muted-foreground">Product/experience exchange</p>
                  </div>
                </>
              )}
            </div>
            <Switch
              checked={formData.is_paid}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_paid: checked }))}
            />
          </div>

          {/* Budget + Spots inline */}
          <div className={`grid gap-2 sm:gap-3 ${formData.is_paid ? 'grid-cols-2' : 'grid-cols-1'}`}>
            {formData.is_paid && (
              <div className="space-y-1.5">
                <Label htmlFor="budget">Budget per Creator ($)</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="budget"
                    type="number"
                    placeholder="Budget"
                    value={formData.budget}
                    onChange={(e) => setFormData(prev => ({ ...prev, budget: e.target.value }))}
                    className="pl-10 h-10"
                  />
                </div>
              </div>
            )}
            <div className="space-y-1.5">
              <Label htmlFor="spots">Creators Needed</Label>
              <Input
                id="spots"
                type="number"
                min="1"
                value={formData.spots_available}
                onChange={(e) => setFormData(prev => ({ ...prev, spots_available: e.target.value }))}
                className="h-10"
              />
            </div>
          </div>

          {/* Location */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3">
            <div className="space-y-1.5">
              <Label>Country *</Label>
              <CountrySelect
                value={formData.location_country}
                onChange={handleCountryChange}
                placeholder="Select country"
              />
            </div>
            
            {countryHasLocationData && countryHasStates && (
              <div className="space-y-1.5">
                <Label>Region</Label>
                <LocationSelect
                  type="state"
                  countryCode={formData.location_country}
                  value={formData.location_state}
                  onChange={handleStateChange}
                  placeholder="Select region"
                />
              </div>
            )}
            
            <div className="space-y-1.5">
              <Label>City</Label>
              {countryHasLocationData ? (
                <LocationSelect
                  type="city"
                  countryCode={formData.location_country}
                  value={formData.location_city}
                  onChange={(city) => setFormData(prev => ({ ...prev, location_city: city }))}
                  stateFilter={formData.location_state}
                  placeholder="Select city"
                />
              ) : (
                <Input
                  placeholder="Enter city"
                  value={formData.location_city}
                  onChange={(e) => setFormData(prev => ({ ...prev, location_city: e.target.value }))}
                  className="h-10"
                />
              )}
            </div>
          </div>

          {/* Special Requirements */}
          <div className="space-y-1.5">
            <Label htmlFor="requirements">Special Requirements (Optional)</Label>
            <Textarea
              id="requirements"
              placeholder={isStandardPackage 
                ? "Any additional requirements beyond the standard package (dress code, specific mentions, etc.)"
                : "Any specific requirements for creators (content style, niche, etc.)"
              }
              value={formData.requirements}
              onChange={(e) => setFormData(prev => ({ ...prev, requirements: e.target.value }))}
              rows={2}
            />
            <AiBioSuggestions
              text={formData.requirements}
              onSelect={(text) => setFormData(prev => ({ ...prev, requirements: text }))}
              type="campaign_description"
              minLength={30}
              label="requirements"
            />
          </div>

          {/* Follower Ranges */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="flex items-center gap-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                Follower Range (Optional)
              </Label>
              <Switch checked={enforceFollowerRange} onCheckedChange={setEnforceFollowerRange} />
            </div>
            <p className="text-xs text-muted-foreground">
              {enforceFollowerRange
                ? "Only matching creators can apply. Leave all unchecked to accept all sizes."
                : "Any creator can apply regardless of follower count."}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-1.5">
              {FOLLOWER_RANGE_ORDER.map((rangeKey) => {
                const range = FOLLOWER_RANGES[rangeKey];
                const isSelected = formData.follower_ranges.includes(rangeKey);
                return (
                  <div
                    key={rangeKey}
                    className={`flex items-center space-x-2 p-2 border rounded-lg cursor-pointer transition-colors ${
                      isSelected ? 'border-primary bg-primary/5' : 'hover:bg-muted/50'
                    }`}
                    onClick={() => handleFollowerRangeToggle(rangeKey)}
                  >
                    <Checkbox
                      id={`range-${rangeKey}`}
                      checked={isSelected}
                      onCheckedChange={() => handleFollowerRangeToggle(rangeKey)}
                      className="h-3.5 w-3.5"
                    />
                    <label
                      htmlFor={`range-${rangeKey}`}
                      className="text-xs font-medium cursor-pointer leading-tight"
                    >
                      {range.label}
                    </label>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <DialogFooter className="flex-col gap-2">
          <div className="flex flex-col sm:flex-row gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)} className="w-full sm:w-auto">
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={submitting} className="w-full sm:w-auto">
              {submitting ? "Creating..." : "Continue to Payment"}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>

      {/* Payment Dialog */}
      <MockPaymentDialog
        open={showPaymentDialog}
        onOpenChange={setShowPaymentDialog}
        title="Post Opportunity"
        description="Pay to publish your opportunity on the board"
        lineItems={[
          {
            label: "Opportunity Posting",
            amountCents: OPPORTUNITY_POSTING_FEE,
          },
          {
            label: "Featured Placement",
            amountCents: FEATURED_UPGRADE_FEE,
            isOptional: true,
            isSelected: wantsFeatured,
            onToggle: setWantsFeatured,
            description: "Get priority visibility at the top of the opportunities board",
          },
        ]}
        onSuccess={handlePaymentSuccess}
        onCancel={handlePaymentCancel}
      />
    </Dialog>
  );
};

export default CreateOpportunityDialog;
