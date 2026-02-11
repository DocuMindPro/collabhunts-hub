import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { format, formatDistanceToNow, isPast, differenceInDays } from "date-fns";
import {
  Plus, Calendar, Users, DollarSign, Gift, Eye, MoreHorizontal, Briefcase,
  MapPin, Clock, Sparkles, Target, Package, AlertTriangle, CheckCircle2,
} from "lucide-react";
import { EVENT_PACKAGES, PackageType } from "@/config/packages";
import { formatFollowerRanges } from "@/config/follower-ranges";
import CreateOpportunityDialog from "./CreateOpportunityDialog";
import OpportunityApplicationsDialog from "./OpportunityApplicationsDialog";
import FeatureLockedCard from "./FeatureLockedCard";
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
  start_time: string | null;
  end_time: string | null;
  is_paid: boolean;
  budget_cents: number | null;
  spots_available: number;
  spots_filled: number;
  status: string;
  application_deadline: string | null;
  location_city: string | null;
  location_country: string | null;
  is_featured: boolean | null;
  follower_ranges: string[] | null;
  requirements: string | null;
  views_count: number;
  created_at: string;
  applications_count?: number;
}

interface BrandOpportunitiesTabProps {
  brandProfileId: string;
  registrationCompleted?: boolean;
}

const PACKAGE_ACCENT: Record<string, string> = {
  social_boost: "border-l-blue-500",
  meet_greet: "border-l-purple-500",
  unbox_review: "border-l-orange-500",
  competition: "border-l-pink-500",
  custom: "border-l-muted-foreground",
};

