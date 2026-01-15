import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Check, Lock, Crown, X } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { getCurrentPlanType, PlanType } from "@/lib/subscription-utils";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const Pricing = () => {
  const [currentPlan, setCurrentPlan] = useState<PlanType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [hasBrandProfile, setHasBrandProfile] = useState(false);

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  useEffect(() => {
    const checkUserAndSubscription = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        setIsAuthenticated(!!user);
        
        if (user) {
          const { data: brandProfile } = await supabase
            .from('brand_profiles')
            .select('id')
            .eq('user_id', user.id)
            .maybeSingle();
          
          setHasBrandProfile(!!brandProfile);
          
          if (brandProfile) {
            const plan = await getCurrentPlanType(user.id);
            setCurrentPlan(plan);
          }
        }
      } catch (error) {
        console.error('Error checking subscription:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    checkUserAndSubscription();
  }, []);

  const planTypeMap: Record<string, PlanType> = {
    'Basic': 'basic',
    'Pro': 'pro',
    'Premium': 'premium'
  };

  const tierOrder: PlanType[] = ['none', 'basic', 'pro', 'premium'];

  const getCtaAndLink = (planName: string): { cta: string; link: string; disabled: boolean } => {
    const planType = planTypeMap[planName];
    
    if (!isAuthenticated || !hasBrandProfile) {
      return { cta: "Get Started", link: "/brand-signup", disabled: false };
    }
    
    if (currentPlan === planType) {
      return { cta: "Current Plan", link: "#", disabled: true };
    }
    
    const currentIndex = tierOrder.indexOf(currentPlan || 'none');
    const targetIndex = tierOrder.indexOf(planType);
    
    if (currentIndex > targetIndex) {
      return { cta: "Contact Support", link: "mailto:care@collabhunts.com?subject=Downgrade Request", disabled: false };
    }
    
    if (currentPlan === 'none') {
      return { cta: `Subscribe to ${planName}`, link: "/brand-dashboard?tab=subscription", disabled: false };
    }
    
    return { cta: `Upgrade to ${planName}`, link: "/brand-dashboard?tab=subscription", disabled: false };
  };

  const isCurrentPlan = (planName: string): boolean => {
    return currentPlan === planTypeMap[planName];
  };

  const plans = [
    {
      name: "Basic",
      price: "$39",
      period: "/mo",
      description: "Start connecting with creators",
      features: [
        { text: "Search influencers on the marketplace", included: true },
        { text: "Chat & negotiate with creators", included: true },
        { text: "View all creator package pricing", included: true },
        { text: "Content Library with 10 GB storage", included: true },
        { text: "Post campaigns", included: false, locked: true },
        { text: "Advanced filters", included: false, locked: true },
        { text: "Save creators & add notes (CRM)", included: false, locked: true },
        { text: "Mass campaign invitations", included: false, locked: true },
        { text: "Verified Business Badge", included: false, locked: true },
      ],
      popular: false,
    },
    {
      name: "Pro",
      price: "$99",
      period: "/mo",
      description: "For growing brands",
      features: [
        { text: "Everything in Basic", included: true },
        { text: "Post 1 campaign per month", included: true },
        { text: "Advanced filters for age, ethnicity, language and more", included: true },
        { text: "Save creators & add private notes (CRM)", included: true },
        { text: "Mass campaign invites (50/day)", included: true },
        { text: "Verified Business Badge (upon approval)", included: true },
      ],
      popular: true,
    },
    {
      name: "Premium",
      price: "$299",
      period: "/mo",
      description: "For established businesses",
      features: [
        { text: "Everything in Pro", included: true },
        { text: "Post unlimited campaigns", included: true },
        { text: "Content Library with 50 GB storage", included: true },
        { text: "Mass campaign invites (100/day)", included: true },
        { text: "Priority customer support (Coming Soon)", included: true },
        { text: "Dedicated account manager (Coming Soon)", included: true },
      ],
      popular: false,
    },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1">
        {/* Header */}
        <section className="py-20 gradient-subtle">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-heading font-bold mb-4">
              Supercharge Your{" "}
              <span className="text-primary">
                Influencer Marketing
              </span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-4">
              Choose the perfect plan for your brand's growth
            </p>
            {isAuthenticated && hasBrandProfile && currentPlan && (
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full">
                <Crown className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">
                  Your current plan: <span className="text-primary capitalize">{currentPlan === 'none' ? 'No Package' : currentPlan}</span>
                </span>
              </div>
            )}
            {!isAuthenticated && (
              <p className="text-sm text-muted-foreground">
                Not ready to commit? Sign up free and explore our creator marketplace.
              </p>
            )}
          </div>
        </section>

        {/* Pricing Cards */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {plans.map((plan, index) => {
                const { cta, link, disabled } = getCtaAndLink(plan.name);
                const isCurrent = isCurrentPlan(plan.name);
                
                return (
                  <div
                    key={index}
                    className={`relative bg-card rounded-2xl border-2 p-8 transition-all ${
                      isCurrent
                        ? "border-primary shadow-hover ring-2 ring-primary/20"
                        : plan.popular
                        ? "border-primary shadow-hover scale-105"
                        : "border-border"
                    }`}
                  >
                    {isCurrent && (
                      <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-primary text-primary-foreground text-sm font-medium rounded-full flex items-center gap-1">
                        <Crown className="h-3 w-3" />
                        Your Plan
                      </div>
                    )}
                    {!isCurrent && plan.popular && (
                      <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-primary text-primary-foreground text-sm font-medium rounded-full">
                        Most Popular
                      </div>
                    )}

                    <div className="mb-6">
                      <h3 className="text-2xl font-heading font-bold mb-2">
                        {plan.name}
                      </h3>
                      <p className="text-muted-foreground mb-4">
                        {plan.description}
                      </p>
                      <div className="flex items-baseline">
                        <span className="text-5xl font-heading font-bold">
                          {plan.price}
                        </span>
                        {plan.period && (
                          <span className="text-muted-foreground ml-2">
                            {plan.period}
                          </span>
                        )}
                      </div>
                    </div>

                    <ul className="space-y-3 mb-8">
                      {plan.features.map((feature, featureIndex) => (
                        <li key={featureIndex} className="flex items-start gap-3">
                          {feature.included ? (
                            <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                          ) : feature.locked ? (
                            <Lock className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                          ) : (
                            <Lock className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                          )}
                          <span
                            className={
                              feature.included
                                ? "text-foreground"
                                : "text-muted-foreground"
                            }
                          >
                            {feature.text}
                          </span>
                        </li>
                      ))}
                    </ul>

                    {disabled ? (
                      <Button
                        className="w-full bg-muted text-muted-foreground cursor-not-allowed"
                        size="lg"
                        disabled
                      >
                        {cta}
                      </Button>
                    ) : link.startsWith('mailto:') ? (
                      <a href={link}>
                        <Button
                          className="w-full bg-secondary hover:bg-secondary/80 text-secondary-foreground"
                          size="lg"
                        >
                          {cta}
                        </Button>
                      </a>
                    ) : (
                      <Link to={link}>
                        <Button
                          className={`w-full ${
                            plan.popular || isCurrent
                              ? "gradient-hero hover:opacity-90"
                              : "bg-secondary hover:bg-secondary/80 text-secondary-foreground"
                          }`}
                          size="lg"
                        >
                          {cta}
                        </Button>
                      </Link>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="mt-12 text-center">
              <div className="inline-flex items-center gap-2 px-6 py-3 bg-muted rounded-full">
                {isAuthenticated && hasBrandProfile && currentPlan === 'none' ? (
                  <>
                    <span className="text-sm text-muted-foreground">
                      <strong>Subscribe now</strong> to unlock all platform features.
                    </span>
                    <Link to="/brand-dashboard?tab=subscription" className="text-sm text-primary font-medium hover:underline">
                      View plans →
                    </Link>
                  </>
                ) : (
                  <>
                    <span className="text-sm text-muted-foreground">
                      <strong>No subscription?</strong> You can still browse creators and explore the marketplace.
                    </span>
                    {!isAuthenticated && (
                      <Link to="/brand-signup" className="text-sm text-primary font-medium hover:underline">
                        Sign up free →
                      </Link>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Feature Comparison Table */}
        <section className="py-20 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-heading font-bold mb-4">
                Compare All Features
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                See exactly what's included in each plan
              </p>
            </div>

            <div className="max-w-5xl mx-auto overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="w-[300px] font-heading font-bold text-foreground">Feature</TableHead>
                    <TableHead className="text-center font-heading font-bold text-foreground">
                      <div className="flex flex-col items-center gap-1">
                        <span>Basic</span>
                        <span className="text-primary font-normal text-sm">$39/mo</span>
                      </div>
                    </TableHead>
                    <TableHead className="text-center font-heading font-bold text-foreground">
                      <div className="flex flex-col items-center gap-1">
                        <span className="flex items-center gap-1">
                          Pro
                          <Badge variant="secondary" className="text-xs">Popular</Badge>
                        </span>
                        <span className="text-primary font-normal text-sm">$99/mo</span>
                      </div>
                    </TableHead>
                    <TableHead className="text-center font-heading font-bold text-foreground">
                      <div className="flex flex-col items-center gap-1">
                        <span>Premium</span>
                        <span className="text-primary font-normal text-sm">$299/mo</span>
                      </div>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {/* Marketplace Access */}
                  <TableRow className="bg-muted/20">
                    <TableCell colSpan={4} className="font-heading font-semibold text-primary">
                      Marketplace Access
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Browse creator marketplace</TableCell>
                    <TableCell className="text-center"><Check className="h-5 w-5 text-primary mx-auto" /></TableCell>
                    <TableCell className="text-center"><Check className="h-5 w-5 text-primary mx-auto" /></TableCell>
                    <TableCell className="text-center"><Check className="h-5 w-5 text-primary mx-auto" /></TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>View creator pricing</TableCell>
                    <TableCell className="text-center"><Check className="h-5 w-5 text-primary mx-auto" /></TableCell>
                    <TableCell className="text-center"><Check className="h-5 w-5 text-primary mx-auto" /></TableCell>
                    <TableCell className="text-center"><Check className="h-5 w-5 text-primary mx-auto" /></TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Message creators directly</TableCell>
                    <TableCell className="text-center"><Check className="h-5 w-5 text-primary mx-auto" /></TableCell>
                    <TableCell className="text-center"><Check className="h-5 w-5 text-primary mx-auto" /></TableCell>
                    <TableCell className="text-center"><Check className="h-5 w-5 text-primary mx-auto" /></TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Advanced filters (age, gender, ethnicity, language)</TableCell>
                    <TableCell className="text-center"><X className="h-5 w-5 text-muted-foreground mx-auto" /></TableCell>
                    <TableCell className="text-center"><Check className="h-5 w-5 text-primary mx-auto" /></TableCell>
                    <TableCell className="text-center"><Check className="h-5 w-5 text-primary mx-auto" /></TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Platform-specific follower filtering</TableCell>
                    <TableCell className="text-center"><X className="h-5 w-5 text-muted-foreground mx-auto" /></TableCell>
                    <TableCell className="text-center"><Check className="h-5 w-5 text-primary mx-auto" /></TableCell>
                    <TableCell className="text-center"><Check className="h-5 w-5 text-primary mx-auto" /></TableCell>
                  </TableRow>

                  {/* Campaigns */}
                  <TableRow className="bg-muted/20">
                    <TableCell colSpan={4} className="font-heading font-semibold text-primary">
                      Campaigns
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Post campaigns</TableCell>
                    <TableCell className="text-center"><X className="h-5 w-5 text-muted-foreground mx-auto" /></TableCell>
                    <TableCell className="text-center"><span className="text-sm font-medium">1/month</span></TableCell>
                    <TableCell className="text-center"><span className="text-sm font-medium text-primary">Unlimited</span></TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Mass campaign invitations</TableCell>
                    <TableCell className="text-center"><X className="h-5 w-5 text-muted-foreground mx-auto" /></TableCell>
                    <TableCell className="text-center"><span className="text-sm font-medium">50/day</span></TableCell>
                    <TableCell className="text-center"><span className="text-sm font-medium">100/day</span></TableCell>
                  </TableRow>

                  {/* CRM & Organization */}
                  <TableRow className="bg-muted/20">
                    <TableCell colSpan={4} className="font-heading font-semibold text-primary">
                      CRM & Organization
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Save favorite creators</TableCell>
                    <TableCell className="text-center"><X className="h-5 w-5 text-muted-foreground mx-auto" /></TableCell>
                    <TableCell className="text-center"><Check className="h-5 w-5 text-primary mx-auto" /></TableCell>
                    <TableCell className="text-center"><Check className="h-5 w-5 text-primary mx-auto" /></TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Add private notes on creators</TableCell>
                    <TableCell className="text-center"><X className="h-5 w-5 text-muted-foreground mx-auto" /></TableCell>
                    <TableCell className="text-center"><Check className="h-5 w-5 text-primary mx-auto" /></TableCell>
                    <TableCell className="text-center"><Check className="h-5 w-5 text-primary mx-auto" /></TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Organize creators in folders</TableCell>
                    <TableCell className="text-center"><X className="h-5 w-5 text-muted-foreground mx-auto" /></TableCell>
                    <TableCell className="text-center"><Check className="h-5 w-5 text-primary mx-auto" /></TableCell>
                    <TableCell className="text-center"><Check className="h-5 w-5 text-primary mx-auto" /></TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Track collaboration history</TableCell>
                    <TableCell className="text-center"><X className="h-5 w-5 text-muted-foreground mx-auto" /></TableCell>
                    <TableCell className="text-center"><Check className="h-5 w-5 text-primary mx-auto" /></TableCell>
                    <TableCell className="text-center"><Check className="h-5 w-5 text-primary mx-auto" /></TableCell>
                  </TableRow>

                  {/* Content Library */}
                  <TableRow className="bg-muted/20">
                    <TableCell colSpan={4} className="font-heading font-semibold text-primary">
                      Content Library
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Cloud storage for content</TableCell>
                    <TableCell className="text-center"><span className="text-sm font-medium">10 GB</span></TableCell>
                    <TableCell className="text-center"><span className="text-sm font-medium">10 GB</span></TableCell>
                    <TableCell className="text-center"><span className="text-sm font-medium text-primary">50 GB</span></TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Purchase additional storage</TableCell>
                    <TableCell className="text-center"><Check className="h-5 w-5 text-primary mx-auto" /></TableCell>
                    <TableCell className="text-center"><Check className="h-5 w-5 text-primary mx-auto" /></TableCell>
                    <TableCell className="text-center"><Check className="h-5 w-5 text-primary mx-auto" /></TableCell>
                  </TableRow>

                  {/* Trust & Verification */}
                  <TableRow className="bg-muted/20">
                    <TableCell colSpan={4} className="font-heading font-semibold text-primary">
                      Trust & Verification
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Verified Business Badge eligibility</TableCell>
                    <TableCell className="text-center"><X className="h-5 w-5 text-muted-foreground mx-auto" /></TableCell>
                    <TableCell className="text-center"><Check className="h-5 w-5 text-primary mx-auto" /></TableCell>
                    <TableCell className="text-center"><Check className="h-5 w-5 text-primary mx-auto" /></TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Marketplace fee</TableCell>
                    <TableCell className="text-center"><span className="text-sm font-medium">15%</span></TableCell>
                    <TableCell className="text-center"><span className="text-sm font-medium">15%</span></TableCell>
                    <TableCell className="text-center"><span className="text-sm font-medium">15%</span></TableCell>
                  </TableRow>

                  {/* Support */}
                  <TableRow className="bg-muted/20">
                    <TableCell colSpan={4} className="font-heading font-semibold text-primary">
                      Support
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Email support</TableCell>
                    <TableCell className="text-center"><Check className="h-5 w-5 text-primary mx-auto" /></TableCell>
                    <TableCell className="text-center"><Check className="h-5 w-5 text-primary mx-auto" /></TableCell>
                    <TableCell className="text-center"><Check className="h-5 w-5 text-primary mx-auto" /></TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Priority support</TableCell>
                    <TableCell className="text-center"><X className="h-5 w-5 text-muted-foreground mx-auto" /></TableCell>
                    <TableCell className="text-center"><X className="h-5 w-5 text-muted-foreground mx-auto" /></TableCell>
                    <TableCell className="text-center">
                      <span className="text-xs text-muted-foreground">Coming Soon</span>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Dedicated account manager</TableCell>
                    <TableCell className="text-center"><X className="h-5 w-5 text-muted-foreground mx-auto" /></TableCell>
                    <TableCell className="text-center"><X className="h-5 w-5 text-muted-foreground mx-auto" /></TableCell>
                    <TableCell className="text-center">
                      <span className="text-xs text-muted-foreground">Coming Soon</span>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>

            {/* CTA below table */}
            <div className="text-center mt-10">
              <Link to={isAuthenticated ? "/brand-dashboard?tab=subscription" : "/brand-signup"}>
                <Button size="lg" className="gradient-hero hover:opacity-90">
                  {isAuthenticated ? "Manage Subscription" : "Get Started Today"}
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 gradient-accent">
          <div className="container mx-auto px-4 text-center">
            <div className="max-w-3xl mx-auto bg-card/95 backdrop-blur rounded-2xl p-12 shadow-card">
              <h2 className="text-3xl md:text-4xl font-heading font-bold mb-4">
                Still on the Fence? Book a Demo
              </h2>
              <p className="text-xl text-muted-foreground mb-8">
                Interested in our monthly plans? Speak to an expert.
              </p>
              <Button 
                size="lg" 
                variant="default"
                onClick={() => window.location.href = 'mailto:care@collabhunts.com?subject=Demo Request&body=Hi, I would like to schedule a demo of CollabHunts.'}
              >
                Book Demo
              </Button>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Pricing;
