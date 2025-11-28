import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { 
  DollarSign, 
  CreditCard, 
  TrendingUp, 
  ExternalLink,
  AlertCircle 
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { createConnectAccount, formatPrice, calculateCreatorEarnings } from "@/lib/stripe-mock";

interface PayoutSettings {
  id: string;
  stripe_account_id: string | null;
  account_status: string;
  payout_enabled: boolean;
}

interface Payout {
  id: string;
  amount_cents: number;
  status: string;
  payout_date: string | null;
  stripe_payout_id: string | null;
  created_at: string;
}

interface EarningsData {
  totalEarnings: number;
  availableBalance: number;
  pendingEarnings: number;
}

const PayoutsTab = () => {
  const [loading, setLoading] = useState(true);
  const [payoutSettings, setPayoutSettings] = useState<PayoutSettings | null>(null);
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [earnings, setEarnings] = useState<EarningsData>({
    totalEarnings: 0,
    availableBalance: 0,
    pendingEarnings: 0
  });
  const [creatorProfileId, setCreatorProfileId] = useState<string>("");
  const [connectingAccount, setConnectingAccount] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchPayoutData();
  }, []);

  const fetchPayoutData = async () => {
    try {
      setLoading(true);

      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get creator profile
      const { data: profile } = await supabase
        .from("creator_profiles")
        .select("id")
        .eq("user_id", user.id)
        .single();

      if (!profile) return;
      setCreatorProfileId(profile.id);

      // Get payout settings
      const { data: settings } = await supabase
        .from("creator_payout_settings")
        .select("*")
        .eq("creator_profile_id", profile.id)
        .maybeSingle();

      setPayoutSettings(settings);

      // Get payout history
      const { data: payoutHistory } = await supabase
        .from("payouts")
        .select("*")
        .eq("creator_profile_id", profile.id)
        .order("created_at", { ascending: false });

      setPayouts(payoutHistory || []);

      // Calculate earnings from completed paid bookings
      const { data: bookings } = await supabase
        .from("bookings")
        .select("total_price_cents, platform_fee_cents, payment_status")
        .eq("creator_profile_id", profile.id)
        .eq("status", "completed");

      if (bookings) {
        const totalEarnings = bookings
          .filter(b => b.payment_status === "paid")
          .reduce((sum, b) => sum + calculateCreatorEarnings(b.total_price_cents, b.platform_fee_cents || 0), 0);

        const pendingEarnings = bookings
          .filter(b => b.payment_status === "pending")
          .reduce((sum, b) => sum + calculateCreatorEarnings(b.total_price_cents, b.platform_fee_cents || 0), 0);

        // Calculate available balance (total earnings - already paid out)
        const totalPaidOut = (payoutHistory || [])
          .filter(p => p.status === "paid")
          .reduce((sum, p) => sum + p.amount_cents, 0);

        setEarnings({
          totalEarnings,
          availableBalance: totalEarnings - totalPaidOut,
          pendingEarnings
        });
      }
    } catch (error) {
      console.error("Error fetching payout data:", error);
      toast({
        title: "Error",
        description: "Failed to load payout information",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleConnectStripe = async () => {
    try {
      setConnectingAccount(true);

      // Create mock Stripe Connect account
      const result = await createConnectAccount(creatorProfileId);

      if (result.success) {
        // Save to database
        const { error } = await supabase
          .from("creator_payout_settings")
          .upsert({
            creator_profile_id: creatorProfileId,
            stripe_account_id: result.accountId,
            account_status: "connected",
            payout_enabled: true,
          });

        if (error) throw error;

        toast({
          title: "Success",
          description: "Stripe Connect account connected successfully (mock)",
        });

        fetchPayoutData();
      }
    } catch (error) {
      console.error("Error connecting Stripe:", error);
      toast({
        title: "Error",
        description: "Failed to connect Stripe account",
        variant: "destructive",
      });
    } finally {
      setConnectingAccount(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending": return "bg-yellow-500";
      case "processing": return "bg-blue-500";
      case "paid": return "bg-green-500";
      case "failed": return "bg-red-500";
      default: return "bg-gray-500";
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Earnings Overview */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatPrice(earnings.totalEarnings)}</div>
            <p className="text-xs text-muted-foreground">From completed bookings</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Available Balance</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatPrice(earnings.availableBalance)}</div>
            <p className="text-xs text-muted-foreground">Ready for payout</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Earnings</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatPrice(earnings.pendingEarnings)}</div>
            <p className="text-xs text-muted-foreground">From unpaid bookings</p>
          </CardContent>
        </Card>
      </div>

      {/* Stripe Connect Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Stripe Connect Account
          </CardTitle>
          <CardDescription>
            Connect your Stripe account to receive payouts
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!payoutSettings || payoutSettings.account_status === "not_connected" ? (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                You need to connect a Stripe account to receive payouts for your completed bookings.
              </AlertDescription>
            </Alert>
          ) : (
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <p className="font-medium">Account Status</p>
                <p className="text-sm text-muted-foreground">
                  Account ID: {payoutSettings.stripe_account_id}
                </p>
              </div>
              <Badge className={`${getStatusColor(payoutSettings.account_status)} text-white capitalize`}>
                {payoutSettings.account_status}
              </Badge>
            </div>
          )}

          {(!payoutSettings || payoutSettings.account_status === "not_connected") && (
            <Button 
              onClick={handleConnectStripe}
              disabled={connectingAccount}
              className="w-full"
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              {connectingAccount ? "Connecting..." : "Connect Stripe Account (Mock)"}
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Payout History */}
      <Card>
        <CardHeader>
          <CardTitle>Payout History</CardTitle>
          <CardDescription>
            View your past and pending payouts
          </CardDescription>
        </CardHeader>
        <CardContent>
          {payouts.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <DollarSign className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>No payouts yet</p>
              <p className="text-sm">Payouts will appear here once bookings are completed</p>
            </div>
          ) : (
            <div className="space-y-4">
              {payouts.map((payout) => (
                <div 
                  key={payout.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="space-y-1">
                    <p className="font-medium">{formatPrice(payout.amount_cents)}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(payout.created_at).toLocaleDateString()}
                    </p>
                    {payout.stripe_payout_id && (
                      <p className="text-xs text-muted-foreground">
                        ID: {payout.stripe_payout_id}
                      </p>
                    )}
                  </div>
                  <Badge className={`${getStatusColor(payout.status)} text-white capitalize`}>
                    {payout.status}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PayoutsTab;
