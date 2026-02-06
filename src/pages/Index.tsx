import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Users, MapPin, Star, Sparkles, ShieldCheck, EyeOff, BadgeDollarSign } from "lucide-react";
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
import PlatformFeatures from "@/components/home/PlatformFeatures";
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


  const rotatingWords = ["Zero Fees, Full Impact", "Your City, Your Creator", "Private. Direct. Done.", "Where Collabs Come Alive"];

  const benefits = [
    { icon: Users, title: "Drive Foot Traffic", description: "Creators bring their followers directly to your venue" },
    { icon: Star, title: "Vetted & VIP Creators", description: "All creators are reviewed; VIP creators go the extra mile" },
    { icon: MapPin, title: "Local Focus", description: "Find creators in your city ready for in-person collabs" },
    { icon: BadgeDollarSign, title: "Zero Platform Fees", description: "No commissions, no hidden charges, no subscription required to connect. You keep 100% of every deal." },
    { icon: ShieldCheck, title: "Private & Confidential", description: "Only brands see creators. Only creators see brands. Your data stays between you." },
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
                  Find Your Influencer{" "}
                  <RotatingText 
                    words={rotatingWords} 
                    className="bg-gradient-to-r from-primary to-yellow-500 bg-clip-text text-transparent" 
                  />
                </h1>
              </AnimatedSection>
              
              <AnimatedSection animation="fade-up" delay={100}>
                <p className="text-xl text-muted-foreground max-w-lg">
                  Discover vetted influencers for brand events, content, and collaborations. 
                  Connect directly, negotiate your own terms — <span className="font-semibold text-primary">$0 platform fees, always.</span>
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

              {/* Animated Stats */}
              <AnimatedSection animation="fade-up" delay={300}>
                <div className="flex items-center gap-8 pt-4">
                  <div className="text-center">
                    <p className="text-3xl font-bold text-primary animate-glow-pulse">
                      <AnimatedCounter end={100} suffix="%" duration={1500} />
                    </p>
                    <p className="text-sm text-muted-foreground">Vetted Influencers</p>
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
                    <p className="text-sm text-muted-foreground">Influencer Options</p>
                  </div>
                </div>
              </AnimatedSection>

              {/* Trust Banner */}
              <AnimatedSection animation="fade-up" delay={400}>
                <div className="flex flex-wrap gap-3 pt-2">
                  <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-primary/5 border border-primary/10">
                    <BadgeDollarSign className="h-4 w-4 text-primary" />
                    <span className="text-xs font-medium text-foreground">Zero Fees — No commissions, no hidden charges</span>
                  </div>
                  <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-primary/5 border border-primary/10">
                    <EyeOff className="h-4 w-4 text-primary" />
                    <span className="text-xs font-medium text-foreground">Private by Design — Brands & creators see only each other</span>
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

      {/* Zero Fees + Privacy Section */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute top-10 left-1/3 w-72 h-72 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute bottom-10 right-1/4 w-56 h-56 rounded-full bg-accent/5 blur-3xl" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto items-center">
            <AnimatedSection animation="slide-left">
              <div className="space-y-4">
                <div className="text-7xl md:text-8xl font-heading font-black text-primary">
                  $0
                </div>
                <h2 className="text-3xl md:text-4xl font-heading font-bold">
                  Zero Fees. Zero Commissions.<br />Zero Catches.
                </h2>
                <p className="text-muted-foreground text-lg max-w-md">
                  Unlike other platforms that take 20-40% of every deal, CollabHunts charges absolutely nothing on transactions. 
                  You negotiate directly, you pay directly, you keep everything.
                </p>
              </div>
            </AnimatedSection>
            <AnimatedSection animation="slide-right" delay={200}>
              <GlowCard glowColor="secondary">
                <div className="p-8 space-y-5">
                  <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-gradient-to-br from-primary/10 to-secondary/10">
                    <ShieldCheck className="h-7 w-7 text-primary" />
                  </div>
                  <h3 className="text-2xl font-heading font-bold">Private by Design</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Your marketplace is confidential. Brands only see creator profiles. 
                    Creators only see brand opportunities. No public exposure, no competitor snooping — 
                    your business stays your business.
                  </p>
                  <div className="flex flex-col gap-2 pt-2">
                    <div className="flex items-center gap-2 text-sm text-foreground">
                      <EyeOff className="h-4 w-4 text-primary shrink-0" />
                      <span>Creators can't see other creators' profiles</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-foreground">
                      <EyeOff className="h-4 w-4 text-primary shrink-0" />
                      <span>Brands can't see other brands' activity</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-foreground">
                      <ShieldCheck className="h-4 w-4 text-primary shrink-0" />
                      <span>All negotiations are 100% private</span>
                    </div>
                  </div>
                </div>
              </GlowCard>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* Benefits Section - Enhanced */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <AnimatedSection animation="fade-up" className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-heading font-bold mb-4">
              Why Brands Choose CollabHunts
            </h2>
          </AnimatedSection>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-6 max-w-6xl mx-auto">
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

      {/* Platform Features Showcase */}
      <PlatformFeatures />

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
                  <p className="text-muted-foreground mb-4 flex-1">
                    Book creators to host live fan events. 
                    Drive foot traffic and create buzz for your business.
                  </p>
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary mb-4 px-3 py-1 rounded-full bg-primary/5 border border-primary/10 w-fit">
                    <BadgeDollarSign className="h-3 w-3" /> $0 platform fees
                  </span>
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
                  <p className="text-muted-foreground mb-4 flex-1">
                    Get booked for live events at venues. Meet your fans in person, 
                    get paid fairly, and create amazing content.
                  </p>
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-accent mb-4 px-3 py-1 rounded-full bg-accent/5 border border-accent/10 w-fit">
                    <BadgeDollarSign className="h-3 w-3" /> Keep 100% of your earnings
                  </span>
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