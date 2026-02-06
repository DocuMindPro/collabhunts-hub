import { Search, Calendar, Rocket, LucideIcon } from "lucide-react";
import AnimatedSection from "@/components/AnimatedSection";
import { cn } from "@/lib/utils";

interface BentoStep {
  icon: LucideIcon;
  step: number;
  title: string;
  description: string;
  size?: "small" | "large" | "wide";
}

const steps: BentoStep[] = [
  {
    icon: Search,
    step: 1,
    title: "Discover Creators",
    description: "Browse vetted creators by location, niche, and availability. Filter by ratings and response time to find the best fit.",
    size: "small"
  },
  {
    icon: Calendar,
    step: 2,
    title: "Connect Directly",
    description: "Message creators, discuss terms, and finalize with an AI-drafted agreement. No middlemen, no fees, complete privacy.",
    size: "large"
  },
  {
    icon: Rocket,
    step: 3,
    title: "Collab & Grow",
    description: "Execute your event or campaign. Watch your brand grow with authentic creator partnerships.",
    size: "wide"
  }
];

const BentoGrid = () => {
  return (
    <section id="how-it-works" className="py-20 md:py-32 bg-background">
      <div className="container mx-auto px-4">
        <AnimatedSection animation="fade-up" className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-heading font-bold mb-4">
            How It Works
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Find your perfect creator in 3 simple steps
          </p>
        </AnimatedSection>

        {/* Bento Grid */}
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
          {steps.map((step, index) => (
            <AnimatedSection 
              key={index} 
              animation="fade-up" 
              delay={index * 150}
              className={cn(
                step.size === "large" ? "md:col-span-2" : "",
                step.size === "wide" ? "md:col-span-3" : ""
              )}
            >
              <div 
                className={cn(
                  "group relative h-full rounded-2xl p-6 md:p-8 transition-all duration-500",
                  "bg-card border border-border/50",
                  "hover:border-primary/30 hover:shadow-hover hover:-translate-y-1",
                  "overflow-hidden"
                )}
              >
                {/* Gradient overlay on hover */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-secondary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                
                {/* Step number */}
                <div className="absolute top-4 right-4 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-sm font-bold text-primary">{step.step}</span>
                </div>

                <div className="relative z-10 flex flex-col h-full">
                  {/* Icon */}
                  <div className={cn(
                    "inline-flex items-center justify-center w-14 h-14 rounded-xl mb-4 transition-all duration-500",
                    "bg-gradient-to-br from-primary to-primary/80",
                    "group-hover:scale-110 group-hover:shadow-lg group-hover:shadow-primary/25"
                  )}>
                    <step.icon className="h-7 w-7 text-white" />
                  </div>

                  {/* Content */}
                  <h3 className="text-xl md:text-2xl font-heading font-bold mb-3">
                    {step.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed flex-1">
                    {step.description}
                  </p>
                </div>

                {/* Decorative element for large cards */}
                {step.size === "large" && (
                  <div className="absolute -bottom-8 -right-8 w-32 h-32 rounded-full bg-primary/5 blur-2xl" />
                )}
                {step.size === "wide" && (
                  <div className="absolute -bottom-12 right-1/4 w-48 h-24 rounded-full bg-secondary/5 blur-2xl" />
                )}
              </div>
            </AnimatedSection>
          ))}
        </div>

        {/* Connecting line on desktop */}
        <div className="hidden md:block absolute left-1/2 top-1/2 -translate-x-1/2 w-[80%] h-px bg-gradient-to-r from-transparent via-border to-transparent" />
      </div>
    </section>
  );
};

export default BentoGrid;
