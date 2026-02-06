import { ShieldCheck } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface VettedBadgeProps {
  className?: string;
  size?: "sm" | "md" | "lg";
  variant?: "icon" | "pill";
  showTooltip?: boolean;
}

const VettedBadge = ({ className, size = "md", variant = "icon", showTooltip = true }: VettedBadgeProps) => {
  const iconSizeClasses = {
    sm: "h-3 w-3",
    md: "h-3.5 w-3.5",
    lg: "h-4 w-4",
  };

  // Pill variant - Collabstr style
  if (variant === "pill") {
    const pillBadge = (
      <span 
        className={cn(
          "inline-flex items-center gap-1 px-2 py-1 bg-gray-800/80 backdrop-blur-sm rounded-full text-white text-xs font-medium shrink-0",
          className
        )}
      >
        <ShieldCheck className={cn(iconSizeClasses[size], "text-green-400")} />
        Vetted
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
            <p className="text-xs">CollabHunts Vetted - Profile reviewed and approved</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  // Icon variant - original behavior
  const iconBadge = (
    <ShieldCheck 
      className={cn(
        iconSizeClasses[size],
        "text-green-600 shrink-0",
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
          <p className="text-xs">CollabHunts Vetted - Profile reviewed and approved</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default VettedBadge;
