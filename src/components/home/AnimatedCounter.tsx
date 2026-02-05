import { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

interface AnimatedCounterProps {
  end: number | string;
  duration?: number;
  suffix?: string;
  prefix?: string;
  className?: string;
  isNumeric?: boolean;
}

const AnimatedCounter = ({ 
  end, 
  duration = 2000, 
  suffix = "", 
  prefix = "",
  className = "",
  isNumeric = true
}: AnimatedCounterProps) => {
  const [count, setCount] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [hasAnimated, setHasAnimated] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated) {
          setIsVisible(true);
          setHasAnimated(true);
        }
      },
      { threshold: 0.3 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [hasAnimated]);

  useEffect(() => {
    if (!isVisible || !isNumeric) return;

    const endNumber = typeof end === 'number' ? end : parseFloat(end);
    if (isNaN(endNumber)) return;

    const startTime = Date.now();
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing function for smooth deceleration
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      const currentCount = Math.round(easeOutQuart * endNumber);
      
      setCount(currentCount);
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    
    requestAnimationFrame(animate);
  }, [isVisible, end, duration, isNumeric]);

  // For non-numeric values, just display the value directly
  if (!isNumeric) {
    return (
      <span ref={ref} className={cn("inline-block", className)}>
        <span className={cn(
          "transition-all duration-500",
          isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
        )}>
          {prefix}{end}{suffix}
        </span>
      </span>
    );
  }

  return (
    <span ref={ref} className={cn("inline-block tabular-nums", className)}>
      <span className={cn(
        "transition-all duration-500",
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
      )}>
        {prefix}{count}{suffix}
      </span>
    </span>
  );
};

export default AnimatedCounter;
