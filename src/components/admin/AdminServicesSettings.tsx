import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Loader2, DollarSign, Save, Plus, Trash2, GripVertical } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

interface PriceTier {
  id: string;
  service_type: string;
  tier_name: string;
  min_price_cents: number;
  max_price_cents: number;
  sort_order: number;
  is_enabled: boolean;
  isNew?: boolean;
  isDeleted?: boolean;
}

interface ServiceGroup {
  service_type: string;
  display_name: string;
  tiers: PriceTier[];
  is_enabled: boolean;
}

const SERVICE_DISPLAY_NAMES: Record<string, string> = {
  meet_greet: "Meet & Greet",
  workshop: "Workshop",
  competition: "Competition Event",
  brand_activation: "Brand Activation",
  nightlife: "Nightlife Appearance",
  private_event: "Private Event",
  content_collab: "Content Collaboration",
  custom: "Custom Experience"
};

const AdminServicesSettings = () => {
  const [serviceGroups, setServiceGroups] = useState<ServiceGroup[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [openServices, setOpenServices] = useState<string[]>([]);

  useEffect(() => {
    fetchPriceTiers();
  }, []);

  const fetchPriceTiers = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from("service_price_tiers")
      .select("*")
      .order("service_type")
      .order("sort_order");

    if (error) {
      console.error("Error fetching price tiers:", error);
      toast.error("Failed to load service price tiers");
      setIsLoading(false);
      return;
    }

    // Group tiers by service type
    const grouped: Record<string, PriceTier[]> = {};
    (data || []).forEach(tier => {
      if (!grouped[tier.service_type]) {
        grouped[tier.service_type] = [];
      }
      grouped[tier.service_type].push(tier);
    });

    // Create service groups
    const groups: ServiceGroup[] = Object.keys(SERVICE_DISPLAY_NAMES).map(serviceType => ({
      service_type: serviceType,
      display_name: SERVICE_DISPLAY_NAMES[serviceType],
      tiers: grouped[serviceType] || [],
      is_enabled: (grouped[serviceType] || []).some(t => t.is_enabled)
    }));

    setServiceGroups(groups);
    setOpenServices(groups.filter(g => g.tiers.length > 0).map(g => g.service_type).slice(0, 2));
    setIsLoading(false);
  };

  const toggleServiceOpen = (serviceType: string) => {
    setOpenServices(prev => 
      prev.includes(serviceType) 
        ? prev.filter(s => s !== serviceType)
        : [...prev, serviceType]
    );
  };

  const toggleServiceEnabled = (serviceType: string, enabled: boolean) => {
    setServiceGroups(prev => prev.map(group => {
      if (group.service_type === serviceType) {
        return {
          ...group,
          is_enabled: enabled,
          tiers: group.tiers.map(tier => ({ ...tier, is_enabled: enabled }))
        };
      }
      return group;
    }));
    setHasChanges(true);
  };

  const updateTier = (serviceType: string, tierId: string, field: keyof PriceTier, value: any) => {
    setServiceGroups(prev => prev.map(group => {
      if (group.service_type === serviceType) {
        return {
          ...group,
          tiers: group.tiers.map(tier => 
            tier.id === tierId ? { ...tier, [field]: value } : tier
          )
        };
      }
      return group;
    }));
    setHasChanges(true);
  };

  const addTier = (serviceType: string) => {
    const newTier: PriceTier = {
      id: `new-${Date.now()}`,
      service_type: serviceType,
      tier_name: "New Tier",
      min_price_cents: 10000,
      max_price_cents: 50000,
      sort_order: 99,
      is_enabled: true,
      isNew: true
    };

    setServiceGroups(prev => prev.map(group => {
      if (group.service_type === serviceType) {
        const maxOrder = Math.max(...group.tiers.map(t => t.sort_order), 0);
        return {
          ...group,
          is_enabled: true,
          tiers: [...group.tiers, { ...newTier, sort_order: maxOrder + 1 }]
        };
      }
      return group;
    }));
    setHasChanges(true);
  };

  const deleteTier = (serviceType: string, tierId: string) => {
    setServiceGroups(prev => prev.map(group => {
      if (group.service_type === serviceType) {
        // If it's a new tier, just remove it
        if (tierId.startsWith('new-')) {
          return {
            ...group,
            tiers: group.tiers.filter(t => t.id !== tierId)
          };
        }
        // Otherwise mark for deletion
        return {
          ...group,
          tiers: group.tiers.map(tier => 
            tier.id === tierId ? { ...tier, isDeleted: true } : tier
          )
        };
      }
      return group;
    }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    setIsSaving(true);

    try {
      // Validate all tiers
      for (const group of serviceGroups) {
        for (const tier of group.tiers.filter(t => !t.isDeleted)) {
          if (tier.min_price_cents < 0 || tier.max_price_cents <= 0) {
            toast.error(`Invalid price for ${tier.tier_name}: prices must be positive`);
            setIsSaving(false);
            return;
          }
          if (tier.min_price_cents >= tier.max_price_cents) {
            toast.error(`Invalid range for ${tier.tier_name}: minimum must be less than maximum`);
            setIsSaving(false);
            return;
          }
          if (!tier.tier_name.trim()) {
            toast.error(`Tier name cannot be empty`);
            setIsSaving(false);
            return;
          }
        }
      }

      // Process deletions
      for (const group of serviceGroups) {
        for (const tier of group.tiers.filter(t => t.isDeleted && !t.isNew)) {
          const { error } = await supabase
            .from("service_price_tiers")
            .delete()
            .eq("id", tier.id);
          if (error) throw error;
        }
      }

      // Process inserts (new tiers)
      for (const group of serviceGroups) {
        for (const tier of group.tiers.filter(t => t.isNew && !t.isDeleted)) {
          const { error } = await supabase
            .from("service_price_tiers")
            .insert({
              service_type: tier.service_type,
              tier_name: tier.tier_name,
              min_price_cents: tier.min_price_cents,
              max_price_cents: tier.max_price_cents,
              sort_order: tier.sort_order,
              is_enabled: tier.is_enabled
            });
          if (error) throw error;
        }
      }

      // Process updates (existing tiers)
      for (const group of serviceGroups) {
        for (const tier of group.tiers.filter(t => !t.isNew && !t.isDeleted)) {
          const { error } = await supabase
            .from("service_price_tiers")
            .update({
              tier_name: tier.tier_name,
              min_price_cents: tier.min_price_cents,
              max_price_cents: tier.max_price_cents,
              sort_order: tier.sort_order,
              is_enabled: tier.is_enabled,
              updated_at: new Date().toISOString()
            })
            .eq("id", tier.id);
          if (error) throw error;
        }
      }

      toast.success("Service price tiers saved successfully");
      setHasChanges(false);
      // Refresh data
      await fetchPriceTiers();
    } catch (error: any) {
      console.error("Error saving price tiers:", error);
      toast.error("Failed to save changes");
    } finally {
      setIsSaving(false);
    }
  };

  const formatCentsToInput = (cents: number) => (cents / 100).toString();
  const parseInputToCents = (value: string) => Math.round(parseFloat(value || "0") * 100);

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="h-5 w-5" />
          Service Price Tiers
        </CardTitle>
        <CardDescription>
          Configure multiple pricing tiers for each service. Creators will select one of these tiers during signup.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {serviceGroups.map((group) => (
          <Collapsible
            key={group.service_type}
            open={openServices.includes(group.service_type)}
            onOpenChange={() => toggleServiceOpen(group.service_type)}
          >
            <div className={`rounded-lg border ${group.is_enabled ? 'bg-card' : 'bg-muted/50 opacity-70'}`}>
              <CollapsibleTrigger asChild>
                <div className="flex items-center justify-between p-4 cursor-pointer hover:bg-muted/30 transition-colors">
                  <div className="flex items-center gap-3">
                    <GripVertical className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <h4 className="font-medium">{group.display_name}</h4>
                      <p className="text-xs text-muted-foreground">
                        {group.tiers.filter(t => !t.isDeleted).length} tier{group.tiers.filter(t => !t.isDeleted).length !== 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3" onClick={(e) => e.stopPropagation()}>
                    <Label htmlFor={`enabled-${group.service_type}`} className="text-sm text-muted-foreground">
                      {group.is_enabled ? 'Enabled' : 'Disabled'}
                    </Label>
                    <Switch
                      id={`enabled-${group.service_type}`}
                      checked={group.is_enabled}
                      onCheckedChange={(checked) => toggleServiceEnabled(group.service_type, checked)}
                    />
                  </div>
                </div>
              </CollapsibleTrigger>

              <CollapsibleContent>
                <div className="border-t p-4 space-y-3">
                  {group.tiers.filter(t => !t.isDeleted).map((tier, index) => (
                    <div 
                      key={tier.id} 
                      className="grid grid-cols-[1fr,auto,auto,auto] gap-3 items-end p-3 rounded-lg bg-muted/50"
                    >
                      <div className="space-y-1">
                        <Label className="text-xs">Tier Name</Label>
                        <Input
                          value={tier.tier_name}
                          onChange={(e) => updateTier(group.service_type, tier.id, 'tier_name', e.target.value)}
                          placeholder="e.g., Standard"
                          className="h-9"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Min ($)</Label>
                        <Input
                          type="number"
                          min="0"
                          step="1"
                          value={formatCentsToInput(tier.min_price_cents)}
                          onChange={(e) => updateTier(group.service_type, tier.id, 'min_price_cents', parseInputToCents(e.target.value))}
                          className="h-9 w-24"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Max ($)</Label>
                        <Input
                          type="number"
                          min="0"
                          step="1"
                          value={formatCentsToInput(tier.max_price_cents)}
                          onChange={(e) => updateTier(group.service_type, tier.id, 'max_price_cents', parseInputToCents(e.target.value))}
                          className="h-9 w-24"
                        />
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-9 w-9 text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={() => deleteTier(group.service_type, tier.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}

                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full gap-2"
                    onClick={() => addTier(group.service_type)}
                  >
                    <Plus className="h-4 w-4" />
                    Add Tier
                  </Button>
                </div>
              </CollapsibleContent>
            </div>
          </Collapsible>
        ))}

        <Button 
          onClick={handleSave} 
          disabled={isSaving || !hasChanges}
          className="w-full gap-2"
        >
          {isSaving ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          {hasChanges ? 'Save Changes' : 'No Changes'}
        </Button>

        <div className="p-4 rounded-lg bg-muted/50 text-sm text-muted-foreground">
          <strong>Note:</strong> Disabled services won't appear in the creator signup flow. 
          Each service can have multiple price tiers that creators can choose from.
        </div>
      </CardContent>
    </Card>
  );
};

export default AdminServicesSettings;
