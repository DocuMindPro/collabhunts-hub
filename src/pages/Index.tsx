import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Users, MapPin, Calendar, Star, Sparkles } from "lucide-react";
import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import heroImage from "@/assets/hero-creators-brand.jpg";
import { supabase } from "@/integrations/supabase/client";
import RotatingText from "@/components/RotatingText";
import AnimatedSection from "@/components/AnimatedSection";
import FloatingShapes from "@/components/FloatingShapes";
import { isNativePlatform, safeNativeAsync } from "@/lib/supabase-native";

const Index = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [user, setUser] = useState<any>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [hasBrandProfile, setHasBrandProfile] = useState(false);
  const [hasCreatorProfile, setHasCreatorProfile] = useState(false);

  useEffect(() => {
    const checkUserProfiles = async (userId: string) => {
      const brandProfile = await safeNativeAsync(
        async () => {
          const { data } = await supabase
            .from('brand_profiles')
            .select('id')
            .eq('user_id', userId)
            .maybeSingle();
          return data;
        },
        null,
        3000
      );
      
      const creatorProfile = await safeNativeAsync(
        async () => {
          const { data } = await supabase
            .from('creator_profiles')
            .select('id')
            .eq('user_id', userId)
            .maybeSingle();
          return data;
        },
        null,
        3000
      );
      
      setHasBrandProfile(!!brandProfile);
      setHasCreatorProfile(!!creatorProfile);
      
      // Auto-redirect logged-in users to their dashboard
      // Brand takes priority (they are the paying customers)
      if (brandProfile) {
        navigate("/brand-dashboard", { replace: true });
        return;
      }
      if (creatorProfile) {
        navigate("/creator-dashboard", { replace: true });
        return;
      }
      
      // No profile - show marketing page
      setAuthLoading(false);
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        setUser(session.user);
        setTimeout(() => {
          checkUserProfiles(session.user.id);
        }, 0);
      } else {
        setUser(null);
        setHasBrandProfile(false);
        setHasCreatorProfile(false);
        setAuthLoading(false);
      }
    });

    const checkSession = () => {
      safeNativeAsync(
        async () => {
          const { data: { session } } = await supabase.auth.getSession();
          return session;
        },
        null,
        3000
      ).then((session) => {
        if (session?.user) {
          setUser(session.user);
          checkUserProfiles(session.user.id);
        } else {
          setAuthLoading(false);
        }
      });
    };

    if (isNativePlatform()) {
      setTimeout(checkSession, 200);
    } else {
      checkSession();
    }

    return () => subscription.unsubscribe();
  }, [navigate]);

  const eventTypes = [
    "Meet & Greet", "Workshop", "Competition", "Brand Activation", "Private Event"
  ];

  const rotatingWords = ["Made Easy", "In Real Life", "At Your Venue", "That Drive Traffic"];

  const steps = [
    {
      icon: Search,
      title: "Find Creators",
      description: "Browse creators available for live events in your area"
    },
    {
      icon: Calendar,
      title: "Book an Event",
      description: "Select a date, choose a package, and secure with 50% deposit"
    },
    {
      icon: MapPin,
      title: "Host & Grow",
      description: "Creators bring their fans to your venue, you get foot traffic and content"
    }
  ];

  const benefits = [
    { icon: Users, title: "Drive Foot Traffic", description: "Creators bring their followers directly to your venue" },
    { icon: Star, title: "Verified Creators", description: "All creators are vetted for professionalism and reliability" },
    { icon: MapPin, title: "Local Focus", description: "Find creators in your city ready for in-person events" },
    { icon: Sparkles, title: "Payment Protection", description: "50% escrow system protects both parties" },
  ];

  // Show loading spinner while checking auth
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden gradient-subtle animated-gradient-bg">
        <FloatingShapes />
        
        <div className="container mx-auto px-4 py-20 md:py-32 relative z-10">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <AnimatedSection animation="fade-up">
                <h1 className="text-5xl md:text-6xl lg:text-7xl font-heading font-bold leading-tight">
                  Creator Events{" "}
                  <span className="bg-gradient-accent bg-clip-text text-transparent">
                    <RotatingText words={rotatingWords} />
                  </span>
                </h1>
              </AnimatedSection>
              
              <AnimatedSection animation="fade-up" delay={100}>
                <p className="text-xl text-muted-foreground">
                  Book creators for live fan experiences at your venue. 
                  Drive foot traffic, create buzz, and get professional content.
                </p>
              </AnimatedSection>
              
              {/* Search Bar */}
              <AnimatedSection animation="fade-up" delay={200}>
                <div className="flex gap-2 max-w-xl">
                  <Input
                    type="text"
                    placeholder="Search by city, event type, or creator..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="flex-1"
                  />
                  <Link to={`/influencers${searchQuery ? `?q=${searchQuery}` : ''}`}>
                    <Button size="lg" className="gradient-hero btn-animated">
                      <Search className="h-5 w-5 mr-2" />
                      Search
                    </Button>
                  </Link>
                </div>
              </AnimatedSection>

              {/* Quick Event Types */}
              <AnimatedSection animation="fade-up" delay={300}>
                <div className="flex flex-wrap gap-2">
                  {eventTypes.map((eventType, index) => (
                    <Link
                      key={eventType}
                      to={`/influencers?event_type=${eventType}`}
                      className="category-badge text-sm px-3 py-1 rounded-full bg-secondary text-secondary-foreground hover:bg-primary hover:text-primary-foreground"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      {eventType}
                    </Link>
                  ))}
                </div>
              </AnimatedSection>

              {/* Stats */}
              <AnimatedSection animation="fade-up" delay={400}>
                <div className="flex items-center gap-6 pt-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-primary">100%</p>
                    <p className="text-xs text-muted-foreground">Verified Creators</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-primary">15%</p>
                    <p className="text-xs text-muted-foreground">Platform Fee Only</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-primary">50%</p>
                    <p className="text-xs text-muted-foreground">Escrow Protection</p>
                  </div>
                </div>
              </AnimatedSection>
            </div>

            <AnimatedSection animation="slide-right" delay={200}>
              <div className="relative">
                <img
                  src={heroImage}
                  alt="Creators hosting live events"
                  className="rounded-2xl shadow-hover w-full"
                  fetchPriority="high"
                />
                <div className="absolute -bottom-6 -right-6 bg-card p-6 rounded-xl shadow-card border border-border animate-float">
                  <div className="flex items-center gap-4">
                    <MapPin className="h-8 w-8 text-primary" />
                    <div>
                      <p className="text-2xl font-bold font-heading">Live</p>
                      <p className="text-sm text-muted-foreground">In-Person Events</p>
                    </div>
                  </div>
                </div>
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 md:py-32 bg-background">
        <div className="container mx-auto px-4">
          <AnimatedSection animation="fade-up" className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-heading font-bold mb-4">
              How It Works
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Book creators for in-person events in three simple steps
            </p>
          </AnimatedSection>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {steps.map((step, index) => (
              <AnimatedSection 
                key={index} 
                animation="fade-up" 
                delay={index * 150}
              >
                <div className="step-card text-center space-y-4 p-6 rounded-xl bg-card border border-border/50">
                  <div className="step-icon inline-flex items-center justify-center w-16 h-16 rounded-full gradient-hero">
                    <step.icon className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-xl font-heading font-semibold">{step.title}</h3>
                  <p className="text-muted-foreground">{step.description}</p>
                </div>
              </AnimatedSection>
            ))}
          </div>

          <AnimatedSection animation="fade-up" delay={500} className="text-center mt-12">
            <Link to="/influencers">
              <Button size="lg" className="gradient-hero btn-animated">
                Browse Creators for Events
              </Button>
            </Link>
          </AnimatedSection>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <AnimatedSection animation="fade-up" className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-heading font-bold mb-4">
              Why Book Creator Events?
            </h2>
          </AnimatedSection>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
            {benefits.map((benefit, index) => (
              <AnimatedSection key={index} animation="fade-up" delay={index * 100}>
                <div className="p-6 rounded-xl bg-card border border-border/50 text-center">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mb-4">
                    <benefit.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-heading font-semibold mb-2">{benefit.title}</h3>
                  <p className="text-sm text-muted-foreground">{benefit.description}</p>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Sections */}
      <section className="py-20 gradient-accent animate-gradient-shift">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <AnimatedSection animation="slide-left" className="h-full">
              <div className="h-full bg-card/95 backdrop-blur p-8 rounded-2xl shadow-card hover:shadow-hover transition-shadow duration-300 flex flex-col">
                <h3 className="text-3xl font-heading font-bold mb-4">For Brands</h3>
                <p className="text-muted-foreground mb-6 flex-1">
                  List your space and book creators to host live fan events. 
                  Drive foot traffic and create buzz for your business.
                </p>
                {hasBrandProfile ? (
                  <Link to="/brand-dashboard">
                    <Button size="lg" variant="default" className="btn-animated">
                      Go to Dashboard
                    </Button>
                  </Link>
                ) : user && hasCreatorProfile ? (
                  <div className="space-y-3">
                    <p className="text-sm text-muted-foreground">
                      Want to list your brand? Create a new account with a different email.
                    </p>
                    <Link to="/brand">
                      <Button size="lg" variant="outline" className="btn-animated">
                        Learn More
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <Link to="/brand">
                    <Button size="lg" variant="default" className="btn-animated">
                      Register Your Brand
                    </Button>
                  </Link>
                )}
              </div>
            </AnimatedSection>

            <AnimatedSection animation="slide-right" className="h-full">
              <div className="h-full bg-card/95 backdrop-blur p-8 rounded-2xl shadow-card hover:shadow-hover transition-shadow duration-300 flex flex-col">
                <h3 className="text-3xl font-heading font-bold mb-4">For Creators</h3>
                <p className="text-muted-foreground mb-6 flex-1">
                  Get booked for live events at venues. Meet your fans in person, 
                  get paid fairly, and create amazing content.
                </p>
                {hasCreatorProfile ? (
                  <Link to="/creator-dashboard">
                    <Button size="lg" className="bg-accent hover:bg-accent-hover btn-animated">
                      Go to Dashboard
                    </Button>
                  </Link>
                ) : user && hasBrandProfile ? (
                  <div className="space-y-3">
                    <p className="text-sm text-muted-foreground">
                      Want to become a creator? Create a new account with a different email.
                    </p>
                    <Link to="/creator">
                      <Button size="lg" variant="outline" className="btn-animated">
                        Learn More
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <Link to="/creator">
                    <Button size="lg" className="bg-accent hover:bg-accent-hover btn-animated">
                      Join as a Creator
                    </Button>
                  </Link>
                )}
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
