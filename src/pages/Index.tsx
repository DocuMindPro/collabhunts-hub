import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Users, Shield, TrendingUp, Instagram, Youtube, Video } from "lucide-react";
import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import heroImage from "@/assets/hero-creators.jpg";
import { supabase } from "@/integrations/supabase/client";
import RotatingText from "@/components/RotatingText";
import FloatingCard from "@/components/FloatingCard";
import AnimatedSection from "@/components/AnimatedSection";

const Index = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [user, setUser] = useState<any>(null);
  const [hasBrandProfile, setHasBrandProfile] = useState(false);
  const [hasCreatorProfile, setHasCreatorProfile] = useState(false);

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
      } else {
        setUser(null);
        setHasBrandProfile(false);
        setHasCreatorProfile(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const platforms = [
    { name: "Instagram", icon: Instagram, color: "text-pink-500" },
    { name: "TikTok", icon: Video, color: "text-foreground" },
    { name: "YouTube", icon: Youtube, color: "text-red-500" },
  ];

  const categories = [
    "Fashion", "Beauty", "Lifestyle", "Travel", "Health & Fitness", 
    "Food", "Tech", "Gaming"
  ];

  const rotatingWords = ["Made Easy", "Simplified", "Made Fun", "Supercharged"];

  const steps = [
    {
      icon: Search,
      title: "Search Influencers",
      description: "Browse thousands of verified creators across all major platforms"
    },
    {
      icon: Shield,
      title: "Secure Payment",
      description: "Safe transactions with escrow protection until work is completed"
    },
    {
      icon: TrendingUp,
      title: "Get Results",
      description: "Receive high-quality content and track campaign performance"
    }
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden gradient-subtle animated-gradient-bg">
        <div className="container mx-auto px-4 py-20 md:py-32 relative z-10">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <AnimatedSection animation="fade-up">
                <h1 className="text-5xl md:text-6xl lg:text-7xl font-heading font-bold leading-tight">
                  Influencer Marketing{" "}
                  <span className="bg-gradient-accent bg-clip-text text-transparent">
                    <RotatingText words={rotatingWords} />
                  </span>
                </h1>
              </AnimatedSection>
              
              <AnimatedSection animation="fade-up" delay={100}>
                <p className="text-xl text-muted-foreground">
                  Find and hire top Instagram, TikTok, YouTube, and UGC influencers to create unique content for your brand
                </p>
              </AnimatedSection>
              
              {/* Search Bar */}
              <AnimatedSection animation="fade-up" delay={200}>
                <div className="flex gap-2 max-w-xl">
                  <Input
                    type="text"
                    placeholder="Search by category, niche, or platform..."
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

              {/* Quick Categories */}
              <AnimatedSection animation="fade-up" delay={300}>
                <div className="flex flex-wrap gap-2">
                  {categories.slice(0, 6).map((category, index) => (
                    <Link
                      key={category}
                      to={`/influencers?category=${category}`}
                      className="category-badge text-sm px-3 py-1 rounded-full bg-secondary text-secondary-foreground hover:bg-primary hover:text-primary-foreground"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      {category}
                    </Link>
                  ))}
                </div>
              </AnimatedSection>

              {/* Platform Icons */}
              <AnimatedSection animation="fade-up" delay={400}>
                <div className="flex items-center gap-4 pt-4">
                  <span className="text-sm text-muted-foreground">Available on:</span>
                  <div className="flex gap-3">
                    {platforms.map((platform, index) => (
                      <div 
                        key={platform.name} 
                        className={`platform-icon ${platform.color} cursor-pointer`}
                        style={{ animationDelay: `${index * 100}ms` }}
                        title={platform.name}
                      >
                        <platform.icon className="h-6 w-6" />
                      </div>
                    ))}
                  </div>
                </div>
              </AnimatedSection>
            </div>

            <AnimatedSection animation="slide-right" delay={200}>
              <div className="relative">
                <img
                  src={heroImage}
                  alt="Content creators collaboration"
                  className="rounded-2xl shadow-hover w-full"
                />
                <FloatingCard className="absolute -bottom-6 -right-6 bg-card p-6 rounded-xl shadow-card border border-border animate-pulse-glow">
                  {(count: number) => (
                    <div className="flex items-center gap-4">
                      <Users className="h-8 w-8 text-primary" />
                      <div>
                        <p className="text-2xl font-bold font-heading">{count}K+</p>
                        <p className="text-sm text-muted-foreground">Active Creators</p>
                      </div>
                    </div>
                  )}
                </FloatingCard>
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
              Get started in three simple steps
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
                Browse Influencers
              </Button>
            </Link>
          </AnimatedSection>
        </div>
      </section>

      {/* CTA Sections */}
      <section className="py-20 gradient-accent animate-gradient-shift">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-8">
            <AnimatedSection animation="slide-left">
              <div className="bg-card/95 backdrop-blur p-8 rounded-2xl shadow-card hover:shadow-hover transition-shadow duration-300">
                <h3 className="text-3xl font-heading font-bold mb-4">For Brands</h3>
                <p className="text-muted-foreground mb-6">
                  Search influencers, post campaigns, track analytics, and get unique content for your brand
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
                      Want to join as a brand? Create a new account with a different email.
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
                      Join as Brand
                    </Button>
                  </Link>
                )}
              </div>
            </AnimatedSection>

            <AnimatedSection animation="slide-right">
              <div className="bg-card/95 backdrop-blur p-8 rounded-2xl shadow-card hover:shadow-hover transition-shadow duration-300">
                <h3 className="text-3xl font-heading font-bold mb-4">For Creators</h3>
                <p className="text-muted-foreground mb-6">
                  Get paid to work with brands you love and showcase your talent to thousands of companies
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
                      Join as Creator
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
