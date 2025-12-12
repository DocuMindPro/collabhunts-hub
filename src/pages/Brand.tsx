import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
  Search, Shield, TrendingUp, Users, DollarSign, CheckCircle, 
  MessageSquare, FolderOpen, Heart, Star, Camera, Video, 
  FileText, Megaphone, Target, Send, Clock, Award, 
  ChevronRight, Play, Sparkles, Filter, Bookmark, BarChart3
} from "lucide-react";
import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";
import heroImage from "@/assets/hero-brand-page.jpg";
import BrandMarquee from "@/components/BrandMarquee";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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
            You're logged in as a creator. Create a new account with a different email to join as a brand.
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
          Join for Free
        </Button>
      </Link>
    );
  };

  const marketplaceFeatures = [
    { icon: DollarSign, title: "No Upfront Cost", description: "Browse creators for free" },
    { icon: CheckCircle, title: "Vetted Creators", description: "All creators are verified" },
    { icon: MessageSquare, title: "Instant Chat", description: "Message creators directly" },
    { icon: Shield, title: "Secure Payments", description: "Escrow protection on all orders" },
  ];

  const campaignFeatures = [
    { 
      icon: Target, 
      title: "Set Your Targeting", 
      description: "Filter by demographics, niche, location, and follower size to find your perfect creators"
    },
    { 
      icon: FileText, 
      title: "Post Your Campaign", 
      description: "Create a brief with your requirements, budget, and timeline in one centralized place"
    },
    { 
      icon: Send, 
      title: "Receive Applications", 
      description: "Sit back as qualified creators apply to work with you, complete with their pricing"
    },
  ];

  const contentLibraryFeatures = [
    { icon: FolderOpen, title: "Folder Organization", description: "Organize content by campaign, creator, or custom folders with color coding" },
    { icon: Clock, title: "Usage Rights Tracking", description: "Never miss a license expiration with automated reminders and tracking" },
    { icon: BarChart3, title: "Bulk Downloads", description: "Download all your content at once with full creator attribution" },
  ];

  const crmFeatures = [
    { icon: Bookmark, title: "Save Favorites", description: "Build your own private list of go-to creators" },
    { icon: FileText, title: "Private Notes", description: "Add internal notes and ratings for each creator" },
    { icon: TrendingUp, title: "Track History", description: "See all past collaborations and spending with each creator" },
  ];

  const contentTypes = [
    { icon: Camera, title: "Sponsored Posts", description: "High-quality feed posts featuring your products" },
    { icon: Video, title: "Video Content", description: "TikToks, Reels, YouTube videos, and more" },
    { icon: Play, title: "UGC Content", description: "Authentic user-generated content for your ads" },
    { icon: Megaphone, title: "Product Reviews", description: "Honest testimonials from trusted voices" },
  ];

  const categories = [
    { name: "Lifestyle" },
    { name: "Fashion" },
    { name: "Beauty" },
    { name: "Fitness" },
    { name: "Travel" },
    { name: "Food" },
  ];

  const subscriptionTiers = [
    {
      name: "Basic",
      price: "$39",
      period: "/month",
      description: "Perfect for getting started",
      features: ["Chat with creators", "10GB content storage", "15% marketplace fee"],
      highlight: false,
    },
    {
      name: "Pro",
      price: "$99",
      period: "/month",
      description: "Most popular for growing brands",
      features: ["Everything in Basic", "1 campaign/month", "Creator CRM access", "Advanced filters", "Verified badge eligibility"],
      highlight: true,
    },
    {
      name: "Premium",
      price: "$299",
      period: "/month",
      description: "For brands that need it all",
      features: ["Everything in Pro", "Unlimited campaigns", "50GB content storage", "Priority support", "Mass messaging"],
      highlight: false,
    },
  ];

  const testimonials = [
    {
      quote: "CollabHunts made finding creators incredibly easy. The Content Library alone saved us hours of organization work.",
      author: "Sarah M.",
      role: "Marketing Director",
      company: "Fashion Brand",
      rating: 5,
    },
    {
      quote: "The campaign feature brought qualified creators directly to us. No more cold outreach - they come to you!",
      author: "Michael R.",
      role: "Founder",
      company: "Tech Startup",
      rating: 5,
    },
    {
      quote: "Secure payments and the dispute system gave us confidence to work with new creators without worry.",
      author: "Emma L.",
      role: "Social Media Manager",
      company: "Beauty Company",
      rating: 5,
    },
  ];

  const faqs = [
    {
      question: "How do payments work?",
      answer: "We use an escrow system. Your payment is held securely until you approve the delivered content. If there's an issue, you can request revisions or open a dispute."
    },
    {
      question: "How are creators vetted?",
      answer: "All creators go through a verification process before they can list their services. We check their social media accounts, content quality, and track record."
    },
    {
      question: "What if I'm not satisfied with the content?",
      answer: "You can request up to 2 revisions per booking. If issues persist, you can open a dispute and our team will help mediate a resolution."
    },
    {
      question: "How long do creators have to deliver?",
      answer: "Delivery times vary by creator and are shown on each service listing. Typical turnaround is 3-7 days for most content types."
    },
    {
      question: "Can I request revisions?",
      answer: "Yes! Each booking includes up to 2 revision requests to ensure you get exactly what you need."
    },
    {
      question: "How does the Content Library work?",
      answer: "The Content Library lets you store all delivered content in one place, organized by folders. Track usage rights, set expiration alerts, and download content anytime."
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
                The #1 Creator Marketplace
              </span>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-heading font-bold mb-6 animate-fade-in text-foreground">
                Get Custom Content for Your Brand{" "}
                <span className="bg-gradient-accent bg-clip-text text-transparent">
                  in Seconds
                </span>
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-xl mx-auto lg:mx-0">
                Search creators, post campaigns, store content, and manage your creator relationships—all in one powerful platform.
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
                  alt="Brands collaborating with creators" 
                  className="w-full h-auto object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background/20 to-transparent" />
              </div>
              <div className="absolute -bottom-6 -left-6 bg-card rounded-xl p-4 shadow-lg border border-border animate-float">
                <p className="text-2xl font-bold text-primary">10K+</p>
                <p className="text-sm text-muted-foreground">Active Creators</p>
              </div>
              <div className="absolute -top-4 -right-4 bg-card rounded-xl p-4 shadow-lg border border-border">
                <p className="text-2xl font-bold text-accent">72hr</p>
                <p className="text-sm text-muted-foreground">Avg. Delivery</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Brand Marquee */}
      <BrandMarquee />

      {/* Feature 1: Marketplace Search */}
      <section className="py-20 md:py-32">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-accent/10 text-accent mb-4">
              Marketplace
            </span>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-heading font-bold mb-4">
              Find and Hire Creators in Seconds
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Browse thousands of vetted Instagram, TikTok, and YouTube creators. Filter by niche, followers, and price to find your perfect match.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <div className="text-center space-y-4 p-6 rounded-xl bg-card border border-border step-card">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-full gradient-hero mx-auto step-icon">
                <Search className="h-7 w-7 text-white" />
              </div>
              <h3 className="text-xl font-heading font-semibold">Search Creators</h3>
              <p className="text-muted-foreground">Filter by niche, platform, location, followers, and price range</p>
            </div>
            <div className="text-center space-y-4 p-6 rounded-xl bg-card border border-border step-card">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-full gradient-hero mx-auto step-icon">
                <MessageSquare className="h-7 w-7 text-white" />
              </div>
              <h3 className="text-xl font-heading font-semibold">Message & Book</h3>
              <p className="text-muted-foreground">Chat directly with creators and securely purchase their services</p>
            </div>
            <div className="text-center space-y-4 p-6 rounded-xl bg-card border border-border step-card">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-full gradient-hero mx-auto step-icon">
                <CheckCircle className="h-7 w-7 text-white" />
              </div>
              <h3 className="text-xl font-heading font-semibold">Get Content</h3>
              <p className="text-muted-foreground">Receive high-quality content directly through the platform</p>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {marketplaceFeatures.map((feature, index) => (
              <div key={index} className="flex items-center gap-3 p-4 rounded-lg bg-muted/50 border border-border/50">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <feature.icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-semibold text-sm">{feature.title}</p>
                  <p className="text-xs text-muted-foreground">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Feature 2: Campaigns */}
      <section className="py-20 md:py-32 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-secondary/20 text-secondary-foreground mb-4">
                Campaigns
              </span>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-heading font-bold mb-6">
                Post Campaigns and Have Creators Come to You
              </h2>
              <p className="text-lg text-muted-foreground mb-8">
                Instead of reaching out to creators one by one, post your campaign and let qualified creators apply to work with you.
              </p>
              
              <div className="space-y-6">
                {campaignFeatures.map((feature, index) => (
                  <div key={index} className="flex gap-4">
                    <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                      <feature.icon className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-heading font-semibold text-lg">{feature.title}</h3>
                      <p className="text-muted-foreground">{feature.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="bg-card rounded-2xl p-6 border border-border shadow-card">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-accent" />
                    <div>
                      <p className="font-semibold text-sm">Summer Product Launch</p>
                      <p className="text-xs text-muted-foreground">Fashion • 5 spots</p>
                    </div>
                  </div>
                  <span className="px-2 py-1 rounded-full bg-green-500/10 text-green-600 text-xs font-medium">Active</span>
                </div>
                <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-hero" />
                    <div>
                      <p className="font-semibold text-sm">UGC for Ads</p>
                      <p className="text-xs text-muted-foreground">Beauty • 10 spots</p>
                    </div>
                  </div>
                  <span className="px-2 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">12 applications</span>
                </div>
                <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-accent" />
                    <div>
                      <p className="font-semibold text-sm">Product Review Video</p>
                      <p className="text-xs text-muted-foreground">Tech • 3 spots</p>
                    </div>
                  </div>
                  <span className="px-2 py-1 rounded-full bg-green-500/10 text-green-600 text-xs font-medium">Active</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature 3: Content Library */}
      <section className="py-20 md:py-32">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="order-2 lg:order-1">
              <div className="bg-card rounded-2xl p-6 border border-border shadow-card">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-3 h-3 rounded-full bg-red-500" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500" />
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                </div>
              <div className="grid grid-cols-3 gap-2 mb-4">
                  {/* Video thumbnails */}
                  <div className="aspect-square rounded-lg bg-gradient-to-br from-primary/20 to-primary/5 border border-border/50 flex items-center justify-center relative overflow-hidden">
                    <img src="https://images.unsplash.com/photo-1611162616475-46b635cb6868?w=200&h=200&fit=crop" alt="Video content" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                      <Play className="h-6 w-6 text-white fill-white" />
                    </div>
                  </div>
                  <div className="aspect-square rounded-lg bg-gradient-to-br from-accent/20 to-accent/5 border border-border/50 flex items-center justify-center relative overflow-hidden">
                    <img src="https://images.unsplash.com/photo-1616469829581-73993eb86b02?w=200&h=200&fit=crop" alt="Video content" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                      <Play className="h-6 w-6 text-white fill-white" />
                    </div>
                  </div>
                  <div className="aspect-square rounded-lg bg-gradient-to-br from-secondary/20 to-secondary/5 border border-border/50 flex items-center justify-center relative overflow-hidden">
                    <img src="https://images.unsplash.com/photo-1526947425960-945c6e72858f?w=200&h=200&fit=crop" alt="Video content" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                      <Play className="h-6 w-6 text-white fill-white" />
                    </div>
                  </div>
                  {/* Image thumbnails */}
                  <div className="aspect-square rounded-lg border border-border/50 overflow-hidden">
                    <img src="https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=200&h=200&fit=crop" alt="Fashion content" className="w-full h-full object-cover" />
                  </div>
                  <div className="aspect-square rounded-lg border border-border/50 overflow-hidden">
                    <img src="https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=200&h=200&fit=crop" alt="Beauty content" className="w-full h-full object-cover" />
                  </div>
                  <div className="aspect-square rounded-lg border border-border/50 overflow-hidden">
                    <img src="https://images.unsplash.com/photo-1483985988355-763728e1935b?w=200&h=200&fit=crop" alt="Lifestyle content" className="w-full h-full object-cover" />
                  </div>
                </div>
                <div className="flex gap-2">
                  <span className="px-2 py-1 rounded bg-primary/10 text-primary text-xs">Summer Campaign</span>
                  <span className="px-2 py-1 rounded bg-accent/10 text-accent text-xs">UGC</span>
                  <span className="px-2 py-1 rounded bg-secondary/20 text-secondary-foreground text-xs">Licensed</span>
                </div>
              </div>
            </div>
            
            <div className="order-1 lg:order-2">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary/10 text-primary mb-4">
                Content Library
              </span>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-heading font-bold mb-6">
                Store, Organize & Manage All Your Content
              </h2>
              <p className="text-lg text-muted-foreground mb-8">
                Keep all your creator content in one secure place. Track usage rights, organize with folders, and never lose a deliverable again.
              </p>
              
              <div className="space-y-4">
                {contentLibraryFeatures.map((feature, index) => (
                  <div key={index} className="flex items-center gap-4 p-4 rounded-lg bg-muted/50">
                    <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <feature.icon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold">{feature.title}</h3>
                      <p className="text-sm text-muted-foreground">{feature.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature 4: Creator CRM */}
      <section className="py-20 md:py-32 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-accent/10 text-accent mb-4">
              Creator CRM
            </span>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-heading font-bold mb-4">
              Your Private Creator Rolodex
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Build lasting relationships with your favorite creators. Save, organize, and track your collaboration history all in one place.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {crmFeatures.map((feature, index) => (
              <div key={index} className="text-center p-8 rounded-2xl bg-card border border-border shadow-card step-card">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-accent/10 mb-6">
                  <feature.icon className="h-8 w-8 text-accent" />
                </div>
                <h3 className="text-xl font-heading font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Content Types */}
      <section className="py-20 md:py-32">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-heading font-bold mb-4">
              One Place for All Your Content Needs
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              From sponsored posts to UGC, find creators for any content type you need.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {contentTypes.map((type, index) => (
              <div key={index} className="group p-6 rounded-2xl bg-card border border-border hover:border-primary/50 hover:shadow-hover transition-all duration-300">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <type.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-lg font-heading font-semibold mb-2">{type.title}</h3>
                <p className="text-sm text-muted-foreground">{type.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Creator Categories */}
      <section className="py-20 md:py-32 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-heading font-bold mb-4">
              Creators in Every Category
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Whatever your niche, we have the perfect creators for your brand.
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-3 mb-8">
            {categories.map((category, index) => (
              <Link 
                key={index} 
                to={`/influencers?category=${category.name.toLowerCase()}`}
                className="px-6 py-3 rounded-full bg-card border border-border hover:border-primary hover:bg-primary/5 transition-all duration-300 group"
              >
                <span className="font-medium group-hover:text-primary transition-colors">{category.name}</span>
              </Link>
            ))}
          </div>

          <div className="text-center">
            <Link to="/influencers">
              <Button variant="outline" className="gap-2">
                View All Categories <ChevronRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Subscription Tiers */}
      <section className="py-20 md:py-32">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-heading font-bold mb-4">
              Simple, Transparent Pricing
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Choose the plan that fits your needs. Upgrade or downgrade anytime.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {subscriptionTiers.map((tier, index) => (
              <div 
                key={index} 
                className={`relative p-8 rounded-2xl border ${
                  tier.highlight 
                    ? 'bg-card border-primary shadow-hover' 
                    : 'bg-card border-border'
                }`}
              >
                {tier.highlight && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-primary text-primary-foreground text-xs font-medium">
                    Most Popular
                  </span>
                )}
                <h3 className="text-2xl font-heading font-bold mb-2">{tier.name}</h3>
                <div className="mb-4">
                  <span className="text-4xl font-bold">{tier.price}</span>
                  <span className="text-muted-foreground">{tier.period}</span>
                </div>
                <p className="text-muted-foreground mb-6">{tier.description}</p>
                <ul className="space-y-3 mb-8">
                  {tier.features.map((feature, fIndex) => (
                    <li key={fIndex} className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-primary flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <Link to="/pricing" className="block">
                  <Button 
                    className={`w-full ${tier.highlight ? 'gradient-hero' : ''}`}
                    variant={tier.highlight ? "default" : "outline"}
                  >
                    Get Started
                  </Button>
                </Link>
              </div>
            ))}
          </div>

          <div className="text-center mt-8">
            <Link to="/pricing">
              <Button variant="link" className="text-primary gap-2">
                View Full Pricing Details <ChevronRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 md:py-32 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-heading font-bold mb-4">
              Trusted by Brands Everywhere
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="p-8 rounded-2xl bg-card border border-border shadow-card">
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-secondary fill-secondary" />
                  ))}
                </div>
                <p className="text-muted-foreground mb-6 italic">"{testimonial.quote}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-accent flex items-center justify-center text-white font-bold">
                    {testimonial.author.charAt(0)}
                  </div>
                  <div>
                    <p className="font-semibold">{testimonial.author}</p>
                    <p className="text-sm text-muted-foreground">{testimonial.role}, {testimonial.company}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 md:py-32">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-heading font-bold mb-4">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="max-w-3xl mx-auto">
            <Accordion type="single" collapsible className="space-y-4">
              {faqs.map((faq, index) => (
                <AccordionItem 
                  key={index} 
                  value={`item-${index}`}
                  className="bg-card border border-border rounded-xl px-6 overflow-hidden"
                >
                  <AccordionTrigger className="text-left font-heading font-semibold hover:no-underline py-4">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground pb-4">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 md:py-32 gradient-accent">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-heading font-bold mb-6 text-white">
              Ready to Get Custom Content for Your Brand?
            </h2>
            <p className="text-xl text-white/80 mb-8">
              Join thousands of brands already using CollabHunts to create amazing content with creators.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {hasBrandProfile ? (
                <Link to="/brand-dashboard">
                  <Button size="lg" className="bg-white text-primary hover:bg-white/90 text-lg px-8 py-6">
                    Go to Dashboard
                  </Button>
                </Link>
              ) : user && hasCreatorProfile ? (
                <Button size="lg" className="bg-white text-primary hover:bg-white/90" onClick={() => supabase.auth.signOut()}>
                  Sign Out to Create Brand Account
                </Button>
              ) : (
                <Link to="/brand-signup">
                  <Button size="lg" className="bg-white text-primary hover:bg-white/90 text-lg px-8 py-6">
                    Join for Free
                  </Button>
                </Link>
              )}
              <Link to="/pricing">
                <Button size="lg" className="bg-white/20 text-white border-2 border-white hover:bg-white hover:text-primary text-lg px-8 py-6">
                  View Pricing
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
