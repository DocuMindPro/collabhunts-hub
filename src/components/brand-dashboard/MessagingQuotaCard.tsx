import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { MessageSquare, ArrowUpRight } from "lucide-react";
import { getCurrentPlanType, getMessageLimit } from "@/lib/subscription-utils";
import UpgradePlanDialog from "./UpgradePlanDialog";

const MessagingQuotaCard = () => {
  const [used, setUsed] = useState(0);
  const [upgradeOpen, setUpgradeOpen] = useState(false);
  const [limit, setLimit] = useState(1);
  const [planLabel, setPlanLabel] = useState("Free");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const planType = await getCurrentPlanType(user.id);
        const msgLimit = getMessageLimit(planType);

        const label = planType === "pro" ? "Pro" : planType === "basic" ? "Basic" : "Free";
        setPlanLabel(label);
        setLimit(msgLimit);

        if (msgLimit === Infinity) {
          setUsed(0);
          return;
        }

        const { data: brand } = await supabase
          .from("brand_profiles")
          .select("creators_messaged_this_month, creators_messaged_reset_at")
          .eq("user_id", user.id)
          .maybeSingle();

        if (!brand) return;

        // Check if counter needs a visual reset (new month)
        const resetAt = new Date(brand.creators_messaged_reset_at);
        const now = new Date();
        if (now.getMonth() !== resetAt.getMonth() || now.getFullYear() !== resetAt.getFullYear()) {
          setUsed(0);
        } else {
          setUsed(brand.creators_messaged_this_month);
        }
      } catch (err) {
        console.error("Error fetching messaging quota:", err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  if (loading) return null;

  const isUnlimited = limit === Infinity;
  const percentage = isUnlimited ? 0 : Math.min((used / limit) * 100, 100);
  const atLimit = !isUnlimited && used >= limit;
  const nearLimit = !isUnlimited && !atLimit && used >= limit * 0.7;

  return (
    <Card>
      <CardHeader className="py-3 px-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            Creator Messaging
          </CardTitle>
          <span className="text-xs text-muted-foreground">{planLabel} plan</span>
        </div>
      </CardHeader>
      <CardContent className="px-4 pb-4 space-y-3">
        {isUnlimited ? (
          <p className="text-sm text-muted-foreground">Unlimited creator messaging</p>
        ) : (
          <>
            <div className="flex items-baseline justify-between">
              <p className="text-lg font-semibold">
                {used} <span className="text-sm font-normal text-muted-foreground">/ {limit}</span>
              </p>
              <span className="text-xs text-muted-foreground">new creators this month</span>
            </div>
            <Progress
              value={percentage}
              className={`h-2 ${atLimit ? "[&>div]:bg-destructive" : nearLimit ? "[&>div]:bg-yellow-500" : ""}`}
            />
            {atLimit && (
              <div className="flex items-center justify-between pt-1">
                <p className="text-xs text-destructive">Monthly limit reached</p>
                <Button
                  variant="link"
                  size="sm"
                  className="h-auto p-0 text-xs gap-1"
                  onClick={() => setUpgradeOpen(true)}
                >
                  Upgrade <ArrowUpRight className="h-3 w-3" />
                </Button>
              </div>
            )}
          </>
        )}
      </CardContent>
      <UpgradePlanDialog open={upgradeOpen} onOpenChange={setUpgradeOpen} currentPlan={planLabel.toLowerCase()} />
    </Card>
  );
};

export default MessagingQuotaCard;