const BrandOpportunitiesTab = ({ brandProfileId, registrationCompleted = true }: BrandOpportunitiesTabProps) => {
  const [opportunities, setOpportunities] = useState<BrandOpportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [selectedOpportunityId, setSelectedOpportunityId] = useState<string | null>(null);

  useEffect(() => {
    fetchOpportunities();
  }, [brandProfileId]);

  const fetchOpportunities = async () => {
    setLoading(true);

    const { data: opps, error } = await supabase
      .from("brand_opportunities")
      .select("*")
      .eq("brand_profile_id", brandProfileId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching opportunities:", error);
      toast({ title: "Error", description: "Failed to load opportunities", variant: "destructive" });
      setLoading(false);
      return;
    }

    if (opps && opps.length > 0) {
      const opportunityIds = opps.map((o) => o.id);
      const { data: appCounts } = await supabase
        .from("opportunity_applications")
        .select("opportunity_id")
        .in("opportunity_id", opportunityIds);

      const countMap: Record<string, number> = {};
      appCounts?.forEach((app) => {
        countMap[app.opportunity_id] = (countMap[app.opportunity_id] || 0) + 1;
      });

      setOpportunities(
        opps.map((opp) => ({
          ...opp,
          applications_count: countMap[opp.id] || 0,
        }))
      );
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
      toast({ title: "Error", description: "Failed to update status", variant: "destructive" });
    } else {
      toast({ title: "Status Updated", description: `Opportunity marked as ${newStatus}` });
      fetchOpportunities();
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "open":
        return <Badge className="bg-green-500/10 text-green-600 border-green-500/20 text-[10px] px-1.5 py-0">Open</Badge>;
      case "filled":
        return <Badge className="bg-blue-500/10 text-blue-600 border-blue-500/20 text-[10px] px-1.5 py-0">Filled</Badge>;
      case "completed":
        return <Badge className="bg-purple-500/10 text-purple-600 border-purple-500/20 text-[10px] px-1.5 py-0">Completed</Badge>;
      case "cancelled":
        return <Badge variant="destructive" className="text-[10px] px-1.5 py-0">Cancelled</Badge>;
      default:
        return <Badge variant="outline" className="text-[10px] px-1.5 py-0">{status}</Badge>;
    }
  };

  const getDeadlineBadge = (deadline: string | null) => {
    if (!deadline) return null;
    const deadlineDate = new Date(deadline);
    if (isPast(deadlineDate)) {
      return (
        <span className="inline-flex items-center gap-1 text-[11px] text-destructive">
          <AlertTriangle className="h-3 w-3" />
          Deadline passed
        </span>
      );
    }
    const daysLeft = differenceInDays(deadlineDate, new Date());
    if (daysLeft <= 3) {
      return (
        <span className="inline-flex items-center gap-1 text-[11px] text-amber-600">
          <Clock className="h-3 w-3" />
          {daysLeft === 0 ? "Closes today" : `${daysLeft}d left`}
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground">
        <Clock className="h-3 w-3" />
        Closes {format(deadlineDate, "MMM d")}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader><div className="h-6 bg-muted rounded w-1/2" /></CardHeader>
            <CardContent><div className="h-24 bg-muted rounded" /></CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!registrationCompleted) {
    return (
      <FeatureLockedCard 
        title="Opportunities Locked" 
        description="Complete your brand registration to post opportunities and attract creators." 
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
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

      {/* Empty State */}
      {opportunities.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Briefcase className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Opportunities Yet</h3>
            <p className="text-muted-foreground mb-4">Post your first opportunity to attract creators for your events.</p>
            <Button onClick={() => setCreateDialogOpen(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              Post Opportunity
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {opportunities.map((opp) => {
            const packageInfo = opp.package_type ? EVENT_PACKAGES[opp.package_type as PackageType] : null;
            const spotsLeft = opp.spots_available - opp.spots_filled;
            const spotsFillPercent = opp.spots_available > 0 ? (opp.spots_filled / opp.spots_available) * 100 : 0;
            const accentClass = opp.package_type ? PACKAGE_ACCENT[opp.package_type] || "border-l-muted-foreground" : "border-l-muted-foreground";
            const location = [opp.location_city, opp.location_country].filter(Boolean).join(", ");
            const deliverables = packageInfo?.includes?.slice(0, 2) || [];

            return (
              <Card
                key={opp.id}
                className={`border-l-4 ${accentClass} ${opp.is_featured ? "ring-1 ring-amber-400/40 shadow-amber-100/20" : ""}`}
              >
                <CardHeader className="p-4 pb-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <CardTitle className="text-base">{opp.title}</CardTitle>
                        {getStatusBadge(opp.status)}
                        {opp.is_featured && (
                          <Badge className="bg-gradient-to-r from-amber-400 to-yellow-500 text-white border-0 text-[10px] px-1.5 py-0">
                            <Sparkles className="h-2.5 w-2.5 mr-0.5" />
                            Featured
                          </Badge>
                        )}
                      </div>
                      <CardDescription className="text-xs flex items-center gap-1.5 flex-wrap">
                        {packageInfo && (
                          <>
                            <Package className="h-3 w-3" />
                            <span>{packageInfo.name}</span>
                          </>
                        )}
                        {location && (
                          <>
                            <span className="text-muted-foreground/40">·</span>
                            <MapPin className="h-3 w-3" />
                            <span>{location}</span>
                          </>
                        )}
                        <span className="text-muted-foreground/40">·</span>
                        <Calendar className="h-3 w-3" />
                        <span>
                          {format(new Date(opp.event_date), "MMM d, yyyy")}
                          {opp.start_time && ` ${opp.start_time.slice(0, 5)}`}
                          {opp.end_time && ` – ${opp.end_time.slice(0, 5)}`}
                        </span>
                      </CardDescription>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => setSelectedOpportunityId(opp.id)}>
                          <Eye className="h-4 w-4 mr-2" />
                          View Applications
                        </DropdownMenuItem>
                        {opp.status === "open" && (
                          <>
                            <DropdownMenuItem onClick={() => handleStatusChange(opp.id, "filled")}>
                              Mark as Filled
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleStatusChange(opp.id, "cancelled")}>
                              Cancel
                            </DropdownMenuItem>
                          </>
                        )}
                        {opp.status === "filled" && (
                          <DropdownMenuItem onClick={() => handleStatusChange(opp.id, "completed")}>
                            <CheckCircle2 className="h-4 w-4 mr-2" />
                            Mark as Completed
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>

                <CardContent className="px-4 pb-4 pt-0 space-y-3">
                  {/* Description preview */}
                  {opp.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2">{opp.description}</p>
                  )}

                  {/* Deliverables + Follower pills */}
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {deliverables.map((d, i) => (
                      <span
                        key={i}
                        className="inline-flex items-center text-[11px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground"
                      >
                        {d}
                      </span>
                    ))}
                    {opp.follower_ranges && opp.follower_ranges.length > 0 && (
                      <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-violet-500/10 text-violet-600">
                        <Target className="h-2.5 w-2.5" />
                        {formatFollowerRanges(opp.follower_ranges)}
                      </span>
                    )}
                  </div>

                  {/* Stats grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    <div className="flex items-center gap-2 rounded-lg bg-muted/50 px-3 py-2">
                      <Eye className="h-3.5 w-3.5 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-semibold leading-none">{opp.views_count ?? 0}</p>
                        <p className="text-[10px] text-muted-foreground">Views</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 rounded-lg bg-muted/50 px-3 py-2">
                      <Users className="h-3.5 w-3.5 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-semibold leading-none">{opp.applications_count || 0}</p>
                        <p className="text-[10px] text-muted-foreground">Applications</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 rounded-lg bg-muted/50 px-3 py-2">
                      <Briefcase className="h-3.5 w-3.5 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-semibold leading-none">{spotsLeft}<span className="text-muted-foreground font-normal">/{opp.spots_available}</span></p>
                        <p className="text-[10px] text-muted-foreground">Spots Left</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 rounded-lg bg-muted/50 px-3 py-2">
                      {opp.is_paid ? (
                        <>
                          <DollarSign className="h-3.5 w-3.5 text-green-600" />
                          <div>
                            <p className="text-sm font-semibold leading-none text-green-600">${(opp.budget_cents || 0) / 100}</p>
                            <p className="text-[10px] text-muted-foreground">Per Creator</p>
                          </div>
                        </>
                      ) : (
                        <>
                          <Gift className="h-3.5 w-3.5 text-amber-600" />
                          <div>
                            <p className="text-sm font-semibold leading-none text-amber-600">Free</p>
                            <p className="text-[10px] text-muted-foreground">Invite</p>
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Spots progress bar */}
                  <div className="space-y-1">
                    <Progress value={spotsFillPercent} className="h-1.5" />
                    <p className="text-[10px] text-muted-foreground">
                      {opp.spots_filled} of {opp.spots_available} spots filled
                    </p>
                  </div>

                  {/* Footer: deadline + view apps button */}
                  <div className="flex items-center justify-between pt-1">
                    <div>{getDeadlineBadge(opp.application_deadline)}</div>
                    {(opp.applications_count ?? 0) > 0 && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 text-xs"
                        onClick={() => setSelectedOpportunityId(opp.id)}
                      >
                        <Eye className="h-3.5 w-3.5 mr-1.5" />
                        View {opp.applications_count} Application{opp.applications_count !== 1 ? "s" : ""}
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <CreateOpportunityDialog
        brandProfileId={brandProfileId}
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onSuccess={() => {
          setCreateDialogOpen(false);
          fetchOpportunities();
        }}
      />

      {selectedOpportunityId && (
        <OpportunityApplicationsDialog
          opportunityId={selectedOpportunityId}
          brandProfileId={brandProfileId}
          open={!!selectedOpportunityId}
          onOpenChange={(open) => !open && setSelectedOpportunityId(null)}
          onUpdate={fetchOpportunities}
        />
      )}
    </div>
  );
};

export default BrandOpportunitiesTab;
