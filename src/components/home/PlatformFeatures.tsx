import { FileCheck, CalendarDays, Megaphone, Check, Bell, DollarSign } from "lucide-react";
import AnimatedSection from "@/components/AnimatedSection";
import GlowCard from "@/components/home/GlowCard";
import { cn } from "@/lib/utils";

const AgreementMockup = () => (
  <div className="relative p-4 rounded-xl bg-muted/50 border border-border/30 space-y-3 transition-transform duration-500 group-hover:scale-[1.02]">
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
          <FileCheck className="h-4 w-4 text-primary" />
        </div>
        <span className="text-sm font-semibold">Social Boost Agreement</span>
      </div>
      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-green-500/10 text-green-500 border border-green-500/20">
        Signed
      </span>
    </div>
    <div className="h-px bg-border/50" />
    {["Deliverables defined", "Timeline set", "Price confirmed"].map((item) => (
      <div key={item} className="flex items-center gap-2 text-xs text-muted-foreground">
        <div className="w-4 h-4 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
          <Check className="h-2.5 w-2.5 text-primary" />
        </div>
        {item}
      </div>
    ))}
    <div className="flex items-center justify-between pt-1 text-xs">
      <span className="text-muted-foreground">Total</span>
      <span className="font-semibold text-foreground">$350.00</span>
    </div>
  </div>
);

const CalendarMockup = () => {
  const days = Array.from({ length: 28 }, (_, i) => i + 1);
  const eventDays: Record<number, string> = { 5: "bg-primary", 12: "bg-accent", 19: "bg-secondary", 22: "bg-primary" };

  return (
    <div className="relative p-4 rounded-xl bg-muted/50 border border-border/30 transition-transform duration-500 group-hover:scale-[1.02]">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-semibold">February 2026</span>
        <div className="relative">
          <Bell className="h-4 w-4 text-muted-foreground" />
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-destructive border-2 border-muted/50" />
        </div>
      </div>
      <div className="grid grid-cols-7 gap-1 text-[10px] text-center">
        {["M","T","W","T","F","S","S"].map((d, i) => (
          <span key={i} className="text-muted-foreground font-medium pb-1">{d}</span>
        ))}
        {days.map((day) => (
          <div key={day} className="relative flex items-center justify-center h-6 rounded text-muted-foreground">
            {day}
            {eventDays[day] && (
              <span className={cn("absolute bottom-0 w-1 h-1 rounded-full", eventDays[day])} />
            )}
          </div>
        ))}
      </div>
      <div className="flex items-center gap-3 mt-3 text-[10px] text-muted-foreground">
        <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-primary" />Bookings</span>
        <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-accent" />Agreements</span>
        <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-secondary" />Deadlines</span>
      </div>
    </div>
  );
};

const OpportunityMockup = () => (
  <div className="relative p-4 rounded-xl bg-muted/50 border border-border/30 space-y-3 transition-transform duration-500 group-hover:scale-[1.02]">
    <div className="flex items-center gap-2">
      <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center">
        <Megaphone className="h-4 w-4 text-accent" />
      </div>
      <div>
        <p className="text-sm font-semibold leading-tight">Rooftop Launch Party</p>
        <p className="text-[10px] text-muted-foreground">SkyBar Beirut</p>
      </div>
    </div>
    <div className="flex items-center gap-2">
      <span className="flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
        <DollarSign className="h-2.5 w-2.5" />$500
      </span>
      <span className="text-[10px] text-muted-foreground">3 spots left</span>
    </div>
    <button className="w-full text-xs font-medium py-1.5 rounded-lg bg-accent/10 text-accent border border-accent/20 hover:bg-accent/20 transition-colors">
      Apply Now
    </button>
  </div>
);

const features = [
  {
    icon: FileCheck,
    title: "AI-Drafted Agreements",
    description: "Finalize every deal with a professional, AI-generated agreement. Choose from templates like Unbox & Review, Social Boost, or Meet & Greet — customized to your exact terms.",
    visual: <AgreementMockup />,
    glow: "primary" as const,
  },
  {
    icon: CalendarDays,
    title: "Never Miss a Collab",
    description: "Every signed agreement automatically appears on your calendar with color-coded events and smart reminders at 7 days, 1 day, and day-of. Stay organized effortlessly.",
    visual: <CalendarMockup />,
    glow: "secondary" as const,
  },
  {
    icon: Megaphone,
    title: "Post & Discover Opportunities",
    description: "Brands post gigs with budgets and requirements. Creators browse and apply in one click. The fastest way to match for your next event.",
    visual: <OpportunityMockup />,
    glow: "accent" as const,
  },
];

const PlatformFeatures = () => {
  return (
    <section className="py-20 relative overflow-hidden">
      {/* Decorative blurs */}
      <div className="absolute top-20 -left-32 w-64 h-64 rounded-full bg-primary/5 blur-3xl" />
      <div className="absolute bottom-20 -right-32 w-48 h-48 rounded-full bg-accent/5 blur-3xl" />

      <div className="container mx-auto px-4 relative z-10">
        <AnimatedSection animation="fade-up" className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-heading font-bold mb-3">
            Built for Seamless Collabs
          </h2>
          <p className="text-muted-foreground max-w-lg mx-auto">
            Every tool you need, from first message to final delivery — all at zero cost
          </p>
        </AnimatedSection>

        <div className="space-y-8 max-w-5xl mx-auto">
          {features.map((feature, index) => {
            const isReversed = index === 1;
            return (
              <AnimatedSection key={index} animation="fade-up" delay={index * 150}>
                <GlowCard glowColor={feature.glow}>
                  <div className={cn(
                    "group grid md:grid-cols-2 gap-6 p-6 md:p-8 items-center",
                    isReversed && "md:[direction:rtl]"
                  )}>
                    <div className={cn("space-y-4", isReversed && "md:[direction:ltr]")}>
                      <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-primary/10 to-secondary/10">
                        <feature.icon className="h-6 w-6 text-primary" />
                      </div>
                      <h3 className="text-2xl font-heading font-bold">{feature.title}</h3>
                      <p className="text-muted-foreground text-sm leading-relaxed">{feature.description}</p>
                    </div>
                    <div className={cn(isReversed && "md:[direction:ltr]")}>
                      {feature.visual}
                    </div>
                  </div>
                </GlowCard>
              </AnimatedSection>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default PlatformFeatures;
