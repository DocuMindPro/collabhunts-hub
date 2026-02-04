import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { EVENT_PACKAGES } from "@/config/packages";
import { DollarSign, Gift } from "lucide-react";
import AiBioSuggestions from "@/components/AiBioSuggestions";

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
    min_followers: "",
    location_city: "",
    location_country: "",
  });

  const handleSubmit = async () => {
    if (!formData.title || !formData.event_date) {
      toast({
        title: "Missing Fields",
        description: "Please fill in the title and event date.",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);

    const { error } = await supabase
      .from("brand_opportunities")
      .insert({
        brand_profile_id: brandProfileId,
        title: formData.title,
        description: formData.description || null,
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
        min_followers: formData.min_followers ? parseInt(formData.min_followers) : null,
        location_city: formData.location_city || null,
        location_country: formData.location_country || null,
      });

    if (error) {
      console.error("Error creating opportunity:", error);
      toast({
        title: "Error",
        description: "Failed to create opportunity. Please try again.",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Opportunity Posted!",
        description: "Creators can now discover and apply to your opportunity.",
      });
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
        min_followers: "",
        location_city: "",
        location_country: "",
      });
      onSuccess();
    }

    setSubmitting(false);
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

        <div className="space-y-4 py-4">
          {/* Title */}
          <div className="space-y-2">
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

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Describe the opportunity, what you're looking for, and what creators can expect..."
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={3}
            />
            <AiBioSuggestions
              text={formData.description}
              onSelect={(text) => setFormData(prev => ({ ...prev, description: text }))}
              type="campaign_description"
              minLength={50}
              label="description"
            />
          </div>

          {/* Package Type */}
          <div className="space-y-2">
            <Label>Package Type</Label>
            <Select 
              value={formData.package_type} 
              onValueChange={(value) => setFormData(prev => ({ ...prev, package_type: value }))}
            >
              <SelectTrigger className="h-11">
                <SelectValue placeholder="Select a package type" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(EVENT_PACKAGES).map(([key, pkg]) => (
                  <SelectItem key={key} value={key}>{pkg.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Date and Time - Responsive Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
            <div className="space-y-2">
              <Label htmlFor="event_date">Event Date *</Label>
              <Input
                id="event_date"
                type="date"
                value={formData.event_date}
                onChange={(e) => setFormData(prev => ({ ...prev, event_date: e.target.value }))}
                className="h-11"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="start_time">Start Time</Label>
              <Input
                id="start_time"
                type="time"
                value={formData.start_time}
                onChange={(e) => setFormData(prev => ({ ...prev, start_time: e.target.value }))}
                className="h-11"
              />
            </div>
            <div className="space-y-2">
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
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center gap-2">
              {formData.is_paid ? (
                <>
                  <DollarSign className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="font-medium">Paid Opportunity</p>
                    <p className="text-sm text-muted-foreground">Creators get paid for their work</p>
                  </div>
                </>
              ) : (
                <>
                  <Gift className="h-5 w-5 text-amber-600" />
                  <div>
                    <p className="font-medium">Free Invite</p>
                    <p className="text-sm text-muted-foreground">Product/experience exchange only</p>
                  </div>
                </>
              )}
            </div>
            <Switch
              checked={formData.is_paid}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_paid: checked }))}
            />
          </div>

          {/* Budget (only for paid) */}
          {formData.is_paid && (
            <div className="space-y-2">
              <Label htmlFor="budget">Budget per Creator ($)</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="budget"
                  type="number"
                  placeholder="Enter budget per creator"
                  value={formData.budget}
                  onChange={(e) => setFormData(prev => ({ ...prev, budget: e.target.value }))}
                  className="pl-10"
                />
              </div>
            </div>
          )}

          {/* Spots Available */}
          <div className="space-y-2">
            <Label htmlFor="spots">Number of Creators Needed</Label>
            <Input
              id="spots"
              type="number"
              min="1"
              value={formData.spots_available}
              onChange={(e) => setFormData(prev => ({ ...prev, spots_available: e.target.value }))}
            />
          </div>

          {/* Location - Responsive Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div className="space-y-2">
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                placeholder="e.g., Beirut"
                value={formData.location_city}
                onChange={(e) => setFormData(prev => ({ ...prev, location_city: e.target.value }))}
                className="h-11"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="country">Country</Label>
              <Input
                id="country"
                placeholder="e.g., Lebanon"
                value={formData.location_country}
                onChange={(e) => setFormData(prev => ({ ...prev, location_country: e.target.value }))}
                className="h-11"
              />
            </div>
          </div>

          {/* Requirements */}
          <div className="space-y-2">
            <Label htmlFor="requirements">Requirements</Label>
            <Textarea
              id="requirements"
              placeholder="Any specific requirements for creators (content style, niche, etc.)"
              value={formData.requirements}
              onChange={(e) => setFormData(prev => ({ ...prev, requirements: e.target.value }))}
              rows={2}
            />
          </div>

          {/* Min Followers */}
          <div className="space-y-2">
            <Label htmlFor="min_followers">Minimum Followers (optional)</Label>
            <Input
              id="min_followers"
              type="number"
              placeholder="e.g., 5000"
              value={formData.min_followers}
              onChange={(e) => setFormData(prev => ({ ...prev, min_followers: e.target.value }))}
            />
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="w-full sm:w-auto">
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={submitting} className="w-full sm:w-auto">
            {submitting ? "Creating..." : "Post Opportunity"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CreateOpportunityDialog;
