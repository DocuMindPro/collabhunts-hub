import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Search, Shield, TrendingUp, Users, DollarSign, CheckCircle } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const Brand = () => {
  const benefits = [
    {
      icon: DollarSign,
      title: "No Upfront Cost",
      description: "Search influencers for free. No subscriptions, contracts, or hidden fees."
    },
    {
      icon: CheckCircle,
      title: "Vetted Influencers",
      description: "All creators are verified and have proven track records with brands."
    },
    {
      icon: Shield,
      title: "Secure Payments",
      description: "We hold your payment until the work is completed to your satisfaction."
    },
    {
      icon: TrendingUp,
      title: "Track Results",
      description: "Monitor campaign performance with real-time analytics and reporting."
    }
  ];

  const steps = [
    {
      icon: Search,
      title: "Search Influencers",
      description: "Browse thousands of vetted Instagram, TikTok, and YouTube influencers"
    },
    {
      icon: Users,
      title: "Purchase & Chat Securely",
      description: "Safely purchase and communicate through CollabHunts. We hold your payment until work is completed"
    },
    {
      icon: TrendingUp,
      title: "Receive Quality Content",
      description: "Get high-quality content from influencers directly through the platform"
    }
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      {/* Hero Section */}
      <section className="relative gradient-subtle py-20 md:py-32">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-heading font-bold mb-6 animate-fade-in">
              The Easy Way to Generate{" "}
              <span className="bg-gradient-accent bg-clip-text text-transparent">
                Product Photos
              </span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              Search influencers, post campaigns, track analytics, and get unique content for your brand in seconds
            </p>
            <Link to="/influencers">
              <Button size="lg" className="gradient-hero hover:opacity-90 text-lg px-8 py-6">
                Join for Free
              </Button>
            </Link>
            <p className="text-sm text-muted-foreground mt-6">
              Trusted by 250,000+ teams
            </p>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 md:py-32">
        <div className="container mx-auto px-4">
          <div className="mb-16">
            <Badge className="mb-4 bg-accent/10 text-accent-foreground border-accent/20">
              Search
            </Badge>
            <h2 className="text-4xl md:text-5xl font-heading font-bold mb-4">
              Find and Hire Influencers in Seconds
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-16">
            {steps.map((step, index) => (
              <div key={index} className="space-y-4">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-full gradient-hero">
                  <step.icon className="h-7 w-7 text-white" />
                </div>
                <h3 className="text-xl font-heading font-semibold">{step.title}</h3>
                <p className="text-muted-foreground">{step.description}</p>
              </div>
            ))}
          </div>

          <div className="bg-muted/50 rounded-2xl p-8 md:p-12">
            <div className="max-w-3xl">
              <p className="text-xl text-muted-foreground mb-6">
                "CollabHunts made finding the perfect influencers incredibly easy. The platform saved us hours of research and negotiations. Highly recommended!"
              </p>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-gradient-accent" />
                <div>
                  <p className="font-semibold">Sarah Johnson</p>
                  <p className="text-sm text-muted-foreground">Marketing Director, TechCorp</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl md:text-5xl font-heading font-bold text-center mb-16">
            Why Brands Choose CollabHunts
          </h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {benefits.map((benefit, index) => (
              <div key={index} className="text-center space-y-4">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10">
                  <benefit.icon className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-heading font-semibold">{benefit.title}</h3>
                <p className="text-muted-foreground">{benefit.description}</p>
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
              Ready to Get Started?
            </h2>
            <p className="text-xl text-muted-foreground mb-8">
              Join thousands of brands already using CollabHunts
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/influencers">
                <Button size="lg" className="gradient-hero hover:opacity-90">
                  Browse Influencers
                </Button>
              </Link>
              <Link to="/pricing">
                <Button size="lg" variant="outline">
                  View Pricing
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

const Badge = ({ children, className }: { children: React.ReactNode; className?: string }) => {
  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${className}`}>
      {children}
    </span>
  );
};

export default Brand;
