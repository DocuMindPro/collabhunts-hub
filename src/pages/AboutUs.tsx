import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Users, Target, Sparkles, Heart, MapPin, Calendar, Star } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { safeNativeAsync } from "@/lib/supabase-native";

const AboutUs = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [hasBrandProfile, setHasBrandProfile] = useState(false);
  const [hasCreatorProfile, setHasCreatorProfile] = useState(false);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    const checkUserProfiles = async () => {
      const session = await safeNativeAsync(
        async () => {
          const { data } = await supabase.auth.getSession();
          return data.session;
        },
        null
      );
      
      if (!session?.user) {
        setIsLoggedIn(false);
        return;
      }

      setIsLoggedIn(true);

      const [brandData, creatorData] = await Promise.all([
        safeNativeAsync(
          async () => {
            const { data } = await supabase.from("brand_profiles").select("id").eq("user_id", session.user.id).maybeSingle();
            return data;
          },
          null
        ),
        safeNativeAsync(
          async () => {
            const { data } = await supabase.from("creator_profiles").select("id").eq("user_id", session.user.id).maybeSingle();
            return data;
          },
          null
        )
      ]);

      setHasBrandProfile(!!brandData);
      setHasCreatorProfile(!!creatorData);
    };

    checkUserProfiles();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 py-12 md:py-20">
        {/* Hero Section */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h1 className="text-4xl md:text-5xl font-heading font-bold mb-6">
            About <span className="bg-gradient-accent bg-clip-text text-transparent">CollabHunts</span>
          </h1>
          <p className="text-lg text-muted-foreground">
            We connect fans with their favorite creators through unforgettable live events 
            at venues across Lebanon. Meet & greets, workshops, and exclusive experiences.
          </p>
        </div>

        {/* Our Story */}
        <section className="mb-20">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-heading font-bold mb-6 text-center">Our Story</h2>
            <div className="prose prose-lg dark:prose-invert mx-auto text-muted-foreground">
              <p className="mb-4">
                CollabHunts was born from a simple idea: what if fans could meet their favorite 
                content creators in person? Not through a screen, but face-to-face at real events 
                hosted by local venues.
              </p>
              <p className="mb-4">
                Founded in 2024, our platform connects Lebanon's vibrant creator community with 
                venues looking to host memorable events. From coffee shops to event halls, we 
                help venues attract foot traffic while giving creators a stage to engage with 
                their audience.
              </p>
              <p>
                Today, CollabHunts powers meet & greets, workshops, and competitions across 
                Lebanon—bringing online communities together in the real world.
              </p>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="mb-20">
          <h2 className="text-2xl md:text-3xl font-heading font-bold mb-10 text-center">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-card border border-border rounded-xl p-6 text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPin className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-heading font-semibold mb-2">Venues Host</h3>
              <p className="text-sm text-muted-foreground">
                Local venues book creators to host events, driving foot traffic and creating buzz.
              </p>
            </div>
            
            <div className="bg-card border border-border rounded-xl p-6 text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Calendar className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-heading font-semibold mb-2">Creators Perform</h3>
              <p className="text-sm text-muted-foreground">
                Creators host meet & greets, workshops, or competitions with their fans.
              </p>
            </div>
            
            <div className="bg-card border border-border rounded-xl p-6 text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-heading font-semibold mb-2">Fans Experience</h3>
              <p className="text-sm text-muted-foreground">
                Fans register and attend live events to meet their favorite creators.
              </p>
            </div>
          </div>
        </section>

        {/* Values */}
        <section className="mb-20">
          <h2 className="text-2xl md:text-3xl font-heading font-bold mb-10 text-center">Our Values</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-card border border-border rounded-xl p-6 text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-heading font-semibold mb-2">Community First</h3>
              <p className="text-sm text-muted-foreground">
                We bring online communities into the real world, creating genuine connections.
              </p>
            </div>
            
            <div className="bg-card border border-border rounded-xl p-6 text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Target className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-heading font-semibold mb-2">Local Focus</h3>
              <p className="text-sm text-muted-foreground">
                Built for Lebanon, supporting local venues and creators across the country.
              </p>
            </div>
            
            <div className="bg-card border border-border rounded-xl p-6 text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Sparkles className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-heading font-semibold mb-2">Memorable Experiences</h3>
              <p className="text-sm text-muted-foreground">
                Every event is designed to create lasting memories for fans and creators alike.
              </p>
            </div>
            
            <div className="bg-card border border-border rounded-xl p-6 text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-heading font-semibold mb-2">Passion</h3>
              <p className="text-sm text-muted-foreground">
                We love connecting people and making events happen seamlessly.
              </p>
            </div>
          </div>
        </section>

        {/* CTA - Role-aware */}
        <section className="text-center">
          <div className="bg-card border border-border rounded-xl p-8 md:p-12 max-w-3xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-heading font-bold mb-4">Ready to Get Started?</h2>
            <p className="text-muted-foreground mb-6">
              {isLoggedIn 
                ? "Explore what CollabHunts has to offer."
                : "Join Lebanon's premier platform for creator events and live experiences."
              }
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {/* For prospects (not logged in) */}
              {!isLoggedIn && (
                <>
                  <a href="/creator" className="inline-flex items-center justify-center px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors">
                    Join as Creator
                  </a>
                  <a href="/brand" className="inline-flex items-center justify-center px-6 py-3 bg-secondary text-secondary-foreground rounded-lg font-medium hover:bg-secondary/80 transition-colors">
                    Register Your Brand
                  </a>
                </>
              )}
              
              {/* For logged-in brands */}
              {hasBrandProfile && (
                <>
                  <a href="/influencers" className="inline-flex items-center justify-center px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors">
                    Find Creators
                  </a>
                  <a href="/brand-dashboard" className="inline-flex items-center justify-center px-6 py-3 bg-secondary text-secondary-foreground rounded-lg font-medium hover:bg-secondary/80 transition-colors">
                    Go to Dashboard
                  </a>
                </>
              )}
              
              {/* For logged-in creators (without brand profile) */}
              {hasCreatorProfile && !hasBrandProfile && (
                <>
                  <a href="/opportunities" className="inline-flex items-center justify-center px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors">
                    Browse Opportunities
                  </a>
                  <a href="/creator-dashboard" className="inline-flex items-center justify-center px-6 py-3 bg-secondary text-secondary-foreground rounded-lg font-medium hover:bg-secondary/80 transition-colors">
                    Go to Dashboard
                  </a>
                </>
              )}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default AboutUs;
