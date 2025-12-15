import { useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Globe, TrendingUp, Briefcase, Handshake, BadgeDollarSign, GraduationCap, Building2, Users, Rocket, Shield } from "lucide-react";

const FranchiseOpportunities = () => {
  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);
  const benefits = [
    {
      icon: Globe,
      title: "Exclusive Territory",
      description: "Own your country or region with exclusive rights to the local market"
    },
    {
      icon: TrendingUp,
      title: "Growing Industry",
      description: "Tap into the booming creator economy worth billions globally"
    },
    {
      icon: Briefcase,
      title: "Proven Model",
      description: "Leverage our established platform and proven business framework"
    },
    {
      icon: Handshake,
      title: "Full Support",
      description: "Comprehensive training, tools, and ongoing assistance from our team"
    },
    {
      icon: BadgeDollarSign,
      title: "Revenue Share",
      description: "Earn from every transaction that happens in your territory"
    }
  ];

  const whyFranchise = [
    {
      icon: Rocket,
      title: "Low Startup Investment",
      description: "Significantly lower investment compared to traditional franchises"
    },
    {
      icon: Building2,
      title: "Digital Business",
      description: "No physical inventory, no warehouse - operate from anywhere"
    },
    {
      icon: TrendingUp,
      title: "Scalable Model",
      description: "High profit margins with unlimited growth potential"
    },
    {
      icon: Shield,
      title: "Proven Technology",
      description: "Access to our established platform and technology stack"
    },
    {
      icon: GraduationCap,
      title: "Comprehensive Training",
      description: "Full onboarding and continuous learning resources"
    },
    {
      icon: Handshake,
      title: "Ongoing Support",
      description: "Dedicated support team to help you succeed"
    }
  ];

  const idealPartners = [
    { icon: Globe, title: "Local Market Experts", description: "Entrepreneurs with deep knowledge of their local market" },
    { icon: Briefcase, title: "Marketing Professionals", description: "Those seeking business ownership in digital marketing" },
    { icon: Building2, title: "Agency Owners", description: "Existing agency owners looking to expand services" },
    { icon: Users, title: "Industry Enthusiasts", description: "People passionate about the creator economy" }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-secondary/10 via-background to-primary/10" />
        <div className="absolute top-20 right-10 w-72 h-72 bg-secondary/20 rounded-full blur-3xl" />
        <div className="absolute bottom-10 left-10 w-96 h-96 bg-primary/20 rounded-full blur-3xl" />
        
        <div className="container mx-auto relative z-10 text-center max-w-4xl">
          <span className="inline-block px-4 py-2 bg-secondary/10 text-secondary rounded-full text-sm font-medium mb-6">
            Franchise Opportunities
          </span>
          <h1 className="text-4xl md:text-6xl font-heading font-bold text-foreground mb-6 leading-tight">
            Build Your{" "}
            <span className="text-secondary">Influencer Marketing Empire</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Own your market with an exclusive territory franchise. Join the creator economy revolution and build a profitable business in your region.
          </p>
          <Link to="/contact?subject=Franchise%20Opportunity">
            <Button size="lg" className="text-lg px-8 py-6 shadow-lg hover:shadow-xl transition-all bg-secondary hover:bg-secondary/90">
              Schedule a Call
            </Button>
          </Link>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-heading font-bold text-foreground mb-4">
              Franchise Benefits
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Discover the advantages of becoming a CollabHunts franchise partner
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {benefits.map((benefit, index) => (
              <div 
                key={index}
                className="bg-card p-8 rounded-2xl border border-border hover:border-secondary/50 hover:shadow-lg transition-all group"
              >
                <div className="w-14 h-14 bg-secondary/10 rounded-xl flex items-center justify-center mb-6 group-hover:bg-secondary/20 transition-colors">
                  <benefit.icon className="w-7 h-7 text-secondary" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-3">{benefit.title}</h3>
                <p className="text-muted-foreground">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Franchise Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-heading font-bold text-foreground mb-4">
              Why Franchise With Us?
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              A modern franchise opportunity designed for the digital age
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {whyFranchise.map((item, index) => (
              <div 
                key={index}
                className="flex gap-4 p-6 rounded-xl bg-card border border-border hover:border-primary/30 transition-all"
              >
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <item.icon className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-1">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Ideal Partners Section */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-heading font-bold text-foreground mb-4">
              Ideal Franchise Partners
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              We're looking for ambitious partners who share our vision
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6">
            {idealPartners.map((partner, index) => (
              <div 
                key={index}
                className="bg-card p-6 rounded-xl border border-border flex gap-4 items-start hover:border-secondary/50 transition-all"
              >
                <div className="w-12 h-12 bg-secondary/10 rounded-full flex items-center justify-center flex-shrink-0">
                  <partner.icon className="w-6 h-6 text-secondary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-1">{partner.title}</h3>
                  <p className="text-sm text-muted-foreground">{partner.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-primary mb-2">$100B+</div>
              <p className="text-sm text-muted-foreground">Creator Economy Size</p>
            </div>
            <div>
              <div className="text-4xl font-bold text-secondary mb-2">50M+</div>
              <p className="text-sm text-muted-foreground">Creators Worldwide</p>
            </div>
            <div>
              <div className="text-4xl font-bold text-primary mb-2">30%</div>
              <p className="text-sm text-muted-foreground">Annual Growth Rate</p>
            </div>
            <div>
              <div className="text-4xl font-bold text-secondary mb-2">∞</div>
              <p className="text-sm text-muted-foreground">Potential Markets</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-secondary to-primary opacity-90" />
        <div className="container mx-auto relative z-10 text-center max-w-3xl">
          <h2 className="text-3xl md:text-5xl font-heading font-bold text-primary-foreground mb-6">
            Ready to Own Your Market?
          </h2>
          <p className="text-xl text-primary-foreground/80 mb-8">
            Let's discuss how you can become a CollabHunts franchise partner and build your influencer marketing empire.
          </p>
          <Link to="/contact?subject=Franchise%20Opportunity">
            <Button size="lg" variant="secondary" className="text-lg px-8 py-6 bg-background text-foreground hover:bg-background/90">
              Schedule a Discovery Call
            </Button>
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default FranchiseOpportunities;
