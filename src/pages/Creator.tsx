import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DollarSign, Users, Shield, Calendar, Award, Clock } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";
import AdPlacement from "@/components/AdPlacement";
const Creator = () => {
  const [username, setUsername] = useState("");
  const [user, setUser] = useState<any>(null);
  const [hasBrandProfile, setHasBrandProfile] = useState(false);
  const [hasCreatorProfile, setHasCreatorProfile] = useState(false);

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // Capture referral code from URL
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const refCode = urlParams.get('ref');
    if (refCode) {
      localStorage.setItem('affiliate_referral_code', refCode);
    }
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
      icon: Clock,
      title: "Save Valuable Time",
      description: "No more filtering through endless DMs — only verified, serious brands ready to collaborate will contact you"
    },
    {
      icon: DollarSign,
      title: "Get Paid Faster",
      description: "Receive payments securely and in a timely manner"
    },
    {
      icon: Users,
      title: "Growing Brand Network",
      description: "Connect with verified brands actively looking to hire and pay creators like you"
    },
    {
      icon: Shield,
      title: "Safe & Secure",
      description: "Verified brands and professional contracts protect your work"
    },
    {
      icon: Calendar,
      title: "Flexible Schedule",
      description: "Work on your own terms and choose your own rates"
    }
  ];

  const categories = [
    "Lifestyle", "Fashion", "Beauty", "Travel", "Health & Fitness",
    "Family & Children", "Music & Dance", "Comedy & Entertainment"
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      {/* Hero Section */}
      <section className="relative gradient-subtle py-20 md:py-32">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-heading font-bold mb-6 animate-fade-in">
              Get Paid to Work With{" "}
              <span className="bg-gradient-accent bg-clip-text text-transparent">
                Brands You Love
              </span>
            </h1>
            <p className="text-xl text-muted-foreground mb-4">
              The simple way to sell, manage, and get paid for your Instagram, TikTok, YouTube, and UGC brand deals
            </p>
            <p className="text-lg text-muted-foreground mb-8">
              No more wasting time on unserious DMs — only verified brands ready to pay will reach out to you.
            </p>

            {/* Username Claim or Dashboard Link */}
            {hasCreatorProfile ? (
              <div className="max-w-2xl mx-auto mb-8">
                <Link to="/creator-dashboard">
                  <Button size="lg" className="gradient-hero hover:opacity-90 text-lg px-8 py-6">
                    Go to Dashboard
                  </Button>
                </Link>
              </div>
            ) : user && hasBrandProfile ? (
              <div className="max-w-2xl mx-auto mb-8 space-y-3">
                <p className="text-muted-foreground">
                  You're logged in as a brand. To join as a creator, please create a new account with a different email.
                </p>
                <Button size="lg" variant="outline" onClick={() => supabase.auth.signOut()}>
                  Sign Out to Create Creator Account
                </Button>
              </div>
            ) : (
              <div className="max-w-2xl mx-auto mb-8">
                <div className="flex gap-2">
                  <div className="flex-1 flex items-center bg-background border border-input rounded-lg px-4">
                    <span className="text-muted-foreground mr-2">collabhunts.com/</span>
                    <Input
                      type="text"
                      placeholder="yourname"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="border-0 focus-visible:ring-0 px-0"
                    />
                  </div>
                  <Button 
                    size="lg" 
                    className="gradient-hero hover:opacity-90"
                    onClick={() => window.location.href = '/creator-signup'}
                  >
                    Claim
                  </Button>
                </div>
              </div>
            )}

            <p className="text-sm text-muted-foreground">
              Join our growing community of creators earning on CollabHunts
            </p>
          </div>
        </div>
      </section>

      {/* Work With Brands Section */}
      <section className="py-20 md:py-32">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-heading font-bold mb-4">
              Work with Brands of All Sizes
            </h2>
            <p className="text-xl text-muted-foreground mb-3">
              Collaborate with startups, growing businesses, and established brands
            </p>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Every brand on CollabHunts has been verified and is ready to work. Say goodbye to sorting through social media DMs from people who waste your time.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
            <AdPlacement 
              placementId="creator_brand_spotlight_1" 
              className="aspect-video"
              showAdvertiseHere={true}
            />
            <AdPlacement 
              placementId="creator_brand_spotlight_2" 
              className="aspect-video"
              showAdvertiseHere={true}
            />
            <AdPlacement 
              placementId="creator_brand_spotlight_3" 
              className="aspect-video"
              showAdvertiseHere={true}
            />
            <AdPlacement 
              placementId="creator_brand_spotlight_4" 
              className="aspect-video"
              showAdvertiseHere={true}
            />
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-heading font-bold mb-4">
              Trusted by Creators Everywhere
            </h2>
            <p className="text-xl text-muted-foreground">
              Find your niche and start earning
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-3 mb-12">
            {categories.map((category) => (
              <button
                key={category}
                className="px-6 py-3 rounded-full bg-background border border-border hover:border-primary hover:text-primary transition-colors"
              >
                {category}
              </button>
            ))}
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {[
              { id: "creator_featured_1", num: 1 },
              { id: "creator_featured_2", num: 2 },
              { id: "creator_featured_3", num: 3 }
            ].map((item) => (
              <AdPlacement 
                key={item.id}
                placementId={item.id} 
                className="aspect-[3/4]"
                fallback={
                  <div className="bg-card rounded-xl overflow-hidden shadow-card h-full">
                    <div className="aspect-square bg-muted"></div>
                    <div className="p-6">
                      <div className="flex items-center gap-2 mb-2">
                        <Award className="h-5 w-5 text-primary" />
                        <span className="text-sm font-medium">Featured Creator</span>
                      </div>
                      <h3 className="font-heading font-semibold text-lg mb-1">
                        Creator Spotlight {item.num}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Coming Soon
                      </p>
                    </div>
                  </div>
                }
              />
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl md:text-5xl font-heading font-bold text-center mb-16">
            Why Creators Choose CollabHunts
          </h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-8">
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
              Ready to Start Earning?
            </h2>
            <p className="text-xl text-muted-foreground mb-8">
              Create your profile in minutes and let serious, verified brands come to you — no more time wasted on dead-end inquiries
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {hasCreatorProfile ? (
                <Link to="/creator-dashboard">
                  <Button size="lg" className="gradient-hero hover:opacity-90">
                    Go to Dashboard
                  </Button>
                </Link>
              ) : user && hasBrandProfile ? (
                <Button size="lg" variant="outline" onClick={() => supabase.auth.signOut()}>
                  Sign Out to Create Creator Account
                </Button>
              ) : (
                <Link to="/creator-signup">
                  <Button size="lg" className="gradient-hero hover:opacity-90">
                    Create Your Profile
                  </Button>
                </Link>
              )}
              <Link to="/#how-it-works">
                <Button size="lg" variant="outline">
                  Learn How It Works
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

export default Creator;
