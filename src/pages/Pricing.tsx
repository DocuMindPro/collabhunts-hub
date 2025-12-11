import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Check, Lock } from "lucide-react";
import { Link } from "react-router-dom";

const Pricing = () => {
  const plans = [
    {
      name: "Basic",
      price: "$39",
      period: "/mo",
      description: "Start connecting with creators",
      features: [
        { text: "Search influencers on the marketplace", included: true },
        { text: "Chat & negotiate with creators", included: true },
        { text: "Content Library with 10 GB storage", included: true },
        { text: "15% marketplace fee on bookings", included: true },
        { text: "Post campaigns", included: false, locked: true },
        { text: "Advanced filters", included: false, locked: true },
        { text: "Save creators & add notes (CRM)", included: false, locked: true },
        { text: "Mass message creators", included: false, locked: true },
        { text: "Verified Business Badge", included: false, locked: true },
      ],
      cta: "Get Started",
      link: "/brand-signup",
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
        { text: "Mass message up to 50 creators/day", included: true },
        { text: "Verified Business Badge (upon approval)", included: true },
        { text: "15% marketplace fee on bookings", included: true },
      ],
      cta: "Upgrade to Pro",
      link: "/brand-signup",
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
        { text: "Mass message up to 100 creators/day", included: true },
        { text: "15% marketplace fee on bookings", included: true },
        { text: "Priority customer support (Coming Soon)", included: true },
        { text: "Dedicated account manager (Coming Soon)", included: true },
      ],
      cta: "Upgrade to Premium",
      link: "/brand-signup",
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
            <p className="text-sm text-muted-foreground">
              Not ready to commit? Sign up free to browse creators with 20% marketplace fee on bookings.
            </p>
          </div>
        </section>

        {/* Pricing Cards */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {plans.map((plan, index) => (
                <div
                  key={index}
                  className={`relative bg-card rounded-2xl border-2 p-8 ${
                    plan.popular
                      ? "border-primary shadow-hover scale-105"
                      : "border-border"
                  }`}
                >
                  {plan.popular && (
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

                  <Link to={plan.link}>
                    <Button
                      className={`w-full ${
                        plan.popular
                          ? "gradient-hero hover:opacity-90"
                          : "bg-secondary hover:bg-secondary/80 text-secondary-foreground"
                      }`}
                      size="lg"
                    >
                      {plan.cta}
                    </Button>
                  </Link>
                </div>
              ))}
            </div>

            {/* Free tier note */}
            <div className="mt-12 text-center">
              <div className="inline-flex items-center gap-2 px-6 py-3 bg-muted rounded-full">
                <span className="text-sm text-muted-foreground">
                  <strong>No subscription?</strong> You can still browse creators and book with a 20% marketplace fee.
                </span>
                <Link to="/brand-signup" className="text-sm text-primary font-medium hover:underline">
                  Sign up free →
                </Link>
              </div>
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