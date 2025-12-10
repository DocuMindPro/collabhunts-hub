import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  BadgeCheck, 
  Search, 
  Eye, 
  CheckCircle, 
  XCircle,
  Clock,
  Phone,
  Globe,
  ExternalLink,
  Building2,
  Mail
} from "lucide-react";
import VerifiedBadge from "@/components/VerifiedBadge";

interface VerificationRequest {
  id: string;
  company_name: string;
  website_url: string | null;
  phone_number: string | null;
  phone_verified: boolean;
  verification_status: string;
  verification_submitted_at: string | null;
  verification_completed_at: string | null;
  verification_rejection_reason: string | null;
  is_verified: boolean;
  user_id: string;
  profiles?: {
    email: string;
  };
  brand_subscriptions?: Array<{
    plan_type: string;
    status: string;
  }>;
}

const AdminVerificationsTab = () => {
  const [requests, setRequests] = useState<VerificationRequest[]>([]);
  const [filteredRequests, setFilteredRequests] = useState<VerificationRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("pending");
  const [selectedRequest, setSelectedRequest] = useState<VerificationRequest | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [adminNotes, setAdminNotes] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchRequests();
  }, []);

  useEffect(() => {
    filterRequests();
  }, [search, statusFilter, requests]);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      
      // Fetch all brand profiles with their verification data
      const { data: brandsData, error: brandsError } = await supabase
        .from("brand_profiles")
        .select(`
          id,
          company_name,
          website_url,
          phone_number,
          phone_verified,
          verification_status,
          verification_submitted_at,
          verification_completed_at,
          verification_rejection_reason,
          is_verified,
          user_id
        `)
        .neq("verification_status", "not_started")
        .order("verification_submitted_at", { ascending: false });

      if (brandsError) throw brandsError;

      // Fetch profiles for emails
      const userIds = brandsData?.map(b => b.user_id) || [];
      const { data: profilesData } = await supabase
        .from("profiles")
        .select("id, email")
        .in("id", userIds);

      // Fetch subscriptions
      const brandIds = brandsData?.map(b => b.id) || [];
      const { data: subscriptionsData } = await supabase
        .from("brand_subscriptions")
        .select("brand_profile_id, plan_type, status")
        .in("brand_profile_id", brandIds)
        .eq("status", "active");

      // Merge data
      const enrichedRequests = brandsData?.map(brand => ({
        ...brand,
        profiles: profilesData?.find(p => p.id === brand.user_id),
        brand_subscriptions: subscriptionsData?.filter(s => s.brand_profile_id === brand.id)
      })) || [];

      setRequests(enrichedRequests);
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

  const filterRequests = () => {
    let filtered = requests;

    if (statusFilter !== "all") {
      filtered = filtered.filter(r => r.verification_status === statusFilter);
    }

    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(r =>
        r.company_name.toLowerCase().includes(searchLower) ||
        r.profiles?.email?.toLowerCase().includes(searchLower) ||
        r.website_url?.toLowerCase().includes(searchLower)
      );
    }

    setFilteredRequests(filtered);
  };

  const handleApprove = async () => {
    if (!selectedRequest) return;

    setActionLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { error } = await supabase
        .from("brand_profiles")
        .update({
          verification_status: "approved",
          is_verified: true,
          verification_completed_at: new Date().toISOString(),
          verified_by_user_id: user?.id,
          verification_notes: adminNotes || null,
        })
        .eq("id", selectedRequest.id);

      if (error) throw error;

      toast({
        title: "Verification Approved",
        description: `${selectedRequest.company_name} has been verified.`,
      });

      setSelectedRequest(null);
      setAdminNotes("");
      fetchRequests();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!selectedRequest) return;

    if (!rejectionReason.trim()) {
      toast({
        title: "Rejection Reason Required",
        description: "Please provide a reason for rejection.",
        variant: "destructive",
      });
      return;
    }

    setActionLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();

      const { error } = await supabase
        .from("brand_profiles")
        .update({
          verification_status: "rejected",
          is_verified: false,
          verification_completed_at: new Date().toISOString(),
          verified_by_user_id: user?.id,
          verification_rejection_reason: rejectionReason,
          verification_notes: adminNotes || null,
        })
        .eq("id", selectedRequest.id);

      if (error) throw error;

      toast({
        title: "Verification Rejected",
        description: `${selectedRequest.company_name}'s verification was rejected.`,
      });

      setSelectedRequest(null);
      setRejectionReason("");
      setAdminNotes("");
      fetchRequests();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusBadge = (status: string, isVerified: boolean) => {
    if (isVerified) {
      return (
        <Badge variant="default" className="bg-green-500">
          <CheckCircle className="h-3 w-3 mr-1" />
          Verified
        </Badge>
      );
    }
    
    switch (status) {
      case "pending":
        return (
          <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
            <Clock className="h-3 w-3 mr-1" />
            Pending
          </Badge>
        );
      case "rejected":
        return (
          <Badge variant="destructive">
            <XCircle className="h-3 w-3 mr-1" />
            Rejected
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const pendingCount = requests.filter(r => r.verification_status === "pending").length;
  const approvedCount = requests.filter(r => r.is_verified).length;
  const rejectedCount = requests.filter(r => r.verification_status === "rejected").length;

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-yellow-500" />
              Pending Review
            </CardDescription>
            <CardTitle className="text-2xl">{pendingCount}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              Verified
            </CardDescription>
            <CardTitle className="text-2xl">{approvedCount}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <XCircle className="h-4 w-4 text-red-500" />
              Rejected
            </CardDescription>
            <CardTitle className="text-2xl">{rejectedCount}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Main Card */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <BadgeCheck className="h-5 w-5 text-blue-500" />
                Business Verifications
              </CardTitle>
              <CardDescription>Review and manage verification requests</CardDescription>
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9 w-full sm:w-64"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-40">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Requests</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">Loading...</div>
          ) : filteredRequests.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {statusFilter === "pending" 
                ? "No pending verification requests" 
                : "No verification requests found"}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Company</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Website</TableHead>
                    <TableHead>Plan</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Submitted</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRequests.map((request) => (
                    <TableRow key={request.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          {request.company_name}
                          {request.is_verified && <VerifiedBadge size="sm" />}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-muted-foreground">
                          {request.profiles?.email || "—"}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Phone className={`h-3.5 w-3.5 ${request.phone_verified ? "text-green-500" : "text-muted-foreground"}`} />
                          {request.phone_verified ? (
                            <Badge variant="outline" className="text-xs">Verified</Badge>
                          ) : (
                            <Badge variant="secondary" className="text-xs">Unverified</Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {request.website_url ? (
                          <a 
                            href={request.website_url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-primary hover:underline text-sm"
                          >
                            <Globe className="h-3.5 w-3.5" />
                            View
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        ) : (
                          <span className="text-muted-foreground text-sm">—</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize text-xs">
                          {request.brand_subscriptions?.[0]?.plan_type || "basic"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(request.verification_status, request.is_verified)}
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-muted-foreground">
                          {request.verification_submitted_at 
                            ? new Date(request.verification_submitted_at).toLocaleDateString()
                            : "—"}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedRequest(request);
                            setRejectionReason("");
                            setAdminNotes("");
                          }}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Review Dialog */}
      <Dialog open={!!selectedRequest} onOpenChange={() => setSelectedRequest(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Review Verification Request
            </DialogTitle>
            <DialogDescription>
              Review the business details and approve or reject the verification request.
            </DialogDescription>
          </DialogHeader>

          {selectedRequest && (
            <div className="space-y-4">
              {/* Company Info */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-muted-foreground">Company Name</Label>
                  <span className="font-medium">{selectedRequest.company_name}</span>
                </div>
                <div className="flex items-center justify-between">
                  <Label className="text-muted-foreground">Email</Label>
                  <a href={`mailto:${selectedRequest.profiles?.email}`} className="flex items-center gap-1 text-primary hover:underline">
                    <Mail className="h-3.5 w-3.5" />
                    {selectedRequest.profiles?.email}
                  </a>
                </div>
                <div className="flex items-center justify-between">
                  <Label className="text-muted-foreground">Phone Verified</Label>
                  {selectedRequest.phone_verified ? (
                    <Badge variant="default" className="bg-green-500">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Yes
                    </Badge>
                  ) : (
                    <Badge variant="destructive">
                      <XCircle className="h-3 w-3 mr-1" />
                      No
                    </Badge>
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <Label className="text-muted-foreground">Website</Label>
                  {selectedRequest.website_url ? (
                    <a 
                      href={selectedRequest.website_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-primary hover:underline"
                    >
                      <Globe className="h-3.5 w-3.5" />
                      {selectedRequest.website_url.replace(/^https?:\/\//, "").slice(0, 30)}
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  ) : (
                    <span className="text-muted-foreground">Not provided</span>
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <Label className="text-muted-foreground">Subscription</Label>
                  <Badge variant="outline" className="capitalize">
                    {selectedRequest.brand_subscriptions?.[0]?.plan_type || "basic"}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <Label className="text-muted-foreground">Current Status</Label>
                  {getStatusBadge(selectedRequest.verification_status, selectedRequest.is_verified)}
                </div>
              </div>

              {/* Admin Notes */}
              <div className="space-y-2">
                <Label>Admin Notes (Internal)</Label>
                <Textarea
                  placeholder="Add internal notes about this verification..."
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  rows={2}
                />
              </div>

              {/* Rejection Reason (only show if not already verified) */}
              {!selectedRequest.is_verified && selectedRequest.verification_status === "pending" && (
                <div className="space-y-2">
                  <Label>Rejection Reason (required if rejecting)</Label>
                  <Textarea
                    placeholder="Explain why the verification is being rejected..."
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    rows={2}
                  />
                </div>
              )}

              {/* Previous Rejection Reason */}
              {selectedRequest.verification_rejection_reason && (
                <div className="p-3 bg-red-50 dark:bg-red-950/30 rounded-lg">
                  <Label className="text-red-600 dark:text-red-400 text-xs">Previous Rejection Reason</Label>
                  <p className="text-sm mt-1">{selectedRequest.verification_rejection_reason}</p>
                </div>
              )}
            </div>
          )}

          <DialogFooter className="gap-2">
            {selectedRequest?.verification_status === "pending" && (
              <>
                <Button
                  variant="destructive"
                  onClick={handleReject}
                  disabled={actionLoading}
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Reject
                </Button>
                <Button
                  onClick={handleApprove}
                  disabled={actionLoading}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Approve
                </Button>
              </>
            )}
            {selectedRequest?.is_verified && (
              <div className="flex items-center gap-2 text-green-600">
                <VerifiedBadge size="md" showTooltip={false} />
                <span className="text-sm font-medium">Already Verified</span>
              </div>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminVerificationsTab;
