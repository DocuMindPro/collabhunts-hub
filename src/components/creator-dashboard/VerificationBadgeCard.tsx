import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { format, isPast } from "date-fns";
import { Crown, CheckCircle, Clock, Sparkles, Bell, Loader2 } from "lucide-react";

interface VerificationBadgeCardProps {
  creatorProfileId: string;
}

const VerificationBadgeCard = ({ creatorProfileId }: VerificationBadgeCardProps) => {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [alreadyInterested, setAlreadyInterested] = useState(false);
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
    fetchData();
  }, [creatorProfileId]);

  const fetchData = async () => {
    setLoading(true);
    const [profileRes, interestRes] = await Promise.all([
      supabase
        .from("creator_profiles")
        .select("verification_payment_status, verification_paid_at, verification_expires_at")
        .eq("id", creatorProfileId)
        .single(),
      supabase
        .from("boost_interest_requests")
        .select("id")
        .eq("creator_profile_id", creatorProfileId)
        .eq("feature_type", "vip_badge")
        .maybeSingle(),
    ]);

    if (!profileRes.error && profileRes.data) {
      setVerificationStatus({
        payment_status: profileRes.data.verification_payment_status,
        paid_at: profileRes.data.verification_paid_at,
        expires_at: profileRes.data.verification_expires_at,
      });
    }
    setAlreadyInterested(!!interestRes.data);
    setLoading(false);
  };

  const handleInterest = async () => {
    setSubmitting(true);
    const { error } = await supabase
      .from("boost_interest_requests")
      .insert({
        creator_profile_id: creatorProfileId,
        feature_type: "vip_badge",
      });

    if (error) {
      console.error("Error submitting interest:", error);
      toast({
        title: "Error",
        description: "Could not submit your interest. Please try again.",
        variant: "destructive",
      });
    } else {
      setAlreadyInterested(true);
      toast({
        title: "Interest Noted!",
        description: "We've noted your interest! Our team will review and reach out to you soon.",
      });
    }
    setSubmitting(false);
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
    <Card className={isActive ? "border-amber-500/50 bg-amber-500/5" : ""}>
      <CardHeader className="p-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Crown className="h-4 w-4 text-amber-500" />
            VIP Creator Badge
          </CardTitle>
          {!isActive && (
            <Badge variant="secondary" className="text-[10px] px-2 py-0.5">
              Coming Soon
            </Badge>
          )}
        </div>
        <CardDescription className="text-xs">
          Stand out with a premium VIP badge on your profile
        </CardDescription>
      </CardHeader>
      <CardContent className="p-4 pt-0 space-y-3">
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

            {verificationStatus.expires_at &&
              new Date(verificationStatus.expires_at).getTime() - Date.now() < 30 * 24 * 60 * 60 * 1000 && (
              <Button
                variant="outline"
                onClick={handleInterest}
                disabled={submitting || alreadyInterested}
                className="w-full"
              >
                {submitting ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Bell className="h-4 w-4 mr-2" />
                )}
                {alreadyInterested ? "Interest Noted ✓" : "I'm Interested in Renewing"}
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
                  Express interest to renew your VIP Creator badge
                </p>
              </div>
            </div>
            <Button
              onClick={handleInterest}
              disabled={submitting || alreadyInterested}
              className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
            >
              {submitting ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : alreadyInterested ? (
                <CheckCircle className="h-4 w-4 mr-2" />
              ) : (
                <Bell className="h-4 w-4 mr-2" />
              )}
              {alreadyInterested ? "Interest Noted ✓" : "I'm Interested – $99/year"}
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

            {alreadyInterested ? (
              <div className="flex items-center gap-2 p-3 bg-green-500/10 border border-green-500/20 rounded-lg text-sm">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-green-700 dark:text-green-400 font-medium">
                  Interest noted! Our team will reach out soon.
                </span>
              </div>
            ) : (
              <Button
                onClick={handleInterest}
                disabled={submitting}
                className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
              >
                {submitting ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Bell className="h-4 w-4 mr-2" />
                )}
                I'm Interested
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default VerificationBadgeCard;
