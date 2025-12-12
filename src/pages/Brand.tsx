import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Search, Shield, TrendingUp, Users, DollarSign, CheckCircle } from "lucide-react";
import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";
import heroImage from "@/assets/hero-brand-page.jpg";
import AdPlacement from "@/components/AdPlacement";

const Brand = () => {
  const [user, setUser] = useState<any>(null);
  const [hasBrandProfile, setHasBrandProfile] = useState(false);
  const [hasCreatorProfile, setHasCreatorProfile] = useState(false);

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    const checkUserProfiles = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUser(session.user);
        
        const { data: brandProfile } = await supabase
          .from('brand_profiles')
          .select('id')
          .eq('user_id', session.user.id)
          .maybeSingle();
        
        const { data: creatorProfile } = await supabase
          .from('creator_profiles')
          .select('id')
          .eq('user_id', session.user.id)
          .maybeSingle();
        
        setHasBrandProfile(!!brandProfile);
        setHasCreatorProfile(!!creatorProfile);
      }
    };

    checkUserProfiles();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        setUser(session.user);
        setTimeout(async () => {
          const { data: brandProfile } = await supabase
            .from('brand_profiles')
            .select('id')
            .eq('user_id', session.user.id)
            .maybeSingle();
          
          const { data: creatorProfile } = await supabase
            .from('creator_profiles')
            .select('id')
            .eq('user_id', session.user.id)
            .maybeSingle();
          
          setHasBrandProfile(!!brandProfile);
          setHasCreatorProfile(!!creatorProfile);
        }, 0);
      } else {
        setUser(null);
        setHasBrandProfile(false);
        setHasCreatorProfile(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);
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
      title: "Fast Delivery",
      description: "Get high-quality UGC content delivered directly through the platform within days."
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
      <section className="relative gradient-subtle py-16 md:py-24 lg:py-32">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left: Text Content */}
            <div className="text-center lg:text-left">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-heading font-bold mb-6 animate-fade-in text-foreground">
                The Easy Way to Generate{" "}
                <span className="bg-gradient-accent bg-clip-text text-transparent">
                  Product Photos
                </span>
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-xl mx-auto lg:mx-0">
                Search influencers, post campaigns, track analytics, and get unique content for your brand in seconds
              </p>
              {hasBrandProfile ? (
                <Link to="/brand-dashboard">
                  <Button size="lg" className="gradient-hero hover:opacity-90 text-lg px-8 py-6">
                    Go to Dashboard
                  </Button>
                </Link>
              ) : user && hasCreatorProfile ? (
                <div className="space-y-3">
                  <p className="text-muted-foreground">
                    You're logged in as a creator. To join as a brand, please create a new account with a different email.
                  </p>
                  <Button size="lg" variant="outline" onClick={() => supabase.auth.signOut()}>
                    Sign Out to Create Brand Account
                  </Button>
                </div>
              ) : (
                <Link to="/brand-signup">
                  <Button size="lg" className="gradient-hero hover:opacity-90 text-lg px-8 py-6">
                    Join for Free
                  </Button>
                </Link>
              )}
            </div>

            {/* Right: Hero Image */}
            <div className="relative animate-fade-in hidden lg:block">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                <img 
                  src={heroImage} 
                  alt="Brands collaborating with influencers" 
                  className="w-full h-auto object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background/20 to-transparent" />
              </div>
              {/* Floating stats card */}
              <div className="absolute -bottom-6 -left-6 bg-card rounded-xl p-4 shadow-lg border border-border">
                <p className="text-2xl font-bold text-primary">10K+</p>
                <p className="text-sm text-muted-foreground">Active Creators</p>
              </div>
              <div className="absolute -top-4 -right-4 bg-card rounded-xl p-4 shadow-lg border border-border">
                <p className="text-2xl font-bold text-accent">98%</p>
                <p className="text-sm text-muted-foreground">Satisfaction</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 md:py-32">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-accent/10 text-accent-foreground border-accent/20">
              How It Works
            </Badge>
            <h2 className="text-4xl md:text-5xl font-heading font-bold mb-4">
              Find and Hire Influencers in Seconds
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-16">
            {steps.map((step, index) => (
              <div key={index} className="text-center space-y-4">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-full gradient-hero mx-auto">
                  <step.icon className="h-7 w-7 text-white" />
                </div>
                <h3 className="text-xl font-heading font-semibold">{step.title}</h3>
                <p className="text-muted-foreground">{step.description}</p>
              </div>
            ))}
          </div>

          {/* Testimonial / Sponsored Section */}
          <div className="bg-muted/50 rounded-2xl p-8 md:p-12">
            <AdPlacement 
              placementId="brand_testimonial" 
              className="max-w-3xl mx-auto"
              fallback={
                <div className="max-w-3xl mx-auto text-center">
                  <p className="text-xl text-muted-foreground mb-6">
                    "CollabHunts made finding the perfect influencers incredibly easy. The platform saved us hours of research and negotiations. Highly recommended!"
                  </p>
                  <div className="flex items-center justify-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-accent" />
                    <div className="text-left">
                      <p className="font-semibold">Sarah Johnson</p>
                      <p className="text-sm text-muted-foreground">Marketing Director, TechCorp</p>
                    </div>
                  </div>
                </div>
              }
            />
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
              {hasBrandProfile ? (
                <Link to="/brand-dashboard">
                  <Button size="lg" className="gradient-hero hover:opacity-90">
                    Go to Dashboard
                  </Button>
                </Link>
              ) : user && hasCreatorProfile ? (
                <Button size="lg" variant="outline" onClick={() => supabase.auth.signOut()}>
                  Sign Out to Create Brand Account
                </Button>
              ) : (
                <Link to="/brand-signup">
                  <Button size="lg" className="gradient-hero hover:opacity-90">
                    Get Started
                  </Button>
                </Link>
              )}
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
