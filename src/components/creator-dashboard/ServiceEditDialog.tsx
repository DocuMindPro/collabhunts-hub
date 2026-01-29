import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface Service {
  id: string;
  service_type: string;
  price_cents: number;
  min_price_cents: number | null;
  max_price_cents: number | null;
  price_tier_id: string | null;
  description: string | null;
  delivery_days: number;
  is_active: boolean;
}

interface PriceTier {
  id: string;
  service_type: string;
  tier_name: string;
  min_price_cents: number;
  max_price_cents: number;
  sort_order: number;
  is_enabled: boolean;
}

interface ServiceEditDialogProps {
  service: Service | null;
  creatorProfileId: string | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const SERVICE_TYPE_LABELS: Record<string, string> = {
  meet_greet: "Meet & Greet",
  workshop: "Workshop",
  brand_activation: "Brand Activation",
  appearance: "Appearance",
  hosting: "Event Hosting",
  content_creation: "Content Creation",
};

const ServiceEditDialog = ({
  service,
  creatorProfileId,
  isOpen,
  onClose,
  onSuccess,
}: ServiceEditDialogProps) => {
  const [availableServiceTypes, setAvailableServiceTypes] = useState<string[]>([]);
  const [selectedServiceType, setSelectedServiceType] = useState<string>("");
  const [priceTiers, setPriceTiers] = useState<PriceTier[]>([]);
  const [selectedTierId, setSelectedTierId] = useState<string>("");
  const [description, setDescription] = useState("");
  const [deliveryDays, setDeliveryDays] = useState("7");
  const [isActive, setIsActive] = useState(true);
  const [loading, setLoading] = useState(false);
  const [loadingTiers, setLoadingTiers] = useState(false);

  // Fetch available service types on mount
  useEffect(() => {
    const fetchServiceTypes = async () => {
      try {
        const { data, error } = await supabase
          .from("service_price_tiers")
          .select("service_type")
          .eq("is_enabled", true);

        if (error) throw error;

        // Get unique service types
        const types = [...new Set(data?.map((t) => t.service_type) || [])];
        setAvailableServiceTypes(types);
      } catch (error) {
        console.error("Error fetching service types:", error);
      }
    };

    if (isOpen) {
      fetchServiceTypes();
    }
  }, [isOpen]);

  // Fetch tiers when service type changes
  useEffect(() => {
    const fetchTiers = async () => {
      if (!selectedServiceType) {
        setPriceTiers([]);
        return;
      }

      setLoadingTiers(true);
      try {
        const { data, error } = await supabase
          .from("service_price_tiers")
          .select("id, service_type, tier_name, min_price_cents, max_price_cents, sort_order, is_enabled")
          .eq("service_type", selectedServiceType)
          .eq("is_enabled", true)
          .order("sort_order", { ascending: true });

        if (error) throw error;
        setPriceTiers(data || []);
      } catch (error) {
        console.error("Error fetching price tiers:", error);
        toast.error("Failed to load price tiers");
      } finally {
        setLoadingTiers(false);
      }
    };

    fetchTiers();
  }, [selectedServiceType]);

  // Reset form when dialog opens/closes or service changes
  useEffect(() => {
    if (isOpen) {
      if (service) {
        setSelectedServiceType(service.service_type);
        setSelectedTierId(service.price_tier_id || "");
        setDescription(service.description || "");
        setDeliveryDays(service.delivery_days?.toString() || "7");
        setIsActive(service.is_active);
      } else {
        setSelectedServiceType("");
        setSelectedTierId("");
        setDescription("");
        setDeliveryDays("7");
        setIsActive(true);
      }
    }
  }, [isOpen, service]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!creatorProfileId) {
      toast.error("Creator profile not found");
      return;
    }

    if (!selectedServiceType) {
      toast.error("Please select a service type");
      return;
    }

    if (!selectedTierId) {
      toast.error("Please select a price range");
      return;
    }

    const selectedTier = priceTiers.find((t) => t.id === selectedTierId);
    if (!selectedTier) {
      toast.error("Invalid price tier selected");
      return;
    }

    setLoading(true);
    try {
      const serviceData = {
        creator_profile_id: creatorProfileId,
        service_type: selectedServiceType,
        price_cents: selectedTier.min_price_cents, // For backwards compatibility
        min_price_cents: selectedTier.min_price_cents,
        max_price_cents: selectedTier.max_price_cents,
        price_tier_id: selectedTierId,
        description: description || null,
        delivery_days: parseInt(deliveryDays) || 7,
        is_active: isActive,
      };

      if (service) {
        const { error } = await supabase
          .from("creator_services")
          .update(serviceData)
          .eq("id", service.id);

        if (error) throw error;
        toast.success("Service updated successfully");
      } else {
        const { error } = await supabase
          .from("creator_services")
          .insert(serviceData);

        if (error) throw error;
        toast.success("Service created successfully");
      }

      onSuccess();
    } catch (error) {
      console.error("Error saving service:", error);
      toast.error("Failed to save service");
    } finally {
      setLoading(false);
    }
  };

  const formatTierPrice = (tier: PriceTier) => {
    return `$${(tier.min_price_cents / 100).toLocaleString()} - $${(tier.max_price_cents / 100).toLocaleString()}`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{service ? "Edit Service" : "Add New Service"}</DialogTitle>
          <DialogDescription>
            {service ? "Update your service details" : "Create a new collaboration package"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Service Type Selection */}
          <div className="space-y-2">
            <Label htmlFor="service_type">Service Type *</Label>
            <Select
              value={selectedServiceType}
              onValueChange={(value) => {
                setSelectedServiceType(value);
                setSelectedTierId(""); // Reset tier when type changes
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a service type" />
              </SelectTrigger>
              <SelectContent>
                {availableServiceTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {SERVICE_TYPE_LABELS[type] || type.replace(/_/g, " ")}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Price Tier Selection */}
          <div className="space-y-3">
            <Label>Price Range *</Label>
            {loadingTiers ? (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              </div>
            ) : priceTiers.length > 0 ? (
              <RadioGroup
                value={selectedTierId}
                onValueChange={setSelectedTierId}
                className="space-y-2"
              >
                {priceTiers.map((tier) => (
                  <label
                    key={tier.id}
                    className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-colors ${
                      selectedTierId === tier.id
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <RadioGroupItem value={tier.id} />
                    <div className="flex-1">
                      <p className="font-medium">{tier.tier_name}</p>
                      <p className="text-sm text-muted-foreground">
                        {formatTierPrice(tier)}
                      </p>
                    </div>
                  </label>
                ))}
              </RadioGroup>
            ) : selectedServiceType ? (
              <p className="text-sm text-muted-foreground py-2">
                No price tiers available for this service type.
              </p>
            ) : (
              <p className="text-sm text-muted-foreground py-2">
                Select a service type to see available price ranges.
              </p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe what's included in this service..."
              rows={3}
            />
          </div>

          {/* Delivery Days */}
          <div className="space-y-2">
            <Label htmlFor="delivery_days">Delivery Time (days)</Label>
            <Input
              id="delivery_days"
              type="number"
              min="1"
              value={deliveryDays}
              onChange={(e) => setDeliveryDays(e.target.value)}
            />
          </div>

          {/* Active Toggle */}
          <div className="flex items-center justify-between">
            <Label htmlFor="is_active">Active</Label>
            <Switch
              id="is_active"
              checked={isActive}
              onCheckedChange={setIsActive}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={loading || !selectedServiceType || !selectedTierId} 
              className="flex-1"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : service ? (
                "Update"
              ) : (
                "Create"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ServiceEditDialog;
