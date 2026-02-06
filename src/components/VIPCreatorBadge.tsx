import { Crown } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface VIPCreatorBadgeProps {
  className?: string;
  size?: "sm" | "md" | "lg";
  variant?: "icon" | "pill";
  showTooltip?: boolean;
}

const VIPCreatorBadge = ({ className, size = "md", variant = "icon", showTooltip = true }: VIPCreatorBadgeProps) => {
  const iconSizeClasses = {
    sm: "h-3 w-3",
    md: "h-3.5 w-3.5",
    lg: "h-4 w-4",
  };

  // Pill variant - Collabstr style with premium gradient
  if (variant === "pill") {
    const pillBadge = (
      <span 
        className={cn(
          "inline-flex items-center gap-1 px-2 py-1 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full text-white text-xs font-semibold shadow-lg shrink-0",
          className
        )}
      >
        <Crown className={cn(iconSizeClasses[size], "text-white")} />
        VIP
      </span>
    );

    if (!showTooltip) {
      return pillBadge;
    }

    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="inline-flex items-center cursor-help">
              {pillBadge}
            </span>
          </TooltipTrigger>
          <TooltipContent>
            <p className="text-xs">VIP Creator - Premium verified creator</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  // Icon variant - original behavior
  const iconBadge = (
    <Crown 
      className={cn(
        iconSizeClasses[size],
        "text-amber-500 fill-amber-500/20 shrink-0",
        className
      )} 
    />
  );

  if (!showTooltip) {
    return iconBadge;
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <span className="inline-flex items-center cursor-help">
            {iconBadge}
          </span>
        </TooltipTrigger>
        <TooltipContent>
          <p className="text-xs">VIP Creator - Premium verified creator</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default VIPCreatorBadge;
