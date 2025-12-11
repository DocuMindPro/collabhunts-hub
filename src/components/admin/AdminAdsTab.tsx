import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Megaphone, 
  Image, 
  ExternalLink, 
  Eye, 
  EyeOff, 
  Edit, 
  Search,
  CheckCircle,
  XCircle,
  Calendar,
  Upload,
  Loader2,
  MapPin,
  RotateCcw,
  AlertTriangle,
  Clock
} from "lucide-react";

// URL mapping for each page
const pageUrlMap: Record<string, string> = {
  home: "/",
  creator: "/creator",
  brand: "/brand",
  influencers: "/influencers",
  campaigns: "/campaigns",
  all: "/",
};

interface AdPlacement {
  id: string;
  placement_id: string;
  placement_name: string;
  page: string;
  position: string;
  advertiser_name: string | null;
  advertiser_type: string | null;
  image_url: string | null;
  link_url: string | null;
  link_type: string | null;
  target_creator_profile_id: string | null;
  is_active: boolean;
  start_date: string | null;
  end_date: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

type AdStatus = "available" | "active" | "inactive" | "expired" | "expiring_soon";

const getAdStatus = (ad: AdPlacement): AdStatus => {
  const now = new Date();
  const hasData = ad.advertiser_name || ad.image_url;
  
  // Check if expired
  if (ad.end_date && new Date(ad.end_date) < now) {
    return "expired";
  }
  
  // Check if expiring soon (within 3 days)
  if (ad.end_date) {
    const endDate = new Date(ad.end_date);
    const daysUntilExpiry = (endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
    if (daysUntilExpiry <= 3 && daysUntilExpiry > 0 && ad.is_active) {
      return "expiring_soon";
    }
  }
  
  // No advertiser data = available slot
  if (!hasData) {
    return "available";
  }
  
  // Has data and is active
  if (ad.is_active) {
    return "active";
  }
  
  // Has data but inactive
  return "inactive";
};

const StatusBadge = ({ status }: { status: AdStatus }) => {
  switch (status) {
    case "available":
      return (
        <Badge variant="outline" className="text-muted-foreground border-dashed">
          <XCircle className="h-3 w-3 mr-1" /> Available
        </Badge>
      );
    case "active":
      return (
        <Badge className="bg-green-100 text-green-800 hover:bg-green-200">
          <Eye className="h-3 w-3 mr-1" /> Active
        </Badge>
      );
    case "inactive":
      return (
        <Badge variant="secondary">
          <EyeOff className="h-3 w-3 mr-1" /> Inactive
        </Badge>
      );
    case "expired":
      return (
        <Badge variant="destructive">
          <Clock className="h-3 w-3 mr-1" /> Expired
        </Badge>
      );
    case "expiring_soon":
      return (
        <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-200">
          <AlertTriangle className="h-3 w-3 mr-1" /> Expiring Soon
        </Badge>
      );
    default:
      return null;
  }
};

const AdminAdsTab = () => {
  const [placements, setPlacements] = useState<AdPlacement[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [pageFilter, setPageFilter] = useState("all");
  const [editingAd, setEditingAd] = useState<AdPlacement | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [resetConfirmAd, setResetConfirmAd] = useState<AdPlacement | null>(null);
  const [resetting, setResetting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    advertiser_name: "",
    advertiser_type: "external",
    image_url: "",
    link_url: "",
    link_type: "external",
    is_active: false,
    start_date: "",
    end_date: "",
    notes: "",
  });

  const { toast } = useToast();

  useEffect(() => {
    fetchPlacements();
  }, []);

  const fetchPlacements = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("ad_placements")
        .select("*")
        .order("page", { ascending: true })
        .order("position", { ascending: true });

      if (error) throw error;
      setPlacements(data || []);
    } catch (error: any) {
      toast({
        title: "Error loading ads",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (ad: AdPlacement) => {
    setEditingAd(ad);
    setFormData({
      advertiser_name: ad.advertiser_name || "",
      advertiser_type: ad.advertiser_type || "external",
      image_url: ad.image_url || "",
      link_url: ad.link_url || "",
      link_type: ad.link_type || "external",
      is_active: ad.is_active,
      start_date: ad.start_date ? ad.start_date.split("T")[0] : "",
      end_date: ad.end_date ? ad.end_date.split("T")[0] : "",
      notes: ad.notes || "",
    });
    setIsEditing(true);
  };

  const handleSave = async () => {
    if (!editingAd) return;

    try {
      setSaving(true);

      const updateData: any = {
        advertiser_name: formData.advertiser_name || null,
        advertiser_type: formData.advertiser_type,
        image_url: formData.image_url || null,
        link_url: formData.link_url || null,
        link_type: formData.link_type,
        is_active: formData.is_active,
        start_date: formData.start_date ? new Date(formData.start_date).toISOString() : null,
        end_date: formData.end_date ? new Date(formData.end_date).toISOString() : null,
        notes: formData.notes || null,
      };

      const { error } = await supabase
        .from("ad_placements")
        .update(updateData)
        .eq("id", editingAd.id);

      if (error) throw error;

      toast({
        title: "Ad Updated",
        description: `${editingAd.placement_name} has been updated successfully.`,
      });

      setIsEditing(false);
      setEditingAd(null);
      fetchPlacements();
    } catch (error: any) {
      toast({
        title: "Error saving ad",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async (ad: AdPlacement) => {
    try {
      setResetting(true);

      const { error } = await supabase
        .from("ad_placements")
        .update({
          advertiser_name: null,
          advertiser_type: "external",
          image_url: null,
          link_url: null,
          link_type: "external",
          is_active: false,
          start_date: null,
          end_date: null,
          notes: null,
          target_creator_profile_id: null,
        })
        .eq("id", ad.id);

      if (error) throw error;

      toast({
        title: "Placement Reset",
        description: `${ad.placement_name} has been reset to "Advertise Here".`,
      });

      setResetConfirmAd(null);
      fetchPlacements();
    } catch (error: any) {
      toast({
        title: "Error resetting placement",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setResetting(false);
    }
  };

  const handleResetFromDialog = async () => {
    if (!editingAd) return;
    
    try {
      setResetting(true);

      const { error } = await supabase
        .from("ad_placements")
        .update({
          advertiser_name: null,
          advertiser_type: "external",
          image_url: null,
          link_url: null,
          link_type: "external",
          is_active: false,
          start_date: null,
          end_date: null,
          notes: null,
          target_creator_profile_id: null,
        })
        .eq("id", editingAd.id);

      if (error) throw error;

      toast({
        title: "Placement Reset",
        description: `${editingAd.placement_name} has been reset to "Advertise Here".`,
      });

      setIsEditing(false);
      setEditingAd(null);
      fetchPlacements();
    } catch (error: any) {
      toast({
        title: "Error resetting placement",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setResetting(false);
    }
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!editingAd) return;
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: "Invalid file type",
        description: "Please upload a JPG, PNG, GIF, or WebP image.",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Maximum file size is 5MB.",
        variant: "destructive",
      });
      return;
    }

    try {
      setUploading(true);

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error("Not authenticated");
      }

      const formDataUpload = new FormData();
      formDataUpload.append("file", file);
      formDataUpload.append("placement_id", editingAd.placement_id);

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/upload-ad-image`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
          body: formDataUpload,
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Upload failed");
      }

      setFormData(prev => ({ ...prev, image_url: result.image_url }));
      toast({
        title: "Image Uploaded",
        description: "Ad image uploaded successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Upload failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const toggleActive = async (ad: AdPlacement) => {
    try {
      const { error } = await supabase
        .from("ad_placements")
        .update({ is_active: !ad.is_active })
        .eq("id", ad.id);

      if (error) throw error;

      toast({
        title: ad.is_active ? "Ad Deactivated" : "Ad Activated",
        description: `${ad.placement_name} is now ${ad.is_active ? "inactive" : "active"}.`,
      });

      fetchPlacements();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const filteredPlacements = placements.filter(ad => {
    const matchesSearch = 
      ad.placement_name.toLowerCase().includes(search.toLowerCase()) ||
      ad.advertiser_name?.toLowerCase().includes(search.toLowerCase()) ||
      ad.placement_id.toLowerCase().includes(search.toLowerCase());
    const matchesPage = pageFilter === "all" || ad.page === pageFilter;
    return matchesSearch && matchesPage;
  });

  const activeCount = placements.filter(ad => ad.is_active).length;
  const expiredCount = placements.filter(ad => getAdStatus(ad) === "expired").length;
  const availableCount = placements.filter(ad => getAdStatus(ad) === "available").length;
  const pages = [...new Set(placements.map(ad => ad.page))];

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Placements</CardTitle>
            <Megaphone className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{placements.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Ads</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{activeCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Available Slots</CardTitle>
            <XCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-muted-foreground">{availableCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Expired</CardTitle>
            <Clock className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{expiredCount}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search placements..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={pageFilter} onValueChange={setPageFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by page" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Pages</SelectItem>
            {pages.map(page => (
              <SelectItem key={page} value={page}>{page.charAt(0).toUpperCase() + page.slice(1)}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Placements Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Placement</TableHead>
              <TableHead>Page</TableHead>
              <TableHead>Advertiser</TableHead>
              <TableHead>Preview</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Schedule</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  Loading placements...
                </TableCell>
              </TableRow>
            ) : filteredPlacements.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  No placements found
                </TableCell>
              </TableRow>
            ) : (
              filteredPlacements.map((ad) => {
                const status = getAdStatus(ad);
                const hasData = ad.advertiser_name || ad.image_url;
                
                return (
                  <TableRow key={ad.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{ad.placement_name}</p>
                        <p className="text-xs text-muted-foreground">{ad.placement_id}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{ad.page}</Badge>
                        <a 
                          href={pageUrlMap[ad.page] || "/"} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          title="View on page"
                          className="text-muted-foreground hover:text-primary"
                        >
                          <MapPin className="h-3.5 w-3.5" />
                        </a>
                      </div>
                    </TableCell>
                    <TableCell>
                      {ad.advertiser_name ? (
                        <div className="flex items-center gap-2">
                          <span>{ad.advertiser_name}</span>
                          {ad.link_url && (
                            <a href={ad.link_url} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="h-3 w-3 text-muted-foreground hover:text-primary" />
                            </a>
                          )}
                        </div>
                      ) : (
                        <span className="text-muted-foreground italic">Empty slot</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {ad.image_url ? (
                        <a href={ad.image_url} target="_blank" rel="noopener noreferrer">
                          <img 
                            src={ad.image_url} 
                            alt={ad.advertiser_name || "Ad"} 
                            className="w-16 h-10 object-cover rounded border"
                          />
                        </a>
                      ) : (
                        <div className="w-16 h-10 bg-muted rounded border flex items-center justify-center">
                          <Image className="h-4 w-4 text-muted-foreground" />
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <button 
                        onClick={() => hasData && toggleActive(ad)}
                        className={hasData ? "cursor-pointer" : "cursor-default"}
                        disabled={!hasData}
                      >
                        <StatusBadge status={status} />
                      </button>
                    </TableCell>
                    <TableCell>
                      {ad.start_date || ad.end_date ? (
                        <div className="text-xs text-muted-foreground">
                          {ad.start_date && <div>From: {new Date(ad.start_date).toLocaleDateString()}</div>}
                          {ad.end_date && (
                            <div className={status === "expired" ? "text-destructive font-medium" : ""}>
                              To: {new Date(ad.end_date).toLocaleDateString()}
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground">No schedule</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        {hasData && (
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => setResetConfirmAd(ad)}
                            title="Reset to Advertise Here"
                          >
                            <RotateCcw className="h-4 w-4" />
                          </Button>
                        )}
                        <Button variant="ghost" size="sm" onClick={() => handleEdit(ad)}>
                          <Edit className="h-4 w-4 mr-1" /> Edit
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Reset Confirmation Dialog */}
      <AlertDialog open={!!resetConfirmAd} onOpenChange={() => setResetConfirmAd(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reset Ad Placement?</AlertDialogTitle>
            <AlertDialogDescription>
              This will clear all advertiser data from "{resetConfirmAd?.placement_name}" and return it to "Advertise Here" state. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={resetting}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => resetConfirmAd && handleReset(resetConfirmAd)}
              disabled={resetting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {resetting ? "Resetting..." : "Reset Placement"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Edit Dialog */}
      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Ad Placement: {editingAd?.placement_name}</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Advertiser Name</Label>
              <Input
                value={formData.advertiser_name}
                onChange={(e) => setFormData(prev => ({ ...prev, advertiser_name: e.target.value }))}
                placeholder="e.g., Nike, Creator Name, Company XYZ"
              />
            </div>

            <div className="space-y-2">
              <Label>Advertiser Type</Label>
              <Select
                value={formData.advertiser_type}
                onValueChange={(val) => setFormData(prev => ({ ...prev, advertiser_type: val }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="brand">Brand</SelectItem>
                  <SelectItem value="creator">Creator</SelectItem>
                  <SelectItem value="external">External</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Ad Image</Label>
              <div className="flex gap-2">
                <Input
                  value={formData.image_url}
                  onChange={(e) => setFormData(prev => ({ ...prev, image_url: e.target.value }))}
                  placeholder="https://... or upload below"
                  className="flex-1"
                />
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageUpload}
                  accept="image/jpeg,image/png,image/gif,image/webp"
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                >
                  {uploading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Upload className="h-4 w-4" />
                  )}
                </Button>
              </div>
              {uploading && (
                <p className="text-xs text-muted-foreground">Uploading image...</p>
              )}
              {formData.image_url && (
                <img 
                  src={formData.image_url} 
                  alt="Preview" 
                  className="w-full h-32 object-cover rounded border mt-2"
                />
              )}
            </div>

            <div className="space-y-2">
              <Label>Link URL</Label>
              <Input
                value={formData.link_url}
                onChange={(e) => setFormData(prev => ({ ...prev, link_url: e.target.value }))}
                placeholder="https://..."
              />
            </div>

            <div className="space-y-2">
              <Label>Link Type</Label>
              <Select
                value={formData.link_type}
                onValueChange={(val) => setFormData(prev => ({ ...prev, link_type: val }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="external">External URL</SelectItem>
                  <SelectItem value="creator_profile">Creator Profile</SelectItem>
                  <SelectItem value="brand_website">Brand Website</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Start Date (Optional)</Label>
                <Input
                  type="date"
                  value={formData.start_date}
                  onChange={(e) => setFormData(prev => ({ ...prev, start_date: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>End Date (Optional)</Label>
                <Input
                  type="date"
                  value={formData.end_date}
                  onChange={(e) => setFormData(prev => ({ ...prev, end_date: e.target.value }))}
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Switch
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked }))}
              />
              <Label>Active</Label>
            </div>

            <div className="space-y-2">
              <Label>Internal Notes</Label>
              <Textarea
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Internal notes about the advertising deal..."
                rows={3}
              />
            </div>

            {/* Reset Button in Dialog */}
            {(formData.advertiser_name || formData.image_url) && (
              <div className="pt-4 border-t">
                <Button 
                  variant="outline" 
                  onClick={handleResetFromDialog}
                  disabled={resetting}
                  className="w-full text-destructive hover:text-destructive hover:bg-destructive/10"
                >
                  <RotateCcw className="h-4 w-4 mr-2" />
                  {resetting ? "Resetting..." : "Reset to Advertise Here"}
                </Button>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditing(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminAdsTab;
