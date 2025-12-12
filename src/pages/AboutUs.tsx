import { useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Users, Target, Sparkles, Heart } from "lucide-react";

const AboutUs = () => {
  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
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
            We're on a mission to revolutionize how brands and creators collaborate, 
            making influencer marketing accessible, transparent, and effective for everyone.
          </p>
        </div>

        {/* Our Story */}
        <section className="mb-20">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-heading font-bold mb-6 text-center">Our Story</h2>
            <div className="prose prose-lg dark:prose-invert mx-auto text-muted-foreground">
              <p className="mb-4">
                CollabHunts was born from a simple observation: the influencer marketing industry was 
                fragmented, opaque, and often frustrating for both creators and brands. We saw talented 
                creators struggling to find brand partnerships, while brands wasted time and resources 
                trying to identify the right influencers for their campaigns.
              </p>
              <p className="mb-4">
                Founded in 2024, our platform bridges this gap by creating a transparent marketplace 
                where authentic connections happen. We believe that when the right brand meets the 
                right creator, magic happens—content that resonates, audiences that engage, and 
                partnerships that last.
              </p>
              <p>
                Today, CollabHunts serves thousands of creators and brands worldwide, facilitating 
                collaborations that drive real results and build meaningful relationships.
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
                We prioritize the success of our creators and brands, building features that serve their needs.
              </p>
            </div>
            
            <div className="bg-card border border-border rounded-xl p-6 text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Target className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-heading font-semibold mb-2">Transparency</h3>
              <p className="text-sm text-muted-foreground">
                Clear pricing, honest communication, and no hidden fees. What you see is what you get.
              </p>
            </div>
            
            <div className="bg-card border border-border rounded-xl p-6 text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Sparkles className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-heading font-semibold mb-2">Quality</h3>
              <p className="text-sm text-muted-foreground">
                We curate our creator community to ensure brands connect with authentic, talented individuals.
              </p>
            </div>
            
            <div className="bg-card border border-border rounded-xl p-6 text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-heading font-semibold mb-2">Passion</h3>
              <p className="text-sm text-muted-foreground">
                We love what we do and it shows in every feature we build and every interaction we have.
              </p>
            </div>
          </div>
        </section>

        {/* Team Section */}
        <section className="mb-20">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-2xl md:text-3xl font-heading font-bold mb-6">Our Team</h2>
            <p className="text-muted-foreground mb-8">
              We're a diverse team of marketers, engineers, and creator economy enthusiasts 
              united by our passion for building the best platform for brand-creator collaborations.
            </p>
            <div className="bg-gradient-to-r from-primary/10 to-accent/10 rounded-xl p-8 border border-border">
              <p className="text-lg font-medium">
                "We believe every creator deserves the opportunity to turn their passion into a profession, 
                and every brand deserves access to authentic voices that resonate with their audience."
              </p>
              <p className="text-sm text-muted-foreground mt-4">— The CollabHunts Team</p>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="text-center">
          <div className="bg-card border border-border rounded-xl p-8 md:p-12 max-w-3xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-heading font-bold mb-4">Ready to Get Started?</h2>
            <p className="text-muted-foreground mb-6">
              Join thousands of creators and brands already using CollabHunts to grow their business.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href="/creator" className="inline-flex items-center justify-center px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors">
                Join as Creator
              </a>
              <a href="/brand" className="inline-flex items-center justify-center px-6 py-3 bg-secondary text-secondary-foreground rounded-lg font-medium hover:bg-secondary/80 transition-colors">
                Join as Brand
              </a>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default AboutUs;
