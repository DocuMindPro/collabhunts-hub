import { useState, useEffect, useCallback } from "react";
import { cn } from "@/lib/utils";

interface MouseGlowProps {
  className?: string;
  size?: number;
  color?: string;
}

const MouseGlow = ({ 
  className = "",
  size = 400,
  color = "hsl(var(--primary) / 0.15)"
}: MouseGlowProps) => {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isVisible, setIsVisible] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Check if mobile/touch device
    const checkMobile = () => {
      setIsMobile(window.matchMedia('(max-width: 768px)').matches || 'ontouchstart' in window);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (isMobile) return;
    
    const target = e.currentTarget as HTMLElement;
    const rect = target.getBoundingClientRect();
    
    setPosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
  }, [isMobile]);

  const handleMouseEnter = useCallback(() => {
    if (!isMobile) setIsVisible(true);
  }, [isMobile]);

  const handleMouseLeave = useCallback(() => {
    setIsVisible(false);
  }, []);

  useEffect(() => {
    const container = document.querySelector('.mouse-glow-container');
    if (!container || isMobile) return;

    container.addEventListener('mousemove', handleMouseMove as EventListener);
    container.addEventListener('mouseenter', handleMouseEnter);
    container.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      container.removeEventListener('mousemove', handleMouseMove as EventListener);
      container.removeEventListener('mouseenter', handleMouseEnter);
      container.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [handleMouseMove, handleMouseEnter, handleMouseLeave, isMobile]);

  // Don't render on mobile
  if (isMobile) return null;

  // Check for reduced motion preference
  if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    return null;
  }

  return (
    <div
      className={cn(
        "pointer-events-none absolute inset-0 overflow-hidden transition-opacity duration-300",
        isVisible ? "opacity-100" : "opacity-0",
        className
      )}
      aria-hidden="true"
    >
      <div
        className="absolute rounded-full blur-3xl transition-transform duration-100 ease-out will-change-transform"
        style={{
          width: size,
          height: size,
          background: `radial-gradient(circle, ${color} 0%, transparent 70%)`,
          left: position.x - size / 2,
          top: position.y - size / 2,
        }}
      />
    </div>
  );
};

export default MouseGlow;
