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
  showTooltip?: boolean;
}

const VIPCreatorBadge = ({ className, size = "md", showTooltip = true }: VIPCreatorBadgeProps) => {
  const sizeClasses = {
    sm: "h-3.5 w-3.5",
    md: "h-4 w-4",
    lg: "h-5 w-5",
  };

  const badge = (
    <Crown 
      className={cn(
        sizeClasses[size],
        "text-amber-500 fill-amber-500/20 shrink-0",
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
          <p className="text-xs">VIP Creator - Premium verified creator</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default VIPCreatorBadge;
