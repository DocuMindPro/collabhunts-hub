import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Loader2, DollarSign, Save, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ServicePriceRange {
  id: string;
  service_type: string;
  display_name: string;
  min_price_cents: number;
  max_price_cents: number;
  is_enabled: boolean;
}

const AdminServicesSettings = () => {
  const [priceRanges, setPriceRanges] = useState<ServicePriceRange[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    fetchPriceRanges();
  }, []);

  const fetchPriceRanges = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from("service_price_ranges")
      .select("*")
      .order("display_name");

    if (error) {
      console.error("Error fetching price ranges:", error);
      toast.error("Failed to load service price ranges");
    } else {
      setPriceRanges(data || []);
    }
    setIsLoading(false);
  };

  const updateLocalRange = (id: string, field: keyof ServicePriceRange, value: number | boolean) => {
    setPriceRanges(prev => prev.map(range => 
      range.id === id ? { ...range, [field]: value } : range
    ));
    setHasChanges(true);
  };

  const handleSave = async () => {
    setIsSaving(true);
    
    try {
      // Validate all ranges
      for (const range of priceRanges) {
        if (range.min_price_cents < 0 || range.max_price_cents < 0) {
          toast.error(`Invalid price for ${range.display_name}: prices must be positive`);
          setIsSaving(false);
          return;
        }
        if (range.min_price_cents >= range.max_price_cents) {
          toast.error(`Invalid range for ${range.display_name}: minimum must be less than maximum`);
          setIsSaving(false);
          return;
        }
      }

      // Get current user for updated_by
      const { data: { user } } = await supabase.auth.getUser();

      // Update all ranges
      for (const range of priceRanges) {
        const { error } = await supabase
          .from("service_price_ranges")
          .update({
            min_price_cents: range.min_price_cents,
            max_price_cents: range.max_price_cents,
            is_enabled: range.is_enabled,
            updated_by: user?.id,
            updated_at: new Date().toISOString()
          })
          .eq("id", range.id);

        if (error) {
          console.error(`Error updating ${range.display_name}:`, error);
          throw error;
        }
      }

      toast.success("Service price ranges saved successfully");
      setHasChanges(false);
    } catch (error: any) {
      console.error("Error saving price ranges:", error);
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
          Service Price Ranges
        </CardTitle>
        <CardDescription>
          Set minimum and maximum prices for each service type. Creators can only set prices within these ranges.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {priceRanges.length === 0 ? (
          <div className="flex items-center gap-2 p-4 rounded-lg bg-amber-50 dark:bg-amber-950/30 text-amber-800 dark:text-amber-300">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <p className="text-sm">No service types found. Please check the database setup.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {priceRanges.map((range) => (
              <div 
                key={range.id} 
                className={`p-4 rounded-lg border ${range.is_enabled ? 'bg-card' : 'bg-muted/50 opacity-60'}`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h4 className="font-medium">{range.display_name}</h4>
                    <p className="text-xs text-muted-foreground">{range.service_type}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Label htmlFor={`enabled-${range.id}`} className="text-sm text-muted-foreground">
                      {range.is_enabled ? 'Enabled' : 'Disabled'}
                    </Label>
                    <Switch
                      id={`enabled-${range.id}`}
                      checked={range.is_enabled}
                      onCheckedChange={(checked) => updateLocalRange(range.id, 'is_enabled', checked)}
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <Label htmlFor={`min-${range.id}`} className="text-xs">
                      Minimum Price ($)
                    </Label>
                    <Input
                      id={`min-${range.id}`}
                      type="number"
                      min="0"
                      step="1"
                      value={formatCentsToInput(range.min_price_cents)}
                      onChange={(e) => updateLocalRange(range.id, 'min_price_cents', parseInputToCents(e.target.value))}
                      disabled={!range.is_enabled}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor={`max-${range.id}`} className="text-xs">
                      Maximum Price ($)
                    </Label>
                    <Input
                      id={`max-${range.id}`}
                      type="number"
                      min="0"
                      step="1"
                      value={formatCentsToInput(range.max_price_cents)}
                      onChange={(e) => updateLocalRange(range.id, 'max_price_cents', parseInputToCents(e.target.value))}
                      disabled={!range.is_enabled}
                    />
                  </div>
                </div>
                
                {range.is_enabled && (
                  <p className="text-xs text-muted-foreground mt-2">
                    Creators can set prices between ${formatCentsToInput(range.min_price_cents)} - ${formatCentsToInput(range.max_price_cents)}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}

        {priceRanges.length > 0 && (
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
        )}

        <div className="p-4 rounded-lg bg-muted/50 text-sm text-muted-foreground">
          <strong>Note:</strong> Disabled services will not appear in the creator signup flow. 
          Price ranges are enforced when creators add services during registration.
        </div>
      </CardContent>
    </Card>
  );
};

export default AdminServicesSettings;
