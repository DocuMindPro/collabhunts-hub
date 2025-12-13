import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/Navbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { BarChart3, Users, DollarSign, Link as LinkIcon, Copy, CheckCircle, Wallet, ArrowUpRight } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

interface Affiliate {
  id: string;
  display_name: string;
  referral_code: string;
  commission_rate: number;
  total_earnings_cents: number;
  available_balance_cents: number;
  status: string;
}

interface Referral {
  id: string;
  referred_user_type: string;
  created_at: string;
  referral_code_used: string;
}

interface AffiliateEarning {
  id: string;
  source_type: string;
  gross_revenue_cents: number;
  affiliate_amount_cents: number;
  created_at: string;
}

interface PayoutRequest {
  id: string;
  amount_cents: number;
  status: string;
  requested_at: string;
  processed_at: string | null;
  admin_notes: string | null;
}

const COLORS = ['hsl(var(--primary))', 'hsl(var(--chart-2))'];

const AffiliateDashboard = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState(searchParams.get("tab") || "overview");
  const [loading, setLoading] = useState(true);
  const [affiliate, setAffiliate] = useState<Affiliate | null>(null);
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [earnings, setEarnings] = useState<AffiliateEarning[]>([]);
  const [payoutRequests, setPayoutRequests] = useState<PayoutRequest[]>([]);
  const [copied, setCopied] = useState(false);
  const [payoutDialogOpen, setPayoutDialogOpen] = useState(false);
  const [payoutAmount, setPayoutAmount] = useState("");
  const [submittingPayout, setSubmittingPayout] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchAffiliateData();
  }, []);

  const fetchAffiliateData = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Fetch affiliate profile
      const { data: affiliateData, error: affiliateError } = await supabase
        .from("affiliates")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (affiliateError) throw affiliateError;
      setAffiliate(affiliateData);

      // Fetch referrals
      const { data: referralsData } = await supabase
        .from("referrals")
        .select("*")
        .eq("affiliate_id", affiliateData.id)
        .order("created_at", { ascending: false });

      setReferrals(referralsData || []);

      // Fetch earnings
      const { data: earningsData } = await supabase
        .from("affiliate_earnings")
        .select("*")
        .eq("affiliate_id", affiliateData.id)
        .order("created_at", { ascending: false });

      setEarnings(earningsData || []);

      // Fetch payout requests
      const { data: payoutData } = await supabase
        .from("affiliate_payout_requests")
        .select("*")
        .eq("affiliate_id", affiliateData.id)
        .order("requested_at", { ascending: false });

      setPayoutRequests(payoutData || []);

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

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    setSearchParams({ tab: value });
  };

  const referralLink = affiliate ? `${window.location.origin}?ref=${affiliate.referral_code}` : "";

  const copyReferralLink = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    toast({ title: "Referral link copied!" });
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRequestPayout = async () => {
    if (!affiliate) return;
    
    const amountCents = Math.round(parseFloat(payoutAmount) * 100);
    if (isNaN(amountCents) || amountCents <= 0) {
      toast({ title: "Invalid amount", variant: "destructive" });
      return;
    }

    if (amountCents > (affiliate.available_balance_cents || 0)) {
      toast({ title: "Insufficient balance", variant: "destructive" });
      return;
    }

    setSubmittingPayout(true);
    try {
      const { error } = await supabase
        .from("affiliate_payout_requests")
        .insert({
          affiliate_id: affiliate.id,
          amount_cents: amountCents,
        });

      if (error) throw error;

      toast({ title: "Payout request submitted" });
      setPayoutDialogOpen(false);
      setPayoutAmount("");
      fetchAffiliateData();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setSubmittingPayout(false);
    }
  };

  // Calculate chart data
  const getMonthlyEarningsData = () => {
    const months: { [key: string]: number } = {};
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = d.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
      months[key] = 0;
    }
    earnings.forEach(e => {
      const d = new Date(e.created_at);
      const key = d.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
      if (months[key] !== undefined) {
        months[key] += e.affiliate_amount_cents / 100;
      }
    });
    return Object.entries(months).map(([month, amount]) => ({ month, amount: Math.round(amount * 100) / 100 }));
  };

  const getReferralTypeData = () => {
    const creatorCount = referrals.filter(r => r.referred_user_type === "creator").length;
    const brandCount = referrals.filter(r => r.referred_user_type === "brand").length;
    return [
      { name: "Creators", value: creatorCount },
      { name: "Brands", value: brandCount },
    ].filter(d => d.value > 0);
  };

  const getMonthlyReferralsData = () => {
    const months: { [key: string]: number } = {};
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = d.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
      months[key] = 0;
    }
    referrals.forEach(r => {
      const d = new Date(r.created_at);
      const key = d.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
      if (months[key] !== undefined) {
        months[key]++;
      }
    });
    return Object.entries(months).map(([month, count]) => ({ month, count }));
  };

  const totalEarnings = affiliate?.total_earnings_cents || 0;
  const availableBalance = affiliate?.available_balance_cents || 0;
  const monthlyEarnings = earnings
    .filter(e => new Date(e.created_at) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000))
    .reduce((sum, e) => sum + e.affiliate_amount_cents, 0);
  const creatorReferrals = referrals.filter(r => r.referred_user_type === "creator").length;
  const brandReferrals = referrals.filter(r => r.referred_user_type === "brand").length;
  const pendingPayouts = payoutRequests.filter(p => p.status === "pending").reduce((sum, p) => sum + p.amount_cents, 0);

  if (loading) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Affiliate Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome, {affiliate?.display_name} • Earn 50% of platform revenue from your referrals
          </p>
        </div>

        {/* Referral Link Card */}
        <Card className="mb-8 border-primary/20 bg-primary/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <LinkIcon className="h-5 w-5" />
              Your Referral Link
            </CardTitle>
            <CardDescription>Share this link to earn commissions from every user who signs up</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Input value={referralLink} readOnly className="font-mono text-sm" />
              <Button onClick={copyReferralLink} variant="outline" className="shrink-0">
                {copied ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              Your referral code: <span className="font-mono font-bold">{affiliate?.referral_code}</span>
            </p>
          </CardContent>
        </Card>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Total Earnings
              </CardDescription>
              <CardTitle className="text-2xl">${(totalEarnings / 100).toLocaleString()}</CardTitle>
            </CardHeader>
          </Card>
          <Card className="border-primary/50 bg-primary/5">
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-2">
                <Wallet className="h-4 w-4" />
                Available Balance
              </CardDescription>
              <CardTitle className="text-2xl text-primary">${(availableBalance / 100).toLocaleString()}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                This Month
              </CardDescription>
              <CardTitle className="text-2xl">${(monthlyEarnings / 100).toLocaleString()}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Creator Referrals
              </CardDescription>
              <CardTitle className="text-2xl">{creatorReferrals}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Brand Referrals
              </CardDescription>
              <CardTitle className="text-2xl">{brandReferrals}</CardTitle>
            </CardHeader>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={handleTabChange}>
          <TabsList className="mb-6 flex-wrap">
            <TabsTrigger value="overview" className="gap-2">
              <BarChart3 className="h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="referrals" className="gap-2">
              <Users className="h-4 w-4" />
              Referrals
            </TabsTrigger>
            <TabsTrigger value="earnings" className="gap-2">
              <DollarSign className="h-4 w-4" />
              Earnings
            </TabsTrigger>
            <TabsTrigger value="payouts" className="gap-2">
              <Wallet className="h-4 w-4" />
              Payouts
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <div className="grid gap-6 md:grid-cols-2">
              {/* Monthly Earnings Chart */}
              <Card>
                <CardHeader>
                  <CardTitle>Monthly Earnings</CardTitle>
                  <CardDescription>Last 6 months performance</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={getMonthlyEarningsData()}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                        <XAxis dataKey="month" className="text-xs" />
                        <YAxis className="text-xs" tickFormatter={(v) => `$${v}`} />
                        <Tooltip formatter={(value) => [`$${value}`, 'Earnings']} />
                        <Bar dataKey="amount" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Referral Type Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle>Referral Distribution</CardTitle>
                  <CardDescription>Creators vs Brands</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-64 flex items-center justify-center">
                    {getReferralTypeData().length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={getReferralTypeData()}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={5}
                            dataKey="value"
                            label={({ name, value }) => `${name}: ${value}`}
                          >
                            {getReferralTypeData().map((_, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    ) : (
                      <p className="text-muted-foreground">No referrals yet</p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Monthly Referrals Chart */}
              <Card>
                <CardHeader>
                  <CardTitle>Monthly Referrals</CardTitle>
                  <CardDescription>New signups from your link</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={getMonthlyReferralsData()}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                        <XAxis dataKey="month" className="text-xs" />
                        <YAxis className="text-xs" />
                        <Tooltip />
                        <Bar dataKey="count" fill="hsl(var(--chart-2))" radius={[4, 4, 0, 0]} name="Referrals" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Recent Activity */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[...referrals.slice(0, 3).map(r => ({ type: 'referral', data: r, date: r.created_at })),
                      ...earnings.slice(0, 3).map(e => ({ type: 'earning', data: e, date: e.created_at }))]
                      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                      .slice(0, 5)
                      .map((item, i) => (
                        <div key={i} className="flex justify-between items-center border-b pb-2">
                          <div>
                            <p className="font-medium">
                              {item.type === 'referral' ? 'New Referral' : 'Earned Commission'}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {item.type === 'referral' 
                                ? `${(item.data as Referral).referred_user_type} signed up`
                                : `From ${(item.data as AffiliateEarning).source_type}`}
                            </p>
                          </div>
                          <div className="text-right">
                            {item.type === 'earning' && (
                              <p className="font-bold text-green-600">
                                +${((item.data as AffiliateEarning).affiliate_amount_cents / 100).toFixed(2)}
                              </p>
                            )}
                            <p className="text-xs text-muted-foreground">
                              {new Date(item.date).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      ))}
                    {referrals.length === 0 && earnings.length === 0 && (
                      <p className="text-muted-foreground text-center py-4">No activity yet. Share your link!</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="referrals">
            <Card>
              <CardHeader>
                <CardTitle>All Referrals</CardTitle>
                <CardDescription>Users who signed up using your referral link</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Code Used</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {referrals.map(referral => (
                      <TableRow key={referral.id}>
                        <TableCell>{new Date(referral.created_at).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="capitalize">{referral.referred_user_type}</Badge>
                        </TableCell>
                        <TableCell className="font-mono">{referral.referral_code_used}</TableCell>
                      </TableRow>
                    ))}
                    {referrals.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={3} className="text-center text-muted-foreground py-8">
                          No referrals yet. Share your link!
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="earnings">
            <Card>
              <CardHeader>
                <CardTitle>Earnings History</CardTitle>
                <CardDescription>Your 50% commission from all referred user activity</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Gross Revenue</TableHead>
                      <TableHead>Your Earnings (50%)</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {earnings.map(earning => (
                      <TableRow key={earning.id}>
                        <TableCell>{new Date(earning.created_at).toLocaleDateString()}</TableCell>
                        <TableCell className="capitalize">{earning.source_type}</TableCell>
                        <TableCell>${(earning.gross_revenue_cents / 100).toFixed(2)}</TableCell>
                        <TableCell className="font-bold text-green-600">
                          ${(earning.affiliate_amount_cents / 100).toFixed(2)}
                        </TableCell>
                      </TableRow>
                    ))}
                    {earnings.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                          No earnings yet
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="payouts">
            <div className="space-y-6">
              {/* Payout Request Card */}
              <Card className="border-primary/20">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle>Request Payout</CardTitle>
                      <CardDescription>Withdraw your available balance</CardDescription>
                    </div>
                    <Dialog open={payoutDialogOpen} onOpenChange={setPayoutDialogOpen}>
                      <DialogTrigger asChild>
                        <Button disabled={availableBalance <= 0}>
                          <ArrowUpRight className="h-4 w-4 mr-2" />
                          Request Payout
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Request Payout</DialogTitle>
                          <DialogDescription>
                            Available balance: ${(availableBalance / 100).toFixed(2)}
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                          <div>
                            <Label htmlFor="amount">Amount ($)</Label>
                            <Input
                              id="amount"
                              type="number"
                              step="0.01"
                              min="1"
                              max={availableBalance / 100}
                              value={payoutAmount}
                              onChange={(e) => setPayoutAmount(e.target.value)}
                              placeholder="Enter amount"
                            />
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setPayoutAmount((availableBalance / 100).toFixed(2))}
                          >
                            Withdraw All
                          </Button>
                        </div>
                        <DialogFooter>
                          <Button variant="outline" onClick={() => setPayoutDialogOpen(false)}>Cancel</Button>
                          <Button onClick={handleRequestPayout} disabled={submittingPayout}>
                            {submittingPayout ? "Submitting..." : "Submit Request"}
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <p className="text-2xl font-bold text-primary">${(availableBalance / 100).toFixed(2)}</p>
                      <p className="text-sm text-muted-foreground">Available</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-yellow-600">${(pendingPayouts / 100).toFixed(2)}</p>
                      <p className="text-sm text-muted-foreground">Pending</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold">${(totalEarnings / 100).toFixed(2)}</p>
                      <p className="text-sm text-muted-foreground">Total Earned</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Payout History */}
              <Card>
                <CardHeader>
                  <CardTitle>Payout History</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Requested</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Processed</TableHead>
                        <TableHead>Notes</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {payoutRequests.map(payout => (
                        <TableRow key={payout.id}>
                          <TableCell>{new Date(payout.requested_at).toLocaleDateString()}</TableCell>
                          <TableCell className="font-bold">${(payout.amount_cents / 100).toFixed(2)}</TableCell>
                          <TableCell>
                            <Badge variant={
                              payout.status === "paid" ? "default" :
                              payout.status === "approved" ? "secondary" :
                              payout.status === "pending" ? "outline" : "destructive"
                            }>
                              {payout.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {payout.processed_at ? new Date(payout.processed_at).toLocaleDateString() : "-"}
                          </TableCell>
                          <TableCell className="text-muted-foreground">{payout.admin_notes || "-"}</TableCell>
                        </TableRow>
                      ))}
                      {payoutRequests.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                            No payout requests yet
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default AffiliateDashboard;