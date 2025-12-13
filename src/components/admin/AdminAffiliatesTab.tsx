import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CheckCircle, XCircle, Plus, Copy, DollarSign } from "lucide-react";
import { format } from "date-fns";

interface Affiliate {
  id: string;
  user_id: string;
  display_name: string;
  email: string;
  referral_code: string;
  commission_rate: number;
  status: string;
  total_earnings_cents: number;
  available_balance_cents: number;
  created_at: string;
  referral_count: number;
}

interface PayoutRequest {
  id: string;
  affiliate_id: string;
  amount_cents: number;
  status: string;
  payout_method: string | null;
  payout_details: unknown;
  admin_notes: string | null;
  requested_at: string;
  processed_at: string | null;
  affiliate?: { display_name: string; email: string };
}

const AdminAffiliatesTab = () => {
  const [affiliates, setAffiliates] = useState<Affiliate[]>([]);
  const [payoutRequests, setPayoutRequests] = useState<PayoutRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [processDialogOpen, setProcessDialogOpen] = useState(false);
  const [selectedPayout, setSelectedPayout] = useState<PayoutRequest | null>(null);
  const [adminNotes, setAdminNotes] = useState("");
  
  // Create form
  const [newEmail, setNewEmail] = useState("");
  const [newDisplayName, setNewDisplayName] = useState("");
  const [newReferralCode, setNewReferralCode] = useState("");
  
  const { toast } = useToast();

  useEffect(() => {
    fetchAffiliates();
    fetchPayoutRequests();
  }, []);

  const fetchAffiliates = async () => {
    try {
      setLoading(true);
      
      const { data: affiliatesData, error } = await supabase
        .from("affiliates")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Fetch referral counts
      const affiliatesWithCounts = await Promise.all(
        (affiliatesData || []).map(async (affiliate) => {
          const { count } = await supabase
            .from("referrals")
            .select("*", { count: "exact", head: true })
            .eq("affiliate_id", affiliate.id);

          return { ...affiliate, referral_count: count || 0 };
        })
      );

      setAffiliates(affiliatesWithCounts);
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const fetchPayoutRequests = async () => {
    try {
      const { data, error } = await supabase
        .from("affiliate_payout_requests")
        .select("*, affiliate:affiliates(display_name, email)")
        .order("requested_at", { ascending: false });

      if (error) throw error;
      setPayoutRequests(data || []);
    } catch (error: any) {
      console.error("Error fetching payout requests:", error);
    }
  };

  const generateReferralCode = () => {
    const code = newDisplayName
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, "")
      .slice(0, 6) + Math.random().toString(36).substring(2, 6).toUpperCase();
    setNewReferralCode(code);
  };

  const handleCreateAffiliate = async () => {
    try {
      const { data: profileData } = await supabase
        .from("profiles")
        .select("id")
        .eq("email", newEmail)
        .single();

      if (!profileData) {
        toast({ title: "Error", description: "No user found with this email", variant: "destructive" });
        return;
      }

      const { error } = await supabase
        .from("affiliates")
        .insert({
          user_id: profileData.id,
          display_name: newDisplayName,
          email: newEmail,
          referral_code: newReferralCode,
          status: "pending",
        });

      if (error) throw error;

      await supabase.from("user_roles").insert({
        user_id: profileData.id,
        role: "affiliate"
      });

      toast({ title: "Affiliate created successfully" });
      setCreateDialogOpen(false);
      setNewEmail("");
      setNewDisplayName("");
      setNewReferralCode("");
      fetchAffiliates();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const handleActivate = async (affiliateId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      const { error } = await supabase
        .from("affiliates")
        .update({ 
          status: "active",
          activated_by: user?.id,
          activated_at: new Date().toISOString()
        })
        .eq("id", affiliateId);

      if (error) throw error;

      toast({ title: "Affiliate activated" });
      fetchAffiliates();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const handleSuspend = async (affiliateId: string) => {
    try {
      const { error } = await supabase
        .from("affiliates")
        .update({ status: "suspended" })
        .eq("id", affiliateId);

      if (error) throw error;

      toast({ title: "Affiliate suspended" });
      fetchAffiliates();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const copyReferralLink = (code: string) => {
    const link = `${window.location.origin}?ref=${code}`;
    navigator.clipboard.writeText(link);
    toast({ title: "Referral link copied!" });
  };

  const handleProcessPayout = async (status: "approved" | "rejected") => {
    if (!selectedPayout) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();

      const { error } = await supabase
        .from("affiliate_payout_requests")
        .update({
          status,
          admin_notes: adminNotes || null,
          processed_by: user?.id,
          processed_at: new Date().toISOString()
        })
        .eq("id", selectedPayout.id);

      if (error) throw error;

      toast({ title: `Payout ${status}` });
      setProcessDialogOpen(false);
      setSelectedPayout(null);
      setAdminNotes("");
      fetchPayoutRequests();
      fetchAffiliates();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const pendingPayouts = payoutRequests.filter(p => p.status === "pending");

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <Tabs defaultValue="affiliates" className="space-y-4">
      <TabsList>
        <TabsTrigger value="affiliates">Affiliates</TabsTrigger>
        <TabsTrigger value="payouts" className="gap-2">
          Payout Requests
          {pendingPayouts.length > 0 && (
            <Badge variant="destructive" className="ml-1">{pendingPayouts.length}</Badge>
          )}
        </TabsTrigger>
      </TabsList>

      <TabsContent value="affiliates">
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Affiliate Management</CardTitle>
                <CardDescription>Manage affiliate partners and their referral codes</CardDescription>
              </div>
              <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="gap-2">
                    <Plus className="h-4 w-4" />
                    Create Affiliate
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create New Affiliate</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label>User Email (must have existing account)</Label>
                      <Input value={newEmail} onChange={(e) => setNewEmail(e.target.value)} type="email" />
                    </div>
                    <div>
                      <Label>Display Name</Label>
                      <Input 
                        value={newDisplayName} 
                        onChange={(e) => setNewDisplayName(e.target.value)} 
                        onBlur={generateReferralCode}
                      />
                    </div>
                    <div>
                      <Label>Referral Code</Label>
                      <div className="flex gap-2">
                        <Input value={newReferralCode} onChange={(e) => setNewReferralCode(e.target.value.toUpperCase())} />
                        <Button type="button" variant="outline" onClick={generateReferralCode}>Generate</Button>
                      </div>
                    </div>
                    <Button onClick={handleCreateAffiliate} className="w-full" disabled={!newEmail || !newDisplayName || !newReferralCode}>
                      Create Affiliate
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Referral Code</TableHead>
                  <TableHead>Referrals</TableHead>
                  <TableHead>Commission</TableHead>
                  <TableHead>Balance</TableHead>
                  <TableHead>Total Earnings</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {affiliates.map((affiliate) => (
                  <TableRow key={affiliate.id}>
                    <TableCell className="font-medium">{affiliate.display_name}</TableCell>
                    <TableCell>{affiliate.email}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <code className="bg-muted px-2 py-1 rounded text-sm">{affiliate.referral_code}</code>
                        <Button size="sm" variant="ghost" onClick={() => copyReferralLink(affiliate.referral_code)}>
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell>{affiliate.referral_count}</TableCell>
                    <TableCell>{(affiliate.commission_rate * 100).toFixed(0)}%</TableCell>
                    <TableCell className="text-green-600 font-medium">
                      ${(affiliate.available_balance_cents / 100).toLocaleString()}
                    </TableCell>
                    <TableCell>${(affiliate.total_earnings_cents / 100).toLocaleString()}</TableCell>
                    <TableCell>
                      <Badge variant={affiliate.status === "active" ? "default" : affiliate.status === "pending" ? "secondary" : "destructive"}>
                        {affiliate.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        {affiliate.status === "pending" && (
                          <Button size="sm" variant="outline" onClick={() => handleActivate(affiliate.id)}>
                            <CheckCircle className="h-4 w-4" />
                          </Button>
                        )}
                        {affiliate.status === "active" && (
                          <Button size="sm" variant="outline" onClick={() => handleSuspend(affiliate.id)}>
                            <XCircle className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="payouts">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Affiliate Payout Requests
            </CardTitle>
            <CardDescription>Review and process payout requests from affiliates</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Affiliate</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead>Requested</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payoutRequests.map((payout) => (
                  <TableRow key={payout.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{payout.affiliate?.display_name}</p>
                        <p className="text-sm text-muted-foreground">{payout.affiliate?.email}</p>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">${(payout.amount_cents / 100).toLocaleString()}</TableCell>
                    <TableCell>{payout.payout_method || "Not specified"}</TableCell>
                    <TableCell>{format(new Date(payout.requested_at), "MMM d, yyyy")}</TableCell>
                    <TableCell>
                      <Badge variant={
                        payout.status === "approved" ? "default" : 
                        payout.status === "rejected" ? "destructive" : 
                        "secondary"
                      }>
                        {payout.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {payout.status === "pending" && (
                        <Button
                          size="sm"
                          onClick={() => {
                            setSelectedPayout(payout);
                            setProcessDialogOpen(true);
                          }}
                        >
                          Process
                        </Button>
                      )}
                      {payout.admin_notes && (
                        <p className="text-xs text-muted-foreground mt-1">Note: {payout.admin_notes}</p>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
                {payoutRequests.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                      No payout requests yet
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </TabsContent>

      {/* Process Payout Dialog */}
      <Dialog open={processDialogOpen} onOpenChange={setProcessDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Process Payout Request</DialogTitle>
          </DialogHeader>
          {selectedPayout && (
            <div className="space-y-4">
              <div className="bg-muted p-4 rounded-lg space-y-2">
                <p><strong>Affiliate:</strong> {selectedPayout.affiliate?.display_name}</p>
                <p><strong>Amount:</strong> ${(selectedPayout.amount_cents / 100).toLocaleString()}</p>
                <p><strong>Method:</strong> {selectedPayout.payout_method || "Not specified"}</p>
                {selectedPayout.payout_details && Object.keys(selectedPayout.payout_details).length > 0 && (
                  <div>
                    <strong>Details:</strong>
                    <pre className="text-xs bg-background p-2 rounded mt-1">
                      {JSON.stringify(selectedPayout.payout_details, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
              <div>
                <Label>Admin Notes (optional)</Label>
                <Textarea 
                  value={adminNotes} 
                  onChange={(e) => setAdminNotes(e.target.value)} 
                  placeholder="Add notes about this payout..."
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={() => handleProcessPayout("approved")} className="flex-1 bg-green-600 hover:bg-green-700">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Approve
                </Button>
                <Button onClick={() => handleProcessPayout("rejected")} variant="destructive" className="flex-1">
                  <XCircle className="h-4 w-4 mr-2" />
                  Reject
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Tabs>
  );
};

export default AdminAffiliatesTab;