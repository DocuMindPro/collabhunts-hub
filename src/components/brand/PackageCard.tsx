import { Clock, CheckCircle, Sparkles, MessageSquare, Search } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
  EventPackage, 
  formatPriceRange, 
  formatPrice,
  type PackageType 
} from "@/config/packages";

interface PackageCardProps {
  pkgType: PackageType;
  pkg: EventPackage;
}

// Standard packages that should show "Find Creators" button
const STANDARD_PACKAGES: PackageType[] = ['unbox_review', 'social_boost', 'meet_greet'];

const PackageCard = ({ pkgType, pkg }: PackageCardProps) => {
  const hasUpsells = pkg.upsells && pkg.upsells.length > 0;
  const hasVariants = pkg.variants && pkg.variants.length > 0;
  const hasPhases = pkg.phases && pkg.phases.length > 0;
  const isCustomPricing = pkg.priceRange === null;
  const isStandardPackage = STANDARD_PACKAGES.includes(pkgType);

  // Generate contact subject based on package name
  const contactSubject = encodeURIComponent(`${pkg.name} Inquiry`);

  return (
    <div className="p-6 rounded-xl bg-card border border-border flex flex-col h-full">
      {/* Header */}
      <h3 className="font-heading font-semibold text-lg mb-2">{pkg.name}</h3>
      
      {/* Price or Custom Pricing indicator */}
      {isCustomPricing ? (
        <p className="text-lg font-semibold text-muted-foreground mb-1">
          Custom pricing
        </p>
      ) : (
        <p className="text-2xl font-bold text-primary mb-1">
          {formatPriceRange(pkg.priceRange)}
        </p>
      )}
      
      {pkg.durationRange && (
        <p className="text-sm text-muted-foreground mb-4 flex items-center gap-1">
          <Clock className="h-3 w-3" />
          {pkg.durationRange.min === pkg.durationRange.max 
            ? `${pkg.durationRange.min} hours` 
            : `${pkg.durationRange.min}-${pkg.durationRange.max} hours`}
        </p>
      )}
      <p className="text-sm text-muted-foreground mb-4">
        {pkg.description}
      </p>

      {/* Phases (for meet_greet) */}
      {hasPhases && (
        <div className="space-y-3 mb-4 flex-1">
          {pkg.phases!.map((phase, phaseIndex) => (
            <div key={phaseIndex}>
              <p className="text-xs font-semibold text-primary uppercase tracking-wide mb-1">
                {phase.title}
              </p>
              <ul className="space-y-1">
                {phase.items.map((item, itemIndex) => (
                  <li key={itemIndex} className="text-xs text-muted-foreground flex items-start gap-1.5">
                    <CheckCircle className="h-3 w-3 text-primary mt-0.5 shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}

      {/* Variants (for competition) */}
      {hasVariants && (
        <div className="space-y-2 mb-4 flex-1">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            Choose your format:
          </p>
          {pkg.variants!.map((variant, index) => (
            <div 
              key={variant.id} 
              className="text-xs p-2 rounded-lg bg-muted/50 border border-border"
            >
              <p className="font-medium">Option {String.fromCharCode(65 + index)}: {variant.name}</p>
              <p className="text-muted-foreground mt-0.5">{variant.description}</p>
            </div>
          ))}
        </div>
      )}

      {/* Simple includes list (fallback for packages without phases/variants) */}
      {!hasPhases && !hasVariants && (
        <ul className="space-y-2 mb-4 flex-1">
          {pkg.includes.slice(0, 4).map((item, i) => (
            <li key={i} className="text-sm flex items-start gap-2">
              <CheckCircle className="h-4 w-4 text-primary mt-0.5 shrink-0" />
              {item}
            </li>
          ))}
        </ul>
      )}

      {/* Upsells badge - only show for packages with fixed pricing */}
      {hasUpsells && !isCustomPricing && (
        <div className="mt-auto pt-4 border-t border-border">
          <div className="flex items-center gap-1.5 text-xs text-accent">
            <Sparkles className="h-3.5 w-3.5" />
            <span className="font-medium">Add-ons available</span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            From {formatPrice(Math.min(...pkg.upsells!.map(u => u.priceCents)))}
          </p>
        </div>
      )}

      {/* Action button based on package type */}
      {isCustomPricing && (
        <div className="mt-auto pt-4 border-t border-border">
          {isStandardPackage ? (
            <Button asChild className="w-full" variant="default">
              <Link to="/influencers">
                <Search className="h-4 w-4 mr-2" />
                Find Creators
              </Link>
            </Button>
          ) : (
            <Button asChild className="w-full" variant="default">
              <Link to={`/contact?subject=${contactSubject}`}>
                <MessageSquare className="h-4 w-4 mr-2" />
                Contact Us
              </Link>
            </Button>
          )}
        </div>
      )}

      {/* Ideal for */}
      <div className="mt-4 pt-3 border-t border-border">
        <p className="text-xs text-muted-foreground">
          <span className="font-medium">Ideal for:</span> {pkg.idealFor.join(', ')}
        </p>
      </div>
    </div>
  );
};

export default PackageCard;
