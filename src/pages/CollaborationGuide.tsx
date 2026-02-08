import { useParams, Link, Navigate } from "react-router-dom";
import { useEffect } from "react";
import {
  CheckCircle, ArrowRight, MessageSquare, FileText, Calendar,
  Search, Sparkles, Shield, Star, Users
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AnimatedSection from "@/components/AnimatedSection";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EVENT_PACKAGES, type PackageType } from "@/config/packages";
import { cn } from "@/lib/utils";

// Slug → PackageType mapping
const SLUG_TO_TYPE: Record<string, PackageType> = {
  "unbox-review": "unbox_review",
  "social-boost": "social_boost",
  "meet-greet": "meet_greet",
  "live-pk-battle": "competition",
  "custom-experience": "custom",
};

// Whether a package should show "Find Creators" or "Contact Us"
const SELF_SERVICE: PackageType[] = ["unbox_review", "social_boost", "meet_greet"];

interface GuideContent {
  whatIsIt: string;
  process: { title: string; description: string; icon: React.ElementType }[];
  bestPractices: string[];
  platformFeatures: { title: string; description: string; icon: React.ElementType }[];
}

const GUIDE_DATA: Record<PackageType, GuideContent> = {
  unbox_review: {
    whatIsIt:
      "An Unbox & Review collaboration lets you ship your product directly to a creator. They'll film an authentic unboxing experience, try out your product, and share their honest thoughts with their audience through social media content like Reels and TikToks. It's one of the most natural and trusted forms of influencer marketing — no in-person coordination needed.",
    process: [
      { title: "Browse Creators", description: "Search our vetted creator directory by niche, location, and follower count to find the perfect match for your product.", icon: Search },
      { title: "Send a Message", description: "Reach out directly through our messaging system. Describe your product, what you're looking for, and discuss pricing.", icon: MessageSquare },
      { title: "Sign an Agreement", description: "Once you agree on terms, use our AI-assisted agreement tool to create a formal document covering deliverables, timeline, and compensation.", icon: FileText },
      { title: "Ship Your Product", description: "Send the product to the creator. They'll confirm receipt and begin creating content according to the agreed timeline.", icon: ArrowRight },
      { title: "Content Goes Live", description: "The creator posts the unboxing and review content. You'll be tagged in all posts for maximum visibility.", icon: Star },
      { title: "Leave a Review", description: "After completion, leave a review to help other brands and build the creator's reputation on the platform.", icon: CheckCircle },
    ],
    bestPractices: [
      "Always request a signed agreement so the booking appears on your Calendar and you can track deadlines.",
      "Be specific about deliverables upfront — how many posts, which platforms, key talking points.",
      "Check creator reviews and past work before reaching out.",
      "Include clear product information and any brand guidelines with your shipment.",
      "Set realistic content timelines — allow 5-7 days after product receipt for quality content.",
      "Don't script the review too heavily — authenticity drives the best engagement.",
    ],
    platformFeatures: [
      { title: "AI-Drafted Agreements", description: "Our AI generates professional agreements based on the package type, ensuring all deliverables are clearly documented.", icon: Sparkles },
      { title: "Calendar Tracking", description: "Signed agreements automatically populate your Calendar with key dates and deadlines, plus automated reminders.", icon: Calendar },
      { title: "Direct Messaging", description: "Communicate with creators in real-time. Negotiate terms, share references, and coordinate — all in one place.", icon: MessageSquare },
    ],
  },
  social_boost: {
    whatIsIt:
      "A Social Boost brings a creator to your physical venue. They experience your business firsthand — trying your food, exploring your space, or using your services — then create engaging social content about it. The result is authentic, location-tagged content that drives real foot traffic from their local followers.",
    process: [
      { title: "Browse Creators", description: "Find creators in your city who match your brand's vibe. Filter by niche, follower count, and content style.", icon: Search },
      { title: "Discuss the Visit", description: "Message the creator to arrange the visit. Agree on what they'll experience, content expectations, and compensation.", icon: MessageSquare },
      { title: "Sign an Agreement", description: "Formalize the collaboration with an AI-drafted agreement covering visit details, deliverables, and payment terms.", icon: FileText },
      { title: "Host the Visit", description: "Welcome the creator to your venue. Let them explore naturally — authenticity creates the best content.", icon: Users },
      { title: "Content Goes Live", description: "The creator posts Reels, TikToks, or Stories featuring your venue with location tags and an honest CTA.", icon: Star },
      { title: "Track Results", description: "Monitor the engagement and foot traffic impact. Leave a review and consider building a long-term relationship.", icon: CheckCircle },
    ],
    bestPractices: [
      "Always request a signed agreement — it adds the event to your Calendar with automated reminders.",
      "Brief your staff so the creator gets great service during their visit.",
      "Don't over-direct the content — let the creator showcase your venue in their authentic style.",
      "Offer a complimentary experience (meal, service) as part of the collaboration.",
      "Schedule visits during your best hours so the venue looks its best on camera.",
      "Engage with the creator's posts by liking, commenting, and sharing to boost reach.",
    ],
    platformFeatures: [
      { title: "AI-Drafted Agreements", description: "Generate professional agreements that cover visit logistics, content deliverables, and compensation.", icon: Sparkles },
      { title: "Calendar Tracking", description: "Visit dates are added to your Calendar automatically with 7-day, 1-day, and same-day reminders.", icon: Calendar },
      { title: "Direct Messaging", description: "Coordinate all visit details through the platform — no need for separate WhatsApp threads.", icon: MessageSquare },
    ],
  },
  meet_greet: {
    whatIsIt:
      "A Meet & Greet is a full creator appearance event at your venue. The creator promotes the event beforehand, shows up to interact with fans, take photos, and create content — then follows up with recap posts. It's the ultimate way to drive foot traffic and create a memorable experience that people talk about.",
    process: [
      { title: "Find Your Creator", description: "Browse creators with strong local followings. Look for high engagement rates and genuine fan communities.", icon: Search },
      { title: "Plan the Event", description: "Discuss format, duration (typically 2-4 hours), capacity, and compensation. Consider parking, space layout, and fan flow.", icon: MessageSquare },
      { title: "Sign an Agreement", description: "Lock in all details with a formal agreement — date, time, deliverables, promotional commitments, and payment.", icon: FileText },
      { title: "Pre-Event Promotion", description: "The creator announces the event on their channels. You promote through your own marketing channels too.", icon: Star },
      { title: "Host the Event", description: "The creator arrives, interacts with fans, takes photos, and promotes your brand. You handle venue logistics.", icon: Users },
      { title: "Post-Event Content", description: "The creator posts recap Reels/TikToks, and you get lasting content featuring your venue.", icon: CheckCircle },
    ],
    bestPractices: [
      "Sign the agreement well in advance — it adds the event to both your and the creator's Calendars.",
      "Set a realistic venue capacity and communicate it clearly in promotions.",
      "Have a designated area for photos and fan interactions.",
      "Prepare special offers or discounts exclusive to event attendees.",
      "Assign a staff member to coordinate with the creator on event day.",
      "Document the event from your own channels too — behind-the-scenes content performs well.",
    ],
    platformFeatures: [
      { title: "AI-Drafted Agreements", description: "Comprehensive agreements covering event logistics, promotional commitments, cancellation terms, and compensation.", icon: Sparkles },
      { title: "Calendar Tracking", description: "Automatic event scheduling with reminders for both you and the creator.", icon: Calendar },
      { title: "Opportunity Board", description: "Post your event as an opportunity to attract multiple creator applications.", icon: Shield },
    ],
  },
  competition: {
    whatIsIt:
      "Live PK Battles are ticketed competitive streaming events hosted at your venue. Two or more creators go head-to-head in live battles while fans watch in person and online audiences tune in via livestream. CollabHunts manages the entire event — from creator coordination and promotion to ticketing and execution. Your venue gets massive exposure, foot traffic, and a cut of ticket revenue.",
    process: [
      { title: "Contact Our Team", description: "Reach out to discuss hosting a PK Battle at your venue. We'll assess venue suitability and audience potential.", icon: MessageSquare },
      { title: "Event Planning", description: "CollabHunts coordinates everything — creator lineup, promotion schedule, ticketing setup, and technical requirements.", icon: FileText },
      { title: "2-Week Promotion", description: "Participating creators promote the event across their channels. Ticket sales drive pre-event buzz.", icon: Star },
      { title: "Event Day", description: "Creators battle in 3-4 minute rounds at your venue. Fans watch live, online viewers tune in via stream.", icon: Users },
      { title: "Post-Event Recap", description: "Highlight reels and recap content are posted across all creator channels, extending your venue's exposure.", icon: CheckCircle },
    ],
    bestPractices: [
      "Ensure your venue has reliable WiFi for live streaming — this is critical.",
      "Prepare a dedicated area with good lighting and minimal background noise.",
      "Have staff available to manage the in-person audience and coordinate logistics.",
      "Promote the event through your own channels to maximize ticket sales.",
      "Consider offering food/drink specials for event attendees to boost revenue.",
      "Capture photos and videos from your perspective for your own marketing.",
    ],
    platformFeatures: [
      { title: "Full Event Management", description: "CollabHunts handles creator coordination, promotion, ticketing, and day-of execution.", icon: Shield },
      { title: "Dual Exposure", description: "Your venue gets visibility from both the in-person audience and the online livestream viewers.", icon: Users },
      { title: "Revenue Sharing", description: "Earn from ticket sales with a transparent revenue share model.", icon: Sparkles },
    ],
  },
  custom: {
    whatIsIt:
      "Custom Experiences are fully bespoke collaborations designed around your specific needs. Whether it's a multi-day brand activation, a product launch party, a seasonal campaign, or something entirely unique — you work directly with creators to design the perfect partnership. There are no templates here — just unlimited creative possibilities.",
    process: [
      { title: "Define Your Vision", description: "Think about what you want to achieve. More foot traffic? Brand awareness? Content library? A memorable experience?", icon: Sparkles },
      { title: "Browse or Contact Us", description: "Find creators who match your vision, or reach out to our team for recommendations and creative guidance.", icon: Search },
      { title: "Discuss & Design", description: "Work directly with the creator(s) to design the collaboration — format, timeline, deliverables, and compensation.", icon: MessageSquare },
      { title: "Sign an Agreement", description: "Document everything in a formal agreement. Custom projects especially benefit from clear, written expectations.", icon: FileText },
      { title: "Execute & Create", description: "Bring your vision to life. Whether it's one day or one month, the agreement keeps everyone aligned.", icon: Star },
      { title: "Review & Repeat", description: "Evaluate the results, leave a review, and consider building an ongoing creator relationship.", icon: CheckCircle },
    ],
    bestPractices: [
      "Be as detailed as possible in the agreement — custom projects have more variables than standard packages.",
      "Start with a smaller collaboration to test the relationship before committing to larger projects.",
      "Set clear milestones and check-in dates for multi-day or multi-week campaigns.",
      "Always use the agreement system so key dates appear on your Calendar.",
      "Budget for unexpected costs — custom projects sometimes evolve during execution.",
      "Communicate proactively and keep the messaging thread active throughout the project.",
    ],
    platformFeatures: [
      { title: "AI-Drafted Agreements", description: "Even for custom projects, our AI helps draft comprehensive agreements covering all unique deliverables.", icon: Sparkles },
      { title: "Calendar Tracking", description: "Track milestones, deadlines, and deliverable dates across multi-day projects.", icon: Calendar },
      { title: "Direct Messaging", description: "Keep all communication in one place for easy reference and accountability.", icon: MessageSquare },
    ],
  },
};

