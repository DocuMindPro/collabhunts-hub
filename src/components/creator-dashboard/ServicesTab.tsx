import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Edit, Trash2, Gift, Sparkles, Users, Swords, Wand2 } from "lucide-react";
import { toast } from "sonner";
import ServiceEditDialog from "./ServiceEditDialog";
import { Badge } from "@/components/ui/badge";
import { DELIVERABLE_PLATFORMS, CONTENT_TYPES, DURATION_OPTIONS, type DeliverablePlatform, type ContentType } from "@/config/packages";

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
}

interface Deliverable {
  id: string;
  platform: string;
  content_type: string;
  quantity: number;
  duration_seconds: number | null;
  price_cents: number;
}

const PACKAGE_ICONS: Record<string, React.ReactNode> = {
  unbox_review: <Gift className="h-5 w-5 text-primary" />,
  social_boost: <Sparkles className="h-5 w-5 text-primary" />,
  meet_greet: <Users className="h-5 w-5 text-primary" />,
  competition: <Swords className="h-5 w-5 text-primary" />,
  custom: <Wand2 className="h-5 w-5 text-primary" />
};

const PACKAGE_NAMES: Record<string, string> = {
  unbox_review: "Unbox & Review",
  social_boost: "Social Boost",
  meet_greet: "Meet & Greet",
  competition: "Live PK Battle",
  custom: "Custom Experience"
};

const PACKAGE_DESCRIPTIONS: Record<string, string> = {
  unbox_review: "Brands send products for you to review from home",
  social_boost: "Visit a venue and create content showcasing the experience",
  meet_greet: "Appear at a venue to meet fans and promote the brand",
  competition: "Participate in live PK battles at venues",
  custom: "Tailored experiences for unique brand needs"
};

const formatPrice = (service: Service) => {
  if (service.service_type === "competition") return "Contact for pricing";
  return `$${(service.price_cents / 100).toLocaleString()}`;
};

