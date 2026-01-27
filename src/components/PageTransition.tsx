import { ReactNode, useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { isNativePlatform } from "@/lib/supabase-native";

interface PageTransitionProps {
  children: ReactNode;
}

const PageTransition = ({ children }: PageTransitionProps) => {
  const location = useLocation();
  const isNative = isNativePlatform();
  
  // On native platforms, skip animations entirely for faster first paint
  const [isVisible, setIsVisible] = useState(isNative);
  const [displayChildren, setDisplayChildren] = useState(children);

  useEffect(() => {
    // Skip animation on native - render immediately
    if (isNative) {
      setDisplayChildren(children);
      setIsVisible(true);
      return;
    }
    
    setIsVisible(false);
    
    // Small delay to ensure exit animation can play (web only)
    const timeout = setTimeout(() => {
      setDisplayChildren(children);
      setIsVisible(true);
    }, 50);

    return () => clearTimeout(timeout);
  }, [location.pathname, children, isNative]);

  // On native, render without transition classes for maximum performance
  if (isNative) {
    return <div className="page-transition page-enter">{displayChildren}</div>;
  }

  return (
    <div
      className={`page-transition ${isVisible ? "page-enter" : "page-exit"}`}
    >
      {displayChildren}
    </div>
  );
};

export default PageTransition;
