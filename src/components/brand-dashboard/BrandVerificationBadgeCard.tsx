import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { format, addYears, isPast } from "date-fns";
import { Shield, CheckCircle, Clock, Sparkles, AlertCircle, Phone, XCircle } from "lucide-react";
import MockPaymentDialog from "@/components/payments/MockPaymentDialog";

const VERIFICATION_FEE_CENTS = 9900; // $99/year

interface BrandVerificationBadgeCardProps {
  brandProfileId: string;
  phoneVerified: boolean;
}

interface VerificationStatus {
  verification_status: string | null;
  verification_payment_status: string | null;
  verification_paid_at: string | null;
  verification_expires_at: string | null;
  verification_rejection_reason: string | null;
  is_verified: boolean | null;
}

const BrandVerificationBadgeCard = ({ brandProfileId, phoneVerified }: BrandVerificationBadgeCardProps) => {
  const [loading, setLoading] = useState(true);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState<VerificationStatus>({
    verification_status: null,
    verification_payment_status: null,
    verification_paid_at: null,
    verification_expires_at: null,
    verification_rejection_reason: null,
    is_verified: null,
  });

  useEffect(() => {
    fetchVerificationStatus();
  }, [brandProfileId]);

  const fetchVerificationStatus = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("brand_profiles")
      .select("verification_status, verification_payment_status, verification_paid_at, verification_expires_at, verification_rejection_reason, is_verified")
      .eq("id", brandProfileId)
      .single();

    if (!error && data) {
      setVerificationStatus({
        verification_status: data.verification_status,
        verification_payment_status: data.verification_payment_status,
        verification_paid_at: data.verification_paid_at,
        verification_expires_at: data.verification_expires_at,
        verification_rejection_reason: data.verification_rejection_reason,
        is_verified: data.is_verified,
      });
    }
    setLoading(false);
  };

  const handlePaymentSuccess = async (paymentId: string) => {
    const now = new Date();
    const expiresAt = addYears(now, 1);

    const { error } = await supabase
      .from("brand_profiles")
      .update({
        verification_payment_status: "paid",
        verification_paid_at: now.toISOString(),
        verification_expires_at: expiresAt.toISOString(),
        verification_payment_id: paymentId,
        verification_status: "pending",
        verification_submitted_at: now.toISOString(),
      })
      .eq("id", brandProfileId);

    if (error) {
      console.error("Error updating verification status:", error);
      toast({
        title: "Error",
        description: "Payment successful but failed to update status. Contact support.",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Verification Request Submitted!",
        description: "Our team will review your request within 24-48 hours.",
      });
      fetchVerificationStatus();
    }
    setShowPaymentDialog(false);
  };

  const isPaid = verificationStatus.verification_payment_status === "paid";
  const isExpired = verificationStatus.verification_expires_at && isPast(new Date(verificationStatus.verification_expires_at));
  const isPending = verificationStatus.verification_status === "pending";
  const isApproved = verificationStatus.verification_status === "approved" && verificationStatus.is_verified;
  const isRejected = verificationStatus.verification_status === "rejected";
  const isActive = isApproved && !isExpired;

  if (loading) {
    return (
      <Card className="animate-pulse">
        <CardHeader className="pb-3">
          <div className="h-5 bg-muted rounded w-1/2" />
        </CardHeader>
        <CardContent>
          <div className="h-16 bg-muted rounded" />
        </CardContent>
      </Card>
    );
  }

  // Phone not verified - show requirement
  if (!phoneVerified) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Shield className="h-4 w-4 text-primary" />
            Verified Business Badge
          </CardTitle>
          <CardDescription>
            Build trust with creators
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3 p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg">
            <Phone className="h-5 w-5 text-amber-600 shrink-0" />
            <div>
              <p className="font-medium text-amber-700 dark:text-amber-400 text-sm">
                Phone Verification Required
              </p>
              <p className="text-xs text-muted-foreground">
                Verify your phone number above before requesting verification
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className={isActive ? "border-primary/50 bg-primary/5" : ""}>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Shield className="h-4 w-4 text-primary" />
            Verified Business Badge
          </CardTitle>
          <CardDescription>
            Build trust with creators
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Active/Verified State */}
          {isActive && (
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
               <CheckCircle className="h-5 w-5 text-green-600 shrink-0" />
                <div>
                  <p className="font-medium text-green-700 dark:text-green-400 text-sm">
                    Verified Business
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Expires {format(new Date(verificationStatus.verification_expires_at!), "MMMM d, yyyy")} · Includes 4 free posts/month
                  </p>
                </div>
              </div>
              
              {/* Renew option if expiring within 30 days */}
              {verificationStatus.verification_expires_at && 
                new Date(verificationStatus.verification_expires_at).getTime() - Date.now() < 30 * 24 * 60 * 60 * 1000 && (
                <Button 
                  variant="outline" 
                  onClick={() => setShowPaymentDialog(true)}
                  className="w-full"
                  size="sm"
                >
                  <Clock className="h-4 w-4 mr-2" />
                  Renew Early ($99/year)
                </Button>
              )}
            </div>
          )}

          {/* Pending Review State */}
          {isPending && !isActive && (
            <div className="flex items-center gap-3 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
              <Clock className="h-5 w-5 text-blue-600 shrink-0" />
              <div>
                <p className="font-medium text-blue-700 dark:text-blue-400 text-sm">
                  Under Review
                </p>
                <p className="text-xs text-muted-foreground">
                  Our team will review your request within 24-48 hours
                </p>
              </div>
            </div>
          )}

          {/* Rejected State */}
          {isRejected && (
            <div className="space-y-3">
              <div className="flex items-start gap-3 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                <XCircle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-red-700 dark:text-red-400 text-sm">
                    Verification Declined
                  </p>
                  {verificationStatus.verification_rejection_reason && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {verificationStatus.verification_rejection_reason}
                    </p>
                  )}
                </div>
              </div>
              <Button onClick={() => setShowPaymentDialog(true)} className="w-full" size="sm">
                <Shield className="h-4 w-4 mr-2" />
                Reapply - $99/year
              </Button>
            </div>
          )}

          {/* Expired State */}
          {isPaid && isExpired && !isRejected && (
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                <Clock className="h-5 w-5 text-amber-600 shrink-0" />
                <div>
                  <p className="font-medium text-amber-700 dark:text-amber-400 text-sm">
                    Verification Expired
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Renew to restore your verified badge
                  </p>
                </div>
              </div>
              <Button onClick={() => setShowPaymentDialog(true)} className="w-full" size="sm">
                <Shield className="h-4 w-4 mr-2" />
                Renew Verification - $99/year
              </Button>
            </div>
          )}

          {/* Not Started State - Ready to Pay */}
          {!isPaid && !isPending && !isRejected && (
            <div className="space-y-3">
              <div className="space-y-2">
                <div className="flex items-start gap-2">
                  <Sparkles className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                  <div>
                    <p className="font-medium text-sm">Increase Creator Trust</p>
                    <p className="text-xs text-muted-foreground">
                      Verified businesses get more responses from top creators
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                  <div>
                    <p className="font-medium text-sm">4 Free Opportunity Posts/Month</p>
                    <p className="text-xs text-muted-foreground">
                      Post up to 4 opportunities per month at no extra cost
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                  <div>
                    <p className="font-medium text-sm">Priority Visibility</p>
                    <p className="text-xs text-muted-foreground">
                      Stand out when reaching out to creators
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div>
                  <p className="font-semibold text-sm">Annual Verification</p>
                  <p className="text-xs text-muted-foreground">Includes admin review</p>
                </div>
                <Badge variant="secondary" className="text-base px-2 py-0.5">
                  $99/year
                </Badge>
              </div>

              <Button onClick={() => setShowPaymentDialog(true)} className="w-full" size="sm">
                <Shield className="h-4 w-4 mr-2" />
                Get Verified
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <MockPaymentDialog
        open={showPaymentDialog}
        onOpenChange={setShowPaymentDialog}
        title="Verified Business Badge"
        description="Get verified to build trust with creators"
        lineItems={[
          {
            label: "Annual Business Verification",
            amountCents: VERIFICATION_FEE_CENTS,
          },
        ]}
        onSuccess={handlePaymentSuccess}
        onCancel={() => setShowPaymentDialog(false)}
      />
    </>
  );
};

export default BrandVerificationBadgeCard;
