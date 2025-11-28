import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Check, X } from "lucide-react";
import { Link } from "react-router-dom";

const Pricing = () => {
  const plans = [
    {
      name: "Basic",
      price: "Free",
      period: "",
      description: "Perfect for getting started",
      features: [
        { text: "Search Influencers on the marketplace", included: true },
        { text: "10% marketplace fee", included: true },
        { text: "Post campaigns", included: false },
        { text: "Track live analytics", included: false },
        { text: "Advanced filters", included: false },
        { text: "Chat & Negotiate with creators", included: false },
        { text: "Influencer reports", included: false },
      ],
      cta: "Get Started",
      popular: false,
    },
    {
      name: "Pro",
      price: "$299",
      period: "/mo",
      description: "For growing brands",
      features: [
        { text: "Everything in Basic", included: true },
        { text: "Post 1 campaign per month", included: true },
        { text: "Track live analytics for 5 posts", included: true },
        { text: "Advanced filters", included: true },
        { text: "Chat & Negotiate with creators", included: true },
        { text: "20 Influencer engagement reports", included: true },
        { text: "Priority support", included: false },
      ],
      cta: "Start Pro",
      popular: true,
    },
    {
      name: "Premium",
      price: "$399",
      period: "/mo",
      description: "For established businesses",
      features: [
        { text: "Everything in Pro", included: true },
        { text: "Post unlimited campaigns", included: true },
        { text: "Track live analytics for 15 posts", included: true },
        { text: "5% marketplace fee", included: true },
        { text: "Priority customer support", included: true },
        { text: "50 Influencer engagement reports", included: true },
        { text: "Dedicated account manager", included: true },
      ],
      cta: "Start Premium",
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
              <span className="bg-gradient-accent bg-clip-text text-transparent">
                Influencer Marketing
              </span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Choose the perfect plan for your brand's growth
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
                        ) : (
                          <X className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                        )}
                        <span
                          className={
                            feature.included
                              ? "text-foreground"
                              : "text-muted-foreground line-through"
                          }
                        >
                          {feature.text}
                        </span>
                      </li>
                    ))}
                  </ul>

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
                </div>
              ))}
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
              <Button size="lg" variant="default">
                Book Demo
              </Button>
            </div>
          </div>
        </section>

        {/* Trust Section */}
        <section className="py-12 border-t border-border">
          <div className="container mx-auto px-4">
            <p className="text-center text-muted-foreground mb-8">
              Trusted by 250,000+ teams
            </p>
            <div className="flex flex-wrap items-center justify-center gap-12 opacity-50">
              <div className="text-2xl font-bold">Brand Logo</div>
              <div className="text-2xl font-bold">Brand Logo</div>
              <div className="text-2xl font-bold">Brand Logo</div>
              <div className="text-2xl font-bold">Brand Logo</div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Pricing;
