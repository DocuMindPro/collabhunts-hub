import { Link } from "react-router-dom";
import { CheckCircle, ArrowRight } from "lucide-react";
import { EventPackage, type PackageType } from "@/config/packages";
import AnimatedSection from "@/components/AnimatedSection";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface CollaborationSectionProps {
  pkg: EventPackage;
  pkgType: PackageType;
  slug: string;
  index: number;
}

const SLUG_MAP: Record<PackageType, string> = {
  unbox_review: "unbox-review",
  social_boost: "social-boost",
  meet_greet: "meet-greet",
  competition: "live-pk-battle",
  custom: "custom-experience",
};

// Short, rich explanations per package type
const DESCRIPTIONS: Record<PackageType, string> = {
  unbox_review:
    "Ship your product directly to a creator's home. They'll film an authentic unboxing and review, sharing their honest experience with their audience. Perfect for e-commerce brands looking for genuine social proof without coordinating in-person logistics.",
  social_boost:
    "Invite a creator to visit your venue and experience it firsthand. They'll capture engaging content on-site — Reels, TikToks, or both — and share it with their followers, tagging your location and driving real foot traffic to your door.",
  meet_greet:
    "Host a creator appearance at your venue with full promotional coverage. From pre-event hype to live fan interaction and post-event recap content, this package turns your location into a destination event that draws crowds and creates lasting buzz.",
  competition:
    "Live PK battles bring the excitement of competitive streaming to your physical venue. Fans buy tickets to watch in person while online audiences tune in. CollabHunts manages the entire event — from promotion to ticketing to execution.",
  custom:
    "Need something unique? Custom Experiences are fully tailored collaborations designed around your specific goals. Whether it's a multi-day activation, a product launch, or something entirely new — we'll help you design the perfect creator partnership.",
};

const CollaborationSection = ({ pkg, pkgType, slug, index }: CollaborationSectionProps) => {
  const isReversed = index % 2 !== 0;
  const highlights = pkg.phases
    ? pkg.phases.flatMap((p) => p.items).slice(0, 4)
    : pkg.includes.slice(0, 4);

  return (
    <AnimatedSection animation="fade-up" delay={index * 80}>
      <div
        className={cn(
          "grid md:grid-cols-2 gap-8 md:gap-12 items-center py-12 md:py-16",
          index > 0 && "border-t border-border/50"
        )}
      >
        {/* Text side */}
        <div className={cn(isReversed && "md:order-2")}>
          <h3 className="text-2xl md:text-3xl font-heading font-bold mb-3 text-foreground">
            {pkg.name}
          </h3>
          <p className="text-muted-foreground leading-relaxed mb-6">
            {DESCRIPTIONS[pkgType]}
          </p>

          <Link
            to={`/collaborations/${slug}`}
            className="inline-flex items-center gap-2 text-primary font-medium hover:underline underline-offset-4 transition-colors"
          >
            Learn More <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {/* Highlights side */}
        <div className={cn(isReversed && "md:order-1")}>
          <div className="rounded-xl bg-card border border-border/50 p-6 space-y-4">
            <p className="text-xs font-semibold text-primary uppercase tracking-wide">
              Key Highlights
            </p>
            <ul className="space-y-3">
              {highlights.map((item, i) => (
                <li key={i} className="flex items-start gap-2.5 text-sm text-muted-foreground">
                  <CheckCircle className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>

            <div className="pt-3 border-t border-border/50">
              <p className="text-xs text-muted-foreground mb-2 font-medium">Ideal for</p>
              <div className="flex flex-wrap gap-2">
                {pkg.idealFor.map((tag) => (
                  <Badge key={tag} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </AnimatedSection>
  );
};

export { SLUG_MAP };
export default CollaborationSection;
