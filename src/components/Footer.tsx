import { Link } from "react-router-dom";
import { Instagram, Twitter, Youtube, Linkedin, BookOpen, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import Logo from "@/components/Logo";
import { useToast } from "@/hooks/use-toast";
import AdPlacement from "@/components/AdPlacement";

const Footer = () => {
  const [hasBrandProfile, setHasBrandProfile] = useState(false);
  const [hasCreatorProfile, setHasCreatorProfile] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [recentUpdatesCount, setRecentUpdatesCount] = useState(0);
  const { toast } = useToast();

  useEffect(() => {
    const checkUserProfiles = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        setHasBrandProfile(false);
        setHasCreatorProfile(false);
        setIsLoggedIn(false);
        return;
      }

      setIsLoggedIn(true);

      const [brandResult, creatorResult] = await Promise.all([
        supabase.from("brand_profiles").select("id").eq("user_id", session.user.id).maybeSingle(),
        supabase.from("creator_profiles").select("id").eq("user_id", session.user.id).maybeSingle()
      ]);

      setHasBrandProfile(!!brandResult.data);
      setHasCreatorProfile(!!creatorResult.data);
    };

    const fetchRecentUpdatesCount = async () => {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const { count } = await supabase
        .from("platform_changelog")
        .select("id", { count: "exact", head: true })
        .eq("is_published", true)
        .gte("published_at", thirtyDaysAgo.toISOString());
      
      setRecentUpdatesCount(count || 0);
    };

    checkUserProfiles();
    fetchRecentUpdatesCount();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      checkUserProfiles();
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSocialClick = (platform: string) => {
    toast({
      title: "Coming Soon",
      description: `Our ${platform} page is coming soon!`,
    });
  };

  return (
    <footer className="border-t border-border bg-muted/30">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center">
              <Logo size="md" />
            </Link>
            <p className="text-sm text-muted-foreground">
              Connecting brands with creators to create amazing content.
            </p>
            <div className="flex space-x-4">
              <button onClick={() => handleSocialClick("Instagram")} className="text-muted-foreground hover:text-primary transition-colors">
                <Instagram className="h-5 w-5" />
              </button>
              <button onClick={() => handleSocialClick("Twitter")} className="text-muted-foreground hover:text-primary transition-colors">
                <Twitter className="h-5 w-5" />
              </button>
              <button onClick={() => handleSocialClick("YouTube")} className="text-muted-foreground hover:text-primary transition-colors">
                <Youtube className="h-5 w-5" />
              </button>
              <button onClick={() => handleSocialClick("LinkedIn")} className="text-muted-foreground hover:text-primary transition-colors">
                <Linkedin className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* For Brands */}
          <div>
            <h3 className="font-heading font-semibold mb-4">For Brands</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/influencers" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Find Influencers
                </Link>
              </li>
              <li>
                <Link to="/pricing" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Pricing
                </Link>
              </li>
              <li>
                {hasBrandProfile ? (
                  <Link to="/brand-dashboard" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                    Brand Dashboard
                  </Link>
                ) : (
                  <Link to="/brand" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                    Join as Brand
                  </Link>
                )}
              </li>
            </ul>
          </div>

          {/* For Creators */}
          <div>
            <h3 className="font-heading font-semibold mb-4">For Creators</h3>
            <ul className="space-y-2">
              <li>
                {hasCreatorProfile ? (
                  <Link to="/creator-dashboard" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                    Creator Dashboard
                  </Link>
                ) : (
                  <Link to="/creator" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                    Join as Creator
                  </Link>
                )}
              </li>
              <li>
                <Link to="/creator" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  How It Works
                </Link>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="font-heading font-semibold mb-4">Company</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/about" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Contact
                </Link>
              </li>
              {isLoggedIn && (
                <li>
                  <Link to="/knowledge-base" className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-1">
                    <BookOpen className="h-3 w-3" />
                    Knowledge Base
                  </Link>
                </li>
              )}
              <li>
                <Link to="/whats-new" className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-1">
                  <Sparkles className="h-3 w-3" />
                  What's New
                  {recentUpdatesCount > 0 && (
                    <span className="ml-1 bg-primary text-primary-foreground text-xs px-1.5 py-0.5 rounded-full font-medium">
                      {recentUpdatesCount}
                    </span>
                  )}
                </Link>
              </li>
              <li>
                <Link to="/terms" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/refund" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Refund Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Footer Sponsors Section */}
        <div className="mt-8 pt-8 border-t border-border">
          <AdPlacement placementId="footer_sponsors" className="max-w-2xl mx-auto h-20" showAdvertiseHere={false} />
        </div>

        <div className="mt-8 pt-8 border-t border-border">
          <p className="text-center text-sm text-muted-foreground">
            © {new Date().getFullYear()} CollabHunts. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
