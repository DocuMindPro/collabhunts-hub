import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { Check, X, MessageSquare, DollarSign, Link as LinkIcon, ExternalLink, Clock } from "lucide-react";
import { Link } from "react-router-dom";

interface Application {
  id: string;
  opportunity_id: string;
  creator_profile_id: string;
  message: string | null;
  proposed_price_cents: number | null;
  status: string;
  delivery_links: string[] | null;
  delivered_at: string | null;
  confirmed_at: string | null;
  created_at: string;
  creator_profiles?: {
    id: string;
    display_name: string;
    profile_image_url: string | null;
    categories: string[] | null;
  };
}

interface OpportunityApplicationsDialogProps {
  opportunityId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate: () => void;
}

const OpportunityApplicationsDialog = ({
  opportunityId,
  open,
  onOpenChange,
  onUpdate,
}: OpportunityApplicationsDialogProps) => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (open) {
      fetchApplications();
    }
  }, [open, opportunityId]);

  const fetchApplications = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("opportunity_applications")
      .select(`
        *,
        creator_profiles (
          id,
          display_name,
          profile_image_url,
          categories
        )
      `)
      .eq("opportunity_id", opportunityId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching applications:", error);
      toast({
        title: "Error",
        description: "Failed to load applications",
        variant: "destructive",
      });
    } else {
      setApplications(data || []);
    }
    setLoading(false);
  };

  const updateApplicationStatus = async (applicationId: string, newStatus: string) => {
    const { error } = await supabase
      .from("opportunity_applications")
      .update({ status: newStatus })
      .eq("id", applicationId);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to update application status",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Updated",
        description: `Application ${newStatus}`,
      });
      fetchApplications();
      onUpdate();
    }
  };

  const confirmDelivery = async (applicationId: string) => {
    const { error } = await supabase
      .from("opportunity_applications")
      .update({ confirmed_at: new Date().toISOString() })
      .eq("id", applicationId);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to confirm delivery",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Delivery Confirmed!",
        description: "The creator's work has been confirmed.",
      });
      fetchApplications();
      onUpdate();
    }
  };

  const getStatusBadge = (application: Application) => {
    if (application.confirmed_at) {
      return <Badge className="bg-purple-500/10 text-purple-600 border-purple-500/20">Confirmed</Badge>;
    }
    if (application.delivered_at) {
      return <Badge className="bg-blue-500/10 text-blue-600 border-blue-500/20">Delivered</Badge>;
    }
    switch (application.status) {
      case 'pending':
        return <Badge variant="outline">Pending</Badge>;
      case 'accepted':
        return <Badge className="bg-green-500/10 text-green-600 border-green-500/20">Accepted</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Rejected</Badge>;
      case 'withdrawn':
        return <Badge variant="secondary">Withdrawn</Badge>;
      default:
        return <Badge variant="outline">{application.status}</Badge>;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] sm:max-w-[700px] max-h-[80vh] sm:max-h-[85vh] overflow-y-auto p-4 sm:p-6">
        <DialogHeader>
          <DialogTitle>Applications</DialogTitle>
          <DialogDescription>
            Review and manage creator applications for this opportunity.
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="space-y-4">
            {[1, 2].map(i => (
              <Card key={i} className="animate-pulse">
                <CardContent className="py-4">
                  <div className="h-16 bg-muted rounded" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : applications.length === 0 ? (
          <div className="py-8 text-center text-muted-foreground">
            No applications yet. Share your opportunity to attract creators!
          </div>
        ) : (
          <div className="space-y-4">
            {applications.map((application) => (
              <Card key={application.id}>
                <CardContent className="py-4">
                  {/* Creator Info */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={application.creator_profiles?.profile_image_url || undefined} />
                        <AvatarFallback>
                          {application.creator_profiles?.display_name?.charAt(0) || "?"}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <Link 
                          to={`/creator/${application.creator_profile_id}`}
                          className="font-medium hover:underline"
                        >
                          {application.creator_profiles?.display_name || "Unknown Creator"}
                        </Link>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          Applied {format(new Date(application.created_at), "MMM d, yyyy")}
                        </div>
                      </div>
                    </div>
                    {getStatusBadge(application)}
                  </div>

                  {/* Categories */}
                  {application.creator_profiles?.categories && application.creator_profiles.categories.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-3">
                      {application.creator_profiles.categories.slice(0, 3).map((cat) => (
                        <Badge key={cat} variant="secondary" className="text-xs">
                          {cat}
                        </Badge>
                      ))}
                    </div>
                  )}

                  {/* Message */}
                  {application.message && (
                    <div className="bg-muted/50 rounded-lg p-3 mb-3">
                      <p className="text-sm">{application.message}</p>
                    </div>
                  )}

                  {/* Proposed Price */}
                  {application.proposed_price_cents && (
                    <div className="flex items-center gap-1 text-sm mb-3">
                      <DollarSign className="h-4 w-4 text-green-600" />
                      <span className="font-medium">
                        Proposed rate: ${(application.proposed_price_cents / 100).toFixed(0)}
                      </span>
                    </div>
                  )}

                  {/* Delivery Links */}
                  {application.delivered_at && application.delivery_links && application.delivery_links.length > 0 && (
                    <div className="mb-3">
                      <Separator className="my-3" />
                      <div className="flex items-center gap-1 text-sm font-medium mb-2">
                        <LinkIcon className="h-4 w-4" />
                        Delivered Content
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

                  {/* Actions - Mobile Responsive */}
                  <div className="flex flex-col sm:flex-row flex-wrap gap-2 mt-3">
                    {application.status === 'pending' && (
                      <>
                        <Button
                          size="sm"
                          onClick={() => updateApplicationStatus(application.id, 'accepted')}
                          className="gap-1 w-full sm:w-auto"
                        >
                          <Check className="h-3 w-3" />
                          Accept
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateApplicationStatus(application.id, 'rejected')}
                          className="gap-1 w-full sm:w-auto"
                        >
                          <X className="h-3 w-3" />
                          Reject
                        </Button>
                      </>
                    )}
                    
                    {application.status === 'accepted' && application.delivered_at && !application.confirmed_at && (
                      <Button
                        size="sm"
                        onClick={() => confirmDelivery(application.id)}
                        className="gap-1 w-full sm:w-auto"
                      >
                        <Check className="h-3 w-3" />
                        Confirm Delivery
                      </Button>
                    )}

                    <Button
                      size="sm"
                      variant="ghost"
                      asChild
                      className="w-full sm:w-auto"
                    >
                      <Link to={`/creator/${application.creator_profile_id}`}>
                        View Profile
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default OpportunityApplicationsDialog;
