import { Zap } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface RespondsFastBadgeProps {
  className?: string;
  size?: "sm" | "md" | "lg";
  variant?: "icon" | "pill";
  showTooltip?: boolean;
}

const RespondsFastBadge = ({ className, size = "md", variant = "icon", showTooltip = true }: RespondsFastBadgeProps) => {
  const iconSizeClasses = {
    sm: "h-3 w-3",
    md: "h-3.5 w-3.5",
    lg: "h-4 w-4",
  };

  if (variant === "pill") {
    const pillBadge = (
      <span 
        className={cn(
          "inline-flex items-center gap-1 px-2.5 py-1 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full text-white text-xs font-semibold shadow-lg shrink-0",
          className
        )}
      >
        <Zap className={cn(iconSizeClasses[size], "text-white fill-white")} />
        Responds Fast
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
            <p className="text-xs">This creator typically responds within 24 hours</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  const iconBadge = (
    <Zap className={cn(iconSizeClasses[size], "text-emerald-500 fill-emerald-500/20 shrink-0", className)} />
  );

  if (!showTooltip) return iconBadge;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <span className="inline-flex items-center cursor-help">{iconBadge}</span>
        </TooltipTrigger>
        <TooltipContent>
          <p className="text-xs">This creator typically responds within 24 hours</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default RespondsFastBadge;
