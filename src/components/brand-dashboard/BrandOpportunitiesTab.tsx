import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { Plus, Calendar, Users, DollarSign, Gift, Eye, MoreHorizontal, Briefcase } from "lucide-react";
import { EVENT_PACKAGES, PackageType } from "@/config/packages";
import CreateOpportunityDialog from "./CreateOpportunityDialog";
import OpportunityApplicationsDialog from "./OpportunityApplicationsDialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface BrandOpportunity {
  id: string;
  title: string;
  description: string | null;
  package_type: string | null;
  event_date: string;
  is_paid: boolean;
  budget_cents: number | null;
  spots_available: number;
  spots_filled: number;
  status: string;
  application_deadline: string | null;
  created_at: string;
  applications_count?: number;
}

interface BrandOpportunitiesTabProps {
  brandProfileId: string;
}

const BrandOpportunitiesTab = ({ brandProfileId }: BrandOpportunitiesTabProps) => {
  const [opportunities, setOpportunities] = useState<BrandOpportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [selectedOpportunityId, setSelectedOpportunityId] = useState<string | null>(null);

  useEffect(() => {
    fetchOpportunities();
  }, [brandProfileId]);

  const fetchOpportunities = async () => {
    setLoading(true);
    
    // Fetch opportunities
    const { data: opps, error } = await supabase
      .from("brand_opportunities")
      .select("*")
      .eq("brand_profile_id", brandProfileId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching opportunities:", error);
      toast({
        title: "Error",
        description: "Failed to load opportunities",
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    // Fetch application counts for each opportunity
    if (opps && opps.length > 0) {
      const opportunityIds = opps.map(o => o.id);
      const { data: appCounts } = await supabase
        .from("opportunity_applications")
        .select("opportunity_id")
        .in("opportunity_id", opportunityIds);

      const countMap: Record<string, number> = {};
      appCounts?.forEach(app => {
        countMap[app.opportunity_id] = (countMap[app.opportunity_id] || 0) + 1;
      });

      const enrichedOpps = opps.map(opp => ({
        ...opp,
        applications_count: countMap[opp.id] || 0,
      }));

      setOpportunities(enrichedOpps);
    } else {
      setOpportunities([]);
    }

    setLoading(false);
  };

  const handleStatusChange = async (opportunityId: string, newStatus: string) => {
    const { error } = await supabase
      .from("brand_opportunities")
      .update({ status: newStatus })
      .eq("id", opportunityId);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to update status",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Status Updated",
        description: `Opportunity marked as ${newStatus}`,
      });
      fetchOpportunities();
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'open':
        return <Badge className="bg-green-500/10 text-green-600 border-green-500/20">Open</Badge>;
      case 'filled':
        return <Badge className="bg-blue-500/10 text-blue-600 border-blue-500/20">Filled</Badge>;
      case 'completed':
        return <Badge className="bg-purple-500/10 text-purple-600 border-purple-500/20">Completed</Badge>;
      case 'cancelled':
        return <Badge variant="destructive">Cancelled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2].map(i => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-6 bg-muted rounded w-1/2" />
            </CardHeader>
            <CardContent>
              <div className="h-20 bg-muted rounded" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Create Button - Mobile Responsive */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold">My Opportunities</h2>
          <p className="text-sm text-muted-foreground">Post opportunities for creators to apply</p>
        </div>
        <Button onClick={() => setCreateDialogOpen(true)} className="gap-2 w-full sm:w-auto">
          <Plus className="h-4 w-4" />
          Post Opportunity
        </Button>
      </div>

      {/* Opportunities List */}
      {opportunities.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Briefcase className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Opportunities Yet</h3>
            <p className="text-muted-foreground mb-4">
              Post your first opportunity to attract creators for your events.
            </p>
            <Button onClick={() => setCreateDialogOpen(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              Post Opportunity
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {opportunities.map((opportunity) => {
            const packageInfo = opportunity.package_type 
              ? EVENT_PACKAGES[opportunity.package_type as PackageType] 
              : null;
            const spotsLeft = opportunity.spots_available - opportunity.spots_filled;

            return (
              <Card key={opportunity.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        {opportunity.title}
                        {getStatusBadge(opportunity.status)}
                      </CardTitle>
                      <CardDescription className="mt-1">
                        {packageInfo?.name || "Custom"} • {format(new Date(opportunity.event_date), "MMM d, yyyy")}
                      </CardDescription>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => setSelectedOpportunityId(opportunity.id)}>
                          <Eye className="h-4 w-4 mr-2" />
                          View Applications
                        </DropdownMenuItem>
                        {opportunity.status === 'open' && (
                          <>
                            <DropdownMenuItem onClick={() => handleStatusChange(opportunity.id, 'filled')}>
                              Mark as Filled
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleStatusChange(opportunity.id, 'cancelled')}>
                              Cancel
                            </DropdownMenuItem>
                          </>
                        )}
                        {opportunity.status === 'filled' && (
                          <DropdownMenuItem onClick={() => handleStatusChange(opportunity.id, 'completed')}>
                            Mark as Completed
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-4 text-sm">
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Users className="h-4 w-4" />
                      <span>{opportunity.applications_count || 0} applications</span>
                    </div>
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span>{spotsLeft} of {opportunity.spots_available} spots left</span>
                    </div>
                    <div className="flex items-center gap-1">
                      {opportunity.is_paid ? (
                        <>
                          <DollarSign className="h-4 w-4 text-green-600" />
                          <span className="text-green-600 font-medium">
                            ${(opportunity.budget_cents || 0) / 100} per creator
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

                  {opportunity.applications_count && opportunity.applications_count > 0 ? (
                    <Button 
                      variant="outline" 
                      className="mt-4"
                      onClick={() => setSelectedOpportunityId(opportunity.id)}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      View {opportunity.applications_count} Application{opportunity.applications_count !== 1 ? 's' : ''}
                    </Button>
                  ) : null}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Create Dialog */}
      <CreateOpportunityDialog
        brandProfileId={brandProfileId}
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onSuccess={() => {
          setCreateDialogOpen(false);
          fetchOpportunities();
        }}
      />

      {/* Applications Dialog */}
      {selectedOpportunityId && (
        <OpportunityApplicationsDialog
          opportunityId={selectedOpportunityId}
          open={!!selectedOpportunityId}
          onOpenChange={(open) => !open && setSelectedOpportunityId(null)}
          onUpdate={fetchOpportunities}
        />
      )}
    </div>
  );
};

export default BrandOpportunitiesTab;
