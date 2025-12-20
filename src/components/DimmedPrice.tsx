import { Lock } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "@/components/ui/tooltip";

interface DimmedPriceProps {
  price: number; // in cents
  canViewPrice: boolean;
  className?: string;
  size?: "sm" | "md" | "lg";
}

const DimmedPrice = ({ price, canViewPrice, className = "", size = "md" }: DimmedPriceProps) => {
  const formattedPrice = `$${(price / 100).toFixed(0)}`;
  
  const sizeClasses = {
    sm: "text-sm",
    md: "text-xl",
    lg: "text-2xl",
  };

  if (canViewPrice) {
    return (
      <span className={`font-heading font-bold ${sizeClasses[size]} ${className}`}>
        {formattedPrice}
      </span>
    );
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className={`inline-flex items-center gap-1.5 ${className}`}>
            <span 
              className={`font-heading font-bold ${sizeClasses[size]} opacity-30 blur-[6px] select-none pointer-events-none`}
            >
              {formattedPrice}
            </span>
            <Lock className="h-3.5 w-3.5 text-muted-foreground" />
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p>Subscribe to Basic to see creator pricing</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default DimmedPrice;
