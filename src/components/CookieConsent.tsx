import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Cookie, X } from "lucide-react";

const CookieConsent = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem("cookie-consent");
    if (!consent) {
      // Small delay to avoid layout shift on page load
      const timer = setTimeout(() => setIsVisible(true), 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem("cookie-consent", "accepted");
    setIsVisible(false);
  };

  const handleDecline = () => {
    localStorage.setItem("cookie-consent", "declined");
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-background border-t border-border shadow-lg animate-in slide-in-from-bottom-5 duration-300">
      <div className="container mx-auto max-w-6xl">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-start gap-3 flex-1">
            <Cookie className="h-6 w-6 text-primary flex-shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="text-sm font-medium">We value your privacy</p>
              <p className="text-sm text-muted-foreground">
                We use cookies to enhance your browsing experience, serve personalized content, and analyze our traffic. 
                By clicking "Accept All", you consent to our use of cookies. Read our{" "}
                <Link to="/privacy" className="text-primary hover:underline">
                  Privacy Policy
                </Link>{" "}
                for more information.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <Button variant="outline" size="sm" onClick={handleDecline}>
              Decline
            </Button>
            <Button size="sm" onClick={handleAccept}>
              Accept All
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CookieConsent;
