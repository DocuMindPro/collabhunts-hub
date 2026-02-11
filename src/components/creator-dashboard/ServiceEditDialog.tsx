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
import { Loader2, Save, Gift, Sparkles, Users, Wand2, Plus, X } from "lucide-react";
import AiBioSuggestions from "@/components/AiBioSuggestions";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  EVENT_PACKAGES,
  type PackageType,
  DELIVERABLE_PLATFORMS,
  CONTENT_TYPES,
  PLATFORM_CONTENT_TYPES,
  STORY_PLATFORMS,
  DURATION_OPTIONS,
  type DeliverablePlatform,
  type ContentType,
} from "@/config/packages";
import { Badge } from "@/components/ui/badge";

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

interface Deliverable {
  id?: string;
  platform: DeliverablePlatform;
  content_type: ContentType;
  quantity: number;
  duration_seconds: number | null;
  price_cents: number;
  description: string | null;
  sort_order: number;
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

const PACKAGE_HINTS: Record<string, string> = {
  unbox_review: "Product shipped to you — review from home",
  social_boost: "Visit the brand's venue & create content",
  meet_greet: "Appear at the brand's location, meet fans",
  custom: "Flexible collab — you negotiate the details",
};

const ServiceEditDialog = ({ service, creatorProfileId, isOpen, onClose, onSuccess }: ServiceEditDialogProps) => {
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [deliveryDays, setDeliveryDays] = useState("7");
  const [isActive, setIsActive] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [serviceType, setServiceType] = useState<string>("");
  const [availableTypes, setAvailableTypes] = useState<string[]>([]);

  // Story add-ons for standard packages (multi-platform)
  const [storyAddons, setStoryAddons] = useState<Record<DeliverablePlatform, { enabled: boolean; price: string }>>({
    instagram: { enabled: false, price: "" },
    tiktok: { enabled: false, price: "" },
    facebook: { enabled: false, price: "" },
  } as any);

  // Deliverables for Custom Experience
  const [deliverables, setDeliverables] = useState<Deliverable[]>([]);
  const [newPlatform, setNewPlatform] = useState<DeliverablePlatform>("instagram");
  const [newContentType, setNewContentType] = useState<ContentType>("reel");
  const [newQty, setNewQty] = useState("1");
  const [newDuration, setNewDuration] = useState<string>("");
  const [newPrice, setNewPrice] = useState("");

  const isCustom = serviceType === "custom";
  const packageConfig = serviceType ? EVENT_PACKAGES[serviceType as PackageType] : null;
  const isStandardWithStoryUpsell = !isCustom && serviceType && packageConfig?.upsells?.some(u => u.id === 'instagram_stories');

  // Fetch available package types
  useEffect(() => {
    const fetchTypes = async () => {
      const { data } = await supabase
        .from("service_price_tiers")
        .select("service_type")
        .eq("is_enabled", true);

      if (data) {
        const types = [...new Set(data.map(d => d.service_type))];
        const mainPackages = ['unbox_review', 'social_boost', 'meet_greet', 'custom'];
        setAvailableTypes(types.filter(t => mainPackages.includes(t)));
      }
    };
    if (isOpen) fetchTypes();
  }, [isOpen]);

  // Load existing data
  useEffect(() => {
    if (service) {
      setServiceType(service.service_type);
      setPrice(((service.price_cents || 0) / 100).toString());
      setDescription(service.description || "");
      setDeliveryDays(service.delivery_days?.toString() || "7");
      setIsActive(service.is_active);
      // Load deliverables from DB
      loadDeliverables(service.id);
    } else {
      setServiceType("");
      setPrice("");
      setDescription("");
      setDeliveryDays("7");
      setIsActive(true);
      setDeliverables([]);
      setStoryAddons({
        instagram: { enabled: false, price: "" },
        tiktok: { enabled: false, price: "" },
        facebook: { enabled: false, price: "" },
      } as any);
    }
  }, [service, isOpen]);

  const loadDeliverables = async (serviceId: string) => {
    const { data } = await supabase
      .from("creator_service_deliverables")
      .select("*")
      .eq("creator_service_id", serviceId)
      .order("sort_order");

    if (data) {
      // Separate story add-ons from custom deliverables
      const storyItems = data.filter(d => d.content_type === "story" && STORY_PLATFORMS.includes(d.platform as DeliverablePlatform));
      const customItems = data.filter(d => !(d.content_type === "story" && STORY_PLATFORMS.includes(d.platform as DeliverablePlatform)));

      const newAddons: any = {
        instagram: { enabled: false, price: "" },
        tiktok: { enabled: false, price: "" },
        facebook: { enabled: false, price: "" },
      };
      storyItems.forEach(s => {
        if (newAddons[s.platform]) {
          newAddons[s.platform] = { enabled: true, price: (s.price_cents / 100).toString() };
        }
      });
      setStoryAddons(newAddons);
      setDeliverables(customItems.map(d => ({
        id: d.id,
        platform: d.platform as DeliverablePlatform,
        content_type: d.content_type as ContentType,
        quantity: d.quantity,
        duration_seconds: d.duration_seconds,
        price_cents: d.price_cents,
        description: d.description,
        sort_order: d.sort_order,
      })));
    }
  };

  // Update content type options when platform changes
  useEffect(() => {
    const available = PLATFORM_CONTENT_TYPES[newPlatform];
    if (available && !available.includes(newContentType)) {
      setNewContentType(available[0]);
    }
  }, [newPlatform]);

  const addDeliverable = () => {
    const priceVal = parseFloat(newPrice);
    if (!priceVal || priceVal < 1) {
      toast.error("Enter a valid price");
      return;
    }
    setDeliverables(prev => [...prev, {
      platform: newPlatform,
      content_type: newContentType,
      quantity: parseInt(newQty) || 1,
      duration_seconds: newDuration ? parseInt(newDuration) : null,
      price_cents: Math.round(priceVal * 100),
      description: null,
      sort_order: prev.length,
    }]);
    setNewPrice("");
    setNewQty("1");
    setNewDuration("");
  };

  const removeDeliverable = (index: number) => {
    setDeliverables(prev => prev.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    if (!creatorProfileId) { toast.error("Creator profile not found"); return; }
    if (!serviceType) { toast.error("Please select a package type"); return; }
    if (!description.trim()) { toast.error("Please add a description"); return; }

    const priceValue = parseFloat(price);
    if (!isCustom && (!priceValue || priceValue < 10)) {
      toast.error("Please enter a valid price (minimum $10)");
      return;
    }

    if (isCustom && deliverables.length === 0) {
      toast.error("Add at least one deliverable for your Custom Experience");
      return;
    }

    setIsSaving(true);

    try {
      const priceCents = isCustom ? 0 : Math.round(priceValue * 100);

      const updateData = {
        service_type: serviceType,
        price_cents: priceCents,
        min_price_cents: priceCents,
        max_price_cents: priceCents,
        price_tier_id: null,
        description,
        delivery_days: parseInt(deliveryDays) || 7,
        is_active: isActive,
      };

      let serviceId = service?.id;

      if (service) {
        const { error } = await supabase.from("creator_services").update(updateData).eq("id", service.id);
        if (error) throw error;
      } else {
        const { data: newService, error } = await supabase
          .from("creator_services")
          .insert({ ...updateData, creator_profile_id: creatorProfileId })
          .select("id")
          .single();
        if (error) throw error;
        serviceId = newService.id;
      }

      // Save deliverables
      if (serviceId) {
        // Delete old deliverables
        await supabase.from("creator_service_deliverables").delete().eq("creator_service_id", serviceId);

        const rows: any[] = [];

        // Story add-ons (for standard packages)
        if (isStandardWithStoryUpsell) {
          STORY_PLATFORMS.forEach((platform, i) => {
            const addon = storyAddons[platform];
            if (addon?.enabled && addon.price) {
              rows.push({
                creator_service_id: serviceId,
                platform,
                content_type: "story",
                quantity: 1,
                price_cents: Math.round(parseFloat(addon.price) * 100),
                sort_order: i,
              });
            }
          });
        }

        // Custom deliverables
        if (isCustom) {
          deliverables.forEach((d, i) => {
            rows.push({
              creator_service_id: serviceId,
              platform: d.platform,
              content_type: d.content_type,
              quantity: d.quantity,
              duration_seconds: d.duration_seconds,
              price_cents: d.price_cents,
              description: d.description,
              sort_order: i,
            });
          });
        }

        if (rows.length > 0) {
          const { error: delError } = await supabase.from("creator_service_deliverables").insert(rows);
          if (delError) throw delError;
        }
      }

      toast.success(service ? "Package updated" : "Package added");
      onSuccess();
    } catch (error: any) {
      console.error("Error saving service:", error);
      toast.error(error.message || "Failed to save package");
    } finally {
      setIsSaving(false);
    }
  };

  const packageInfo = serviceType ? EVENT_PACKAGES[serviceType as PackageType] : null;
  const availableContentTypes = PLATFORM_CONTENT_TYPES[newPlatform] || [];

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
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
                    <SelectItem key={type} value={type} className="h-auto py-2">
                      <div className="flex flex-col">
                        <span>{PACKAGE_NAMES[type] || type.replace(/_/g, ' ')}</span>
                        {PACKAGE_HINTS[type] && (
                          <span className="text-xs text-muted-foreground">{PACKAGE_HINTS[type]}</span>
                        )}
                      </div>
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

          {/* Price (hidden for Custom which uses deliverables) */}
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
              <p className="text-xs text-muted-foreground">Set your own price for this package</p>
            </div>
          )}

