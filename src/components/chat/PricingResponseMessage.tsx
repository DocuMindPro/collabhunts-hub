import { DollarSign, Package } from "lucide-react";
import { Card } from "@/components/ui/card";
import { EVENT_PACKAGES, type PackageType } from "@/config/packages";

interface SharedPackage {
  service_type: string;
  price_cents: number;
  delivery_days?: number;
}

interface PricingResponseMessageProps {
  packages: SharedPackage[];
  isOwn: boolean;
}

const PricingResponseMessage = ({ packages, isOwn }: PricingResponseMessageProps) => {
  return (
    <Card className="max-w-[80%] border-accent/30 bg-accent/5 overflow-hidden">
      <div className="flex items-center gap-2 px-3 py-2 bg-accent/10 border-b border-accent/20">
        <DollarSign className="h-4 w-4 text-accent-foreground" />
        <span className="text-xs font-semibold text-accent-foreground">
          {isOwn ? "Pricing Shared" : "Creator's Pricing"}
        </span>
      </div>
      <div className="p-3 space-y-2">
        {packages.map((pkg, i) => {
          const config = EVENT_PACKAGES[pkg.service_type as PackageType];
          const name = config?.name || pkg.service_type.replace(/_/g, " ");
          return (
            <div key={i} className="flex items-center justify-between gap-3 py-1.5 border-b border-border/30 last:border-0">
              <div className="flex items-center gap-2 min-w-0">
                <Package className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                <span className="text-sm font-medium truncate">{name}</span>
              </div>
              <span className="text-sm font-bold text-foreground flex-shrink-0">
                ${(pkg.price_cents / 100).toLocaleString()}
              </span>
            </div>
          );
        })}
        <p className="text-xs text-muted-foreground pt-1">
          {isOwn ? "You shared your pricing." : "Use 'Inquire' on a package to start negotiation."}
        </p>
      </div>
    </Card>
  );
};

export default PricingResponseMessage;

export const isPricingResponse = (content: string): boolean => {
  try {
    const parsed = JSON.parse(content);
    return parsed.type === "pricing_response";
  } catch {
    return false;
  }
};
