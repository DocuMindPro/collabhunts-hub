import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { format, addYears, isPast } from "date-fns";
import { Crown, CheckCircle, Clock, Sparkles } from "lucide-react";
import MockPaymentDialog from "@/components/payments/MockPaymentDialog";

const VIP_FEE_CENTS = 9900; // $99/year

interface VerificationBadgeCardProps {
  creatorProfileId: string;
}

const VerificationBadgeCard = ({ creatorProfileId }: VerificationBadgeCardProps) => {
  const [loading, setLoading] = useState(true);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState<{
    payment_status: string | null;
    paid_at: string | null;
    expires_at: string | null;
  }>({
    payment_status: null,
    paid_at: null,
    expires_at: null,
  });

  useEffect(() => {
    fetchVerificationStatus();
  }, [creatorProfileId]);

  const fetchVerificationStatus = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("creator_profiles")
      .select("verification_payment_status, verification_paid_at, verification_expires_at")
      .eq("id", creatorProfileId)
      .single();

    if (!error && data) {
      setVerificationStatus({
        payment_status: data.verification_payment_status,
        paid_at: data.verification_paid_at,
        expires_at: data.verification_expires_at,
      });
    }
    setLoading(false);
  };

  const handlePaymentSuccess = async (paymentId: string) => {
    const now = new Date();
    const expiresAt = addYears(now, 1);

    const { error } = await supabase
      .from("creator_profiles")
      .update({
        verification_payment_status: "paid",
        verification_paid_at: now.toISOString(),
        verification_expires_at: expiresAt.toISOString(),
        verification_payment_id: paymentId,
      })
      .eq("id", creatorProfileId);

    if (error) {
      console.error("Error updating verification status:", error);
      toast({
        title: "Error",
        description: "Payment successful but failed to update status. Contact support.",
        variant: "destructive",
      });
    } else {
      toast({
        title: "VIP Badge Activated!",
        description: "Your VIP badge is now active for 1 year.",
      });
      fetchVerificationStatus();
    }
    setShowPaymentDialog(false);
  };

  const isPaid = verificationStatus.payment_status === "paid";
  const isExpired = verificationStatus.expires_at && isPast(new Date(verificationStatus.expires_at));
  const isActive = isPaid && !isExpired;

  if (loading) {
    return (
      <Card className="animate-pulse">
        <CardHeader>
          <div className="h-6 bg-muted rounded w-1/2" />
        </CardHeader>
        <CardContent>
          <div className="h-20 bg-muted rounded" />
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className={isActive ? "border-amber-500/50 bg-amber-500/5" : ""}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Crown className="h-5 w-5 text-amber-500" />
            VIP Creator Badge
          </CardTitle>
          <CardDescription>
            Stand out with a premium VIP badge on your profile
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {isActive ? (
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-4 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                <CheckCircle className="h-6 w-6 text-amber-600" />
                <div>
                  <p className="font-medium text-amber-700 dark:text-amber-400">
                    VIP Creator Active
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Expires on {format(new Date(verificationStatus.expires_at!), "MMMM d, yyyy")}
                  </p>
                </div>
              </div>
              
              {/* Renew option if expiring within 30 days */}
              {verificationStatus.expires_at && 
                new Date(verificationStatus.expires_at).getTime() - Date.now() < 30 * 24 * 60 * 60 * 1000 && (
                <Button 
                  variant="outline" 
                  onClick={() => setShowPaymentDialog(true)}
                  className="w-full"
                >
                  <Clock className="h-4 w-4 mr-2" />
                  Renew Early ($99/year)
                </Button>
              )}
            </div>
          ) : isExpired ? (
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-4 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                <Clock className="h-6 w-6 text-amber-600" />
                <div>
                  <p className="font-medium text-amber-700 dark:text-amber-400">
                    VIP Status Expired
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Renew to restore your VIP Creator badge
                  </p>
                </div>
              </div>
              <Button onClick={() => setShowPaymentDialog(true)} className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600">
                <Crown className="h-4 w-4 mr-2" />
                Renew VIP - $99/year
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <Sparkles className="h-5 w-5 text-amber-500 mt-0.5" />
                  <div>
                    <p className="font-medium">Premium Visibility</p>
                    <p className="text-sm text-muted-foreground">
                      A gold VIP badge shows brands you're a top-tier creator
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-amber-500 mt-0.5" />
                  <div>
                    <p className="font-medium">Stand Out in Search</p>
                    <p className="text-sm text-muted-foreground">
                      VIP creators appear higher in brand searches
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20 rounded-lg">
                <div>
                  <p className="font-semibold">VIP Creator Badge</p>
                  <p className="text-sm text-muted-foreground">One-time yearly payment</p>
                </div>
                <Badge className="text-lg px-3 py-1 bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0">
                  $99/year
                </Badge>
              </div>

              <Button onClick={() => setShowPaymentDialog(true)} className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600">
                <Crown className="h-4 w-4 mr-2" />
                Become VIP
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <MockPaymentDialog
        open={showPaymentDialog}
        onOpenChange={setShowPaymentDialog}
        title="VIP Creator Badge"
        description="Become a VIP Creator to boost your visibility with brands"
        lineItems={[
          {
            label: "Annual VIP Creator Badge",
            amountCents: VIP_FEE_CENTS,
          },
        ]}
        onSuccess={handlePaymentSuccess}
        onCancel={() => setShowPaymentDialog(false)}
      />
    </>
  );
};

export default VerificationBadgeCard;
