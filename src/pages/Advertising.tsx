import { useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { 
  Megaphone, 
  Users, 
  Eye, 
  Target, 
  Sparkles, 
  Mail,
  CheckCircle,
  TrendingUp,
  Globe,
  LayoutGrid
} from "lucide-react";

const Advertising = () => {
  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);
  const placements = [
    {
      name: "Homepage Hero Banner",
      location: "Homepage - Below Hero",
      dimensions: "1200 x 300px",
      reach: "High visibility",
      price: "Contact for pricing",
    },
    {
      name: "Creator Page Spotlight",
      location: "Creator Landing - Brand Grid",
      dimensions: "300 x 250px",
      reach: "Creator-focused audience",
      price: "Contact for pricing",
    },
    {
      name: "Influencers Sidebar",
      location: "Influencers Directory - Right Sidebar",
      dimensions: "300 x 600px",
      reach: "Brand decision-makers",
      price: "Contact for pricing",
    },
    {
      name: "Featured Creator Spot",
      location: "Multiple Pages - Featured Section",
      dimensions: "400 x 500px (Portrait)",
      reach: "Premium placement",
      price: "Contact for pricing",
    },
  ];

  const benefits = [
    {
      icon: Users,
      title: "Targeted Audience",
      description: "Reach brands actively looking for creators and influencers seeking collaboration opportunities.",
    },
    {
      icon: Eye,
      title: "High Visibility",
      description: "Premium ad placements on high-traffic pages including homepage, creator directory, and campaign listings.",
    },
    {
      icon: Target,
      title: "Relevant Context",
      description: "Your ads appear alongside relevant content, ensuring maximum relevance and engagement.",
    },
    {
      icon: TrendingUp,
      title: "Drive Results",
      description: "Whether you're a brand, creator, or external advertiser, connect with the right audience to achieve your goals.",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-secondary/10" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <Badge className="mb-4 bg-primary/10 text-primary border-primary/20">
              <Megaphone className="w-3 h-3 mr-1" />
              Advertising Opportunities
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Advertise on <span className="text-primary">CollabHunts</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              Connect with creators, brands, and industry professionals through premium advertising placements on our growing platform.
            </p>
            <Link to="/contact?subject=Advertising%20Inquiry">
              <Button size="lg" className="bg-primary hover:bg-primary/90">
                <Mail className="w-5 h-5 mr-2" />
                Contact for Advertising
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Why Advertise Section */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Why Advertise With Us?</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              CollabHunts connects brands with creators for authentic collaborations. Our platform attracts engaged users actively seeking partnership opportunities.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {benefits.map((benefit, index) => (
              <Card key={index} className="border-border/50 hover:border-primary/30 transition-colors">
                <CardHeader>
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    <benefit.icon className="w-6 h-6 text-primary" />
                  </div>
                  <CardTitle className="text-lg">{benefit.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-sm">{benefit.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Ad Placements Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-2 mb-4">
              <LayoutGrid className="w-6 h-6 text-primary" />
              <h2 className="text-3xl font-bold">Available Ad Placements</h2>
            </div>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Choose from various strategic ad placements across our platform to reach your target audience effectively.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {placements.map((placement, index) => (
              <Card key={index} className="border-border/50 hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-lg">{placement.name}</CardTitle>
                    <Badge variant="outline" className="text-xs">
                      {placement.reach}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <Globe className="w-4 h-4 text-muted-foreground" />
                    <span className="text-muted-foreground">{placement.location}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Sparkles className="w-4 h-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Dimensions: {placement.dimensions}</span>
                  </div>
                  <div className="pt-2 border-t border-border/50">
                    <span className="font-medium text-primary">{placement.price}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Who Can Advertise Section */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Who Can Advertise?</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <Card className="text-center border-border/50">
              <CardHeader>
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-primary" />
                </div>
                <CardTitle>Brands</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-sm">
                  Showcase your brand to creators actively seeking partnerships. Perfect for product launches, campaigns, and brand awareness.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center border-border/50">
              <CardHeader>
                <div className="w-16 h-16 rounded-full bg-secondary/10 flex items-center justify-center mx-auto mb-4">
                  <Sparkles className="w-8 h-8 text-secondary" />
                </div>
                <CardTitle>Creators</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-sm">
                  Get featured prominently to attract brand partnerships. Boost your visibility and land more collaboration opportunities.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center border-border/50">
              <CardHeader>
                <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-4">
                  <Globe className="w-8 h-8 text-accent" />
                </div>
                <CardTitle>External Advertisers</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-sm">
                  Reach our engaged audience of marketing professionals, creators, and business decision-makers with your products and services.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">How It Works</h2>
          </div>

          <div className="max-w-3xl mx-auto">
            <div className="space-y-6">
              {[
                { step: 1, title: "Contact Us", description: "Reach out via email with your advertising goals and preferred placements." },
                { step: 2, title: "Discuss Requirements", description: "We'll work with you to understand your needs and recommend the best ad placements." },
                { step: 3, title: "Submit Creative", description: "Provide your ad creative (images, links) that meet our specifications." },
                { step: 4, title: "Go Live", description: "Once payment is confirmed, your ad goes live on the platform immediately." },
              ].map((item) => (
                <div key={item.step} className="flex gap-4">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                    {item.step}
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">{item.title}</h3>
                    <p className="text-muted-foreground text-sm">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-br from-primary/10 via-background to-secondary/10">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
            Contact our advertising team to discuss your goals and find the perfect placement for your campaign.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/contact?subject=Advertising%20Inquiry">
              <Button size="lg" className="bg-primary hover:bg-primary/90">
                <Mail className="w-5 h-5 mr-2" />
                Contact Us for Advertising
              </Button>
            </Link>
          </div>
          <p className="text-sm text-muted-foreground mt-6">
            <CheckCircle className="w-4 h-4 inline mr-1" />
            All ads are reviewed by our team to ensure quality and relevance
          </p>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Advertising;