const ServicesTab = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [creatorProfileId, setCreatorProfileId] = useState<string | null>(null);
  const [deliverablesByService, setDeliverablesByService] = useState<Record<string, Deliverable[]>>({});

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from("creator_profiles")
        .select("id")
        .eq("user_id", user.id)
        .maybeSingle();

      if (!profile) return;
      setCreatorProfileId(profile.id);

      const { data, error } = await supabase
        .from("creator_services")
        .select("id, service_type, price_cents, min_price_cents, max_price_cents, price_tier_id, description, delivery_days, is_active, creator_profile_id")
        .eq("creator_profile_id", profile.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      const servicesList = data || [];
      setServices(servicesList);

      // Fetch deliverables for all services
      if (servicesList.length > 0) {
        const serviceIds = servicesList.map(s => s.id);
        const { data: delData } = await supabase
          .from("creator_service_deliverables")
          .select("id, creator_service_id, platform, content_type, quantity, duration_seconds, price_cents")
          .in("creator_service_id", serviceIds)
          .order("sort_order");

        if (delData) {
          const grouped: Record<string, Deliverable[]> = {};
          delData.forEach(d => {
            if (!grouped[d.creator_service_id]) grouped[d.creator_service_id] = [];
            grouped[d.creator_service_id].push(d);
          });
          setDeliverablesByService(grouped);
        }
      }
    } catch (error) {
      console.error("Error fetching services:", error);
      toast.error("Failed to load packages");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (serviceId: string) => {
    if (!confirm("Are you sure you want to delete this package?")) return;
    try {
      const { error } = await supabase.from("creator_services").delete().eq("id", serviceId);
      if (error) throw error;
      toast.success("Package deleted successfully");
      fetchServices();
    } catch (error) {
      console.error("Error deleting service:", error);
      toast.error("Failed to delete package");
    }
  };

  const handleEdit = (service: Service) => { setEditingService(service); setIsDialogOpen(true); };
  const handleAddNew = () => { setEditingService(null); setIsDialogOpen(true); };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-heading font-bold">My Packages</h2>
          <p className="text-muted-foreground">Manage your event packages and pricing</p>
        </div>
        <Button onClick={handleAddNew} className="gap-2">
          <Plus className="h-4 w-4" />
          Add Package
        </Button>
      </div>

      {services.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-muted-foreground mb-4">No packages added yet</p>
            <Button onClick={handleAddNew} className="gap-2">
              <Plus className="h-4 w-4" />
              Add Your First Package
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {services.map((service) => {
            const isPKBattle = service.service_type === "competition";
            const isCustom = service.service_type === "custom";
            const dels = deliverablesByService[service.id] || [];
            const storyAddons = dels.filter(d => d.content_type === "story");
            const customDels = isCustom ? dels : [];

            return (
              <Card key={service.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                        {PACKAGE_ICONS[service.service_type] || <Gift className="h-5 w-5 text-primary" />}
                      </div>
                      <div className="space-y-1">
                        <CardTitle className="text-lg">
                          {PACKAGE_NAMES[service.service_type] || service.service_type.replace(/_/g, ' ')}
                        </CardTitle>
                        <CardDescription>
                          {service.description || PACKAGE_DESCRIPTIONS[service.service_type] || "No description provided"}
                        </CardDescription>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="icon" onClick={() => handleEdit(service)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="icon" onClick={() => handleDelete(service.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">
                        {isPKBattle ? "Pricing" : isCustom ? "Content Menu" : "Your Price"}
                      </p>
                      {isCustom ? (
                        <p className="text-lg font-semibold">
                          {customDels.length} deliverable{customDels.length !== 1 ? "s" : ""}
                        </p>
                      ) : (
                        <p className={`text-2xl font-bold ${isPKBattle ? 'text-muted-foreground text-lg' : ''}`}>
                          {formatPrice(service)}
                        </p>
                      )}
                    </div>
                    {!isPKBattle && !isCustom && (
                      <div className="space-y-1 text-right">
                        <p className="text-sm text-muted-foreground">Delivery Time</p>
                        <p className="text-lg font-semibold">
                          {service.delivery_days} day{service.delivery_days !== 1 ? "s" : ""}
                        </p>
                      </div>
                    )}
                    <div className="space-y-1 text-right">
                      <p className="text-sm text-muted-foreground">Status</p>
                      <Badge variant={service.is_active ? "default" : "secondary"}>
                        {service.is_active ? (isPKBattle ? "Available" : "Active") : (isPKBattle ? "Not Available" : "Inactive")}
                      </Badge>
                    </div>
                  </div>

                  {/* Story add-ons indicator */}
                  {storyAddons.length > 0 && !isCustom && (
                    <div className="mt-3 pt-3 border-t flex flex-wrap gap-1.5">
                      <span className="text-xs text-muted-foreground mr-1">Story Add-ons:</span>
                      {storyAddons.map(s => (
                        <Badge key={s.id} variant="outline" className="text-xs">
                          {DELIVERABLE_PLATFORMS[s.platform as DeliverablePlatform] || s.platform} ${(s.price_cents / 100)}
                        </Badge>
                      ))}
                    </div>
                  )}

                  {/* Custom deliverables summary */}
                  {isCustom && customDels.length > 0 && (
                    <div className="mt-3 pt-3 border-t space-y-1">
                      {customDels.map(d => {
                        const durLabel = d.duration_seconds ? DURATION_OPTIONS.find(o => o.value === d.duration_seconds)?.label : null;
                        return (
                          <div key={d.id} className="flex items-center justify-between text-sm">
                            <span>
                              {d.quantity}x {DELIVERABLE_PLATFORMS[d.platform as DeliverablePlatform] || d.platform}{" "}
                              {CONTENT_TYPES[d.content_type as ContentType] || d.content_type}
                              {durLabel && <span className="text-muted-foreground"> ({durLabel})</span>}
                            </span>
                            <span className="font-medium">${(d.price_cents / 100).toLocaleString()}</span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <ServiceEditDialog
        service={editingService}
        creatorProfileId={creatorProfileId}
        isOpen={isDialogOpen}
        onClose={() => { setIsDialogOpen(false); setEditingService(null); }}
        onSuccess={() => { fetchServices(); setIsDialogOpen(false); setEditingService(null); }}
      />
    </div>
  );
};

export default ServicesTab;
