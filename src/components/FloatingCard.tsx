import { useEffect, useState, useRef, ReactNode } from "react";

interface FloatingCardProps {
  children: ReactNode | ((count: number) => ReactNode);
  className?: string;
  delay?: number;
}

const FloatingCard = ({ children, className = "", delay = 0 }: FloatingCardProps) => {
  const [count, setCount] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const targetNumber = 350;

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.5 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isVisible) return;
    
    const duration = 2000;
    const steps = 60;
    const stepDuration = duration / steps;
    const increment = targetNumber / steps;
    
    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= targetNumber) {
        setCount(targetNumber);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current));
      }
    }, stepDuration);

    return () => clearInterval(timer);
  }, [isVisible]);

  return (
    <div
      ref={ref}
      className={`animate-float ${className}`}
      style={{ animationDelay: `${delay}ms` }}
    >
      {typeof children === 'function' ? children(count) : children}
    </div>
  );
};

export default FloatingCard;
