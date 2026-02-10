import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { Calendar, DollarSign, Gift, Building2, ExternalLink, Search, Link as LinkIcon, Sparkles, ArrowRight } from "lucide-react";
import { EVENT_PACKAGES, PackageType } from "@/config/packages";
import SubmitDeliveryDialog from "./SubmitDeliveryDialog";

interface Application {
  id: string;
  opportunity_id: string;
  message: string | null;
  proposed_price_cents: number | null;
  status: string;
  delivery_links: string[] | null;
  delivered_at: string | null;
  confirmed_at: string | null;
  created_at: string;
  brand_opportunities?: {
    id: string;
    title: string;
    package_type: string | null;
    event_date: string;
    is_paid: boolean;
    budget_cents: number | null;
    brand_profiles?: {
      company_name: string;
      venue_name: string | null;
    };
  };
}

interface OpportunitiesTabProps {
  creatorProfileId: string;
}

interface NewestOpportunity {
  id: string;
  title: string;
  package_type: string | null;
  event_date: string;
  is_paid: boolean;
  budget_cents: number | null;
  brand_profiles: {
    company_name: string;
    venue_name: string | null;
  } | null;
}

const OpportunitiesTab = ({ creatorProfileId }: OpportunitiesTabProps) => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [newestOpportunities, setNewestOpportunities] = useState<NewestOpportunity[]>([]);

  useEffect(() => {
    fetchApplications();
    fetchNewestOpportunities();
  }, [creatorProfileId]);

  const fetchNewestOpportunities = async () => {
    const { data } = await supabase
      .from("brand_opportunities")
      .select("id, title, package_type, event_date, is_paid, budget_cents, brand_profiles(company_name, venue_name)")
      .eq("status", "open")
      .gte("event_date", new Date().toISOString().split('T')[0])
      .order("created_at", { ascending: false })
      .limit(3);
    setNewestOpportunities((data as unknown as NewestOpportunity[]) || []);
  };

  const fetchApplications = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("opportunity_applications")
      .select(`
        *,
        brand_opportunities (
          id,
          title,
          package_type,
          event_date,
          is_paid,
          budget_cents,
          brand_profiles (
            company_name,
            venue_name
          )
        )
      `)
      .eq("creator_profile_id", creatorProfileId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching applications:", error);
      toast({
        title: "Error",
        description: "Failed to load your applications",
        variant: "destructive",
      });
    } else {
      setApplications(data || []);
    }
    setLoading(false);
  };

  const handleDeliverySuccess = () => {
    setSelectedApplication(null);
    fetchApplications();
  };

  const withdrawApplication = async (applicationId: string) => {
    const { error } = await supabase
      .from("opportunity_applications")
      .update({ status: 'withdrawn' })
      .eq("id", applicationId);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to withdraw application",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Application Withdrawn",
        description: "Your application has been withdrawn.",
      });
      fetchApplications();
    }
  };

  const getStatusBadge = (application: Application) => {
    if (application.confirmed_at) {
      return <Badge className="bg-purple-500/10 text-purple-600 border-purple-500/20">Completed</Badge>;
    }
    if (application.delivered_at) {
      return <Badge className="bg-blue-500/10 text-blue-600 border-blue-500/20">Awaiting Confirmation</Badge>;
    }
    switch (application.status) {
      case 'pending':
        return <Badge variant="outline">Pending Review</Badge>;
      case 'accepted':
        return <Badge className="bg-green-500/10 text-green-600 border-green-500/20">Accepted</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Not Selected</Badge>;
      case 'withdrawn':
        return <Badge variant="secondary">Withdrawn</Badge>;
      default:
        return <Badge variant="outline">{application.status}</Badge>;
    }
  };

  const filteredApplications = applications.filter(app => {
    if (activeTab === "all") return true;
    if (activeTab === "pending") return app.status === "pending";
    if (activeTab === "accepted") return app.status === "accepted" && !app.confirmed_at;
    if (activeTab === "completed") return app.confirmed_at;
    return true;
  });

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2].map(i => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-6 bg-muted rounded w-1/2" />
            </CardHeader>
            <CardContent>
              <div className="h-16 bg-muted rounded" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Newest Opportunities Inline Preview */}
      {newestOpportunities.length > 0 && (
        <Card className="border-primary/20">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                Fresh Opportunities
              </CardTitle>
              <Button asChild size="sm" className="gap-1">
                <Link to="/opportunities">
                  Browse All <ArrowRight className="h-3 w-3" />
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2 sm:grid-cols-3">
              {newestOpportunities.map((opp) => {
                const packageInfo = opp.package_type ? EVENT_PACKAGES[opp.package_type as PackageType] : null;
                return (
                  <Link
                    key={opp.id}
                    to="/opportunities"
                    className="p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors"
                  >
                    <p className="font-medium text-sm truncate">{opp.title}</p>
                    <p className="text-xs text-muted-foreground mt-1 truncate">
                      {opp.brand_profiles?.venue_name || opp.brand_profiles?.company_name}
                    </p>
                    <div className="flex items-center justify-between mt-2">
                      {packageInfo && (
                        <Badge variant="outline" className="text-[10px] px-1.5 py-0">{packageInfo.name}</Badge>
                      )}
                      <span className="text-xs text-muted-foreground">
                        {format(new Date(opp.event_date), "MMM d")}
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">My Applications</h2>
          <p className="text-muted-foreground">Track your opportunity applications</p>
        </div>
        <Button asChild>
          <Link to="/opportunities" className="gap-2">
            <Search className="h-4 w-4" />
            Browse Opportunities
          </Link>
        </Button>
      </div>

      {/* Filter Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">All ({applications.length})</TabsTrigger>
          <TabsTrigger value="pending">
            Pending ({applications.filter(a => a.status === 'pending').length})
          </TabsTrigger>
          <TabsTrigger value="accepted">
            Active ({applications.filter(a => a.status === 'accepted' && !a.confirmed_at).length})
          </TabsTrigger>
          <TabsTrigger value="completed">
            Completed ({applications.filter(a => a.confirmed_at).length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-4">
          {filteredApplications.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Search className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                  {activeTab === "all" 
                    ? "No Applications Yet" 
                    : `No ${activeTab} Applications`}
                </h3>
                <p className="text-muted-foreground mb-4">
                  Discover and apply to brand opportunities.
                </p>
                <Button asChild>
                  <Link to="/opportunities">Browse Opportunities</Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredApplications.map((application) => {
                const opportunity = application.brand_opportunities;
                const packageInfo = opportunity?.package_type 
                  ? EVENT_PACKAGES[opportunity.package_type as PackageType] 
                  : null;

                return (
                  <Card key={application.id}>
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-lg">
                            {opportunity?.title || "Unknown Opportunity"}
                          </CardTitle>
                          <CardDescription className="flex items-center gap-1 mt-1">
                            <Building2 className="h-3 w-3" />
                            {opportunity?.brand_profiles?.venue_name || opportunity?.brand_profiles?.company_name}
                          </CardDescription>
                        </div>
                        {getStatusBadge(application)}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-4 text-sm mb-4">
                        {packageInfo && (
                          <Badge variant="outline">{packageInfo.name}</Badge>
                        )}
                        {opportunity?.event_date && (
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <Calendar className="h-4 w-4" />
                            {format(new Date(opportunity.event_date), "MMM d, yyyy")}
                          </div>
                        )}
                        <div className="flex items-center gap-1">
                          {opportunity?.is_paid ? (
                            <>
                              <DollarSign className="h-4 w-4 text-green-600" />
                              <span className="text-green-600">
                                {application.proposed_price_cents 
                                  ? `$${(application.proposed_price_cents / 100).toFixed(0)} proposed`
                                  : opportunity?.budget_cents 
                                    ? `$${(opportunity.budget_cents / 100).toFixed(0)}`
                                    : "Paid"
                                }
                              </span>
                            </>
                          ) : (
                            <>
                              <Gift className="h-4 w-4 text-amber-600" />
                              <span className="text-amber-600">Free Invite</span>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Delivery Links (if submitted) */}
                      {application.delivered_at && application.delivery_links && application.delivery_links.length > 0 && (
                        <div className="bg-muted/50 rounded-lg p-3 mb-4">
                          <div className="flex items-center gap-1 text-sm font-medium mb-2">
                            <LinkIcon className="h-4 w-4" />
                            Submitted Content
                          </div>
                          <div className="space-y-1">
                            {application.delivery_links.map((link, idx) => (
                              <a
                                key={idx}
                                href={link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-1 text-sm text-primary hover:underline"
                              >
                                <ExternalLink className="h-3 w-3" />
                                {link.length > 50 ? link.slice(0, 50) + "..." : link}
                              </a>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex flex-wrap gap-2">
                        {application.status === 'pending' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => withdrawApplication(application.id)}
                          >
                            Withdraw Application
                          </Button>
                        )}

                        {application.status === 'accepted' && !application.delivered_at && (
                          <Button
                            size="sm"
                            onClick={() => setSelectedApplication(application)}
                          >
                            Submit Delivery
                          </Button>
                        )}

                        {application.delivered_at && !application.confirmed_at && (
                          <p className="text-sm text-muted-foreground">
                            Waiting for brand to confirm delivery...
                          </p>
                        )}

                        {application.confirmed_at && (
                          <p className="text-sm text-green-600 font-medium">
                            ✓ Delivery confirmed on {format(new Date(application.confirmed_at), "MMM d, yyyy")}
                          </p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Submit Delivery Dialog */}
      {selectedApplication && (
        <SubmitDeliveryDialog
          applicationId={selectedApplication.id}
          opportunityTitle={selectedApplication.brand_opportunities?.title || "Opportunity"}
          open={!!selectedApplication}
          onOpenChange={(open) => !open && setSelectedApplication(null)}
          onSuccess={handleDeliverySuccess}
        />
      )}
    </div>
  );
};

export default OpportunitiesTab;
