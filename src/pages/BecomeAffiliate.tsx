import { useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { DollarSign, Link2, BarChart3, Target, CreditCard, Users, Megaphone, Briefcase, Heart } from "lucide-react";

const BecomeAffiliate = () => {
  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);
  const benefits = [
    {
      icon: DollarSign,
      title: "Passive Income",
      description: "Earn commissions on every successful referral that joins our platform"
    },
    {
      icon: Link2,
      title: "Simple Sharing",
      description: "Just share your unique referral link - we handle the rest"
    },
    {
      icon: BarChart3,
      title: "Real-Time Tracking",
      description: "Monitor your referrals and earnings through your personal dashboard"
    },
    {
      icon: Target,
      title: "No Limits",
      description: "Unlimited earning potential - the more you refer, the more you earn"
    },
    {
      icon: CreditCard,
      title: "Easy Payouts",
      description: "Regular, hassle-free payments directly to your preferred method"
    }
  ];

  const steps = [
    {
      number: "01",
      title: "Apply to Join",
      description: "Fill out a quick application and tell us about yourself"
    },
    {
      number: "02",
      title: "Get Your Link",
      description: "Receive your unique referral link and promotional materials"
    },
    {
      number: "03",
      title: "Start Earning",
      description: "Share your link and earn on every successful sign-up"
    }
  ];

  const idealCandidates = [
    { icon: Megaphone, title: "Social Media Marketers" },
    { icon: Briefcase, title: "Marketing Agencies" },
    { icon: Users, title: "Content Creators" },
    { icon: Heart, title: "Industry Enthusiasts" }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-secondary/10" />
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/20 rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-secondary/20 rounded-full blur-3xl" />
        
        <div className="container mx-auto relative z-10 text-center max-w-4xl">
          <span className="inline-block px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-medium mb-6">
            Affiliate Program
          </span>
          <h1 className="text-4xl md:text-6xl font-heading font-bold text-foreground mb-6 leading-tight">
            Turn Your Network Into{" "}
            <span className="text-primary">Income</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join our affiliate program and earn generous commissions by connecting creators and brands with CollabHunts. No limits, no hassle.
          </p>
          <Link to="/contact?subject=Become%20an%20Affiliate">
            <Button size="lg" className="text-lg px-8 py-6 shadow-lg hover:shadow-xl transition-all">
              Apply to Join
            </Button>
          </Link>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-heading font-bold text-foreground mb-4">
              Why Become an Affiliate?
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Enjoy the benefits of partnering with a growing platform in the creator economy
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {benefits.map((benefit, index) => (
              <div 
                key={index}
                className="bg-card p-8 rounded-2xl border border-border hover:border-primary/50 hover:shadow-lg transition-all group"
              >
                <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors">
                  <benefit.icon className="w-7 h-7 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-3">{benefit.title}</h3>
                <p className="text-muted-foreground">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-heading font-bold text-foreground mb-4">
              How It Works
            </h2>
            <p className="text-muted-foreground text-lg">
              Getting started is simple - just three easy steps
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {steps.map((step, index) => (
              <div key={index} className="text-center relative">
                <div className="text-7xl font-bold text-primary/10 mb-4">{step.number}</div>
                <h3 className="text-xl font-semibold text-foreground mb-3">{step.title}</h3>
                <p className="text-muted-foreground">{step.description}</p>
                {index < steps.length - 1 && (
                  <div className="hidden md:block absolute top-12 right-0 w-1/2 h-0.5 bg-gradient-to-r from-primary/30 to-transparent" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Who Should Apply Section */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-heading font-bold text-foreground mb-4">
              Who Should Apply?
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Our affiliate program is perfect for anyone with a network in the creator or marketing space
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {idealCandidates.map((candidate, index) => (
              <div 
                key={index}
                className="bg-card p-6 rounded-xl border border-border text-center hover:border-primary/50 transition-all"
              >
                <div className="w-12 h-12 bg-secondary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <candidate.icon className="w-6 h-6 text-secondary" />
                </div>
                <h3 className="font-medium text-foreground">{candidate.title}</h3>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary to-secondary opacity-90" />
        <div className="container mx-auto relative z-10 text-center max-w-3xl">
          <h2 className="text-3xl md:text-5xl font-heading font-bold text-primary-foreground mb-6">
            Ready to Start Earning?
          </h2>
          <p className="text-xl text-primary-foreground/80 mb-8">
            Join our growing network of affiliates and start earning today. Apply now and we'll be in touch.
          </p>
          <Link to="/contact?subject=Become%20an%20Affiliate">
            <Button size="lg" variant="secondary" className="text-lg px-8 py-6">
              Contact Us to Apply
            </Button>
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default BecomeAffiliate;
