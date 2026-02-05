import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Save, Gift, Sparkles, Users, Wand2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { EVENT_PACKAGES, type PackageType } from "@/config/packages";

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
  creator_profile_id: string;
  story_upsell_price_cents?: number | null;
}

interface ServiceEditDialogProps {
  service: Service | null;
  creatorProfileId: string | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const PACKAGE_ICONS: Record<string, React.ReactNode> = {
  unbox_review: <Gift className="h-5 w-5" />,
  social_boost: <Sparkles className="h-5 w-5" />,
  meet_greet: <Users className="h-5 w-5" />,
  custom: <Wand2 className="h-5 w-5" />
};

const PACKAGE_NAMES: Record<string, string> = {
  unbox_review: "Unbox & Review",
  social_boost: "Social Boost",
  meet_greet: "Meet & Greet",
  custom: "Custom Experience"
};

const ServiceEditDialog = ({ service, creatorProfileId, isOpen, onClose, onSuccess }: ServiceEditDialogProps) => {
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [deliveryDays, setDeliveryDays] = useState("7");
  const [isActive, setIsActive] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [serviceType, setServiceType] = useState<string>("");
  const [availableTypes, setAvailableTypes] = useState<string[]>([]);
  const [storyUpsellPrice, setStoryUpsellPrice] = useState("");

  const isCustom = serviceType === "custom";
  const packageConfig = serviceType ? EVENT_PACKAGES[serviceType as PackageType] : null;
  const hasStoryUpsell = packageConfig?.upsells?.some(u => u.id === 'instagram_stories');

  // Fetch available package types
  useEffect(() => {
    const fetchTypes = async () => {
      const { data } = await supabase
        .from("service_price_tiers")
        .select("service_type")
        .eq("is_enabled", true);

      if (data) {
        const types = [...new Set(data.map(d => d.service_type))];
        // Filter to only show the 4 main packages (excluding Live PK Battle which is platform-managed)
        const mainPackages = ['unbox_review', 'social_boost', 'meet_greet', 'custom'];
        setAvailableTypes(types.filter(t => mainPackages.includes(t)));
      }
    };
    
    if (isOpen) fetchTypes();
  }, [isOpen]);

  useEffect(() => {
    if (service) {
      setServiceType(service.service_type);
      // Use the single price_cents value
      setPrice(((service.price_cents || 0) / 100).toString());
      setDescription(service.description || "");
      setDeliveryDays(service.delivery_days?.toString() || "7");
      setIsActive(service.is_active);
      setStoryUpsellPrice(service.story_upsell_price_cents ? ((service.story_upsell_price_cents) / 100).toString() : "");
    } else {
      setServiceType("");
      setPrice("");
      setDescription("");
      setDeliveryDays("7");
      setIsActive(true);
      setStoryUpsellPrice("");
    }
  }, [service, isOpen]);

  const handleSave = async () => {
    if (!creatorProfileId) {
      toast.error("Creator profile not found");
      return;
    }

    if (!serviceType) {
      toast.error("Please select a package type");
      return;
    }

    // Validate price (except for Custom which is negotiated)
    const priceValue = parseFloat(price);
    if (!isCustom && (!priceValue || priceValue < 10)) {
      toast.error("Please enter a valid price (minimum $10)");
      return;
    }

    setIsSaving(true);

    try {
      const priceCents = isCustom ? 0 : Math.round(priceValue * 100);
      const storyUpsellCents = storyUpsellPrice ? Math.round(parseFloat(storyUpsellPrice) * 100) : null;
      
      const updateData = {
        service_type: serviceType,
        price_cents: priceCents,
        min_price_cents: priceCents,
        max_price_cents: priceCents,
        price_tier_id: null, // No longer using tiers
        description: description || null,
        delivery_days: parseInt(deliveryDays) || 7,
        is_active: isActive,
        story_upsell_price_cents: storyUpsellCents
      };

      if (service) {
        // Update existing service
        const { error } = await supabase
          .from("creator_services")
          .update(updateData)
          .eq("id", service.id);

        if (error) throw error;
        toast.success("Package updated successfully");
      } else {
        // Create new service
        const { error } = await supabase
          .from("creator_services")
          .insert({
            ...updateData,
            creator_profile_id: creatorProfileId
          });

        if (error) throw error;
        toast.success("Package added successfully");
      }

      onSuccess();
    } catch (error: any) {
      console.error("Error saving service:", error);
      toast.error(error.message || "Failed to save package");
    } finally {
      setIsSaving(false);
    }
  };

  const packageInfo = serviceType ? EVENT_PACKAGES[serviceType as PackageType] : null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {serviceType && PACKAGE_ICONS[serviceType]}
            {service ? "Edit Package" : "Add Package"}
          </DialogTitle>
          <DialogDescription>
            {service 
              ? `Update your ${PACKAGE_NAMES[serviceType] || serviceType} settings`
              : "Configure your package details"
            }
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-4">
          {/* Package Type Selection (only for new) */}
          {!service && (
            <div className="space-y-2">
              <Label htmlFor="serviceType">Package Type</Label>
              <Select value={serviceType} onValueChange={setServiceType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a package" />
                </SelectTrigger>
                <SelectContent>
                  {availableTypes.map(type => (
                    <SelectItem key={type} value={type}>
                      {PACKAGE_NAMES[type] || type.replace(/_/g, ' ')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Package Info */}
          {packageInfo && (
            <div className="p-3 bg-muted/50 rounded-lg">
              <p className="font-medium">{packageInfo.name}</p>
              <p className="text-sm text-muted-foreground">{packageInfo.description}</p>
            </div>
          )}

          {/* Price (hidden for Custom which is negotiated) */}
          {serviceType && !isCustom && (
            <div className="space-y-2">
              <Label htmlFor="price">Your Price (USD)</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                <Input
                  id="price"
                  type="number"
                  min="10"
                  step="1"
                  placeholder="e.g., 200"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="pl-8"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Set your own price for this package
              </p>
            </div>
          )}
          
          {/* Story Upsell Price */}
          {serviceType && hasStoryUpsell && !isCustom && (
            <div className="space-y-2 p-3 bg-muted/50 rounded-lg">
              <Label htmlFor="storyUpsell" className="flex items-center gap-2">
                📸 Instagram Stories Upsell
              </Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                <Input
                  id="storyUpsell"
                  type="number"
                  min="5"
                  step="1"
                  placeholder="e.g., 20"
                  value={storyUpsellPrice}
                  onChange={(e) => setStoryUpsellPrice(e.target.value)}
                  className="pl-8"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Brands can add Stories to their booking for this extra fee. Leave empty to not offer this option.
              </p>
            </div>
          )}

          {/* Custom Experience Notice */}
          {isCustom && (
            <div className="p-3 bg-primary/5 border border-primary/20 rounded-lg text-sm">
              <p className="font-medium mb-1">🎨 How Custom Experience Works</p>
              <p className="text-muted-foreground">
                By enabling this, you're telling brands you're open to unique collaborations 
                beyond standard packages. Brands will message you to discuss ideas, and you'll 
                negotiate terms together.
              </p>
            </div>
          )}

          {/* Description */}
          {serviceType && (
            <div className="space-y-2">
              <Label htmlFor="description">Description (optional)</Label>
              <Textarea
                id="description"
                placeholder="Add any special details about your offering..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
              />
            </div>
          )}

          {/* Delivery Days */}
          {serviceType && (
            <div className="space-y-2">
              <Label htmlFor="deliveryDays">Delivery Time (days)</Label>
              <Input
                id="deliveryDays"
                type="number"
                min="1"
                max="90"
                value={deliveryDays}
                onChange={(e) => setDeliveryDays(e.target.value)}
              />
            </div>
          )}

          {/* Active Toggle */}
          {serviceType && (
            <div className="flex items-center justify-between py-2">
              <div className="space-y-0.5">
                <Label>Active</Label>
                <p className="text-xs text-muted-foreground">
                  Visible to brands
                </p>
              </div>
              <Switch
                checked={isActive}
                onCheckedChange={setIsActive}
              />
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              className="flex-1"
              onClick={onClose}
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button
              className="flex-1 gap-2"
              onClick={handleSave}
              disabled={isSaving || !serviceType}
            >
              {isSaving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              Save
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ServiceEditDialog;