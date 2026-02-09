import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { AlertTriangle, X, ArrowUpRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getCurrentPlanType, getMessageLimit } from "@/lib/subscription-utils";

const MessagingLimitBanner = () => {
  const navigate = useNavigate();
  const [used, setUsed] = useState(0);
  const [limit, setLimit] = useState(1);
  const [dismissed, setDismissed] = useState(false);
  const [show, setShow] = useState(false);
  const [atLimit, setAtLimit] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const planType = await getCurrentPlanType(user.id);
        const msgLimit = getMessageLimit(planType);

        if (msgLimit === Infinity) return;

        setLimit(msgLimit);

        const { data: brand } = await supabase
          .from("brand_profiles")
          .select("creators_messaged_this_month, creators_messaged_reset_at")
          .eq("user_id", user.id)
          .maybeSingle();

        if (!brand) return;

        const resetAt = new Date(brand.creators_messaged_reset_at);
        const now = new Date();
        let count = brand.creators_messaged_this_month;
        if (now.getMonth() !== resetAt.getMonth() || now.getFullYear() !== resetAt.getFullYear()) {
          count = 0;
        }

        setUsed(count);

        const nearThreshold = msgLimit * 0.7;
        if (count >= nearThreshold) {
          setShow(true);
          setAtLimit(count >= msgLimit);
        }
      } catch (err) {
        console.error("Error fetching messaging limit:", err);
      }
    };
    fetch();
  }, []);

  if (!show || dismissed) return null;

  return (
    <Alert variant={atLimit ? "destructive" : "default"} className={`relative ${!atLimit ? "border-yellow-500/50 bg-yellow-50 dark:bg-yellow-950/20 text-yellow-900 dark:text-yellow-200 [&>svg]:text-yellow-600" : ""}`}>
      <AlertTriangle className="h-4 w-4" />
      <AlertTitle className="text-sm font-medium">
        {atLimit ? "Monthly limit reached" : "Approaching messaging limit"}
      </AlertTitle>
      <AlertDescription className="text-sm flex items-center justify-between gap-2 flex-wrap">
        <span>
          {atLimit
            ? `You've reached your monthly limit of ${limit} new creator${limit === 1 ? "" : "s"}. Upgrade to keep connecting.`
            : `You've messaged ${used} of ${limit} new creators this month. Upgrade for unlimited messaging.`}
        </span>
        <Button
          variant="link"
          size="sm"
          className="h-auto p-0 text-xs gap-1 shrink-0"
          onClick={() => navigate("/brand-dashboard?tab=account")}
        >
          Upgrade <ArrowUpRight className="h-3 w-3" />
        </Button>
      </AlertDescription>
      <button
        onClick={() => setDismissed(true)}
        className="absolute top-2 right-2 p-1 rounded-md hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
        aria-label="Dismiss"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </Alert>
  );
};

export default MessagingLimitBanner;
