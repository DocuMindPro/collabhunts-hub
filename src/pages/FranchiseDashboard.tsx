import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/Navbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { BarChart3, Users, Building2, DollarSign, Globe, CheckCircle, XCircle, Eye } from "lucide-react";

interface FranchiseOwner {
  id: string;
  company_name: string;
  commission_rate: number;
  total_earnings_cents: number;
  status: string;
}

interface FranchiseCountry {
  id: string;
  country_code: string;
  country_name: string;
  assigned_at: string;
}

interface CreatorProfile {
  id: string;
  display_name: string;
  status: string;
  location_country: string;
  created_at: string;
  categories: string[];
}

interface BrandProfile {
  id: string;
  company_name: string;
  location_country: string;
  created_at: string;
}

interface Earning {
  id: string;
  source_type: string;
  gross_amount_cents: number;
  franchise_amount_cents: number;
  created_at: string;
  user_type: string;
}

const FranchiseDashboard = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState(searchParams.get("tab") || "overview");
  const [loading, setLoading] = useState(true);
  const [franchiseOwner, setFranchiseOwner] = useState<FranchiseOwner | null>(null);
  const [countries, setCountries] = useState<FranchiseCountry[]>([]);
  const [creators, setCreators] = useState<CreatorProfile[]>([]);
  const [brands, setBrands] = useState<BrandProfile[]>([]);
  const [earnings, setEarnings] = useState<Earning[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    fetchFranchiseData();
  }, []);

  const fetchFranchiseData = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Fetch franchise owner profile
      const { data: ownerData, error: ownerError } = await supabase
        .from("franchise_owners")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (ownerError) throw ownerError;
      setFranchiseOwner(ownerData);

      // Fetch assigned countries
      const { data: countriesData } = await supabase
        .from("franchise_countries")
        .select("*")
        .eq("franchise_owner_id", ownerData.id);

      setCountries(countriesData || []);

      const countryCodes = (countriesData || []).map(c => c.country_code);

      if (countryCodes.length > 0) {
        // Fetch creators from assigned countries
        const { data: creatorsData } = await supabase
          .from("creator_profiles")
          .select("id, display_name, status, location_country, created_at, categories")
          .in("location_country", countryCodes)
          .order("created_at", { ascending: false });

        setCreators(creatorsData || []);

        // Fetch brands from assigned countries
        const { data: brandsData } = await supabase
          .from("brand_profiles")
          .select("id, company_name, location_country, created_at")
          .in("location_country", countryCodes)
          .order("created_at", { ascending: false });

        setBrands(brandsData || []);
      }

      // Fetch earnings
      const { data: earningsData } = await supabase
        .from("franchise_earnings")
        .select("*")
        .eq("franchise_owner_id", ownerData.id)
        .order("created_at", { ascending: false })
        .limit(50);

      setEarnings(earningsData || []);

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

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    setSearchParams({ tab: value });
  };

  const handleApproveCreator = async (creatorId: string) => {
    try {
      const { error } = await supabase
        .from("creator_profiles")
        .update({ status: "approved" })
        .eq("id", creatorId);

      if (error) throw error;

      toast({ title: "Creator approved successfully" });
      fetchFranchiseData();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const handleRejectCreator = async (creatorId: string) => {
    const reason = prompt("Enter rejection reason:");
    if (!reason) return;

    try {
      const { error } = await supabase
        .from("creator_profiles")
        .update({ status: "rejected", rejection_reason: reason })
        .eq("id", creatorId);

      if (error) throw error;

      toast({ title: "Creator rejected" });
      fetchFranchiseData();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const totalEarnings = franchiseOwner?.total_earnings_cents || 0;
  const monthlyEarnings = earnings
    .filter(e => new Date(e.created_at) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000))
    .reduce((sum, e) => sum + e.franchise_amount_cents, 0);
  const pendingCreators = creators.filter(c => c.status === "pending").length;

  if (loading) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Franchise Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome, {franchiseOwner?.company_name} • Managing {countries.length} {countries.length === 1 ? "country" : "countries"}
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Total Earnings
              </CardDescription>
              <CardTitle className="text-2xl">${(totalEarnings / 100).toLocaleString()}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                This Month
              </CardDescription>
              <CardTitle className="text-2xl">${(monthlyEarnings / 100).toLocaleString()}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Creators
              </CardDescription>
              <CardTitle className="text-2xl">{creators.length}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                Brands
              </CardDescription>
              <CardTitle className="text-2xl">{brands.length}</CardTitle>
            </CardHeader>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={handleTabChange}>
          <TabsList className="mb-6">
            <TabsTrigger value="overview" className="gap-2">
              <BarChart3 className="h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="creators" className="gap-2">
              <Users className="h-4 w-4" />
              Creators
              {pendingCreators > 0 && <Badge variant="destructive" className="ml-1">{pendingCreators}</Badge>}
            </TabsTrigger>
            <TabsTrigger value="brands" className="gap-2">
              <Building2 className="h-4 w-4" />
              Brands
            </TabsTrigger>
            <TabsTrigger value="earnings" className="gap-2">
              <DollarSign className="h-4 w-4" />
              Earnings
            </TabsTrigger>
            <TabsTrigger value="countries" className="gap-2">
              <Globe className="h-4 w-4" />
              Countries
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <div className="grid gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {earnings.slice(0, 5).map(earning => (
                      <div key={earning.id} className="flex justify-between items-center border-b pb-2">
                        <div>
                          <p className="font-medium capitalize">{earning.source_type} Revenue</p>
                          <p className="text-sm text-muted-foreground">From {earning.user_type}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-green-600">+${(earning.franchise_amount_cents / 100).toFixed(2)}</p>
                          <p className="text-xs text-muted-foreground">{new Date(earning.created_at).toLocaleDateString()}</p>
                        </div>
                      </div>
                    ))}
                    {earnings.length === 0 && (
                      <p className="text-muted-foreground text-center py-4">No earnings yet</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="creators">
            <Card>
              <CardHeader>
                <CardTitle>Creators in Your Region</CardTitle>
                <CardDescription>Manage and approve creators from your assigned countries</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Country</TableHead>
                      <TableHead>Categories</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Joined</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {creators.map(creator => (
                      <TableRow key={creator.id}>
                        <TableCell className="font-medium">{creator.display_name}</TableCell>
                        <TableCell>{creator.location_country}</TableCell>
                        <TableCell>
                          <div className="flex gap-1 flex-wrap">
                            {creator.categories.slice(0, 2).map(cat => (
                              <Badge key={cat} variant="outline" className="text-xs">{cat}</Badge>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={creator.status === "approved" ? "default" : creator.status === "pending" ? "secondary" : "destructive"}>
                            {creator.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{new Date(creator.created_at).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            {creator.status === "pending" && (
                              <>
                                <Button size="sm" variant="outline" onClick={() => handleApproveCreator(creator.id)}>
                                  <CheckCircle className="h-4 w-4" />
                                </Button>
                                <Button size="sm" variant="outline" onClick={() => handleRejectCreator(creator.id)}>
                                  <XCircle className="h-4 w-4" />
                                </Button>
                              </>
                            )}
                            <Button size="sm" variant="ghost" asChild>
                              <a href={`/creator/${creator.id}`} target="_blank">
                                <Eye className="h-4 w-4" />
                              </a>
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="brands">
            <Card>
              <CardHeader>
                <CardTitle>Brands in Your Region</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Company</TableHead>
                      <TableHead>Country</TableHead>
                      <TableHead>Joined</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {brands.map(brand => (
                      <TableRow key={brand.id}>
                        <TableCell className="font-medium">{brand.company_name}</TableCell>
                        <TableCell>{brand.location_country}</TableCell>
                        <TableCell>{new Date(brand.created_at).toLocaleDateString()}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="earnings">
            <Card>
              <CardHeader>
                <CardTitle>Earnings History</CardTitle>
                <CardDescription>Your 70% commission from all activity in your regions</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Source</TableHead>
                      <TableHead>Gross</TableHead>
                      <TableHead>Your Earnings (70%)</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {earnings.map(earning => (
                      <TableRow key={earning.id}>
                        <TableCell>{new Date(earning.created_at).toLocaleDateString()}</TableCell>
                        <TableCell className="capitalize">{earning.source_type}</TableCell>
                        <TableCell className="capitalize">{earning.user_type}</TableCell>
                        <TableCell>${(earning.gross_amount_cents / 100).toFixed(2)}</TableCell>
                        <TableCell className="font-bold text-green-600">
                          ${(earning.franchise_amount_cents / 100).toFixed(2)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="countries">
            <Card>
              <CardHeader>
                <CardTitle>Assigned Countries</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {countries.map(country => (
                    <Card key={country.id}>
                      <CardHeader>
                        <CardTitle className="text-lg">{country.country_name}</CardTitle>
                        <CardDescription>Code: {country.country_code}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2 text-sm">
                          <p>Creators: {creators.filter(c => c.location_country === country.country_code).length}</p>
                          <p>Brands: {brands.filter(b => b.location_country === country.country_code).length}</p>
                          <p className="text-muted-foreground">
                            Assigned: {new Date(country.assigned_at).toLocaleDateString()}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default FranchiseDashboard;
