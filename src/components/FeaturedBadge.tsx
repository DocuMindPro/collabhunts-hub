import { Sparkles } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface FeaturedBadgeProps {
  className?: string;
  size?: "sm" | "md" | "lg";
  variant?: "icon" | "pill";
  showTooltip?: boolean;
}

const FeaturedBadge = ({ className, size = "md", variant = "icon", showTooltip = true }: FeaturedBadgeProps) => {
  const iconSizeClasses = {
    sm: "h-3 w-3",
    md: "h-3.5 w-3.5",
    lg: "h-4 w-4",
  };

  if (variant === "pill") {
    const pillBadge = (
      <span 
        className={cn(
          "inline-flex items-center gap-1 px-2.5 py-1 bg-gradient-to-r from-amber-400 to-yellow-500 rounded-full text-white text-xs font-semibold shadow-lg shrink-0",
          className
        )}
      >
        <Sparkles className={cn(iconSizeClasses[size], "text-white")} />
        Featured
      </span>
    );

    if (!showTooltip) return pillBadge;

    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="inline-flex items-center cursor-help">{pillBadge}</span>
          </TooltipTrigger>
          <TooltipContent>
            <p className="text-xs">Featured Creator - Boosted profile visibility</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  const iconBadge = (
    <Sparkles className={cn(iconSizeClasses[size], "text-amber-500 shrink-0", className)} />
  );

  if (!showTooltip) return iconBadge;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <span className="inline-flex items-center cursor-help">{iconBadge}</span>
        </TooltipTrigger>
        <TooltipContent>
          <p className="text-xs">Featured Creator - Boosted profile visibility</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default FeaturedBadge;
