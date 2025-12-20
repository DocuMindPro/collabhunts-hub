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
  onClick?: () => void;
}

const DimmedPrice = ({ price, canViewPrice, className = "", size = "md", onClick }: DimmedPriceProps) => {
  const formattedPrice = `$${(price / 100).toFixed(0)}`;
  
  const sizeClasses = {
    sm: "text-sm",
    md: "text-xl",
    lg: "text-2xl",
  };

  const lockIconSizes = {
    sm: "h-3.5 w-3.5",
    md: "h-4 w-4",
    lg: "h-5 w-5",
  };

  const containerPadding = {
    sm: "px-2 py-1",
    md: "px-3 py-1.5",
    lg: "px-4 py-2",
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
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onClick?.();
            }}
            className={`
              inline-flex items-center gap-2 
              ${containerPadding[size]}
              bg-muted/50 border border-border/50 rounded-lg
              cursor-pointer
              hover:bg-muted/70 hover:border-primary/30
              transition-all duration-200
              group
              ${className}
            `}
          >
            <Lock className={`${lockIconSizes[size]} text-primary group-hover:scale-110 transition-transform`} />
            <span 
              className={`font-heading font-bold ${sizeClasses[size]} text-muted-foreground/40 select-none`}
            >
              $••
            </span>
          </button>
        </TooltipTrigger>
        <TooltipContent>
          <p className="text-sm">Subscribe to view pricing</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default DimmedPrice;
