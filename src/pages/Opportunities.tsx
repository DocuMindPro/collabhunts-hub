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
import { Alert, AlertDescription } from "@/components/ui/alert";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { Calendar, MapPin, Users, DollarSign, Clock, Search, Gift, Briefcase, AlertCircle, BarChart3 } from "lucide-react";
import ProfileAvatar from "@/components/ProfileAvatar";
import { EVENT_PACKAGES, PackageType } from "@/config/packages";
import { FOLLOWER_RANGES, checkFollowerEligibility, formatFollowerRanges, formatFollowerCount, getCombinedRange } from "@/config/follower-ranges";
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
  follower_ranges: string[] | null;
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
  const [authLoading, setAuthLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPackageType, setSelectedPackageType] = useState<string>("all");
  const [showPaidOnly, setShowPaidOnly] = useState(false);
  const [showFreeOnly, setShowFreeOnly] = useState(false);
  const [selectedOpportunity, setSelectedOpportunity] = useState<BrandOpportunity | null>(null);
  const [creatorProfileId, setCreatorProfileId] = useState<string | null>(null);
  const [appliedOpportunities, setAppliedOpportunities] = useState<string[]>([]);
  const [isCreator, setIsCreator] = useState<boolean | null>(null);
  const [isBrand, setIsBrand] = useState<boolean | null>(null);
  const [creatorMaxFollowers, setCreatorMaxFollowers] = useState<number>(0);

  useEffect(() => {
    checkUserAccess();
  }, []);

  const checkUserAccess = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      // Not logged in - redirect to login
      navigate("/login");
      return;
    }

    // Check for creator profile
    const { data: creatorProfile } = await supabase
      .from("creator_profiles")
      .select("id")
      .eq("user_id", user.id)
      .maybeSingle();

    // Check for brand profile
    const { data: brandProfile } = await supabase
      .from("brand_profiles")
      .select("id")
      .eq("user_id", user.id)
      .maybeSingle();

    setIsCreator(!!creatorProfile);
    setIsBrand(!!brandProfile);

    if (creatorProfile) {
      setCreatorProfileId(creatorProfile.id);
      
      // Fetch creator's social accounts to get max follower count
      const { data: socialAccounts } = await supabase
        .from("creator_social_accounts")
        .select("follower_count")
        .eq("creator_profile_id", creatorProfile.id);
      
      if (socialAccounts && socialAccounts.length > 0) {
        const maxFollowers = Math.max(
          ...socialAccounts.map(a => Number(a.follower_count) || 0)
        );
        setCreatorMaxFollowers(maxFollowers);
      }
      
      // Fetch applied opportunities
      const { data: applications } = await supabase
        .from("opportunity_applications")
        .select("opportunity_id")
        .eq("creator_profile_id", creatorProfile.id);
      
      if (applications) {
        setAppliedOpportunities(applications.map(a => a.opportunity_id));
      }
      // Fetch opportunities only for creators
      fetchOpportunities();
    } else if (brandProfile) {
      // Brand only - redirect to their dashboard
      navigate("/brand-dashboard?tab=opportunities");
      return;
    }

    setAuthLoading(false);
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

  // Show loading state while checking auth
  if (authLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </main>
      </div>
    );
  }

  // If not a creator and not a brand, prompt to create profile
  if (!isCreator && !isBrand) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <main className="flex-1 py-8">
          <div className="container mx-auto px-4 max-w-md text-center">
            <Card>
              <CardContent className="py-12">
                <Briefcase className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Creator Profile Required</h3>
                <p className="text-muted-foreground mb-6">
                  You need a creator profile to browse and apply to opportunities.
                </p>
                <Button onClick={() => navigate("/creator-signup")}>
                  Become a Creator
                </Button>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    );
  }

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

          {/* Filters - Mobile Responsive */}
          <Card className="mb-6">
            <CardContent className="pt-4 sm:pt-6">
              <div className="flex flex-col gap-3 sm:gap-4">
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search opportunities..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 h-11"
                  />
                </div>
                
                {/* Package Select + Toggles */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <Select value={selectedPackageType} onValueChange={setSelectedPackageType}>
                    <SelectTrigger className="w-full sm:w-[200px] h-11">
                      <SelectValue placeholder="Package Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Packages</SelectItem>
                      {Object.entries(EVENT_PACKAGES).map(([key, pkg]) => (
                        <SelectItem key={key} value={key}>{pkg.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <div className="flex items-center gap-4 flex-wrap">
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
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              {filteredOpportunities.map((opportunity) => {
                const hasApplied = appliedOpportunities.includes(opportunity.id);
                const spotsLeft = opportunity.spots_available - opportunity.spots_filled;
                const packageInfo = opportunity.package_type 
                  ? EVENT_PACKAGES[opportunity.package_type as PackageType] 
                  : null;
                
                const hasFollowerRequirement = opportunity.follower_ranges && opportunity.follower_ranges.length > 0;
                const enforceRange = (opportunity as any).enforce_follower_range !== false;
                const isEligible = !enforceRange || checkFollowerEligibility(creatorMaxFollowers, opportunity.follower_ranges);
                const combinedRange = getCombinedRange(opportunity.follower_ranges);

                return (
                  <Card key={opportunity.id} className="flex flex-col hover:shadow-md transition-shadow">
                    <CardHeader className="p-4 pb-2">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <ProfileAvatar
                            src={opportunity.brand_profiles?.logo_url}
                            fallbackName={opportunity.brand_profiles?.company_name || "B"}
                            className="h-9 w-9 shrink-0"
                            fallbackClassName="text-xs"
                          />
                          <div className="min-w-0">
                            <CardTitle className="text-base truncate">{opportunity.title}</CardTitle>
                            <CardDescription className="truncate mt-0.5 text-xs">
                              {opportunity.brand_profiles?.venue_name || opportunity.brand_profiles?.company_name}
                            </CardDescription>
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          {packageInfo && (
                            <Badge 
                              variant="outline" 
                              className={`text-[10px] px-1.5 py-0 ${getPackageBadgeColor(opportunity.package_type)}`}
                            >
                              {packageInfo.name}
                            </Badge>
                          )}
                          <Badge 
                            variant="outline" 
                            className={`text-[10px] px-1.5 py-0 ${opportunity.is_paid 
                              ? "bg-green-500/10 text-green-600 border-green-500/20" 
                              : "bg-amber-500/10 text-amber-600 border-amber-500/20"
                            }`}
                          >
                            {opportunity.is_paid ? "Paid" : "Free"}
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="flex-1 flex flex-col px-4 pb-4 pt-0">
                      {/* Details */}
                      <div className="space-y-1.5 text-xs mb-3">
                        <div className="flex items-center gap-1.5 text-muted-foreground">
                          <Calendar className="h-3.5 w-3.5 shrink-0" />
                          <span>
                            {format(new Date(opportunity.event_date), "MMM d, yyyy")}
                            {opportunity.start_time && ` · ${opportunity.start_time.slice(0, 5)}`}
                          </span>
                        </div>
                        
                        {(opportunity.location_city || opportunity.location_country) && (
                          <div className="flex items-center gap-1.5 text-muted-foreground">
                            <MapPin className="h-3.5 w-3.5 shrink-0" />
                            <span>{[opportunity.location_city, opportunity.location_country].filter(Boolean).join(", ")}</span>
                          </div>
                        )}

                        <div className="flex items-center gap-1.5 text-muted-foreground flex-wrap">
                          <Users className="h-3.5 w-3.5 shrink-0" />
                          <span>
                            {spotsLeft > 0 
                              ? `${spotsLeft} spot${spotsLeft !== 1 ? 's' : ''} left`
                              : 'Full'
                            }
                          </span>
                          {opportunity.is_paid && opportunity.budget_cents && (
                            <>
                              <span className="text-muted-foreground/40">·</span>
                              <span className="font-medium text-foreground">
                                ${(opportunity.budget_cents / 100).toFixed(0)}/creator
                              </span>
                            </>
                          )}
                          {hasFollowerRequirement && (
                            <>
                              <span className="text-muted-foreground/40">·</span>
                              <span>{formatFollowerCount(combinedRange?.min || 0)}+ followers</span>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Eligibility Warning - compact inline */}
                      {!isEligible && hasFollowerRequirement && enforceRange && (
                        <p className="text-[11px] text-destructive mb-3 flex items-center gap-1">
                          <AlertCircle className="h-3 w-3 shrink-0" />
                          Your followers ({formatFollowerCount(creatorMaxFollowers)}) don't meet requirements
                        </p>
                      )}

                      {/* Apply Button */}
                      <div className="mt-auto pt-3 border-t">
                        {hasApplied ? (
                          <Button variant="outline" size="sm" className="w-full h-9" disabled>
                            Applied
                          </Button>
                        ) : spotsLeft === 0 ? (
                          <Button variant="outline" size="sm" className="w-full h-9" disabled>
                            Filled
                          </Button>
                        ) : !isEligible ? (
                          <Button variant="outline" size="sm" className="w-full h-9" disabled>
                            Not Eligible
                          </Button>
                        ) : (
                          <Button 
                            size="sm"
                            className="w-full h-9" 
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
