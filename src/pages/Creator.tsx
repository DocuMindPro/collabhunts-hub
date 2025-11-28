import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DollarSign, Users, Shield, TrendingUp, Calendar, Award } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const Creator = () => {
  const [username, setUsername] = useState("");

  const benefits = [
    {
      icon: DollarSign,
      title: "Get Paid Faster",
      description: "Receive payments securely within 7 days of completing work"
    },
    {
      icon: Users,
      title: "250K+ Brands",
      description: "Connect with top brands actively looking for creators"
    },
    {
      icon: Shield,
      title: "Safe & Secure",
      description: "Protected payments and professional contracts"
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
            <p className="text-xl text-muted-foreground mb-8">
              The simple way to sell, manage, and get paid for your Instagram, TikTok, YouTube, and UGC brand deals
            </p>

            {/* Username Claim */}
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
                <Button size="lg" className="gradient-hero hover:opacity-90">
                  Claim
                </Button>
              </div>
            </div>

            <p className="text-sm text-muted-foreground">
              Join 350,000+ creators already earning on CollabHunts
            </p>
          </div>
        </div>
      </section>

      {/* Work With Brands Section */}
      <section className="py-20 md:py-32">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-heading font-bold mb-4">
              Work with 250,000+ Brands
            </h2>
            <p className="text-xl text-muted-foreground">
              Collaborate with brands like Fortune 500 companies and startups
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
            <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
              <span className="text-2xl font-bold text-muted-foreground">Brand</span>
            </div>
            <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
              <span className="text-2xl font-bold text-muted-foreground">Brand</span>
            </div>
            <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
              <span className="text-2xl font-bold text-muted-foreground">Brand</span>
            </div>
            <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
              <span className="text-2xl font-bold text-muted-foreground">Brand</span>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-heading font-bold mb-4">
              Loved by 350,000+ Creators
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
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-card rounded-xl overflow-hidden shadow-card">
                <div className="aspect-square bg-muted"></div>
                <div className="p-6">
                  <div className="flex items-center gap-2 mb-2">
                    <Award className="h-5 w-5 text-primary" />
                    <span className="text-sm font-medium">Top Creator</span>
                  </div>
                  <h3 className="font-heading font-semibold text-lg mb-1">
                    Example Creator {i}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Fashion & Lifestyle Influencer
                  </p>
                </div>
              </div>
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

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
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
              Create your profile in minutes and start getting paid
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="gradient-hero hover:opacity-90">
                Create Your Profile
              </Button>
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
