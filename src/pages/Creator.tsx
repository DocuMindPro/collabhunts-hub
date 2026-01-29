import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DollarSign, Users, Shield, Calendar, Award, Clock, MapPin, Star } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";

const Creator = () => {
  const [username, setUsername] = useState("");
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

  const benefits = [
    {
      icon: MapPin,
      title: "Host Live Events",
      description: "Get booked by venues to host meet & greets, workshops, and fan experiences"
    },
    {
      icon: DollarSign,
      title: "Earn 85% of Booking",
      description: "Keep 85% of every event booking. We only take a 15% platform fee."
    },
    {
      icon: Users,
      title: "Meet Your Fans",
      description: "Connect with your followers in real life and create unforgettable moments"
    },
    {
      icon: Shield,
      title: "Payment Protection",
      description: "50% escrow deposit ensures you get paid for your time"
    },
    {
      icon: Calendar,
      title: "Flexible Schedule",
      description: "Set your availability and choose which events to accept"
    }
  ];

  const eventTypes = [
    "Meet & Greet", "Workshop", "Competition", "Brand Activation", "Private Event"
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      {/* Hero Section */}
      <section className="relative gradient-subtle py-20 md:py-32">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-heading font-bold mb-6 animate-fade-in">
              Get Paid to{" "}
              <span className="bg-gradient-accent bg-clip-text text-transparent">
                Meet Your Fans
              </span>
            </h1>
            <p className="text-xl text-muted-foreground mb-4">
              Host live events at venues near you. Meet & greets, workshops, competitions — 
              you bring the audience, they bring the venue.
            </p>
            <p className="text-lg text-muted-foreground mb-8">
              Keep 85% of every booking. Payment protected with 50% escrow deposits.
            </p>

            {/* CTA */}
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
                  You're logged in as a venue. To host events as a creator, please create a new account.
                </p>
                <Button size="lg" variant="outline" onClick={() => supabase.auth.signOut()}>
                  Sign Out to Create Creator Account
                </Button>
              </div>
            ) : (
              <div className="max-w-2xl mx-auto mb-8">
                <Link to="/creator-signup">
                  <Button size="lg" className="gradient-hero hover:opacity-90 text-lg px-8 py-6">
                    Start Hosting Events
                  </Button>
                </Link>
              </div>
            )}

            <p className="text-sm text-muted-foreground">
              Join our community of creators hosting live fan experiences
            </p>
          </div>
        </div>
      </section>

      {/* Event Types Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-heading font-bold mb-4">
              Event Types You Can Host
            </h2>
            <p className="text-xl text-muted-foreground">
              From casual meet & greets to full-day activations
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-3 mb-12">
            {eventTypes.map((eventType) => (
              <button
                key={eventType}
                className="px-6 py-3 rounded-full bg-background border border-border hover:border-primary hover:text-primary transition-colors"
              >
                {eventType}
              </button>
            ))}
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {[
              { title: "Meet & Greet", price: "$300-$800", duration: "3 hours" },
              { title: "Workshop", price: "$500-$1,200", duration: "2 hours" },
              { title: "Competition", price: "$800-$2,000", duration: "4 hours" },
            ].map((item) => (
              <div key={item.title} className="bg-card rounded-xl p-6 border border-border">
                <h3 className="font-heading font-semibold text-lg mb-2">{item.title}</h3>
                <p className="text-2xl font-bold text-primary mb-1">{item.price}</p>
                <p className="text-sm text-muted-foreground">{item.duration} typical duration</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl md:text-5xl font-heading font-bold text-center mb-16">
            Why Join as a Creator on CollabHunts
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

      {/* How It Works */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl md:text-5xl font-heading font-bold text-center mb-16">
            How It Works
          </h2>

          <div className="grid md:grid-cols-4 gap-8 max-w-5xl mx-auto">
            {[
              { step: 1, title: "Create Your Profile", desc: "Set up your event portfolio and pricing" },
              { step: 2, title: "Set Availability", desc: "Mark dates you're available for events" },
              { step: 3, title: "Get Booked", desc: "Venues request your event packages" },
              { step: 4, title: "Host & Get Paid", desc: "Meet fans, create content, get 85%" },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="w-12 h-12 rounded-full gradient-hero flex items-center justify-center mx-auto mb-4">
                  <span className="text-white font-bold">{item.step}</span>
                </div>
                <h3 className="font-heading font-semibold mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
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
              Ready to Meet Your Fans?
            </h2>
            <p className="text-xl text-muted-foreground mb-8">
              Create your profile and start getting booked for live events
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
                    Start Hosting Events
                  </Button>
                </Link>
              )}
              <Link to="/#how-it-works">
                <Button size="lg" variant="outline">
                  Learn More
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
