import { Package, Gift, Users, Trophy, Sparkles, CheckCircle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EVENT_PACKAGES, PackageType } from "@/config/packages";

interface PackageInfoCardProps {
  packageType: PackageType;
  priceRange?: { min: number; max: number } | null;
  showFullDetails?: boolean;
  compact?: boolean;
  selected?: boolean;
  onClick?: () => void;
  children?: React.ReactNode;
}

const PACKAGE_ICONS: Record<PackageType, typeof Package> = {
  unbox_review: Gift,
  social_boost: Sparkles,
  meet_greet: Users,
  competition: Trophy,
  custom: Package,
};

const PackageInfoCard = ({
  packageType,
  priceRange,
  showFullDetails = false,
  compact = false,
  selected = false,
  onClick,
  children,
}: PackageInfoCardProps) => {
  const pkg = EVENT_PACKAGES[packageType];
  if (!pkg) return null;

  const Icon = PACKAGE_ICONS[packageType] || Package;

  const formatPrice = (cents: number) => {
    return `$${(cents / 100).toLocaleString()}`;
  };

  const hasPriceRange = priceRange && typeof priceRange.min === 'number' && typeof priceRange.max === 'number';

  if (compact) {
    return (
      <Card
        className={`cursor-pointer transition-all hover:shadow-md ${
          selected ? "border-primary ring-2 ring-primary/20" : "border-border"
        }`}
        onClick={onClick}
      >
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Icon className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-sm">{pkg.name}</h3>
              <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                {pkg.description}
              </p>
              {hasPriceRange && (
                <p className="text-sm font-medium text-primary mt-2">
                  {formatPrice(priceRange.min)} - {formatPrice(priceRange.max)}
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card
      className={`transition-all ${
        onClick ? "cursor-pointer hover:shadow-md" : ""
      } ${selected ? "border-primary ring-2 ring-primary/20" : "border-border"}`}
      onClick={onClick}
    >
      <CardHeader className="pb-3">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
            <Icon className="h-6 w-6 text-primary" />
          </div>
          <div className="flex-1">
            <CardTitle className="text-lg">{pkg.name}</CardTitle>
          </div>
          {hasPriceRange && (
            <div className="text-right">
              <p className="text-lg font-bold text-primary">
                {formatPrice(priceRange.min)} - {formatPrice(priceRange.max)}
              </p>
            </div>
          )}
        </div>
        <CardDescription className="mt-2">{pkg.description}</CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Phases - What brands expect / What creators deliver */}
        {showFullDetails && pkg.phases && pkg.phases.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-foreground">What's Included</h4>
            <div className="grid gap-3">
              {pkg.phases.map((phase, idx) => (
                <div key={idx} className="bg-muted/50 rounded-lg p-3">
                  <h5 className="text-xs font-semibold uppercase text-muted-foreground mb-2">
                    {phase.title}
                  </h5>
                  <ul className="space-y-1.5">
                    {phase.items.map((item, itemIdx) => (
                      <li key={itemIdx} className="flex items-start gap-2 text-sm">
                        <CheckCircle className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Ideal For */}
        {showFullDetails && pkg.idealFor && pkg.idealFor.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold text-foreground mb-2">Ideal For</h4>
            <div className="flex flex-wrap gap-1.5">
              {pkg.idealFor.map((item, idx) => (
                <Badge key={idx} variant="secondary" className="text-xs">
                  {item}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {children}
      </CardContent>
    </Card>
  );
};

export default PackageInfoCard;
