import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Check, X, Shield, Sparkles, Crown } from "lucide-react";
import AnimatedSection from "@/components/AnimatedSection";
import GlowCard from "@/components/home/GlowCard";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

const plans = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    icon: Sparkles,
    highlighted: false,
    cta: "Get Started Free",
    ctaLink: "/brand-signup",
    showPrice: true,
    planKey: "free",
    features: [
      { text: "Browse creators", included: true },
      { text: "Message 1 creator/month", included: true },
      { text: "AI-drafted agreements", included: true },
      { text: "$15 per opportunity post", included: true },
      { text: "Verified Business Badge", included: false },
      { text: "Team access (invite members)", included: false },
      { text: "Free opportunity posts", included: false },
      { text: "Dedicated CSM", included: false },
    ],
  },
  {
    name: "Basic",
    price: "$99",
    period: "/year",
    icon: Shield,
    highlighted: true,
    badge: "Most Popular",
    cta: "Get a Quotation",
    ctaLink: "/brand-signup",
    showPrice: false,
    planKey: "basic",
    features: [
      { text: "Browse creators", included: true },
      { text: "Message 10 creators/month", included: true },
      { text: "AI-drafted agreements", included: true },
      { text: "4 free opportunity posts/month", included: true },
      { text: "Verified Business Badge", included: true },
      { text: "Team access (invite members)", included: false },
      { text: "Priority visibility", included: true },
      { text: "Dedicated CSM", included: false },
    ],
  },
  {
    name: "Pro",
    price: "$299",
    period: "/year",
    icon: Crown,
    highlighted: false,
    cta: "Get a Quotation",
    ctaLink: "/contact",
    showPrice: false,
    planKey: "pro",
    features: [
      { text: "Browse creators", included: true },
      { text: "Unlimited creator messaging", included: true },
      { text: "AI-drafted agreements", included: true },
      { text: "Unlimited opportunity posts", included: true },
      { text: "Verified Business Badge", included: true },
      { text: "Team access (invite members)", included: true },
      { text: "Priority visibility", included: true },
      { text: "Dedicated Customer Success Manager", included: true },
    ],
  },
];

const BrandPricingSection = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [submitting, setSubmitting] = useState(false);
  const [thankYouPlan, setThankYouPlan] = useState<string | null>(null);

  const handleQuotation = async (planKey: string) => {
    if (submitting) return;

    // Check if user is logged in and has a brand profile
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      // Not logged in — redirect to brand signup with quotation param
      navigate(`/brand-signup?quotation=${planKey}`);
      return;
    }

    // Check if they have a brand profile
    const { data: brandProfile } = await supabase
      .from("brand_profiles")
      .select("id, company_name")
      .eq("user_id", session.user.id)
      .maybeSingle();

    if (!brandProfile) {
      // Logged in but no brand profile
      navigate(`/brand-signup?quotation=${planKey}`);
      return;
    }

    // Already a brand — submit inquiry directly
    setSubmitting(true);
    try {
      const { error: inquiryError } = await supabase
        .from("quotation_inquiries")
        .insert({
          brand_profile_id: brandProfile.id,
          plan_type: planKey,
        });

      if (inquiryError) throw inquiryError;

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

  return (
    <>
      <section id="pricing" className="py-20 bg-muted/30 scroll-mt-20">
        <div className="container mx-auto px-4">
          <AnimatedSection animation="fade-up" className="text-center mb-12">
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
              <Shield className="h-4 w-4" />
              Pricing
            </span>
            <h2 className="text-3xl md:text-4xl font-heading font-bold mb-4">
              Simple, Transparent Pricing
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Start free and upgrade when you're ready to grow
            </p>
          </AnimatedSection>

          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {plans.map((plan, index) => {
              const CardWrapper = plan.highlighted ? GlowCard : "div";
              const wrapperProps = plan.highlighted
                ? { glowColor: "primary" as const }
                : { className: "rounded-2xl border border-border/50 bg-card" };

              return (
                <AnimatedSection key={plan.name} animation="fade-up" delay={index * 100}>
                  <CardWrapper {...wrapperProps}>
                    <div className="p-6 md:p-8 h-full flex flex-col">
                      {plan.badge && (
                        <span className="inline-flex self-start items-center gap-1 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold mb-4">
                          <Sparkles className="h-3 w-3" />
                          {plan.badge}
                        </span>
                      )}

                      <div className="flex items-center gap-2 mb-2">
                        <plan.icon className={cn(
                          "h-5 w-5",
                          plan.highlighted ? "text-primary" : "text-muted-foreground"
                        )} />
                        <h3 className="text-xl font-heading font-bold">{plan.name}</h3>
                      </div>

                      {plan.showPrice ? (
                        <div className="mb-6">
                          <span className="text-4xl font-heading font-bold">{plan.price}</span>
                          <span className="text-muted-foreground">{plan.period}</span>
                        </div>
                      ) : (
                        <div className="mb-6">
                          <span className="text-lg font-heading font-medium text-muted-foreground">
                            Contact us for pricing
                          </span>
                        </div>
                      )}

                      <ul className="space-y-3 mb-8 flex-1">
                        {plan.features.map((feature, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm">
                            {feature.included ? (
                              <Check className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                            ) : (
                              <X className="h-4 w-4 text-muted-foreground/40 mt-0.5 shrink-0" />
                            )}
                            <span className={cn(
                              feature.included ? "text-foreground" : "text-muted-foreground/60"
                            )}>
                              {feature.text}
                            </span>
                          </li>
                        ))}
                      </ul>

                      {plan.showPrice ? (
                        <Link to={plan.ctaLink} className="mt-auto">
                          <Button
                            className={cn(
                              "w-full",
                              plan.highlighted && "gradient-hero hover:opacity-90"
                            )}
                            variant={plan.highlighted ? "default" : "outline"}
                            size="lg"
                          >
                            {plan.cta}
                          </Button>
                        </Link>
                      ) : (
                        <Button
                          className={cn(
                            "w-full mt-auto",
                            plan.highlighted && "gradient-hero hover:opacity-90"
                          )}
                          variant={plan.highlighted ? "default" : "outline"}
                          size="lg"
                          disabled={submitting}
                          onClick={() => handleQuotation(plan.planKey)}
                        >
                          {submitting ? "Submitting..." : plan.cta}
                        </Button>
                      )}
                    </div>
                  </CardWrapper>
                </AnimatedSection>
              );
            })}
          </div>
        </div>
      </section>

      {/* Thank You Dialog */}
      <Dialog open={!!thankYouPlan} onOpenChange={() => setThankYouPlan(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-2xl font-heading">Thank You!</DialogTitle>
            <DialogDescription className="text-base pt-2">
              Thank you for inquiring about our{" "}
              <span className="font-semibold text-foreground">
                {thankYouPlan?.charAt(0).toUpperCase()}{thankYouPlan?.slice(1)}
              </span>{" "}
              plan. Our team will reach out to you very soon via phone or email.
            </DialogDescription>
          </DialogHeader>
          <Button onClick={() => setThankYouPlan(null)} className="w-full mt-2">
            OK
          </Button>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default BrandPricingSection;
