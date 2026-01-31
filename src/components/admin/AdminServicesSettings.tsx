import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Loader2, Package } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface PackageConfig {
  id: string;
  name: string;
  description: string;
  is_enabled: boolean;
}

const PACKAGE_CONFIGS: Record<string, { name: string; description: string }> = {
  unbox_review: {
    name: "Unbox & Review",
    description: "Brands send products for creators to review from home"
  },
  social_boost: {
    name: "Social Boost",
    description: "Creators visit venues and create engaging content"
  },
  meet_greet: {
    name: "Meet & Greet",
    description: "In-person creator appearances with fan interaction"
  },
  competition: {
    name: "Live PK Battle",
    description: "Live streaming competitions at venues (pricing handled by CollabHunts)"
  },
  custom: {
    name: "Custom Experience",
    description: "Tailored experiences for unique brand needs"
  }
};

const AdminServicesSettings = () => {
  const [packages, setPackages] = useState<PackageConfig[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState<string | null>(null);

  useEffect(() => {
    loadPackageSettings();
  }, []);

  const loadPackageSettings = async () => {
    setIsLoading(true);
    
    // Check which packages have at least one enabled tier
    const { data, error } = await supabase
      .from("service_price_tiers")
      .select("service_type, is_enabled")
      .in("service_type", Object.keys(PACKAGE_CONFIGS));

    if (error) {
      console.error("Error loading package settings:", error);
      toast.error("Failed to load package settings");
      setIsLoading(false);
      return;
    }

    // Group by service type and check if any tier is enabled
    const enabledByType: Record<string, boolean> = {};
    (data || []).forEach(row => {
      if (!enabledByType[row.service_type]) {
        enabledByType[row.service_type] = row.is_enabled;
      } else if (row.is_enabled) {
        enabledByType[row.service_type] = true;
      }
    });

    // Create package list
    const pkgList = Object.entries(PACKAGE_CONFIGS).map(([id, config]) => ({
      id,
      name: config.name,
      description: config.description,
      is_enabled: enabledByType[id] ?? true // Default to enabled if no tiers exist
    }));

    setPackages(pkgList);
    setIsLoading(false);
  };

  const togglePackage = async (packageId: string, enabled: boolean) => {
    setIsSaving(packageId);

    try {
      // Update all tiers for this service type
      const { error } = await supabase
        .from("service_price_tiers")
        .update({ is_enabled: enabled, updated_at: new Date().toISOString() })
        .eq("service_type", packageId);

      if (error) throw error;

      // Update local state
      setPackages(prev => prev.map(pkg => 
        pkg.id === packageId ? { ...pkg, is_enabled: enabled } : pkg
      ));

      toast.success(`${PACKAGE_CONFIGS[packageId].name} ${enabled ? 'enabled' : 'disabled'}`);
    } catch (error: any) {
      console.error("Error toggling package:", error);
      toast.error("Failed to update package setting");
    } finally {
      setIsSaving(null);
    }
  };

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
          <Package className="h-5 w-5" />
          Event Packages
        </CardTitle>
        <CardDescription>
          Enable or disable packages available for creators. Creators set their own prices for each package.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {packages.map((pkg) => (
          <div
            key={pkg.id}
            className={`flex items-center justify-between p-4 rounded-lg border ${
              pkg.is_enabled ? 'bg-card' : 'bg-muted/50 opacity-70'
            }`}
          >
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h4 className="font-medium">{pkg.name}</h4>
                {pkg.id === 'competition' && (
                  <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                    No creator pricing
                  </span>
                )}
              </div>
              <p className="text-sm text-muted-foreground">{pkg.description}</p>
            </div>
            <div className="flex items-center gap-3">
              <Label htmlFor={`enabled-${pkg.id}`} className="text-sm text-muted-foreground">
                {pkg.is_enabled ? 'Enabled' : 'Disabled'}
              </Label>
              <Switch
                id={`enabled-${pkg.id}`}
                checked={pkg.is_enabled}
                onCheckedChange={(checked) => togglePackage(pkg.id, checked)}
                disabled={isSaving === pkg.id}
              />
            </div>
          </div>
        ))}

        <div className="p-4 rounded-lg bg-muted/50 text-sm text-muted-foreground space-y-2">
          <p><strong>Note:</strong> Disabled packages won't appear in the creator signup flow.</p>
          <p>Creators set their own single price for each package (except Live PK Battle, which is managed by CollabHunts during booking discussions).</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default AdminServicesSettings;
