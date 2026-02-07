import { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

interface ParallaxImageProps {
  src: string;
  alt: string;
  className?: string;
  speed?: number;
  children?: React.ReactNode;
}

const ParallaxImage = ({ 
  src, 
  alt, 
  className = "",
  speed = 0.3,
  children
}: ParallaxImageProps) => {
  const [offset, setOffset] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isReducedMotion, setIsReducedMotion] = useState(false);

  useEffect(() => {
    // Check for reduced motion preference
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setIsReducedMotion(mediaQuery.matches);
    
    const handleChange = (e: MediaQueryListEvent) => setIsReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  useEffect(() => {
    if (isReducedMotion) return;

    let rafId: number | null = null;

    const handleScroll = () => {
      if (rafId !== null) return;
      rafId = requestAnimationFrame(() => {
        rafId = null;
        if (!containerRef.current) return;
        
        const rect = containerRef.current.getBoundingClientRect();
        const windowHeight = window.innerHeight;
        
        // Only apply parallax when element is in view
        if (rect.top < windowHeight && rect.bottom > 0) {
          const elementCenter = rect.top + rect.height / 2;
          const windowCenter = windowHeight / 2;
          const distance = elementCenter - windowCenter;
          setOffset(distance * speed);
        }
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Initial calculation
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (rafId !== null) cancelAnimationFrame(rafId);
    };
  }, [speed, isReducedMotion]);

  return (
    <div 
      ref={containerRef}
      className={cn("relative overflow-hidden", className)}
    >
      <img
        src={src}
        alt={alt}
        className={cn(
          "w-full h-full object-cover transition-transform duration-100 ease-out will-change-transform",
          isReducedMotion ? "" : "scale-110"
        )}
        style={{
          transform: isReducedMotion ? 'none' : `translateY(${offset}px)`,
        }}
        fetchPriority="high"
      />
      {children}
    </div>
  );
};

export default ParallaxImage;
