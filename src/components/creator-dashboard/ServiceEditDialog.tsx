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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";

interface Service {
  id: string;
  service_type: string;
  price_cents: number;
  description: string | null;
  delivery_days: number;
  is_active: boolean;
}

interface ServiceEditDialogProps {
  service: Service | null;
  creatorProfileId: string | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const ServiceEditDialog = ({
  service,
  creatorProfileId,
  isOpen,
  onClose,
  onSuccess,
}: ServiceEditDialogProps) => {
  const [formData, setFormData] = useState({
    service_type: "",
    price_cents: "",
    description: "",
    delivery_days: "7",
    is_active: true,
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (service) {
      setFormData({
        service_type: service.service_type,
        price_cents: (service.price_cents / 100).toString(),
        description: service.description || "",
        delivery_days: service.delivery_days.toString(),
        is_active: service.is_active,
      });
    } else {
      setFormData({
        service_type: "",
        price_cents: "",
        description: "",
        delivery_days: "7",
        is_active: true,
      });
    }
  }, [service]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!creatorProfileId) {
      toast.error("Creator profile not found");
      return;
    }

    setLoading(true);
    try {
      const price = parseFloat(formData.price_cents);
      if (isNaN(price) || price <= 0) {
        toast.error("Please enter a valid price");
        return;
      }

      const serviceData = {
        creator_profile_id: creatorProfileId,
        service_type: formData.service_type,
        price_cents: Math.round(price * 100),
        description: formData.description || null,
        delivery_days: parseInt(formData.delivery_days),
        is_active: formData.is_active,
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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{service ? "Edit Service" : "Add New Service"}</DialogTitle>
          <DialogDescription>
            {service ? "Update your service details" : "Create a new collaboration package"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="service_type">Service Type</Label>
            <Input
              id="service_type"
              value={formData.service_type}
              onChange={(e) => setFormData({ ...formData, service_type: e.target.value })}
              placeholder="e.g., meet_greet, workshop, brand_activation"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="price">Price (USD)</Label>
            <Input
              id="price"
              type="number"
              step="0.01"
              min="0"
              value={formData.price_cents}
              onChange={(e) => setFormData({ ...formData, price_cents: e.target.value })}
              placeholder="100.00"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="delivery_days">Delivery Time (days)</Label>
            <Input
              id="delivery_days"
              type="number"
              min="1"
              value={formData.delivery_days}
              onChange={(e) => setFormData({ ...formData, delivery_days: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe what's included in this service..."
              rows={3}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="is_active">Active</Label>
            <Switch
              id="is_active"
              checked={formData.is_active}
              onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
            />
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? "Saving..." : service ? "Update" : "Create"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ServiceEditDialog;
