import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { Calendar, MapPin, Users, DollarSign, Clock, Search, Gift, Briefcase, Building2 } from "lucide-react";
import { EVENT_PACKAGES, PackageType } from "@/config/packages";
import ApplyOpportunityDialog from "@/components/opportunities/ApplyOpportunityDialog";
import { toast } from "@/hooks/use-toast";

interface BrandOpportunity {
  id: string;
  brand_profile_id: string;
  title: string;
  description: string | null;
  package_type: string | null;
  event_date: string;
  start_time: string | null;
  end_time: string | null;
  is_paid: boolean;
  budget_cents: number | null;
  spots_available: number;
  spots_filled: number;
  requirements: string | null;
  min_followers: number | null;
  required_categories: string[] | null;
  status: string;
  application_deadline: string | null;
  location_city: string | null;
  location_country: string | null;
  created_at: string;
  brand_profiles?: {
    company_name: string;
    venue_name: string | null;
    logo_url: string | null;
  };
}

const Opportunities = () => {
  const navigate = useNavigate();
  const [opportunities, setOpportunities] = useState<BrandOpportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPackageType, setSelectedPackageType] = useState<string>("all");
  const [showPaidOnly, setShowPaidOnly] = useState(false);
  const [showFreeOnly, setShowFreeOnly] = useState(false);
  const [selectedOpportunity, setSelectedOpportunity] = useState<BrandOpportunity | null>(null);
  const [creatorProfileId, setCreatorProfileId] = useState<string | null>(null);
  const [appliedOpportunities, setAppliedOpportunities] = useState<string[]>([]);

  useEffect(() => {
    fetchOpportunities();
    checkCreatorProfile();
  }, []);

  const checkCreatorProfile = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: creatorProfile } = await supabase
      .from("creator_profiles")
      .select("id")
      .eq("user_id", user.id)
      .maybeSingle();

    if (creatorProfile) {
      setCreatorProfileId(creatorProfile.id);
      // Fetch applied opportunities
      const { data: applications } = await supabase
        .from("opportunity_applications")
        .select("opportunity_id")
        .eq("creator_profile_id", creatorProfile.id);
      
      if (applications) {
        setAppliedOpportunities(applications.map(a => a.opportunity_id));
      }
    }
  };

  const fetchOpportunities = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("brand_opportunities")
      .select(`
        *,
        brand_profiles (
          company_name,
          venue_name,
          logo_url
        )
      `)
      .eq("status", "open")
      .order("event_date", { ascending: true });

    if (error) {
      console.error("Error fetching opportunities:", error);
      toast({
        title: "Error",
        description: "Failed to load opportunities",
        variant: "destructive",
      });
    } else {
      setOpportunities(data || []);
    }
    setLoading(false);
  };

  const handleApply = (opportunity: BrandOpportunity) => {
    if (!creatorProfileId) {
      toast({
        title: "Creator Profile Required",
        description: "You need to create a creator profile to apply for opportunities.",
        variant: "destructive",
      });
      navigate("/creator-signup");
      return;
    }
    setSelectedOpportunity(opportunity);
  };

  const handleApplicationSuccess = () => {
    if (selectedOpportunity) {
      setAppliedOpportunities(prev => [...prev, selectedOpportunity.id]);
    }
    setSelectedOpportunity(null);
    fetchOpportunities();
  };

  const filteredOpportunities = opportunities.filter(opp => {
    const matchesSearch = 
      opp.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      opp.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      opp.brand_profiles?.company_name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesPackage = selectedPackageType === "all" || opp.package_type === selectedPackageType;
    const matchesPaid = !showPaidOnly || opp.is_paid;
    const matchesFree = !showFreeOnly || !opp.is_paid;
    
    return matchesSearch && matchesPackage && matchesPaid && matchesFree;
  });

  const getPackageBadgeColor = (packageType: string | null) => {
    switch (packageType) {
      case 'social_boost': return 'bg-blue-500/10 text-blue-600 border-blue-500/20';
      case 'meet_greet': return 'bg-purple-500/10 text-purple-600 border-purple-500/20';
      case 'unbox_review': return 'bg-orange-500/10 text-orange-600 border-orange-500/20';
      case 'competition': return 'bg-pink-500/10 text-pink-600 border-pink-500/20';
      case 'custom': return 'bg-gray-500/10 text-gray-600 border-gray-500/20';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      
      <main className="flex-1 py-8">
        <div className="container mx-auto px-4 max-w-6xl">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-heading font-bold mb-2">
              Opportunities
            </h1>
            <p className="text-muted-foreground">
              Discover and apply to brand collaborations in your area
            </p>
          </div>

          {/* Filters */}
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search opportunities..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                
                <Select value={selectedPackageType} onValueChange={setSelectedPackageType}>
                  <SelectTrigger className="w-full md:w-[200px]">
                    <SelectValue placeholder="Package Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Packages</SelectItem>
                    {Object.entries(EVENT_PACKAGES).map(([key, pkg]) => (
                      <SelectItem key={key} value={key}>{pkg.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Switch
                      id="paid-only"
                      checked={showPaidOnly}
                      onCheckedChange={(checked) => {
                        setShowPaidOnly(checked);
                        if (checked) setShowFreeOnly(false);
                      }}
                    />
                    <Label htmlFor="paid-only" className="text-sm flex items-center gap-1">
                      <DollarSign className="h-3 w-3" />
                      Paid
                    </Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      id="free-only"
                      checked={showFreeOnly}
                      onCheckedChange={(checked) => {
                        setShowFreeOnly(checked);
                        if (checked) setShowPaidOnly(false);
                      }}
                    />
                    <Label htmlFor="free-only" className="text-sm flex items-center gap-1">
                      <Gift className="h-3 w-3" />
                      Free
                    </Label>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Opportunities Grid */}
          {loading ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="animate-pulse">
                  <CardHeader>
                    <div className="h-6 bg-muted rounded w-3/4" />
                    <div className="h-4 bg-muted rounded w-1/2" />
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="h-4 bg-muted rounded" />
                      <div className="h-4 bg-muted rounded w-5/6" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : filteredOpportunities.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Briefcase className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Opportunities Found</h3>
                <p className="text-muted-foreground">
                  {searchTerm || selectedPackageType !== "all" || showPaidOnly || showFreeOnly
                    ? "Try adjusting your filters to see more opportunities."
                    : "Check back soon for new brand opportunities!"}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredOpportunities.map((opportunity) => {
                const hasApplied = appliedOpportunities.includes(opportunity.id);
                const spotsLeft = opportunity.spots_available - opportunity.spots_filled;
                const packageInfo = opportunity.package_type 
                  ? EVENT_PACKAGES[opportunity.package_type as PackageType] 
                  : null;

                return (
                  <Card key={opportunity.id} className="flex flex-col hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <CardTitle className="text-lg truncate">{opportunity.title}</CardTitle>
                          <CardDescription className="flex items-center gap-1 mt-1">
                            <Building2 className="h-3 w-3 shrink-0" />
                            <span className="truncate">
                              {opportunity.brand_profiles?.venue_name || opportunity.brand_profiles?.company_name}
                            </span>
                          </CardDescription>
                        </div>
                        <Badge 
                          variant="outline" 
                          className={opportunity.is_paid 
                            ? "bg-green-500/10 text-green-600 border-green-500/20 shrink-0" 
                            : "bg-amber-500/10 text-amber-600 border-amber-500/20 shrink-0"
                          }
                        >
                          {opportunity.is_paid ? (
                            <>
                              <DollarSign className="h-3 w-3 mr-0.5" />
                              Paid
                            </>
                          ) : (
                            <>
                              <Gift className="h-3 w-3 mr-0.5" />
                              Free
                            </>
                          )}
                        </Badge>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="flex-1 flex flex-col">
                      {/* Package Type */}
                      {packageInfo && (
                        <Badge 
                          variant="outline" 
                          className={`mb-3 w-fit ${getPackageBadgeColor(opportunity.package_type)}`}
                        >
                          {packageInfo.name}
                        </Badge>
                      )}

                      {/* Description */}
                      {opportunity.description && (
                        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                          {opportunity.description}
                        </p>
                      )}

                      {/* Details */}
                      <div className="space-y-2 text-sm mb-4">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Calendar className="h-4 w-4 shrink-0" />
                          <span>{format(new Date(opportunity.event_date), "MMM d, yyyy")}</span>
                          {opportunity.start_time && (
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {opportunity.start_time.slice(0, 5)}
                            </span>
                          )}
                        </div>
                        
                        {(opportunity.location_city || opportunity.location_country) && (
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <MapPin className="h-4 w-4 shrink-0" />
                            <span>
                              {[opportunity.location_city, opportunity.location_country].filter(Boolean).join(", ")}
                            </span>
                          </div>
                        )}

                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Users className="h-4 w-4 shrink-0" />
                          <span>
                            {spotsLeft > 0 
                              ? `${spotsLeft} spot${spotsLeft !== 1 ? 's' : ''} left`
                              : 'No spots available'
                            }
                          </span>
                        </div>

                        {opportunity.is_paid && opportunity.budget_cents && (
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <DollarSign className="h-4 w-4 shrink-0" />
                            <span className="font-medium text-foreground">
                              ${(opportunity.budget_cents / 100).toFixed(0)} per creator
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Requirements */}
                      {opportunity.min_followers && (
                        <p className="text-xs text-muted-foreground mb-4">
                          Min. {opportunity.min_followers.toLocaleString()} followers required
                        </p>
                      )}

                      {/* Apply Button */}
                      <div className="mt-auto pt-4 border-t">
                        {hasApplied ? (
                          <Button variant="outline" className="w-full" disabled>
                            Applied
                          </Button>
                        ) : spotsLeft === 0 ? (
                          <Button variant="outline" className="w-full" disabled>
                            Filled
                          </Button>
                        ) : (
                          <Button 
                            className="w-full" 
                            onClick={() => handleApply(opportunity)}
                          >
                            Apply Now
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </main>

      {/* Apply Dialog */}
      {selectedOpportunity && creatorProfileId && (
        <ApplyOpportunityDialog
          opportunity={selectedOpportunity}
          creatorProfileId={creatorProfileId}
          open={!!selectedOpportunity}
          onOpenChange={(open) => !open && setSelectedOpportunity(null)}
          onSuccess={handleApplicationSuccess}
        />
      )}
    </div>
  );
};

export default Opportunities;
