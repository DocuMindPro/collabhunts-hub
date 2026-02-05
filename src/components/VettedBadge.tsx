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
  showTooltip?: boolean;
}

const VettedBadge = ({ className, size = "md", showTooltip = true }: VettedBadgeProps) => {
  const sizeClasses = {
    sm: "h-3.5 w-3.5",
    md: "h-4 w-4",
    lg: "h-5 w-5",
  };

  const badge = (
    <ShieldCheck 
      className={cn(
        sizeClasses[size],
        "text-green-600 shrink-0",
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
          <p className="text-xs">CollabHunts Vetted - Profile reviewed and approved</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default VettedBadge;
