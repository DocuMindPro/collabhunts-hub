import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

interface RotatingTextProps {
  words: string[];
  className?: string;
}

const RotatingText = ({ words, className = "" }: RotatingTextProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % words.length);
        setIsAnimating(false);
      }, 500);
    }, 3000);

    return () => clearInterval(interval);
  }, [words.length]);

  return (
    <span className={cn("inline-block relative", className)}>
      <span
        className={cn(
          "inline-block transition-all duration-500",
          isAnimating 
            ? "opacity-0 translate-y-4" 
            : "opacity-100 translate-y-0"
        )}
      >
        {words[currentIndex]}
      </span>
      {/* Animated gradient underline */}
      <span 
        className={cn(
          "absolute -bottom-1 left-0 h-1 bg-gradient-to-r from-primary via-secondary to-primary",
          "rounded-full transition-all duration-500 animate-gradient-shift",
          isAnimating ? "w-0 opacity-0" : "w-full opacity-100"
        )}
        style={{ backgroundSize: "200% 100%" }}
      />
    </span>
  );
};

export default RotatingText;
