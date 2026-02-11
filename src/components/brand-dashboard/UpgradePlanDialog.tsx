import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, X, Shield, Sparkles, Crown } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const plans = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    icon: Sparkles,
    planKey: "free",
    showPrice: true,
    features: [
      { text: "Browse creators", included: true },
      { text: "Message 1 creator/month", included: true },
      { text: "5 AI-drafted agreements/month", included: true },
      { text: "$40 per opportunity post", included: true },
      { text: "Verified Business Badge", included: false },
      { text: "Team access", included: false },
    ],
  },
  {
    name: "Basic",
    price: "$99",
    period: "/year",
    icon: Shield,
    planKey: "basic",
    showPrice: false,
    badge: "Most Popular",
    features: [
      { text: "Browse creators", included: true },
      { text: "Message 10 creators/month", included: true },
      { text: "30 AI-drafted agreements/month", included: true },
      { text: "4 free opportunity posts/month", included: true },
      { text: "Verified Business Badge", included: true },
      { text: "Priority visibility", included: true },
    ],
  },
  {
    name: "Pro",
    price: "$299",
    period: "/year",
    icon: Crown,
    planKey: "pro",
    showPrice: false,
    features: [
      { text: "Browse creators", included: true },
      { text: "Unlimited creator messaging", included: true },
      { text: "100 AI-drafted agreements/month", included: true },
      { text: "Unlimited opportunity posts", included: true },
      { text: "Team access", included: true },
      { text: "Dedicated CSM", included: true },
    ],
  },
];

interface UpgradePlanDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentPlan: string;
}

const UpgradePlanDialog = ({ open, onOpenChange, currentPlan }: UpgradePlanDialogProps) => {
  const { toast } = useToast();
  const [submitting, setSubmitting] = useState(false);
  const [thankYouPlan, setThankYouPlan] = useState<string | null>(null);

  const handleQuotation = async (planKey: string) => {
    if (submitting) return;
    setSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: brandProfile } = await supabase
        .from("brand_profiles")
        .select("id, company_name")
        .eq("user_id", user.id)
        .maybeSingle();

      if (!brandProfile) return;

      const { error } = await supabase
        .from("quotation_inquiries")
        .insert({
          brand_profile_id: brandProfile.id,
          plan_type: planKey,
        });

      if (error) throw error;

      // Notify admins
      const { data: admins } = await supabase
        .from("user_roles")
        .select("user_id")
        .eq("role", "admin");

      if (admins && admins.length > 0) {
        const notifications = admins.map((admin) => ({
          user_id: admin.user_id,
          title: "New Quotation Inquiry",
          message: `${brandProfile.company_name} is inquiring about the ${planKey.charAt(0).toUpperCase() + planKey.slice(1)} plan`,
          type: "quotation_inquiry",
          link: "/admin",
        }));
        await supabase.from("notifications").insert(notifications);
      }

      setThankYouPlan(planKey);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to submit inquiry",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (thankYouPlan) {
    return (
      <Dialog open={open} onOpenChange={(v) => { if (!v) { setThankYouPlan(null); } onOpenChange(v); }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl font-heading">Thank You!</DialogTitle>
            <DialogDescription className="text-base pt-2">
              Thank you for inquiring about our{" "}
              <span className="font-semibold text-foreground">
                {thankYouPlan.charAt(0).toUpperCase()}{thankYouPlan.slice(1)}
              </span>{" "}
              plan. Our team will reach out to you very soon via phone or email.
            </DialogDescription>
          </DialogHeader>
          <Button onClick={() => { setThankYouPlan(null); onOpenChange(false); }} className="w-full mt-2">
            OK
          </Button>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-heading">Upgrade Your Plan</DialogTitle>
          <DialogDescription>
            Choose the plan that fits your business needs
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          {plans.map((plan) => {
            const isCurrent = currentPlan === plan.planKey;
            const isUpgrade = !isCurrent && plan.planKey !== "free";

            return (
              <div
                key={plan.planKey}
                className={cn(
                  "rounded-xl border p-5 flex flex-col relative transition-shadow",
                  isCurrent
                    ? "border-primary bg-primary/5 shadow-md"
                    : "border-border hover:shadow-md"
                )}
              >
                {plan.badge && (
                  <Badge className="absolute -top-2.5 left-4 gap-1 text-xs">
                    <Sparkles className="h-3 w-3" />
                    {plan.badge}
                  </Badge>
                )}
                {isCurrent && (
                  <Badge variant="outline" className="absolute -top-2.5 right-4 text-xs border-primary text-primary">
                    Current Plan
                  </Badge>
                )}

                <div className="flex items-center gap-2 mb-3 mt-1">
                  <plan.icon className={cn("h-5 w-5", isCurrent ? "text-primary" : "text-muted-foreground")} />
                  <h3 className="font-heading font-bold text-lg">{plan.name}</h3>
                </div>

                {plan.showPrice ? (
                  <div className="mb-4">
                    <span className="text-3xl font-heading font-bold">{plan.price}</span>
                    <span className="text-muted-foreground text-sm"> {plan.period}</span>
                  </div>
                ) : (
                  <div className="mb-4">
                    <span className="text-sm font-medium text-muted-foreground">Contact us for pricing</span>
                  </div>
                )}

                <ul className="space-y-2 mb-5 flex-1">
                  {plan.features.map((f, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      {f.included ? (
                        <Check className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                      ) : (
                        <X className="h-4 w-4 text-muted-foreground/40 mt-0.5 shrink-0" />
                      )}
                      <span className={f.included ? "text-foreground" : "text-muted-foreground/60"}>
                        {f.text}
                      </span>
                    </li>
                  ))}
                </ul>

                {isCurrent ? (
                  <Button variant="outline" size="sm" disabled className="w-full mt-auto">
                    Current Plan
                  </Button>
                ) : isUpgrade ? (
                  <Button
                    size="sm"
                    className="w-full mt-auto"
                    disabled={submitting}
                    onClick={() => handleQuotation(plan.planKey)}
                  >
                    {submitting ? "Submitting..." : "Get a Quotation"}
                  </Button>
                ) : null}
              </div>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default UpgradePlanDialog;