const CollaborationGuide = () => {
  const { slug } = useParams<{ slug: string }>();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [slug]);

  if (!slug || !SLUG_TO_TYPE[slug]) {
    return <Navigate to="/brand" replace />;
  }

  const pkgType = SLUG_TO_TYPE[slug];
  const pkg = EVENT_PACKAGES[pkgType];
  const guide = GUIDE_DATA[pkgType];
  const isSelfService = SELF_SERVICE.includes(pkgType);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      {/* Hero */}
      <section className="py-16 md:py-24 gradient-subtle">
        <div className="container mx-auto px-4 max-w-4xl">
          <AnimatedSection animation="fade-up">
            <Link
              to="/brand"
              className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary mb-6 transition-colors"
            >
              ← Back to Brand
            </Link>
            <h1 className="text-3xl md:text-5xl font-heading font-bold mb-4 text-foreground">
              {pkg.name}
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl">
              {pkg.description}
            </p>
          </AnimatedSection>
        </div>
      </section>

      {/* What Is It */}
      <section className="py-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <AnimatedSection animation="fade-up">
            <h2 className="text-2xl md:text-3xl font-heading font-bold mb-4">What is it?</h2>
            <p className="text-muted-foreground leading-relaxed text-lg">{guide.whatIsIt}</p>
          </AnimatedSection>
        </div>
      </section>

      {/* Deliverables (Phases) */}
      {pkg.phases && pkg.phases.length > 0 && (
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4 max-w-4xl">
            <AnimatedSection animation="fade-up">
              <h2 className="text-2xl md:text-3xl font-heading font-bold mb-8">What to Expect</h2>
            </AnimatedSection>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {pkg.phases.map((phase, i) => (
                <AnimatedSection key={i} animation="fade-up" delay={i * 100}>
                  <div className="rounded-xl bg-card border border-border/50 p-5 h-full">
                    <p className="text-xs font-semibold text-primary uppercase tracking-wide mb-3">
                      {phase.title}
                    </p>
                    <ul className="space-y-2">
                      {phase.items.map((item, j) => (
                        <li key={j} className="flex items-start gap-2 text-sm text-muted-foreground">
                          <CheckCircle className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </AnimatedSection>
              ))}
            </div>
            <p className="text-sm text-muted-foreground/70 italic mt-6">
              *Exact deliverables are always finalized in your signed agreement.
            </p>
          </div>
        </section>
      )}

      {/* How It Works - Step by Step */}
      <section className={cn("py-16", pkg.phases ? "" : "bg-muted/30")}>
        <div className="container mx-auto px-4 max-w-4xl">
          <AnimatedSection animation="fade-up">
            <h2 className="text-2xl md:text-3xl font-heading font-bold mb-8">
              How It Works — Step by Step
            </h2>
          </AnimatedSection>
          <div className="space-y-0">
            {guide.process.map((step, i) => (
              <AnimatedSection key={i} animation="fade-up" delay={i * 60}>
                <div className="flex gap-4 md:gap-6 pb-8 last:pb-0 relative">
                  {/* Vertical line */}
                  {i < guide.process.length - 1 && (
                    <div className="absolute left-5 top-10 bottom-0 w-px bg-border" />
                  )}
                  {/* Step circle */}
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0 relative z-10">
                    <step.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div className="pt-1">
                    <h3 className="font-heading font-semibold mb-1">
                      <span className="text-primary mr-2">Step {i + 1}.</span>
                      {step.title}
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* Best Practices */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4 max-w-4xl">
          <AnimatedSection animation="fade-up">
            <h2 className="text-2xl md:text-3xl font-heading font-bold mb-8">Best Practices</h2>
          </AnimatedSection>
          <div className="grid sm:grid-cols-2 gap-4">
            {guide.bestPractices.map((tip, i) => (
              <AnimatedSection key={i} animation="fade-up" delay={i * 60}>
                <div className="flex items-start gap-3 p-4 rounded-xl bg-card border border-border/50">
                  <Shield className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                  <p className="text-sm text-muted-foreground leading-relaxed">{tip}</p>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* Platform Features */}
      <section className="py-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <AnimatedSection animation="fade-up">
            <h2 className="text-2xl md:text-3xl font-heading font-bold mb-8">
              Platform Features to Help You
            </h2>
          </AnimatedSection>
          <div className="grid sm:grid-cols-3 gap-6">
            {guide.platformFeatures.map((feature, i) => (
              <AnimatedSection key={i} animation="fade-up" delay={i * 100}>
                <div className="text-center p-6 rounded-xl bg-card border border-border/50 h-full">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <feature.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-heading font-semibold mb-2">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* Ideal For */}
      <section className="py-12 bg-muted/30">
        <div className="container mx-auto px-4 max-w-4xl">
          <AnimatedSection animation="fade-up">
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-sm font-medium text-muted-foreground">Ideal for:</span>
              {pkg.idealFor.map((tag) => (
                <Badge key={tag} variant="secondary">{tag}</Badge>
              ))}
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="container mx-auto px-4 max-w-4xl text-center">
          <AnimatedSection animation="fade-up">
            <h2 className="text-2xl md:text-3xl font-heading font-bold mb-4">
              Ready to Get Started?
            </h2>
            <p className="text-muted-foreground mb-8 max-w-lg mx-auto">
              {isSelfService
                ? "Browse our vetted creator directory and find the perfect match for your brand."
                : "Get in touch with our team to discuss how we can bring this experience to your venue."}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {isSelfService ? (
                <Button asChild size="lg" className="gradient-hero hover:opacity-90">
                  <Link to="/influencers">
                    <Search className="h-5 w-5 mr-2" />
                    Find Creators
                  </Link>
                </Button>
              ) : (
                <Button asChild size="lg" className="gradient-hero hover:opacity-90">
                  <Link to={`/contact?subject=${encodeURIComponent(pkg.name + " Inquiry")}`}>
                    <MessageSquare className="h-5 w-5 mr-2" />
                    Contact Us
                  </Link>
                </Button>
              )}
              <Button asChild size="lg" variant="outline">
                <Link to="/brand">← Back to Brand</Link>
              </Button>
            </div>
          </AnimatedSection>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default CollaborationGuide;
