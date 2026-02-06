import { Link } from "react-router-dom";
import { Instagram, Twitter, Youtube, Linkedin, BookOpen, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import Logo from "@/components/Logo";
import { useToast } from "@/hooks/use-toast";
import { isNativePlatform, safeNativeAsync } from "@/lib/supabase-native";

const Footer = () => {
  const [hasBrandProfile, setHasBrandProfile] = useState(false);
  const [hasCreatorProfile, setHasCreatorProfile] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [recentUpdatesCount, setRecentUpdatesCount] = useState(0);
  const { toast } = useToast();
  const isNative = isNativePlatform();

  useEffect(() => {
    const checkUserProfiles = async () => {
      const session = await safeNativeAsync(
        async () => {
          const { data } = await supabase.auth.getSession();
          return data.session;
        },
        null
      );
      
      if (!session?.user) {
        setHasBrandProfile(false);
        setHasCreatorProfile(false);
        setIsLoggedIn(false);
        return;
      }

      setIsLoggedIn(true);

      const [brandData, creatorData] = await Promise.all([
        safeNativeAsync(
          async () => {
            const { data } = await supabase.from("brand_profiles").select("id").eq("user_id", session.user.id).maybeSingle();
            return data;
          },
          null
        ),
        safeNativeAsync(
          async () => {
            const { data } = await supabase.from("creator_profiles").select("id").eq("user_id", session.user.id).maybeSingle();
            return data;
          },
          null
        )
      ]);

      setHasBrandProfile(!!brandData);
      setHasCreatorProfile(!!creatorData);
    };

    const fetchRecentUpdatesCount = async () => {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const count = await safeNativeAsync(
        async () => {
          const { count } = await supabase
            .from("platform_changelog")
            .select("id", { count: "exact", head: true })
            .eq("is_published", true)
            .gte("published_at", thirtyDaysAgo.toISOString());
          return count;
        },
        0
      );
      
      setRecentUpdatesCount(count || 0);
    };

    if (isNative) {
      const timeout = setTimeout(() => {
        checkUserProfiles();
        fetchRecentUpdatesCount();
      }, 500);
      return () => clearTimeout(timeout);
    }

    checkUserProfiles();
    fetchRecentUpdatesCount();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      checkUserProfiles();
    });

    return () => subscription.unsubscribe();
  }, [isNative]);

  const handleSocialClick = (platform: string) => {
    toast({
      title: "Coming Soon",
      description: `Our ${platform} page is coming soon!`,
    });
  };

  return (
    <footer className="border-t border-border bg-muted/30">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center">
              <Logo size="md" />
            </Link>
            <p className="text-sm text-muted-foreground">
              Book creators for live fan experiences at your venue.
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

          {/* Conditional: Role-aware navigation */}
          {isLoggedIn ? (
            <>
              {/* Quick Links - contextual to user role */}
              <div>
                <h3 className="font-heading font-semibold mb-4">Quick Links</h3>
                <ul className="space-y-2">
                  <li>
                    <Link to="/influencers" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                      Find Influencers
                    </Link>
                  </li>
                  {hasBrandProfile && (
                    <>
                      <li>
                        <Link to="/brand-dashboard" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                          My Dashboard
                        </Link>
                      </li>
                      <li>
                        <Link to="/brand-dashboard?tab=messages" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                          My Messages
                        </Link>
                      </li>
                    </>
                  )}
                  {hasCreatorProfile && (
                    <>
                      <li>
                        <Link to="/opportunities" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                          Browse Opportunities
                        </Link>
                      </li>
                      <li>
                        <Link to="/creator-dashboard" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                          My Dashboard
                        </Link>
                      </li>
                    </>
                  )}
                </ul>
              </div>

              {/* Resources - useful for logged-in users */}
              <div>
                <h3 className="font-heading font-semibold mb-4">Resources</h3>
                <ul className="space-y-2">
                  <li>
                    <Link to="/knowledge-base" className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-1">
                      <BookOpen className="h-3 w-3" />
                      Knowledge Base
                    </Link>
                  </li>
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
                    <Link to="/contact" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                      Help & Support
                    </Link>
                  </li>
                </ul>
              </div>
            </>
          ) : (
            <>
              {/* For Brands - marketing to prospects */}
              <div>
                <h3 className="font-heading font-semibold mb-4">For Brands</h3>
                <ul className="space-y-2">
                  <li>
                    <Link to="/influencers" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                      Find Influencers
                    </Link>
                  </li>
                  <li>
                    <Link to="/brand" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                      How It Works
                    </Link>
                  </li>
                  <li>
                    <Link to="/brand" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                      Register Your Brand
                    </Link>
                  </li>
                </ul>
              </div>

              {/* For Creators - marketing to prospects */}
              <div>
                <h3 className="font-heading font-semibold mb-4">For Creators</h3>
                <ul className="space-y-2">
                  <li>
                    <Link to="/creator" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                      Join as a Creator
                    </Link>
                  </li>
                  <li>
                    <Link to="/creator" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                      How It Works
                    </Link>
                  </li>
                </ul>
              </div>
            </>
          )}

          {/* Company - always visible */}
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
              {!isLoggedIn && (
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
              )}
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
