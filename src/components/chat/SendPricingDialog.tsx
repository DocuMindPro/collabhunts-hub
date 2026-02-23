import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Send, Package } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { EVENT_PACKAGES, type PackageType } from "@/config/packages";

interface Service {
  id: string;
  service_type: string;
  price_cents: number;
  delivery_days: number;
  is_active: boolean;
}

interface SendPricingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  creatorProfileId: string;
  onSend: (packages: { service_type: string; price_cents: number; delivery_days: number }[]) => void;
}

const SendPricingDialog = ({ open, onOpenChange, creatorProfileId, onSend }: SendPricingDialogProps) => {
  const [services, setServices] = useState<Service[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open || !creatorProfileId) return;
    const fetchServices = async () => {
      setLoading(true);
      const { data } = await supabase
        .from("creator_services")
        .select("id, service_type, price_cents, delivery_days, is_active")
        .eq("creator_profile_id", creatorProfileId)
        .eq("is_active", true);
      setServices(data || []);
      setSelected(new Set((data || []).map(s => s.id)));
      setLoading(false);
    };
    fetchServices();
  }, [open, creatorProfileId]);

  const toggle = (id: string) => {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleSend = () => {
    const selectedServices = services
      .filter(s => selected.has(s.id))
      .map(s => ({ service_type: s.service_type, price_cents: s.price_cents, delivery_days: s.delivery_days }));
    onSend(selectedServices);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Share Your Pricing</DialogTitle>
          <DialogDescription>Select which packages to share with this brand.</DialogDescription>
        </DialogHeader>
        <div className="space-y-3 max-h-[300px] overflow-y-auto">
          {loading ? (
            <p className="text-sm text-muted-foreground text-center py-4">Loading...</p>
          ) : services.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">No active packages found.</p>
          ) : (
            services.map(s => {
              const config = EVENT_PACKAGES[s.service_type as PackageType];
              const name = config?.name || s.service_type.replace(/_/g, " ");
              return (
                <label
                  key={s.id}
                  className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
                >
                  <Checkbox checked={selected.has(s.id)} onCheckedChange={() => toggle(s.id)} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <Package className="h-4 w-4 text-primary flex-shrink-0" />
                      <span className="text-sm font-medium">{name}</span>
                    </div>
                  </div>
                  <span className="text-sm font-bold">${(s.price_cents / 100).toLocaleString()}</span>
                </label>
              );
            })
          )}
        </div>
        <Button onClick={handleSend} disabled={selected.size === 0} className="w-full gap-1.5">
          <Send className="h-4 w-4" />
          Send Pricing ({selected.size})
        </Button>
      </DialogContent>
    </Dialog>
  );
};

export default SendPricingDialog;
