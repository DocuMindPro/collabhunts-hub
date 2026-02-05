import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Menu, Shield, LogOut, LayoutDashboard, ChevronDown, ChevronUp, BookOpen, Sparkles,
  BarChart3, User as UserIcon, Package, Calendar, MessageSquare, Wallet, Crown, MapPin
} from "lucide-react";
import Notifications from "@/components/Notifications";
import { useState, useEffect } from "react";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import Logo from "@/components/Logo";
import { isNativePlatform, safeNativeAsync } from "@/lib/supabase-native";
import { useUnreadMessages } from "@/hooks/useUnreadMessages";
import BrandRegistrationPrompt from "@/components/BrandRegistrationPrompt";

const Navbar = () => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [hasCreatorProfile, setHasCreatorProfile] = useState(false);
  const [hasBrandProfile, setHasBrandProfile] = useState(false);
  const [creatorMenuOpen, setCreatorMenuOpen] = useState(false);
  const [brandMenuOpen, setBrandMenuOpen] = useState(false);
  const [hasNewUpdates, setHasNewUpdates] = useState(false);
  const [showRegistrationPrompt, setShowRegistrationPrompt] = useState(false);
  const { unreadCount: unreadMessages, getMessagesLink } = useUnreadMessages();
  const creatorTabs = [
    { value: "overview", label: "Overview", icon: BarChart3 },
    { value: "availability", label: "Availability", icon: Calendar },
    { value: "profile", label: "Profile", icon: UserIcon },
    { value: "services", label: "Event Packages", icon: Package },
    { value: "bookings", label: "Events", icon: MapPin },
    { value: "payouts", label: "Earnings", icon: Wallet },
    { value: "messages", label: "Messages", icon: MessageSquare },
  ];

  const brandTabs = [
    { value: "overview", label: "Overview", icon: BarChart3 },
    { value: "venue", label: "Venue Profile", icon: MapPin },
    { value: "bookings", label: "Events", icon: Calendar },
    { value: "messages", label: "Messages", icon: MessageSquare },
  ];

  type NavLink = { to: string; label: string; icon?: typeof Sparkles };
  
  const handleFindCreatorsClick = (e: React.MouseEvent) => {
    if (!hasBrandProfile) {
      e.preventDefault();
      setShowRegistrationPrompt(true);
    }
  };

  const getNavLinks = (): NavLink[] => {
    const links: NavLink[] = [];
    
    // Only show "Find Creators" to non-creators (brands and prospects)
    if (!hasCreatorProfile) {
      links.push({ to: "/influencers", label: "Find Creators" });
    }
    
    // Only show Opportunities link to users with a creator profile
    if (hasCreatorProfile) {
      links.push({ to: "/opportunities", label: "Opportunities" });
    }
    
    // Only show "For Brands" to non-brand AND non-creator users (prospects only)
    if (!hasBrandProfile && !hasCreatorProfile) {
      links.push({ to: "/brand", label: "For Brands" });
    }
    
    if (user) {
      links.push({ to: "/whats-new", label: "What's New", icon: Sparkles });
    }
    
    return links;
  };

  const navLinks = getNavLinks();

  const checkAdminRole = async (userId: string) => {
    const data = await safeNativeAsync(
      async () => {
        const { data } = await supabase.from('user_roles').select('role').eq('user_id', userId).eq('role', 'admin').maybeSingle();
        return data;
      },
      null
    );
    setIsAdmin(!!data);
  };

  const checkCreatorStatus = async (userId: string) => {
    const data = await safeNativeAsync(
      async () => {
        const { data } = await supabase.from('creator_profiles').select('id').eq('user_id', userId).maybeSingle();
        return data;
      },
      null
    );
    setHasCreatorProfile(!!data);
  };

  const checkBrandProfile = async (userId: string) => {
    const data = await safeNativeAsync(
      async () => {
        const { data } = await supabase.from('brand_profiles').select('id').eq('user_id', userId).maybeSingle();
        return data;
      },
      null
    );
    setHasBrandProfile(!!data);
  };

  useEffect(() => {
    const isNative = isNativePlatform();
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        setTimeout(() => {
          checkAdminRole(session.user.id);
          checkCreatorStatus(session.user.id);
          checkBrandProfile(session.user.id);
        }, isNative ? 500 : 0);
      } else {
        setIsAdmin(false);
        setHasCreatorProfile(false);
        setHasBrandProfile(false);
      }
    });

    const checkSession = async () => {
      const session = await safeNativeAsync(
        async () => {
          const { data } = await supabase.auth.getSession();
          return data.session;
        },
        null
      );
      
      setUser(session?.user ?? null);
      if (session?.user) {
        setTimeout(() => {
          checkAdminRole(session.user.id);
          checkCreatorStatus(session.user.id);
          checkBrandProfile(session.user.id);
        }, isNative ? 300 : 0);
      }
    };

    if (isNative) {
      setTimeout(checkSession, 100);
    } else {
      checkSession();
    }

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const isNative = isNativePlatform();
    
    const checkNewUpdates = async () => {
      const data = await safeNativeAsync(
        async () => {
          const { data } = await supabase
            .from("platform_changelog")
            .select("published_at")
            .eq("is_published", true)
            .order("published_at", { ascending: false })
            .limit(1)
            .single();
          return data;
        },
        null
      );

      if (data?.published_at) {
        const lastVisited = localStorage.getItem("whats_new_last_visited");
        if (!lastVisited || new Date(data.published_at) > new Date(lastVisited)) {
          setHasNewUpdates(true);
        }
      }
    };

    if (isNative) {
      setTimeout(checkNewUpdates, 1000);
    } else {
      checkNewUpdates();
    }
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <nav className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center flex-shrink-0 mr-8">
            <Logo size="md" />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="text-sm font-medium text-foreground/80 hover:text-primary transition-colors flex items-center gap-1"
                onClick={(e) => {
                  if (link.to === "/influencers") {
                    handleFindCreatorsClick(e);
                  }
                  if (link.to === "/whats-new") {
                    setHasNewUpdates(false);
                  }
                }}
              >
                {'icon' in link && link.icon && <link.icon className="h-3.5 w-3.5" />}
                {link.label}
                {link.to === "/whats-new" && hasNewUpdates && (
                  <span className="ml-1 px-1.5 py-0.5 text-[10px] font-semibold bg-primary text-primary-foreground rounded-full animate-pulse">
                    New
                  </span>
                )}
              </Link>
            ))}
            
            {user ? (
              <>
                <Link 
                  to="/knowledge-base" 
                  className="text-sm font-medium text-foreground/80 hover:text-primary transition-colors flex items-center gap-1"
                  title="Help & FAQs"
                >
                  <BookOpen className="h-4 w-4" />
                </Link>
                <Link 
                  to={getMessagesLink()} 
                  className="relative text-foreground/80 hover:text-primary transition-colors"
                  title="Messages"
                >
                  <MessageSquare className="h-5 w-5" />
                  {unreadMessages > 0 && (
                    <span className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground text-[10px] font-bold rounded-full h-4 min-w-[16px] flex items-center justify-center px-1">
                      {unreadMessages > 99 ? "99+" : unreadMessages}
                    </span>
                  )}
                </Link>
                <Notifications />
                {isAdmin && (
                  <Link to="/admin">
                    <Button variant="outline" size="sm" className="gap-2">
                      <Shield className="h-4 w-4" />
                      Admin
                    </Button>
                  </Link>
                )}
                {hasCreatorProfile && (
                  <Link to="/creator-dashboard">
                    <Button variant="outline" size="sm" className="gap-2">
                      <LayoutDashboard className="h-4 w-4" />
                      Creator Dashboard
                    </Button>
                  </Link>
                )}
                {hasBrandProfile && (
                  <Link to="/brand-dashboard">
                    <Button variant="outline" size="sm" className="gap-2">
                      <MapPin className="h-4 w-4" />
                      Brand Dashboard
                    </Button>
                  </Link>
                )}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="gap-2">
                      <Avatar className="h-6 w-6">
                        <AvatarFallback>
                          {user.email?.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm">{user.email}</span>
                      {isAdmin && (
                        <Badge variant="default" className="ml-1 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs px-1.5 py-0">
                          <Crown className="h-3 w-3 mr-0.5" />
                          Admin
                        </Badge>
                      )}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={handleLogout}>
                      <LogOut className="h-4 w-4 mr-2" />
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="ghost" size="sm">
                    Login
                  </Button>
                </Link>
                <Link to="/brand-signup">
                  <Button variant="outline" size="sm">
                    Register Your Brand
                  </Button>
                </Link>
                <Link to="/creator-signup">
                  <Button size="sm" className="bg-accent hover:bg-accent-hover">
                    Join as a Creator
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Navigation */}
          <div className="md:hidden">
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent>
                <div className="flex flex-col space-y-4 mt-8">
                  {navLinks.map((link) => (
                    <Link
                      key={link.to}
                      to={link.to}
                      onClick={(e) => {
                        if (link.to === "/influencers" && !hasBrandProfile) {
                          e.preventDefault();
                          setIsOpen(false);
                          setShowRegistrationPrompt(true);
                        } else {
                          setIsOpen(false);
                        }
                      }}
                      className="text-sm font-medium text-foreground/80 hover:text-primary transition-colors"
                    >
                      {link.label}
                    </Link>
                  ))}
                  
                    {user ? (
                    <>
                      <Link to={getMessagesLink()} onClick={() => setIsOpen(false)}>
                        <Button variant="ghost" className="w-full gap-2 justify-start relative">
                          <MessageSquare className="h-4 w-4" />
                          Messages
                          {unreadMessages > 0 && (
                            <span className="ml-auto bg-destructive text-destructive-foreground text-[10px] font-bold rounded-full h-5 min-w-[20px] flex items-center justify-center px-1.5">
                              {unreadMessages > 99 ? "99+" : unreadMessages}
                            </span>
                          )}
                        </Button>
                      </Link>
                      <Link to="/knowledge-base" onClick={() => setIsOpen(false)}>
                        <Button variant="ghost" className="w-full gap-2 justify-start">
                          <BookOpen className="h-4 w-4" />
                          Knowledge Base
                        </Button>
                      </Link>
                      {isAdmin && (
                        <Link to="/admin" onClick={() => setIsOpen(false)}>
                          <Button variant="outline" className="w-full gap-2">
                            <Shield className="h-4 w-4" />
                            Admin Dashboard
                          </Button>
                        </Link>
                      )}
                      
                      {hasCreatorProfile && (
                        <div className="space-y-1">
                          <Button 
                            variant="outline" 
                            className="w-full gap-2 justify-between"
                            onClick={() => setCreatorMenuOpen(!creatorMenuOpen)}
                          >
                            <span className="flex items-center gap-2">
                              <LayoutDashboard className="h-4 w-4" />
                              Creator Dashboard
                            </span>
                            {creatorMenuOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                          </Button>
                          {creatorMenuOpen && (
                            <div className="ml-4 space-y-1 border-l-2 border-border pl-3">
                              {creatorTabs.map((tab) => (
                                <Link 
                                  key={tab.value}
                                  to={`/creator-dashboard?tab=${tab.value}`}
                                  onClick={() => setIsOpen(false)}
                                  className="flex items-center gap-2 py-2 px-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors"
                                >
                                  <tab.icon className="h-4 w-4" />
                                  {tab.label}
                                </Link>
                              ))}
                            </div>
                          )}
                        </div>
                      )}

                      {hasBrandProfile && (
                        <div className="space-y-1">
                          <Button 
                            variant="outline" 
                            className="w-full gap-2 justify-between"
                            onClick={() => setBrandMenuOpen(!brandMenuOpen)}
                          >
                            <span className="flex items-center gap-2">
                              <MapPin className="h-4 w-4" />
                              Brand Dashboard
                            </span>
                            {brandMenuOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                          </Button>
                          {brandMenuOpen && (
                            <div className="ml-4 space-y-1 border-l-2 border-border pl-3">
                              {brandTabs.map((tab) => (
                                <Link 
                                  key={tab.value}
                                  to={`/brand-dashboard?tab=${tab.value}`}
                                  onClick={() => setIsOpen(false)}
                                  className="flex items-center gap-2 py-2 px-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors"
                                >
                                  <tab.icon className="h-4 w-4" />
                                  {tab.label}
                                </Link>
                              ))}
                            </div>
                          )}
                        </div>
                      )}

                      <div className="pt-4 border-t border-border">
                        <div className="flex items-center gap-2 mb-4">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback>
                              {user.email?.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-sm">{user.email}</span>
                        </div>
                        <Button 
                          variant="outline" 
                          className="w-full gap-2"
                          onClick={() => {
                            handleLogout();
                            setIsOpen(false);
                          }}
                        >
                          <LogOut className="h-4 w-4" />
                          Logout
                        </Button>
                      </div>
                    </>
                  ) : (
                    <>
                      <Link to="/login" onClick={() => setIsOpen(false)}>
                        <Button variant="ghost" className="w-full">
                          Login
                        </Button>
                      </Link>
                      <Link to="/brand-signup" onClick={() => setIsOpen(false)}>
                        <Button variant="outline" className="w-full">
                          Register Your Brand
                        </Button>
                      </Link>
                      <Link to="/creator-signup" onClick={() => setIsOpen(false)}>
                        <Button className="w-full bg-accent hover:bg-accent-hover">
                          Join as a Creator
                        </Button>
                      </Link>
                    </>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>

      <BrandRegistrationPrompt 
        open={showRegistrationPrompt} 
        onOpenChange={setShowRegistrationPrompt} 
      />
    </nav>
  );
};

export default Navbar;
