import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface GlowCardProps {
  children: ReactNode;
  className?: string;
  glowColor?: "primary" | "accent" | "secondary";
  variant?: "default" | "glass";
}

const GlowCard = ({ 
  children, 
  className = "",
  glowColor = "primary",
  variant = "default"
}: GlowCardProps) => {
  const glowColorClasses = {
    primary: "before:from-primary before:to-secondary",
    accent: "before:from-accent before:to-primary",
    secondary: "before:from-secondary before:to-primary",
  };

  return (
    <div 
      className={cn(
        "glow-card group relative rounded-2xl p-[2px] transition-all duration-500",
        "before:absolute before:inset-0 before:rounded-2xl before:p-[2px]",
        "before:bg-gradient-to-r before:opacity-0 before:transition-opacity before:duration-500",
        "hover:before:opacity-100",
        glowColorClasses[glowColor],
        "after:absolute after:inset-0 after:rounded-2xl after:blur-xl after:opacity-0",
        "after:bg-gradient-to-r after:from-primary/20 after:to-secondary/20",
        "after:transition-opacity after:duration-500 hover:after:opacity-100",
        "after:-z-10",
        className
      )}
    >
      <div 
        className={cn(
          "relative rounded-2xl h-full transition-transform duration-300",
          "group-hover:scale-[1.01]",
          variant === "glass" 
            ? "glass-card" 
            : "bg-card"
        )}
      >
        {children}
      </div>
    </div>
  );
};

export default GlowCard;
