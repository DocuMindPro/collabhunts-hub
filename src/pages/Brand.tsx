import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
  MapPin, Shield, Users, DollarSign, CheckCircle, 
  MessageSquare, Calendar, Star, Building, 
  Sparkles, Clock, Zap
} from "lucide-react";
import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";
import heroImage from "@/assets/hero-brand-page.jpg";
import { VENUE_TYPES, EVENT_PACKAGES, PACKAGE_ORDER, formatPriceRange } from "@/config/packages";
import { LEBANESE_CITIES } from "@/config/lebanese-market";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const Brand = () => {
  const [user, setUser] = useState<any>(null);
  const [hasBrandProfile, setHasBrandProfile] = useState(false);
  const [hasCreatorProfile, setHasCreatorProfile] = useState(false);

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
    { icon: Star, title: "Content Creation", description: "Get professional photos & videos from every event" },
    { icon: Shield, title: "Payment Protection", description: "50% escrow deposit ensures reliable creators" },
    { icon: Calendar, title: "Easy Scheduling", description: "Browse availability and book instantly" },
  ];

  const howItWorks = [
    { 
      step: 1, 
      title: "Register Your Brand", 
      description: "Add your location, capacity, and what makes it special for events" 
    },
    { 
      step: 2, 
      title: "Browse Creators", 
      description: "Search by niche, follower count, and event experience" 
    },
    { 
      step: 3, 
      title: "Book Events", 
      description: "Choose packages and dates that work for your schedule" 
    },
    { 
      step: 4, 
      title: "Host & Grow", 
      description: "Welcome fans, get content, and watch your business grow" 
    },
  ];

  const faqs = [
    {
      question: "How does event booking work?",
      answer: "Browse creators, select a package (Meet & Greet, Workshop, Competition, or Custom), choose a date, and submit your request. Creators respond within 48 hours. Once confirmed, pay 50% deposit to secure the booking."
    },
    {
      question: "What types of venues can list?",
      answer: "Cafés, restaurants, malls, gyms, studios, retail stores, entertainment centers—any space that can host a creator event with fans."
    },
    {
      question: "How is payment protected?",
      answer: "We use an escrow system. You pay 50% upfront, held securely until the event completes. The remaining 50% is due after the event. If there's an issue, you can dispute within 72 hours."
    },
    {
      question: "What event packages are available?",
      answer: "Meet & Greet ($300-$800, 3 hours), Workshop ($500-$1,200, 2 hours), Competition ($800-$2,000, 4 hours with 2 creators), or Custom experiences tailored to your needs."
    },
    {
      question: "Do I need to provide anything for the event?",
      answer: "You provide the venue and coordinate with the creator on logistics. Creators bring their audience and handle the engagement. We recommend having staff available for support."
    },
    {
      question: "Can I cancel a booking?",
      answer: "Yes, but cancellation policies apply. Canceling more than 7 days before gets a full refund. Less than 7 days may forfeit the deposit. See our Refund Policy for details."
    },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      {/* Hero Section */}
      <section className="relative gradient-subtle py-16 md:py-24 lg:py-32 overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="text-center lg:text-left">
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
                <Sparkles className="h-4 w-4" />
                For Brands
              </span>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-heading font-bold mb-6 animate-fade-in text-foreground">
                Host Creator Events{" "}
                <span className="bg-gradient-accent bg-clip-text text-transparent">
                  at Your Location
                </span>
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-xl mx-auto lg:mx-0">
                Book creators to host live fan experiences. Drive foot traffic, 
                create buzz, and get professional content for your business.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                {renderCTA("lg", "text-lg px-8 py-6")}
                <Link to="/influencers">
                  <Button size="lg" variant="outline" className="text-lg px-8 py-6">
                    Browse Creators
                  </Button>
                </Link>
              </div>
            </div>

            <div className="relative animate-fade-in hidden lg:block">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                <img 
                  src={heroImage} 
                  alt="Venue hosting creator event" 
                  className="w-full h-auto object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background/20 to-transparent" />
              </div>
              <div className="absolute -bottom-6 -left-6 bg-card rounded-xl p-4 shadow-lg border border-border animate-float">
                <p className="text-2xl font-bold text-primary">15%</p>
                <p className="text-sm text-muted-foreground">Platform Fee Only</p>
              </div>
              <div className="absolute -top-4 -right-4 bg-card rounded-xl p-4 shadow-lg border border-border">
                <p className="text-2xl font-bold text-accent">50%</p>
                <p className="text-sm text-muted-foreground">Escrow Protection</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-heading font-bold mb-4">
              Why Host Creator Events?
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Turn your brand into a destination for creator fans
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
            {benefits.map((benefit, index) => (
              <div key={index} className="p-6 rounded-xl bg-card border border-border text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mb-4">
                  <benefit.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-heading font-semibold mb-2">{benefit.title}</h3>
                <p className="text-sm text-muted-foreground">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Event Packages */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-heading font-bold mb-4">
              Event Packages
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Choose the right experience for your brand
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {PACKAGE_ORDER.map((pkgType) => {
              const pkg = EVENT_PACKAGES[pkgType];
              return (
                <div key={pkgType} className="p-6 rounded-xl bg-card border border-border flex flex-col">
                  <h3 className="font-heading font-semibold text-lg mb-2">{pkg.name}</h3>
                  <p className="text-2xl font-bold text-primary mb-1">
                    {formatPriceRange(pkg.priceRange)}
                  </p>
                  {pkg.defaultDuration && (
                    <p className="text-sm text-muted-foreground mb-4 flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {pkg.defaultDuration} hours
                    </p>
                  )}
                  <p className="text-sm text-muted-foreground mb-4 flex-1">
                    {pkg.description}
                  </p>
                  <ul className="space-y-2">
                    {pkg.includes.slice(0, 3).map((item, i) => (
                      <li key={i} className="text-sm flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-heading font-bold text-center mb-12">
            How It Works
          </h2>

          <div className="grid md:grid-cols-4 gap-8 max-w-5xl mx-auto">
            {howItWorks.map((item) => (
              <div key={item.step} className="text-center">
                <div className="w-12 h-12 rounded-full gradient-hero flex items-center justify-center mx-auto mb-4">
                  <span className="text-white font-bold">{item.step}</span>
                </div>
                <h3 className="font-heading font-semibold mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.description}</p>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            {renderCTA("lg")}
          </div>
        </div>
      </section>

      {/* Venue Types */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-heading font-bold mb-4">
              Perfect for Any Business
            </h2>
            <p className="text-lg text-muted-foreground">
              Creator events work for businesses of all types
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-3 max-w-3xl mx-auto">
            {Object.values(VENUE_TYPES).map((type) => (
              <span 
                key={type}
                className="px-4 py-2 rounded-full bg-secondary text-secondary-foreground text-sm"
              >
                {type}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Lebanese Cities */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-heading font-bold mb-4">
              Available Across Lebanon
            </h2>
            <p className="text-lg text-muted-foreground">
              Host events in major cities
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-3 max-w-3xl mx-auto">
            {LEBANESE_CITIES.map((city) => (
              <span 
                key={city.value}
                className="px-4 py-2 rounded-full bg-card border border-border text-sm flex items-center gap-2"
              >
                <MapPin className="h-3 w-3 text-primary" />
                {city.label}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-heading font-bold text-center mb-12">
            Frequently Asked Questions
          </h2>

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
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 gradient-accent">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto bg-card/95 backdrop-blur rounded-2xl p-12 shadow-card">
            <h2 className="text-3xl md:text-4xl font-heading font-bold mb-4">
              Ready to Host Creator Events?
            </h2>
            <p className="text-xl text-muted-foreground mb-8">
              Register your brand for free and start booking creators
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {renderCTA("lg")}
              <Link to="/events">
                <Button size="lg" variant="outline">
                  See Upcoming Events
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

export default Brand;
