import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
  MapPin, Shield, Users, DollarSign, CheckCircle, 
  MessageSquare, Calendar, Star, Building, 
  Sparkles, Clock, Zap, FileText
} from "lucide-react";
import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";
import heroImage from "@/assets/hero-brand-page.jpg";
import { VENUE_TYPES, EVENT_PACKAGES, PACKAGE_ORDER } from "@/config/packages";
import CollaborationSection, { SLUG_MAP } from "@/components/brand/CollaborationSection";
import { getMiddleEastCitiesByCountry } from "@/config/lebanese-market";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import AnimatedSection from "@/components/AnimatedSection";
import FloatingShapes from "@/components/FloatingShapes";
import MouseGlow from "@/components/home/MouseGlow";
import GlowCard from "@/components/home/GlowCard";
import TestimonialCarousel from "@/components/home/TestimonialCarousel";
import { cn } from "@/lib/utils";
import BrandPricingSection from "@/components/brand/BrandPricingSection";

const Brand = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [hasBrandProfile, setHasBrandProfile] = useState(false);
  const [hasCreatorProfile, setHasCreatorProfile] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
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
        
        // If user has a brand profile, redirect to dashboard
        if (brandProfile) {
          navigate("/brand-dashboard");
          return;
        }
        
        const { data: creatorProfile } = await supabase
          .from('creator_profiles')
          .select('id')
          .eq('user_id', session.user.id)
          .maybeSingle();
        
        setHasBrandProfile(!!brandProfile);
        setHasCreatorProfile(!!creatorProfile);
      }
      setAuthLoading(false);
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
          
          // If user has a brand profile, redirect to dashboard
          if (brandProfile) {
            navigate("/brand-dashboard");
            return;
          }
          
          const { data: creatorProfile } = await supabase
            .from('creator_profiles')
            .select('id')
            .eq('user_id', session.user.id)
            .maybeSingle();
          
          setHasBrandProfile(!!brandProfile);
          setHasCreatorProfile(!!creatorProfile);
          setAuthLoading(false);
        }, 0);
      } else {
        setUser(null);
        setHasBrandProfile(false);
        setHasCreatorProfile(false);
        setAuthLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const renderCTA = (size: "default" | "lg" = "lg", className: string = "") => {
    if (hasBrandProfile) {
      return (
        <Link to="/brand-dashboard">
          <Button size={size} className={`gradient-hero hover:opacity-90 ${className}`}>
            Go to Dashboard
          </Button>
        </Link>
      );
    }
    if (user && hasCreatorProfile) {
      return (
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">
            You're logged in as a creator. Create a new account with a different email to list a venue.
          </p>
          <Button size={size} variant="outline" onClick={() => supabase.auth.signOut()}>
            Sign Out
          </Button>
        </div>
      );
    }
    return (
      <Link to="/brand-signup">
        <Button size={size} className={`gradient-hero hover:opacity-90 ${className}`}>
          Register Your Brand
        </Button>
      </Link>
    );
  };

  const benefits = [
    { icon: Users, title: "Drive Foot Traffic", description: "Creators bring their followers directly to your venue" },
    { icon: Star, title: "Vetted Creators", description: "All creators are reviewed and verified before listing" },
    { icon: MessageSquare, title: "Direct Connection", description: "Message creators directly to discuss your needs" },
    { icon: Sparkles, title: "Zero Platform Fees", description: "Negotiate and pay creators directly — no middleman" },
  ];

  const howItWorks = [
    { 
      step: 1, 
      title: "Register Your Brand", 
      description: "Create your free brand profile with venue details",
      icon: Building
    },
    { 
      step: 2, 
      title: "Discover Creators", 
      description: "Browse vetted creators by niche, location, and availability",
      icon: Users
    },
    { 
      step: 3, 
      title: "Connect Directly", 
      description: "Message creators, negotiate terms, finalize with AI-drafted agreements",
      icon: MessageSquare
    },
    { 
      step: 4, 
      title: "Collaborate & Grow", 
      description: "Execute your event and build lasting creator partnerships",
      icon: Zap
    },
  ];

  const faqs = [
    {
      question: "How does booking work?",
      answer: "Browse creators, message them directly to discuss your needs, and agree on terms. Once aligned, we provide an AI-drafted agreement for both parties to sign. Payment is handled directly between you and the creator — no platform middleman."
    },
    {
      question: "What types of brands can list?",
      answer: "Cafés, restaurants, malls, gyms, studios, retail stores, entertainment centers — any business that wants to collaborate with creators for events or content."
    },
    {
      question: "Are there any platform fees?",
      answer: "No transaction fees! You pay creators directly. CollabHunts is free to use for discovery. Revenue comes from optional creator boost packages and verified business badges."
    },
    {
      question: "What collaboration options are available?",
      answer: "Unbox & Review (ship products for content), Social Boost (venue visit & content), Meet & Greet (fan events), Live PK Battles (competitive streaming events), and fully Custom Experiences."
    },
    {
      question: "How do agreements work?",
      answer: "Once you and a creator agree on terms, our AI drafts a professional agreement covering deliverables, timeline, and compensation. Both parties sign digitally for record-keeping."
    },
    {
      question: "How do I handle payment?",
      answer: "Payment is arranged directly between you and the creator. Common methods include bank transfer, OMT, or cash. The agreement documents the agreed compensation."
    },
  ];

  // Show loading while checking auth
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      {/* Hero Section */}
      <section className="relative gradient-subtle py-16 md:py-24 lg:py-32 overflow-hidden mouse-glow-container">
        <FloatingShapes />
        <MouseGlow />
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <AnimatedSection animation="fade-up" className="text-center lg:text-left">
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
                <Sparkles className="h-4 w-4" />
                For Brands
              </span>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-heading font-bold mb-6 text-foreground">
                Host Creator Events{" "}
                <span className="bg-gradient-accent bg-clip-text text-transparent">
                  at Your Location
                </span>
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-xl mx-auto lg:mx-0">
                Connect with vetted creators to host live fan experiences. 
                Drive foot traffic, create buzz, and grow your business — with zero platform fees.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                {renderCTA("lg", "text-lg px-8 py-6")}
                <Link to="/influencers">
                  <Button size="lg" variant="outline" className="text-lg px-8 py-6">
                    Browse Creators
                  </Button>
                </Link>
              </div>
            </AnimatedSection>

            <AnimatedSection animation="fade-up" delay={200} className="relative hidden lg:block">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                <img 
                  src={heroImage} 
                  alt="Venue hosting creator event" 
                  className="w-full h-auto object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background/20 to-transparent" />
              </div>
              <div className="absolute -bottom-6 -left-6 bg-card rounded-xl p-4 shadow-lg border border-border animate-float">
                <p className="text-2xl font-bold text-primary">$0</p>
                <p className="text-sm text-muted-foreground">Platform Fees</p>
              </div>
              <div className="absolute -top-4 -right-4 bg-card rounded-xl p-4 shadow-lg border border-border">
                <p className="text-2xl font-bold text-accent">Direct</p>
                <p className="text-sm text-muted-foreground">Payments</p>
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <AnimatedSection animation="fade-up" className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-heading font-bold mb-4">
              Why Host Creator Events?
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Turn your brand into a destination for creator fans
            </p>
          </AnimatedSection>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
            {benefits.map((benefit, index) => (
              <AnimatedSection key={index} animation="fade-up" delay={index * 100}>
                <div className={cn(
                  "group p-6 rounded-xl bg-card border border-border/50 text-center h-full",
                  "transition-all duration-500 hover:border-primary/30 hover:shadow-hover hover:-translate-y-1"
                )}>
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mb-4 group-hover:scale-110 transition-transform duration-300">
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

      {/* How It Works - Bento Style */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <AnimatedSection animation="fade-up" className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-heading font-bold">
              How It Works
            </h2>
          </AnimatedSection>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
            {howItWorks.map((item, index) => (
              <AnimatedSection key={item.step} animation="fade-up" delay={index * 100}>
                <div className={cn(
                  "group relative h-full rounded-2xl p-6 md:p-8 transition-all duration-500",
                  "bg-card border border-border/50",
                  "hover:border-primary/30 hover:shadow-hover hover:-translate-y-1",
                  "overflow-hidden"
                )}>
                  {/* Gradient overlay on hover */}
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-secondary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  
                  {/* Step number badge */}
                  <div className="absolute top-4 right-4 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-sm font-bold text-primary">{item.step}</span>
                  </div>
                  
                  <div className="relative z-10">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                      <item.icon className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="font-heading font-semibold mb-2">{item.title}</h3>
                    <p className="text-sm text-muted-foreground">{item.description}</p>
                  </div>
                </div>
              </AnimatedSection>
            ))}
          </div>

          <AnimatedSection animation="fade-up" delay={400} className="text-center mt-12">
            {renderCTA("lg")}
          </AnimatedSection>
        </div>
      </section>

      {/* Pricing */}
      <BrandPricingSection />

      {/* Collaboration Options - Individual Sections */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <AnimatedSection animation="fade-up" className="text-center mb-4">
            <h2 className="text-3xl md:text-4xl font-heading font-bold mb-4">
              Collaboration Options
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Explore each collaboration type in detail — find the right fit for your brand
            </p>
          </AnimatedSection>

          <div className="max-w-5xl mx-auto">
            {PACKAGE_ORDER.map((pkgType, index) => (
              <CollaborationSection
                key={pkgType}
                pkg={EVENT_PACKAGES[pkgType]}
                pkgType={pkgType}
                slug={SLUG_MAP[pkgType]}
                index={index}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Venue Types */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <AnimatedSection animation="fade-up" className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-heading font-bold mb-4">
              Perfect for Any Business
            </h2>
            <p className="text-lg text-muted-foreground">
              Creator events work for businesses of all types
            </p>
          </AnimatedSection>

          <AnimatedSection animation="fade-up" delay={100}>
            <div className="flex flex-wrap justify-center gap-3 max-w-3xl mx-auto">
              {Object.values(VENUE_TYPES).map((type) => (
                <span 
                  key={type}
                  className="px-4 py-2 rounded-full bg-secondary text-secondary-foreground text-sm hover:bg-primary/10 hover:text-primary transition-colors duration-300"
                >
                  {type}
                </span>
              ))}
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* Middle East Cities */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <AnimatedSection animation="fade-up" className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-heading font-bold mb-4">
              Available Across the Middle East
            </h2>
            <p className="text-lg text-muted-foreground">
              Host events and collaborations across the region
            </p>
          </AnimatedSection>

          <AnimatedSection animation="fade-up" delay={100}>
            <div className="max-w-4xl mx-auto space-y-6">
              {getMiddleEastCitiesByCountry().map(({ country, cities }) => (
                <div key={country}>
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 ml-1">{country}</h3>
                  <div className="flex flex-wrap gap-2">
                    {cities.map((city) => (
                      <span 
                        key={city.value}
                        className="px-4 py-2 rounded-full bg-card border border-border text-sm flex items-center gap-2 hover:border-primary/30 hover:bg-primary/5 transition-colors duration-300"
                      >
                        <MapPin className="h-3 w-3 text-primary" />
                        {city.label}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <AnimatedSection animation="fade-up" className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-heading font-bold">
              Frequently Asked Questions
            </h2>
          </AnimatedSection>

          <AnimatedSection animation="fade-up" delay={100}>
            <Accordion type="single" collapsible className="max-w-3xl mx-auto">
              {faqs.map((faq, index) => (
                <AccordionItem key={index} value={`faq-${index}`}>
                  <AccordionTrigger className="text-left">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </AnimatedSection>
        </div>
      </section>

      {/* Testimonials */}
      <TestimonialCarousel />

      {/* Final CTA */}
      <section className="py-20 gradient-accent animate-gradient-shift relative overflow-hidden">
        {/* Decorative blurs */}
        <div className="absolute top-0 left-1/4 w-64 h-64 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-48 h-48 rounded-full bg-secondary/10 blur-3xl" />
        
        <div className="container mx-auto px-4 relative z-10">
          <AnimatedSection animation="fade-up">
            <GlowCard glowColor="primary" className="max-w-3xl mx-auto">
              <div className="p-12 text-center">
                <h2 className="text-3xl md:text-4xl font-heading font-bold mb-4">
                  Ready to Host Creator Events?
                </h2>
                <p className="text-xl text-muted-foreground mb-8">
                  Register your brand for free and start connecting with creators
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  {renderCTA("lg")}
                  <Link to="/influencers">
                    <Button size="lg" variant="outline">
                      Browse Creators
                    </Button>
                  </Link>
                </div>
              </div>
            </GlowCard>
          </AnimatedSection>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Brand;
