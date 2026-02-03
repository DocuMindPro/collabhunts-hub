import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Mail, MessageSquare, Clock, MapPin } from "lucide-react";
import { toast } from "sonner";
import WhatsAppButton from "@/components/WhatsAppButton";
import { supabase } from "@/integrations/supabase/client";
import { safeNativeAsync } from "@/lib/supabase-native";

const Contact = () => {
  const [searchParams] = useSearchParams();
  const prefilledSubject = searchParams.get("subject") || "";
  const [isSubmitting, setIsSubmitting] = useState(false);
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

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    toast.success("Message sent! We'll get back to you within 24-48 hours.");
    setIsSubmitting(false);
    (e.target as HTMLFormElement).reset();
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 py-12 md:py-20">
        {/* Hero Section */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h1 className="text-4xl md:text-5xl font-heading font-bold mb-6">
            Get in <span className="bg-gradient-accent bg-clip-text text-transparent">Touch</span>
          </h1>
          <p className="text-lg text-muted-foreground">
            Have a question about hosting an event, becoming a creator, or registering your brand? We're here to help.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
          {/* Contact Form */}
          <div className="bg-card border border-border rounded-xl p-6 md:p-8">
            <h2 className="text-2xl font-heading font-bold mb-6">Send us a Message</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input id="firstName" placeholder="John" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input id="lastName" placeholder="Doe" required />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="john@example.com" required />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="subject">Subject</Label>
                <Input 
                  id="subject" 
                  placeholder="How can we help?" 
                  required 
                  defaultValue={prefilledSubject}
                  readOnly={!!prefilledSubject}
                  className={prefilledSubject ? "bg-muted cursor-not-allowed" : ""}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="message">Message</Label>
                <Textarea 
                  id="message" 
                  placeholder="Tell us about your event idea, venue, or any questions..." 
                  rows={5}
                  required 
                />
              </div>
              
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? "Sending..." : "Send Message"}
              </Button>
            </form>
          </div>

          {/* Contact Info */}
          <div className="space-y-8">
            <div>
              <h2 className="text-2xl font-heading font-bold mb-6">Contact Information</h2>
              <p className="text-muted-foreground mb-8">
                Reach out via email or WhatsApp. Our team is here to help you plan amazing events.
              </p>
            </div>

            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center shrink-0">
                  <Mail className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-heading font-semibold mb-1">Email Us</h3>
                  <p className="text-muted-foreground text-sm mb-1">For general inquiries and support</p>
                  <a href="mailto:care@collabhunts.com" className="text-primary hover:underline">
                    care@collabhunts.com
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-green-500/10 rounded-full flex items-center justify-center shrink-0">
                  <MessageSquare className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <h3 className="font-heading font-semibold mb-1">WhatsApp</h3>
                  <p className="text-muted-foreground text-sm mb-2">Quick responses during business hours</p>
                  <WhatsAppButton 
                    phoneNumber="+96170123456" 
                    message="Hi! I have a question about CollabHunts events."
                    variant="outline"
                    size="sm"
                  />
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center shrink-0">
                  <Clock className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-heading font-semibold mb-1">Response Time</h3>
                  <p className="text-muted-foreground text-sm">
                    We typically respond within 24-48 hours during business days.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center shrink-0">
                  <MapPin className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-heading font-semibold mb-1">Location</h3>
                  <p className="text-muted-foreground text-sm">
                    Based in Lebanon, serving creators and venues across the country.
                  </p>
                </div>
              </div>
            </div>

            {/* Role-aware FAQ CTA */}
            {hasBrandProfile && (
              <div className="bg-muted/50 rounded-xl p-6 border border-border">
                <h3 className="font-heading font-semibold mb-2">Need help finding the right creator?</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Browse our curated selection of creators or check your dashboard for booking updates.
                </p>
                <Button variant="outline" size="sm" asChild>
                  <a href="/influencers">Find Creators</a>
                </Button>
              </div>
            )}

            {hasCreatorProfile && !hasBrandProfile && (
              <div className="bg-muted/50 rounded-xl p-6 border border-border">
                <h3 className="font-heading font-semibold mb-2">Looking for your next opportunity?</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Browse open opportunities from venues and brands looking for creators like you.
                </p>
                <Button variant="outline" size="sm" asChild>
                  <a href="/opportunities">Browse Opportunities</a>
                </Button>
              </div>
            )}

            {!isLoggedIn && (
              <div className="bg-muted/50 rounded-xl p-6 border border-border">
                <h3 className="font-heading font-semibold mb-2">Planning an event?</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Browse our events page to see what's happening, or check out our creator and venue guides.
                </p>
                <Button variant="outline" size="sm" asChild>
                  <a href="/events">Browse Events</a>
                </Button>
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Contact;
