import { useEffect, useRef, useState } from "react";
import { isNativePlatform } from "@/lib/supabase-native";

interface AnimatedSectionProps {
  children: React.ReactNode;
  className?: string;
  animation?: "fade-up" | "fade-in" | "scale-in" | "slide-left" | "slide-right";
  delay?: number;
  stagger?: number;
}

const AnimatedSection = ({ 
  children, 
  className = "", 
  animation = "fade-up",
  delay = 0,
  stagger = 0
}: AnimatedSectionProps) => {
  const isNative = isNativePlatform();
  // On native platforms, start visible immediately to prevent white screen
  const [isVisible, setIsVisible] = useState(isNative);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Skip IntersectionObserver on native - content is immediately visible
    if (isNative) {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1, rootMargin: "50px" }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [isNative]);

  const getAnimationClasses = () => {
    const baseClasses = "transition-all duration-700 ease-out";
    
    if (!isVisible) {
      switch (animation) {
        case "fade-up":
          return `${baseClasses} opacity-0 translate-y-8`;
        case "fade-in":
          return `${baseClasses} opacity-0`;
        case "scale-in":
          return `${baseClasses} opacity-0 scale-95`;
        case "slide-left":
          return `${baseClasses} opacity-0 -translate-x-8`;
        case "slide-right":
          return `${baseClasses} opacity-0 translate-x-8`;
        default:
          return `${baseClasses} opacity-0 translate-y-8`;
      }
    }
    
    return `${baseClasses} opacity-100 translate-y-0 translate-x-0 scale-100`;
  };

  return (
    <div
      ref={ref}
      className={`${getAnimationClasses()} ${className}`}
      style={{ 
        transitionDelay: `${delay + stagger}ms`
      }}
    >
      {children}
    </div>
  );
};

export default AnimatedSection;
