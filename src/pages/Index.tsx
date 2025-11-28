import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Users, Shield, TrendingUp, Instagram, Youtube, Video } from "lucide-react";
import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import heroImage from "@/assets/hero-creators.jpg";

const Index = () => {
  const [searchQuery, setSearchQuery] = useState("");

  const platforms = [
    { name: "Instagram", icon: Instagram, color: "text-pink-500" },
    { name: "TikTok", icon: Video, color: "text-foreground" },
    { name: "YouTube", icon: Youtube, color: "text-red-500" },
  ];

  const categories = [
    "Fashion", "Beauty", "Lifestyle", "Travel", "Health & Fitness", 
    "Food", "Tech", "Gaming"
  ];

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
      <section className="relative overflow-hidden gradient-subtle">
        <div className="container mx-auto px-4 py-20 md:py-32">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6 animate-fade-in">
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-heading font-bold leading-tight">
                Influencer Marketing{" "}
                <span className="bg-gradient-accent bg-clip-text text-transparent">
                  Made Easy
                </span>
              </h1>
              <p className="text-xl text-muted-foreground">
                Find and hire top Instagram, TikTok, YouTube, and UGC influencers to create unique content for your brand
              </p>
              
              {/* Search Bar */}
              <div className="flex gap-2 max-w-xl">
                <Input
                  type="text"
                  placeholder="Search by category, niche, or platform..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1"
                />
                <Link to={`/influencers${searchQuery ? `?q=${searchQuery}` : ''}`}>
                  <Button size="lg" className="gradient-hero hover:opacity-90">
                    <Search className="h-5 w-5 mr-2" />
                    Search
                  </Button>
                </Link>
              </div>

              {/* Quick Categories */}
              <div className="flex flex-wrap gap-2">
                {categories.slice(0, 6).map((category) => (
                  <Link
                    key={category}
                    to={`/influencers?category=${category}`}
                    className="text-sm px-3 py-1 rounded-full bg-secondary text-secondary-foreground hover:bg-primary hover:text-primary-foreground transition-colors"
                  >
                    {category}
                  </Link>
                ))}
              </div>

              {/* Platform Icons */}
              <div className="flex items-center gap-4 pt-4">
                <span className="text-sm text-muted-foreground">Available on:</span>
                <div className="flex gap-3">
                  {platforms.map((platform) => (
                    <div key={platform.name} className={`${platform.color}`}>
                      <platform.icon className="h-6 w-6" />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="relative animate-slide-up">
              <img
                src={heroImage}
                alt="Content creators collaboration"
                className="rounded-2xl shadow-hover w-full"
              />
              <div className="absolute -bottom-6 -right-6 bg-card p-6 rounded-xl shadow-card border border-border">
                <div className="flex items-center gap-4">
                  <Users className="h-8 w-8 text-primary" />
                  <div>
                    <p className="text-2xl font-bold font-heading">350K+</p>
                    <p className="text-sm text-muted-foreground">Active Creators</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 md:py-32 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-heading font-bold mb-4">
              How It Works
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Get started in three simple steps
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {steps.map((step, index) => (
              <div
                key={index}
                className="text-center space-y-4 p-6 rounded-xl hover:shadow-card transition-shadow"
              >
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full gradient-hero">
                  <step.icon className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-heading font-semibold">{step.title}</h3>
                <p className="text-muted-foreground">{step.description}</p>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link to="/influencers">
              <Button size="lg" className="gradient-hero hover:opacity-90">
                Browse Influencers
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Sections */}
      <section className="py-20 gradient-accent">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-card/95 backdrop-blur p-8 rounded-2xl shadow-card">
              <h3 className="text-3xl font-heading font-bold mb-4">For Brands</h3>
              <p className="text-muted-foreground mb-6">
                Search influencers, post campaigns, track analytics, and get unique content for your brand
              </p>
              <Link to="/brand">
                <Button size="lg" variant="default">
                  Join as Brand
                </Button>
              </Link>
            </div>

            <div className="bg-card/95 backdrop-blur p-8 rounded-2xl shadow-card">
              <h3 className="text-3xl font-heading font-bold mb-4">For Creators</h3>
              <p className="text-muted-foreground mb-6">
                Get paid to work with brands you love and showcase your talent to thousands of companies
              </p>
              <Link to="/creator">
                <Button size="lg" className="bg-accent hover:bg-accent-hover">
                  Join as Creator
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

export default Index;
