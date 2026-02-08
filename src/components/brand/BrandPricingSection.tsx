import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Check, X, Shield, Sparkles, Crown } from "lucide-react";
import AnimatedSection from "@/components/AnimatedSection";
import GlowCard from "@/components/home/GlowCard";
import { cn } from "@/lib/utils";

const plans = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    icon: Sparkles,
    highlighted: false,
    cta: "Get Started Free",
    ctaLink: "/brand-signup",
    features: [
      { text: "Browse creators", included: true },
      { text: "Direct messaging", included: true },
      { text: "AI-drafted agreements", included: true },
      { text: "$15 per opportunity post", included: true },
      { text: "Verified Business Badge", included: false },
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
    cta: "Get Started",
    ctaLink: "/brand-signup",
    features: [
      { text: "Browse creators", included: true },
      { text: "Direct messaging", included: true },
      { text: "AI-drafted agreements", included: true },
      { text: "3 free opportunity posts/month", included: true },
      { text: "Verified Business Badge", included: true },
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
    cta: "Contact Us",
    ctaLink: "/contact",
    features: [
      { text: "Browse creators", included: true },
      { text: "Direct messaging", included: true },
      { text: "AI-drafted agreements", included: true },
      { text: "Unlimited opportunity posts", included: true },
      { text: "Verified Business Badge", included: true },
      { text: "Priority visibility", included: true },
      { text: "Dedicated Customer Success Manager", included: true },
    ],
  },
];

const BrandPricingSection = () => {
  return (
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

                    <div className="mb-6">
                      <span className="text-4xl font-heading font-bold">{plan.price}</span>
                      <span className="text-muted-foreground">{plan.period}</span>
                    </div>

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
                  </div>
                </CardWrapper>
              </AnimatedSection>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default BrandPricingSection;
