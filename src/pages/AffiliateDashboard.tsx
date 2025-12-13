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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { BarChart3, Users, DollarSign, Link as LinkIcon, Copy, CheckCircle } from "lucide-react";

interface Affiliate {
  id: string;
  display_name: string;
  referral_code: string;
  commission_rate: number;
  total_earnings_cents: number;
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

const AffiliateDashboard = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState(searchParams.get("tab") || "overview");
  const [loading, setLoading] = useState(true);
  const [affiliate, setAffiliate] = useState<Affiliate | null>(null);
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [earnings, setEarnings] = useState<AffiliateEarning[]>([]);
  const [copied, setCopied] = useState(false);
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

  const totalEarnings = affiliate?.total_earnings_cents || 0;
  const monthlyEarnings = earnings
    .filter(e => new Date(e.created_at) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000))
    .reduce((sum, e) => sum + e.affiliate_amount_cents, 0);
  const creatorReferrals = referrals.filter(r => r.referred_user_type === "creator").length;
  const brandReferrals = referrals.filter(r => r.referred_user_type === "brand").length;

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
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Total Earnings
              </CardDescription>
              <CardTitle className="text-2xl">${(totalEarnings / 100).toLocaleString()}</CardTitle>
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
          <TabsList className="mb-6">
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
          </TabsList>

          <TabsContent value="overview">
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Referrals</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {referrals.slice(0, 5).map(referral => (
                      <div key={referral.id} className="flex justify-between items-center border-b pb-2">
                        <div>
                          <p className="font-medium capitalize">{referral.referred_user_type}</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(referral.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <Badge variant="outline" className="capitalize">{referral.referred_user_type}</Badge>
                      </div>
                    ))}
                    {referrals.length === 0 && (
                      <p className="text-muted-foreground text-center py-4">No referrals yet. Share your link!</p>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Recent Earnings</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {earnings.slice(0, 5).map(earning => (
                      <div key={earning.id} className="flex justify-between items-center border-b pb-2">
                        <div>
                          <p className="font-medium capitalize">{earning.source_type} Revenue</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(earning.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <p className="font-bold text-green-600">+${(earning.affiliate_amount_cents / 100).toFixed(2)}</p>
                      </div>
                    ))}
                    {earnings.length === 0 && (
                      <p className="text-muted-foreground text-center py-4">No earnings yet</p>
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
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default AffiliateDashboard;
