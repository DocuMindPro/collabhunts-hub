import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { CheckCircle, XCircle, Plus, Copy } from "lucide-react";

interface Affiliate {
  id: string;
  user_id: string;
  display_name: string;
  email: string;
  referral_code: string;
  commission_rate: number;
  status: string;
  total_earnings_cents: number;
  created_at: string;
  referral_count: number;
}

const AdminAffiliatesTab = () => {
  const [affiliates, setAffiliates] = useState<Affiliate[]>([]);
  const [loading, setLoading] = useState(true);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  
  // Create form
  const [newEmail, setNewEmail] = useState("");
  const [newDisplayName, setNewDisplayName] = useState("");
  const [newReferralCode, setNewReferralCode] = useState("");
  
  const { toast } = useToast();

  useEffect(() => {
    fetchAffiliates();
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

  const generateReferralCode = () => {
    const code = newDisplayName
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, "")
      .slice(0, 6) + Math.random().toString(36).substring(2, 6).toUpperCase();
    setNewReferralCode(code);
  };

  const handleCreateAffiliate = async () => {
    try {
      // First, check if user exists with this email
      const { data: profileData } = await supabase
        .from("profiles")
        .select("id")
        .eq("email", newEmail)
        .single();

      if (!profileData) {
        toast({ title: "Error", description: "No user found with this email", variant: "destructive" });
        return;
      }

      const { data: { user } } = await supabase.auth.getUser();

      // Create affiliate
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

      // Add affiliate role
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

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
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
              <TableHead>Earnings</TableHead>
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
  );
};

export default AdminAffiliatesTab;