          {/* ── Multi-Platform Story Add-ons (Standard packages) ── */}
          {isStandardWithStoryUpsell && (
            <div className="space-y-3 p-3 bg-muted/50 rounded-lg">
              <div>
                <Label className="text-sm font-medium">📸 Story Add-ons</Label>
                <p className="text-xs text-muted-foreground mt-0.5">Brands can add stories to their booking</p>
              </div>
              {STORY_PLATFORMS.map(platform => (
                <div key={platform} className="flex items-center gap-3">
                  <Switch
                    checked={storyAddons[platform]?.enabled || false}
                    onCheckedChange={(checked) =>
                      setStoryAddons(prev => ({ ...prev, [platform]: { ...prev[platform], enabled: checked } }))
                    }
                  />
                  <span className="text-sm min-w-[90px]">{DELIVERABLE_PLATFORMS[platform]} Stories</span>
                  {storyAddons[platform]?.enabled && (
                    <div className="relative flex-1">
                      <span className="absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground text-xs">$</span>
                      <Input
                        type="number"
                        min="5"
                        step="1"
                        placeholder="20"
                        value={storyAddons[platform]?.price || ""}
                        onChange={(e) =>
                          setStoryAddons(prev => ({ ...prev, [platform]: { ...prev[platform], price: e.target.value } }))
                        }
                        className="pl-6 h-8 text-sm"
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* ── Custom Experience: Content Deliverables Builder ── */}
          {isCustom && (
            <div className="space-y-3 p-3 bg-primary/5 border border-primary/20 rounded-lg">
              <div>
                <Label className="text-sm font-medium">🎨 Your Content Menu</Label>
                <p className="text-xs text-muted-foreground mt-0.5">Define exactly what you offer and at what price</p>
              </div>

              {/* Add new deliverable form */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label className="text-xs">Platform</Label>
                  <Select value={newPlatform} onValueChange={(v) => setNewPlatform(v as DeliverablePlatform)}>
                    <SelectTrigger className="h-8 text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {(Object.keys(DELIVERABLE_PLATFORMS) as DeliverablePlatform[]).map(p => (
                        <SelectItem key={p} value={p}>{DELIVERABLE_PLATFORMS[p]}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs">Type</Label>
                  <Select value={newContentType} onValueChange={(v) => setNewContentType(v as ContentType)}>
                    <SelectTrigger className="h-8 text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {availableContentTypes.map(ct => (
                        <SelectItem key={ct} value={ct}>{CONTENT_TYPES[ct]}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs">Qty</Label>
                  <Input type="number" min="1" max="10" value={newQty} onChange={(e) => setNewQty(e.target.value)} className="h-8 text-sm" />
                </div>
                <div>
                  <Label className="text-xs">Duration</Label>
                  <Select value={newDuration} onValueChange={setNewDuration}>
                    <SelectTrigger className="h-8 text-sm">
                      <SelectValue placeholder="Optional" />
                    </SelectTrigger>
                    <SelectContent>
                      {DURATION_OPTIONS.map(d => (
                        <SelectItem key={d.value} value={d.value.toString()}>{d.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <span className="absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground text-xs">$</span>
                  <Input
                    type="number"
                    min="1"
                    placeholder="Price"
                    value={newPrice}
                    onChange={(e) => setNewPrice(e.target.value)}
                    className="pl-6 h-8 text-sm"
                  />
                </div>
                <Button size="sm" variant="outline" onClick={addDeliverable} className="h-8 gap-1">
                  <Plus className="h-3 w-3" /> Add
                </Button>
              </div>

              {/* Deliverables list */}
              {deliverables.length > 0 && (
                <div className="space-y-1.5 pt-2 border-t">
                  {deliverables.map((d, i) => {
                    const durLabel = d.duration_seconds ? DURATION_OPTIONS.find(o => o.value === d.duration_seconds)?.label : null;
                    return (
                      <div key={i} className="flex items-center justify-between bg-background rounded px-2 py-1.5 text-sm">
                        <span>
                          {d.quantity}x {DELIVERABLE_PLATFORMS[d.platform]} {CONTENT_TYPES[d.content_type]}
                          {durLabel && <span className="text-muted-foreground"> ({durLabel})</span>}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">${(d.price_cents / 100).toLocaleString()}</span>
                          <button onClick={() => removeDeliverable(i)} className="text-muted-foreground hover:text-destructive">
                            <X className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                  <div className="text-right text-sm font-medium pt-1">
                    Total: ${(deliverables.reduce((s, d) => s + d.price_cents * d.quantity, 0) / 100).toLocaleString()}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Custom Experience Notice (only when no deliverables yet) */}
          {isCustom && deliverables.length === 0 && (
            <p className="text-xs text-muted-foreground text-center">
              Add deliverables above to build your content menu
            </p>
          )}

          {/* Description */}
          {serviceType && (
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Add any special details about your offering..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
              />
              <AiBioSuggestions
                text={description}
                onSelect={setDescription}
                type="description"
                label="package description"
                minLength={10}
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
                <p className="text-xs text-muted-foreground">Visible to brands</p>
              </div>
              <Switch checked={isActive} onCheckedChange={setIsActive} />
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button variant="outline" className="flex-1" onClick={onClose} disabled={isSaving}>
              Cancel
            </Button>
            <Button className="flex-1 gap-2" onClick={handleSave} disabled={isSaving || !serviceType}>
              {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Save
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ServiceEditDialog;
