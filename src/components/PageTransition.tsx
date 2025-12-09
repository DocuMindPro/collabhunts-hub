import { ReactNode, useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

interface PageTransitionProps {
  children: ReactNode;
}

const PageTransition = ({ children }: PageTransitionProps) => {
  const location = useLocation();
  const [isVisible, setIsVisible] = useState(false);
  const [displayChildren, setDisplayChildren] = useState(children);

  useEffect(() => {
    setIsVisible(false);
    
    // Small delay to ensure exit animation can play
    const timeout = setTimeout(() => {
      setDisplayChildren(children);
      setIsVisible(true);
    }, 50);

    return () => clearTimeout(timeout);
  }, [location.pathname, children]);

  return (
    <div
      className={`page-transition ${isVisible ? "page-enter" : "page-exit"}`}
    >
      {displayChildren}
    </div>
  );
};

export default PageTransition;
