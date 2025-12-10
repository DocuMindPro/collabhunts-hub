import { BadgeCheck } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface VerifiedBadgeProps {
  className?: string;
  size?: "sm" | "md" | "lg";
  showTooltip?: boolean;
}

const VerifiedBadge = ({ className, size = "md", showTooltip = true }: VerifiedBadgeProps) => {
  const sizeClasses = {
    sm: "h-3.5 w-3.5",
    md: "h-4 w-4",
    lg: "h-5 w-5",
  };

  const badge = (
    <BadgeCheck 
      className={cn(
        sizeClasses[size],
        "text-blue-500 fill-blue-500/20 shrink-0",
        className
      )} 
    />
  );

  if (!showTooltip) {
    return badge;
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <span className="inline-flex items-center cursor-help">
            {badge}
          </span>
        </TooltipTrigger>
        <TooltipContent>
          <p className="text-xs">Verified Business</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default VerifiedBadge;
