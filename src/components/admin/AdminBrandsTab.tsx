import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Checkbox } from "@/components/ui/checkbox";
import { Search, Eye, Phone, CheckCircle, XCircle, Globe, Building2, Download, ChevronLeft, ChevronRight } from "lucide-react";

interface BrandData {
  id: string;
  user_id: string;
  company_name: string;
  phone_number: string | null;
  phone_verified: boolean | null;
  logo_url: string | null;
  website_url: string | null;
  industry: string | null;
  company_size: string | null;
  monthly_budget_range: string | null;
  onboarding_completed: boolean | null;
  created_at: string;
  email?: string;
  subscription_tier?: string;
  total_spent_cents?: number;
  bookings_count?: number;
  campaigns_count?: number;
}

const ITEMS_PER_PAGE = 20;

const AdminBrandsTab = () => {
  const [brands, setBrands] = useState<BrandData[]>([]);
  const [filteredBrands, setFilteredBrands] = useState<BrandData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBrand, setSelectedBrand] = useState<BrandData | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  
  // Filters
  const [search, setSearch] = useState("");
  const [phoneFilter, setPhoneFilter] = useState<string>("all");
  const [tierFilter, setTierFilter] = useState<string>("all");
  const [industryFilter, setIndustryFilter] = useState<string>("all");
  const [sizeFilter, setSizeFilter] = useState<string>("all");
  const [onboardingFilter, setOnboardingFilter] = useState<string>("all");
  
  const { toast } = useToast();

  // Get unique values for filter dropdowns
  const industries = [...new Set(brands.map(b => b.industry).filter(Boolean))];
  const companySizes = [...new Set(brands.map(b => b.company_size).filter(Boolean))];

  // Pagination
  const totalPages = Math.ceil(filteredBrands.length / ITEMS_PER_PAGE);
  const paginatedBrands = filteredBrands.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  useEffect(() => {
    fetchBrands();
  }, []);

  useEffect(() => {
    let filtered = brands;

    if (search) {
      filtered = filtered.filter(b =>
        b.company_name.toLowerCase().includes(search.toLowerCase()) ||
        b.email?.toLowerCase().includes(search.toLowerCase()) ||
        b.phone_number?.includes(search)
      );
    }

    if (phoneFilter !== "all") {
      filtered = filtered.filter(b => 
        phoneFilter === "verified" ? b.phone_verified : !b.phone_verified
      );
    }

    if (tierFilter !== "all") {
      filtered = filtered.filter(b => b.subscription_tier === tierFilter);
    }

    if (industryFilter !== "all") {
      filtered = filtered.filter(b => b.industry === industryFilter);
    }

    if (sizeFilter !== "all") {
      filtered = filtered.filter(b => b.company_size === sizeFilter);
    }

    if (onboardingFilter !== "all") {
      filtered = filtered.filter(b => 
        onboardingFilter === "completed" ? b.onboarding_completed : !b.onboarding_completed
      );
    }

    setFilteredBrands(filtered);
    setCurrentPage(1);
    setSelectedIds(new Set());
  }, [search, phoneFilter, tierFilter, industryFilter, sizeFilter, onboardingFilter, brands]);

  const fetchBrands = async () => {
    try {
      setLoading(true);

      const { data: brandsData, error: brandsError } = await supabase
        .from("brand_profiles")
        .select("*")
        .order("created_at", { ascending: false });

      if (brandsError) throw brandsError;

      if (!brandsData) {
        setBrands([]);
        return;
      }

      const userIds = brandsData.map(b => b.user_id);
      const brandIds = brandsData.map(b => b.id);

      const [profilesRes, subscriptionsRes, bookingsRes, campaignsRes] = await Promise.all([
        supabase.from("profiles").select("id, email").in("id", userIds),
        supabase.from("brand_subscriptions").select("brand_profile_id, plan_type, status").in("brand_profile_id", brandIds),
        supabase.from("bookings").select("brand_profile_id, total_price_cents, status").in("brand_profile_id", brandIds),
        supabase.from("campaigns").select("brand_profile_id").in("brand_profile_id", brandIds)
      ]);

      const brandsWithDetails = brandsData.map(brand => {
        const profile = profilesRes.data?.find(p => p.id === brand.user_id);
        const subscription = subscriptionsRes.data?.find(s => s.brand_profile_id === brand.id && s.status === "active");
        const completedBookings = bookingsRes.data?.filter(
          b => b.brand_profile_id === brand.id && b.status === "completed"
        ) || [];
        const campaigns = campaignsRes.data?.filter(c => c.brand_profile_id === brand.id) || [];

        return {
          ...brand,
          email: profile?.email,
          subscription_tier: subscription?.plan_type || "basic",
          total_spent_cents: completedBookings.reduce((sum, b) => sum + b.total_price_cents, 0),
          bookings_count: completedBookings.length,
          campaigns_count: campaigns.length
        };
      });

      setBrands(brandsWithDetails);
      setFilteredBrands(brandsWithDetails);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleSelect = (id: string) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setSelectedIds(newSet);
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === paginatedBrands.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(paginatedBrands.map(b => b.id)));
    }
  };

  const exportToCSV = () => {
    const headers = ["Company Name", "Email", "Phone", "Phone Verified", "Industry", "Company Size", "Subscription Tier", "Monthly Budget", "Total Spent ($)", "Bookings", "Campaigns", "Onboarding", "Joined"];
    const rows = filteredBrands.map(b => [
      b.company_name,
      b.email || "",
      b.phone_number || "",
      b.phone_verified ? "Yes" : "No",
      b.industry || "",
      b.company_size || "",
      b.subscription_tier || "basic",
      b.monthly_budget_range || "",
      ((b.total_spent_cents || 0) / 100).toFixed(2),
      b.bookings_count?.toString() || "0",
      b.campaigns_count?.toString() || "0",
      b.onboarding_completed ? "Completed" : "Incomplete",
      new Date(b.created_at).toLocaleDateString()
    ]);

    const csvContent = [headers, ...rows].map(row => 
      row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(",")
    ).join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `brands_export_${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
    toast({ title: "Export complete", description: `${filteredBrands.length} brands exported` });
  };

  const PhoneDisplay = ({ phone, verified }: { phone?: string | null; verified?: boolean | null }) => {
    if (!phone) return <span className="text-muted-foreground">—</span>;
    return (
      <div className="flex items-center gap-1">
        <Phone className="h-3 w-3 text-muted-foreground" />
        <span className="text-sm">{phone}</span>
        {verified ? (
          <CheckCircle className="h-3 w-3 text-green-500" />
        ) : (
          <XCircle className="h-3 w-3 text-red-500" />
        )}
      </div>
    );
  };

  const getTierBadgeVariant = (tier: string) => {
    switch (tier) {
      case "premium": return "default";
      case "pro": return "secondary";
      default: return "outline";
    }
  };

  return (
    <Card>
      <CardHeader className="p-4 md:p-6">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
            <div>
              <CardTitle className="text-lg md:text-xl">All Brands</CardTitle>
              <CardDescription className="text-xs md:text-sm">
                Comprehensive brand management ({filteredBrands.length} of {brands.length})
              </CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={exportToCSV}>
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
          </div>
          
          {/* Filters */}
          <div className="grid grid-cols-2 md:grid-cols-6 gap-2">
            <div className="col-span-2 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search company, email, phone..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            
            <Select value={phoneFilter} onValueChange={setPhoneFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Phone" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Phones</SelectItem>
                <SelectItem value="verified">Verified</SelectItem>
                <SelectItem value="unverified">Unverified</SelectItem>
              </SelectContent>
            </Select>

            <Select value={tierFilter} onValueChange={setTierFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Tier" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Tiers</SelectItem>
                <SelectItem value="basic">Basic</SelectItem>
                <SelectItem value="pro">Pro</SelectItem>
                <SelectItem value="premium">Premium</SelectItem>
              </SelectContent>
            </Select>

            <Select value={industryFilter} onValueChange={setIndustryFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Industry" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Industries</SelectItem>
                {industries.map(industry => (
                  <SelectItem key={industry} value={industry!}>{industry}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={onboardingFilter} onValueChange={setOnboardingFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Onboarding" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="incomplete">Incomplete</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Selection info */}
          {selectedIds.size > 0 && (
            <div className="flex items-center gap-2 p-2 bg-muted rounded-lg">
              <span className="text-sm font-medium">{selectedIds.size} selected</span>
              <Button size="sm" variant="ghost" onClick={() => setSelectedIds(new Set())}>
                Clear
              </Button>
            </div>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="p-4 md:p-6 pt-0">
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : filteredBrands.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No brands found
          </div>
        ) : (
          <>
            <div className="overflow-x-auto -mx-4 md:mx-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-10">
                      <Checkbox
                        checked={selectedIds.size === paginatedBrands.length && paginatedBrands.length > 0}
                        onCheckedChange={toggleSelectAll}
                      />
                    </TableHead>
                    <TableHead>Company</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Industry</TableHead>
                    <TableHead>Tier</TableHead>
                    <TableHead>Spent</TableHead>
                    <TableHead>Campaigns</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedBrands.map((brand) => (
                    <TableRow key={brand.id}>
                      <TableCell>
                        <Checkbox
                          checked={selectedIds.has(brand.id)}
                          onCheckedChange={() => toggleSelect(brand.id)}
                        />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={brand.logo_url || undefined} />
                            <AvatarFallback>
                              <Building2 className="h-4 w-4" />
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{brand.company_name}</p>
                            <p className="text-xs text-muted-foreground">{brand.email}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <PhoneDisplay phone={brand.phone_number} verified={brand.phone_verified} />
                      </TableCell>
                      <TableCell>
                        {brand.industry || <span className="text-muted-foreground">—</span>}
                      </TableCell>
                      <TableCell>
                        <Badge variant={getTierBadgeVariant(brand.subscription_tier || "basic")} className="capitalize">
                          {brand.subscription_tier || "basic"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {brand.total_spent_cents && brand.total_spent_cents > 0 ? (
                          <span className="text-blue-600 font-medium">
                            ${(brand.total_spent_cents / 100).toFixed(2)}
                          </span>
                        ) : (
                          "—"
                        )}
                      </TableCell>
                      <TableCell>
                        {brand.campaigns_count || 0}
                      </TableCell>
                      <TableCell>
                        {new Date(brand.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedBrand(brand)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-4 pt-4 border-t">
                <p className="text-sm text-muted-foreground">
                  Page {currentPage} of {totalPages}
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>

      {/* Brand Detail Modal */}
      <Dialog open={!!selectedBrand} onOpenChange={() => setSelectedBrand(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Brand Details</DialogTitle>
          </DialogHeader>
          {selectedBrand && (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={selectedBrand.logo_url || undefined} />
                  <AvatarFallback>
                    <Building2 className="h-8 w-8" />
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold text-lg">{selectedBrand.company_name}</h3>
                  <p className="text-muted-foreground">{selectedBrand.email}</p>
                  <PhoneDisplay phone={selectedBrand.phone_number} verified={selectedBrand.phone_verified} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold text-sm mb-1">Subscription Tier</h4>
                  <Badge variant={getTierBadgeVariant(selectedBrand.subscription_tier || "basic")} className="capitalize">
                    {selectedBrand.subscription_tier || "basic"}
                  </Badge>
                </div>
                <div>
                  <h4 className="font-semibold text-sm mb-1">Industry</h4>
                  <p className="text-sm text-muted-foreground">{selectedBrand.industry || "—"}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-sm mb-1">Company Size</h4>
                  <p className="text-sm text-muted-foreground">{selectedBrand.company_size || "—"}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-sm mb-1">Monthly Budget</h4>
                  <p className="text-sm text-muted-foreground">{selectedBrand.monthly_budget_range || "—"}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-sm mb-1">Website</h4>
                  {selectedBrand.website_url ? (
                    <a href={selectedBrand.website_url} target="_blank" rel="noopener noreferrer" className="text-sm text-primary flex items-center gap-1">
                      <Globe className="h-3 w-3" />
                      {selectedBrand.website_url}
                    </a>
                  ) : (
                    <p className="text-sm text-muted-foreground">—</p>
                  )}
                </div>
                <div>
                  <h4 className="font-semibold text-sm mb-1">Onboarding</h4>
                  <Badge variant={selectedBrand.onboarding_completed ? "default" : "secondary"}>
                    {selectedBrand.onboarding_completed ? "Completed" : "Incomplete"}
                  </Badge>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 pt-4 border-t">
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-600">
                    ${((selectedBrand.total_spent_cents || 0) / 100).toFixed(2)}
                  </p>
                  <p className="text-xs text-muted-foreground">Total Spent</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold">{selectedBrand.bookings_count || 0}</p>
                  <p className="text-xs text-muted-foreground">Bookings</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold">{selectedBrand.campaigns_count || 0}</p>
                  <p className="text-xs text-muted-foreground">Campaigns</p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default AdminBrandsTab;
