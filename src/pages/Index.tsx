import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Users, MapPin, Star, Sparkles } from "lucide-react";
import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import heroImage from "@/assets/hero-creators-brand.jpg";
import { supabase } from "@/integrations/supabase/client";
import RotatingText from "@/components/RotatingText";
import AnimatedSection from "@/components/AnimatedSection";
import FloatingShapes from "@/components/FloatingShapes";
import { isNativePlatform, safeNativeAsync } from "@/lib/supabase-native";
import AnimatedCounter from "@/components/home/AnimatedCounter";
import MouseGlow from "@/components/home/MouseGlow";
import ParallaxImage from "@/components/home/ParallaxImage";
import GlowCard from "@/components/home/GlowCard";
import CreatorSpotlight from "@/components/home/CreatorSpotlight";
import TestimonialCarousel from "@/components/home/TestimonialCarousel";
import BentoGrid from "@/components/home/BentoGrid";
import BrandRegistrationPrompt from "@/components/BrandRegistrationPrompt";
import { cn } from "@/lib/utils";

const Index = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [user, setUser] = useState<any>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [hasBrandProfile, setHasBrandProfile] = useState(false);
  const [hasCreatorProfile, setHasCreatorProfile] = useState(false);
  const [showRegistrationPrompt, setShowRegistrationPrompt] = useState(false);

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
      
      if (brandProfile) {
        navigate("/brand-dashboard", { replace: true });
        return;
      }
      if (creatorProfile) {
        navigate("/creator-dashboard", { replace: true });
        return;
      }
      
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
    "Unbox & Review", "Social Boost", "Meet & Greet", "Brand Activation", "Custom Experience"
  ];

  const rotatingWords = ["Made Simple", "Zero Fees", "Near You", "That Convert"];

  const benefits = [
    { icon: Users, title: "Drive Foot Traffic", description: "Creators bring their followers directly to your venue" },
    { icon: Star, title: "Vetted & VIP Creators", description: "All creators are reviewed; VIP creators go the extra mile" },
    { icon: MapPin, title: "Local Focus", description: "Find creators in your city ready for in-person collabs" },
    { icon: Sparkles, title: "Zero Platform Fees", description: "Negotiate and pay creators directly — no middleman" },
  ];

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
      
      {/* Hero Section with Mouse Glow */}
      <section className="relative overflow-hidden gradient-subtle animated-gradient-bg mouse-glow-container">
        <FloatingShapes />
        <MouseGlow />
        
        <div className="container mx-auto px-4 py-20 md:py-32 relative z-10">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <AnimatedSection animation="fade-up">
                <h1 className="text-5xl md:text-6xl lg:text-7xl font-heading font-bold leading-tight">
                  Find Your Creator{" "}
                  <span className="bg-gradient-accent bg-clip-text text-transparent">
                    <RotatingText words={rotatingWords} />
                  </span>
                </h1>
              </AnimatedSection>
              
              <AnimatedSection animation="fade-up" delay={100}>
                <p className="text-xl text-muted-foreground max-w-lg">
                  Discover vetted creators for brand events, content, and collaborations. 
                  Connect directly, negotiate your own terms — zero platform fees.
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
                    className="flex-1 h-12"
                  />
                  <Button 
                    size="lg" 
                    className="h-12 gradient-hero search-btn-glow"
                    onClick={() => {
                      if (hasBrandProfile) {
                        navigate(`/influencers${searchQuery ? `?q=${searchQuery}` : ''}`);
                      } else {
                        setShowRegistrationPrompt(true);
                      }
                    }}
                  >
                    <Search className="h-5 w-5 mr-2" />
                    Search
                  </Button>
                </div>
              </AnimatedSection>

              {/* Quick Event Types */}
              <AnimatedSection animation="fade-up" delay={300}>
                <div className="flex flex-wrap gap-2 stagger-fade-in">
                  {eventTypes.map((eventType) => (
                    <button
                      key={eventType}
                      onClick={() => {
                        if (hasBrandProfile) {
                          navigate(`/influencers?event_type=${eventType}`);
                        } else {
                          setShowRegistrationPrompt(true);
                        }
                      }}
                      className="category-badge text-sm px-4 py-2 rounded-full bg-card border border-border/50 hover:border-primary hover:bg-primary/5 transition-all duration-300"
                    >
                      {eventType}
                    </button>
                  ))}
                </div>
              </AnimatedSection>

              {/* Animated Stats */}
              <AnimatedSection animation="fade-up" delay={400}>
                <div className="flex items-center gap-8 pt-4">
                  <div className="text-center">
                    <p className="text-3xl font-bold text-primary animate-glow-pulse">
                      <AnimatedCounter end={100} suffix="%" duration={1500} />
                    </p>
                    <p className="text-sm text-muted-foreground">Vetted Creators</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold text-primary animate-glow-pulse">
                      <AnimatedCounter end="$0" isNumeric={false} />
                    </p>
                    <p className="text-sm text-muted-foreground">Transaction Fees</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold text-primary animate-glow-pulse">
                      <AnimatedCounter end="VIP" isNumeric={false} />
                    </p>
                    <p className="text-sm text-muted-foreground">Creator Options</p>
                  </div>
                </div>
              </AnimatedSection>
            </div>

            {/* Hero Image with Parallax */}
            <AnimatedSection animation="slide-right" delay={200}>
              <ParallaxImage
                src={heroImage}
                alt="Creators hosting live events"
                className="rounded-2xl shadow-hover overflow-hidden"
              >
                {/* Floating badge overlay */}
                <div className="absolute -bottom-4 -right-4 md:-bottom-6 md:-right-6 bg-card p-4 md:p-6 rounded-xl shadow-card border border-border animate-float z-10">
                  <div className="flex items-center gap-3 md:gap-4">
                    <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <MapPin className="h-5 w-5 md:h-6 md:w-6 text-primary" />
                    </div>
                    <div>
                      <p className="text-xl md:text-2xl font-bold font-heading">Live</p>
                      <p className="text-xs md:text-sm text-muted-foreground">In-Person Events</p>
                    </div>
                  </div>
                </div>
              </ParallaxImage>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* Featured Creators Section */}
      <CreatorSpotlight />

      {/* How It Works - Bento Grid */}
      <BentoGrid />

      {/* Benefits Section - Enhanced */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <AnimatedSection animation="fade-up" className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-heading font-bold mb-4">
              Why Brands Choose CollabHunts
            </h2>
          </AnimatedSection>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
            {benefits.map((benefit, index) => (
              <AnimatedSection key={index} animation="fade-up" delay={index * 100}>
                <div className={cn(
                  "group p-6 rounded-xl bg-card border border-border/50 text-center",
                  "transition-all duration-500 hover:border-primary/30 hover:shadow-hover hover:-translate-y-1"
                )}>
                  <div className={cn(
                    "inline-flex items-center justify-center w-14 h-14 rounded-xl mb-4",
                    "bg-gradient-to-br from-primary/10 to-secondary/10",
                    "transition-all duration-500 group-hover:scale-110 group-hover:from-primary/20 group-hover:to-secondary/20"
                  )}>
                    <benefit.icon className="h-7 w-7 text-primary transition-transform duration-500 group-hover:-translate-y-1" />
                  </div>
                  <h3 className="font-heading font-semibold mb-2">{benefit.title}</h3>
                  <p className="text-sm text-muted-foreground">{benefit.description}</p>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <TestimonialCarousel />

      {/* CTA Sections with Glow Cards */}
      <section className="py-20 gradient-accent animate-gradient-shift relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 left-1/4 w-64 h-64 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-48 h-48 rounded-full bg-secondary/10 blur-3xl" />
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <AnimatedSection animation="slide-left" className="h-full">
              <GlowCard glowColor="primary" className="h-full">
                <div className="p-8 flex flex-col h-full">
                  <div className="flex items-center gap-2 mb-4">
                    <Sparkles className="h-5 w-5 text-primary" />
                    <span className="text-sm font-medium text-primary">For Brands</span>
                  </div>
                  <h3 className="text-3xl font-heading font-bold mb-4">List Your Brand</h3>
                  <p className="text-muted-foreground mb-6 flex-1">
                    Book creators to host live fan events. 
                    Drive foot traffic and create buzz for your business.
                  </p>
                  {hasBrandProfile ? (
                    <Link to="/brand-dashboard">
                      <Button size="lg" variant="default" className="w-full btn-animated">
                        Go to Dashboard
                      </Button>
                    </Link>
                  ) : user && hasCreatorProfile ? (
                    <div className="space-y-3">
                      <p className="text-sm text-muted-foreground">
                        Want to list your brand? Create a new account with a different email.
                      </p>
                      <Link to="/brand">
                        <Button size="lg" variant="outline" className="w-full btn-animated">
                          Learn More
                        </Button>
                      </Link>
                    </div>
                  ) : (
                    <Link to="/brand">
                      <Button size="lg" variant="default" className="w-full btn-animated">
                        Register Your Brand
                      </Button>
                    </Link>
                  )}
                </div>
              </GlowCard>
            </AnimatedSection>

            <AnimatedSection animation="slide-right" className="h-full">
              <GlowCard glowColor="accent" className="h-full">
                <div className="p-8 flex flex-col h-full">
                  <div className="flex items-center gap-2 mb-4">
                    <Star className="h-5 w-5 text-accent" />
                    <span className="text-sm font-medium text-accent">For Creators</span>
                  </div>
                  <h3 className="text-3xl font-heading font-bold mb-4">Join as Creator</h3>
                  <p className="text-muted-foreground mb-6 flex-1">
                    Get booked for live events at venues. Meet your fans in person, 
                    get paid fairly, and create amazing content.
                  </p>
                  {hasCreatorProfile ? (
                    <Link to="/creator-dashboard">
                      <Button size="lg" className="w-full bg-accent hover:bg-accent-hover btn-animated">
                        Go to Dashboard
                      </Button>
                    </Link>
                  ) : user && hasBrandProfile ? (
                    <div className="space-y-3">
                      <p className="text-sm text-muted-foreground">
                        Want to become a creator? Create a new account with a different email.
                      </p>
                      <Link to="/creator">
                        <Button size="lg" variant="outline" className="w-full btn-animated">
                          Learn More
                        </Button>
                      </Link>
                    </div>
                  ) : (
                    <Link to="/creator">
                      <Button size="lg" className="w-full bg-accent hover:bg-accent-hover btn-animated">
                        Join as a Creator
                      </Button>
                    </Link>
                  )}
                </div>
              </GlowCard>
            </AnimatedSection>
          </div>
        </div>
      </section>

      <Footer />

      <BrandRegistrationPrompt 
        open={showRegistrationPrompt} 
        onOpenChange={setShowRegistrationPrompt} 
      />
    </div>
  );
};

export default Index;