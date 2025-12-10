import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { toast } from "sonner";
import { format, formatDistanceToNow, isPast } from "date-fns";
import { 
  Gavel, Clock, AlertTriangle, CheckCircle, DollarSign, RefreshCcw,
  MessageSquare, User, Building2, Calendar, FileText
} from "lucide-react";

interface Dispute {
  id: string;
  booking_id: string;
  opened_by_user_id: string;
  opened_by_role: string;
  reason: string;
  evidence_description: string | null;
  status: string;
  response_text: string | null;
  response_submitted_at: string | null;
  admin_notes: string | null;
  admin_decision_reason: string | null;
  resolved_at: string | null;
  refund_percentage: number | null;
  response_deadline: string;
  resolution_deadline: string | null;
  created_at: string;
  bookings: {
    id: string;
    total_price_cents: number;
    status: string;
    message: string | null;
    creator_profiles: {
      display_name: string;
      user_id: string;
    };
    brand_profiles: {
      company_name: string;
      user_id: string;
    };
    creator_services: {
      service_type: string;
    } | null;
  };
}

const AdminDisputesTab = () => {
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");
  const [selectedDispute, setSelectedDispute] = useState<Dispute | null>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [resolveDialogOpen, setResolveDialogOpen] = useState(false);
  const [adminNotes, setAdminNotes] = useState("");
  const [decisionReason, setDecisionReason] = useState("");
  const [refundPercentage, setRefundPercentage] = useState(50);
  const [resolutionType, setResolutionType] = useState<string>("release");
  const [resolving, setResolving] = useState(false);

  useEffect(() => {
    fetchDisputes();
  }, []);

  const fetchDisputes = async () => {
    try {
      const { data, error } = await supabase
        .from("booking_disputes")
        .select(`
          *,
          bookings!inner(
            id,
            total_price_cents,
            status,
            message,
            creator_profiles!inner(display_name, user_id),
            brand_profiles!inner(company_name, user_id),
            creator_services(service_type)
          )
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setDisputes(data || []);
    } catch (error) {
      console.error("Error fetching disputes:", error);
      toast.error("Failed to load disputes");
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending_response": return "bg-yellow-500";
      case "pending_admin_review": return "bg-blue-500";
      case "resolved_refund": return "bg-red-500";
      case "resolved_release": return "bg-green-500";
      case "resolved_split": return "bg-purple-500";
      case "cancelled": return "bg-gray-500";
      default: return "bg-gray-500";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "pending_response": return "Awaiting Response";
      case "pending_admin_review": return "Ready for Review";
      case "resolved_refund": return "Refunded";
      case "resolved_release": return "Released";
      case "resolved_split": return "Split";
      case "cancelled": return "Cancelled";
      default: return status;
    }
  };

  const isOverdue = (dispute: Dispute) => {
    if (dispute.status === "pending_response") {
      return isPast(new Date(dispute.response_deadline));
    }
    if (dispute.status === "pending_admin_review" && dispute.resolution_deadline) {
      return isPast(new Date(dispute.resolution_deadline));
    }
    return false;
  };

  const filteredDisputes = disputes.filter(d => {
    if (filter === "all") return true;
    if (filter === "pending") return d.status === "pending_response" || d.status === "pending_admin_review";
    if (filter === "review") return d.status === "pending_admin_review";
    if (filter === "resolved") return d.status.startsWith("resolved_");
    if (filter === "overdue") return isOverdue(d);
    return true;
  });

  const stats = {
    awaitingResponse: disputes.filter(d => d.status === "pending_response").length,
    pendingReview: disputes.filter(d => d.status === "pending_admin_review").length,
    overdue: disputes.filter(d => isOverdue(d)).length,
    resolvedToday: disputes.filter(d => 
      d.resolved_at && new Date(d.resolved_at).toDateString() === new Date().toDateString()
    ).length,
  };

  const handleOpenDetail = (dispute: Dispute) => {
    setSelectedDispute(dispute);
    setAdminNotes(dispute.admin_notes || "");
    setDetailDialogOpen(true);
  };

  const handleOpenResolve = (dispute: Dispute) => {
    setSelectedDispute(dispute);
    setDecisionReason("");
    setRefundPercentage(50);
    setResolutionType("release");
    setResolveDialogOpen(true);
  };

  const handleSaveNotes = async () => {
    if (!selectedDispute) return;

    try {
      const { error } = await supabase
        .from("booking_disputes")
        .update({ admin_notes: adminNotes })
        .eq("id", selectedDispute.id);

      if (error) throw error;
      toast.success("Notes saved");
      fetchDisputes();
    } catch (error) {
      console.error("Error saving notes:", error);
      toast.error("Failed to save notes");
    }
  };

  const handleResolve = async () => {
    if (!selectedDispute || !decisionReason.trim()) {
      toast.error("Please provide a decision reason");
      return;
    }

    setResolving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      let status: string;
      let refund: number | null = null;

      if (resolutionType === "refund") {
        status = "resolved_refund";
        refund = 100;
      } else if (resolutionType === "release") {
        status = "resolved_release";
        refund = 0;
      } else {
        status = "resolved_split";
        refund = refundPercentage;
      }

      // Update dispute
      const { error: disputeError } = await supabase
        .from("booking_disputes")
        .update({
          status,
          admin_decision_reason: decisionReason,
          resolved_by_user_id: user.id,
          resolved_at: new Date().toISOString(),
          refund_percentage: refund
        })
        .eq("id", selectedDispute.id);

      if (disputeError) throw disputeError;

      // Update booking payment status based on resolution
      const paymentStatus = resolutionType === "refund" ? "refunded" : "paid";
      await supabase
        .from("bookings")
        .update({ 
          payment_status: paymentStatus,
          status: "completed"
        })
        .eq("id", selectedDispute.booking_id);

      toast.success(`Dispute resolved: ${getStatusLabel(status)}`);
      setResolveDialogOpen(false);
      setSelectedDispute(null);
      fetchDisputes();
    } catch (error: any) {
      console.error("Error resolving dispute:", error);
      toast.error(error.message || "Failed to resolve dispute");
    } finally {
      setResolving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Awaiting Response</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.awaitingResponse}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Ready for Review</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.pendingReview}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Overdue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{stats.overdue}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Resolved Today</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.resolvedToday}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        {[
          { key: "all", label: "All" },
          { key: "pending", label: "Pending" },
          { key: "review", label: "Ready for Review" },
          { key: "overdue", label: "Overdue" },
          { key: "resolved", label: "Resolved" },
        ].map(({ key, label }) => (
          <Button
            key={key}
            variant={filter === key ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter(key)}
          >
            {label}
            {key === "overdue" && stats.overdue > 0 && (
              <Badge className="ml-1 bg-destructive">{stats.overdue}</Badge>
            )}
          </Button>
        ))}
      </div>

      {/* Disputes List */}
      {filteredDisputes.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Gavel className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No disputes found</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredDisputes.map((dispute) => (
            <Card key={dispute.id} className={isOverdue(dispute) ? "border-destructive" : ""}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Building2 className="h-4 w-4" />
                      {dispute.bookings.brand_profiles.company_name}
                      <span className="text-muted-foreground">vs</span>
                      <User className="h-4 w-4" />
                      {dispute.bookings.creator_profiles.display_name}
                    </CardTitle>
                    <CardDescription>
                      {dispute.bookings.creator_services?.service_type.replace(/_/g, " ") || "Service"} • 
                      ${(dispute.bookings.total_price_cents / 100).toFixed(2)}
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    {isOverdue(dispute) && (
                      <Badge variant="destructive" className="gap-1">
                        <AlertTriangle className="h-3 w-3" />
                        Overdue
                      </Badge>
                    )}
                    <Badge className={`${getStatusColor(dispute.status)} text-white`}>
                      {getStatusLabel(dispute.status)}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Opened By</p>
                    <p className="font-medium capitalize">{dispute.opened_by_role}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Opened</p>
                    <p className="font-medium">{format(new Date(dispute.created_at), "MMM dd, yyyy")}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Response Due</p>
                    <p className={`font-medium ${isPast(new Date(dispute.response_deadline)) ? 'text-destructive' : ''}`}>
                      {formatDistanceToNow(new Date(dispute.response_deadline), { addSuffix: true })}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Amount at Stake</p>
                    <p className="font-medium">${(dispute.bookings.total_price_cents / 100).toFixed(2)}</p>
                  </div>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground mb-1">Dispute Reason:</p>
                  <p className="text-sm bg-muted p-3 rounded-lg line-clamp-2">{dispute.reason}</p>
                </div>

                {dispute.response_text && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Response:</p>
                    <p className="text-sm bg-muted p-3 rounded-lg line-clamp-2">{dispute.response_text}</p>
                  </div>
                )}

                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => handleOpenDetail(dispute)} className="flex-1">
                    <FileText className="h-4 w-4 mr-2" />
                    View Details
                  </Button>
                  {(dispute.status === "pending_admin_review" || dispute.status === "pending_response") && (
                    <Button onClick={() => handleOpenResolve(dispute)} className="flex-1">
                      <Gavel className="h-4 w-4 mr-2" />
                      Resolve
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Detail Dialog */}
      <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Dispute Details</DialogTitle>
          </DialogHeader>

          {selectedDispute && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Brand</Label>
                  <p className="font-medium">{selectedDispute.bookings.brand_profiles.company_name}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Creator</Label>
                  <p className="font-medium">{selectedDispute.bookings.creator_profiles.display_name}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Amount</Label>
                  <p className="font-medium">${(selectedDispute.bookings.total_price_cents / 100).toFixed(2)}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Status</Label>
                  <Badge className={`${getStatusColor(selectedDispute.status)} text-white`}>
                    {getStatusLabel(selectedDispute.status)}
                  </Badge>
                </div>
              </div>

              <div>
                <Label className="text-muted-foreground">Dispute Reason ({selectedDispute.opened_by_role})</Label>
                <p className="mt-1 p-3 bg-muted rounded-lg text-sm">{selectedDispute.reason}</p>
              </div>

              {selectedDispute.evidence_description && (
                <div>
                  <Label className="text-muted-foreground">Evidence Description</Label>
                  <p className="mt-1 p-3 bg-muted rounded-lg text-sm">{selectedDispute.evidence_description}</p>
                </div>
              )}

              {selectedDispute.response_text && (
                <div>
                  <Label className="text-muted-foreground">Response</Label>
                  <p className="mt-1 p-3 bg-muted rounded-lg text-sm">{selectedDispute.response_text}</p>
                </div>
              )}

              {selectedDispute.bookings.message && (
                <div>
                  <Label className="text-muted-foreground">Original Booking Message</Label>
                  <p className="mt-1 p-3 bg-muted rounded-lg text-sm">{selectedDispute.bookings.message}</p>
                </div>
              )}

              <div>
                <Label htmlFor="admin-notes">Admin Notes</Label>
                <Textarea
                  id="admin-notes"
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Add internal notes about this dispute..."
                  rows={3}
                  className="mt-1"
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setDetailDialogOpen(false)}>
              Close
            </Button>
            <Button onClick={handleSaveNotes}>Save Notes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Resolve Dialog */}
      <Dialog open={resolveDialogOpen} onOpenChange={setResolveDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Gavel className="h-5 w-5" />
              Resolve Dispute
            </DialogTitle>
          </DialogHeader>

          {selectedDispute && (
            <div className="space-y-4">
              <div className="p-3 bg-muted rounded-lg">
                <p className="text-sm font-medium">
                  Amount: ${(selectedDispute.bookings.total_price_cents / 100).toFixed(2)}
                </p>
                <p className="text-sm text-muted-foreground">
                  {selectedDispute.bookings.brand_profiles.company_name} vs {selectedDispute.bookings.creator_profiles.display_name}
                </p>
              </div>

              <div className="space-y-2">
                <Label>Resolution Type</Label>
                <Select value={resolutionType} onValueChange={setResolutionType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="release">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        Release to Creator (100%)
                      </div>
                    </SelectItem>
                    <SelectItem value="refund">
                      <div className="flex items-center gap-2">
                        <RefreshCcw className="h-4 w-4 text-red-500" />
                        Refund to Brand (100%)
                      </div>
                    </SelectItem>
                    <SelectItem value="split">
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-purple-500" />
                        Split Payment
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {resolutionType === "split" && (
                <div className="space-y-3">
                  <Label>Split Percentage</Label>
                  <div className="flex items-center gap-4">
                    <Slider
                      value={[refundPercentage]}
                      onValueChange={([value]) => setRefundPercentage(value)}
                      max={100}
                      step={5}
                      className="flex-1"
                    />
                    <span className="text-sm font-medium w-16">{refundPercentage}%</span>
                  </div>
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Brand gets: ${((selectedDispute.bookings.total_price_cents * refundPercentage / 100) / 100).toFixed(2)}</span>
                    <span>Creator gets: ${((selectedDispute.bookings.total_price_cents * (100 - refundPercentage) / 100) / 100).toFixed(2)}</span>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="decision-reason">
                  Decision Reason <span className="text-destructive">*</span>
                </Label>
                <Textarea
                  id="decision-reason"
                  value={decisionReason}
                  onChange={(e) => setDecisionReason(e.target.value)}
                  placeholder="Explain the reasoning behind your decision..."
                  rows={3}
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setResolveDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleResolve} disabled={resolving || !decisionReason.trim()}>
              {resolving ? "Resolving..." : "Confirm Resolution"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminDisputesTab;
