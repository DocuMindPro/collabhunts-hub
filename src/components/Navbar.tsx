import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Menu, Shield, LogOut, LayoutDashboard, ChevronDown, ChevronUp, BookOpen, Sparkles,
  BarChart3, User as UserIcon, Package, Calendar, MessageSquare, Megaphone, Wallet, Users, CreditCard, Crown, Zap
} from "lucide-react";
import Notifications from "@/components/Notifications";
import NavbarUpgradeBadge from "@/components/NavbarUpgradeBadge";
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
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import Logo from "@/components/Logo";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [hasCreatorProfile, setHasCreatorProfile] = useState(false);
  const [hasBrandProfile, setHasBrandProfile] = useState(false);
  const [creatorMenuOpen, setCreatorMenuOpen] = useState(false);
  const [brandMenuOpen, setBrandMenuOpen] = useState(false);
  const [hasNewUpdates, setHasNewUpdates] = useState(false);

  const creatorTabs = [
    { value: "overview", label: "Overview", icon: BarChart3 },
    { value: "campaigns", label: "Campaigns", icon: Megaphone },
    { value: "profile", label: "Profile", icon: UserIcon },
    { value: "services", label: "Services", icon: Package },
    { value: "bookings", label: "Bookings", icon: Calendar },
    { value: "payouts", label: "Payouts", icon: Wallet },
    { value: "messages", label: "Messages", icon: MessageSquare },
  ];

  const brandTabs = [
    { value: "overview", label: "Overview", icon: BarChart3 },
    { value: "campaigns", label: "Campaigns", icon: Megaphone },
    { value: "bookings", label: "Bookings", icon: Calendar },
    { value: "creators", label: "Creators", icon: Users },
    { value: "subscription", label: "Subscription", icon: CreditCard },
    { value: "messages", label: "Messages", icon: MessageSquare },
  ];

  type NavLink = { to: string; label: string; icon?: typeof Sparkles };
  
  const baseNavLinks: NavLink[] = [
    { to: "/influencers", label: "Search" },
    { to: "/brand", label: "How It Works" },
    { to: "/pricing", label: "Pricing" },
  ];

  // Campaigns link only visible to logged-in creators
  const getNavLinks = (): NavLink[] => {
    const links = [...baseNavLinks];
    
    // Add Campaigns link only for logged-in creators
    if (user && hasCreatorProfile) {
      links.splice(1, 0, { to: "/campaigns", label: "Campaigns" });
    }
    
    // Add What's New for logged-in users
    if (user) {
      links.push({ to: "/whats-new", label: "What's New", icon: Sparkles });
    }
    
    return links;
  };

  const navLinks = getNavLinks();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        checkAdminRole(session.user.id);
        checkCreatorStatus(session.user.id);
        checkBrandProfile(session.user.id);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        setTimeout(() => {
          checkAdminRole(session.user.id);
          checkCreatorStatus(session.user.id);
          checkBrandProfile(session.user.id);
        }, 0);
      } else {
        setIsAdmin(false);
        setHasCreatorProfile(false);
        setHasBrandProfile(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Check for new changelog updates
  useEffect(() => {
    const checkNewUpdates = async () => {
      try {
        const { data } = await supabase
          .from("platform_changelog")
          .select("published_at")
          .eq("is_published", true)
          .order("published_at", { ascending: false })
          .limit(1)
          .single();

        if (data?.published_at) {
          const lastVisited = localStorage.getItem("whats_new_last_visited");
          if (!lastVisited || new Date(data.published_at) > new Date(lastVisited)) {
            setHasNewUpdates(true);
          }
        }
      } catch (error) {
        // No published entries or error, don't show badge
      }
    };

    checkNewUpdates();
  }, []);

  const checkAdminRole = async (userId: string) => {
    const { data } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId)
      .eq('role', 'admin')
      .maybeSingle();
    setIsAdmin(!!data);
  };

  const checkCreatorStatus = async (userId: string) => {
    const { data } = await supabase
      .from('creator_profiles')
      .select('id')
      .eq('user_id', userId)
      .maybeSingle();
    setHasCreatorProfile(!!data);
  };

  const checkBrandProfile = async (userId: string) => {
    const { data } = await supabase
      .from('brand_profiles')
      .select('id')
      .eq('user_id', userId)
      .maybeSingle();
    setHasBrandProfile(!!data);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <nav className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <Logo size="md" />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="text-sm font-medium text-foreground/80 hover:text-primary transition-colors flex items-center gap-1"
                onClick={() => {
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
                <Notifications />
                {/* Upgrade badge for brands on free tier */}
                {hasBrandProfile && <NavbarUpgradeBadge />}
                {isAdmin && (
                  <Link to="/admin">
                    <Button variant="outline" size="sm" className="gap-2">
                      <Shield className="h-4 w-4" />
                      Admin Dashboard
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
                      <LayoutDashboard className="h-4 w-4" />
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
                          Super Admin
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
                <Link to="/brand">
                  <Button variant="outline" size="sm">
                    Join as Brand
                  </Button>
                </Link>
                <Link to="/creator">
                  <Button size="sm" className="bg-accent hover:bg-accent-hover">
                    Join as Creator
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
                      onClick={() => setIsOpen(false)}
                      className="text-sm font-medium text-foreground/80 hover:text-primary transition-colors"
                    >
                      {link.label}
                    </Link>
                  ))}
                  
                  {user ? (
                    <>
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
                              <LayoutDashboard className="h-4 w-4" />
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
                      <div className="pt-4 border-t">
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          <p className="text-sm text-muted-foreground">{user.email}</p>
                          {isAdmin && (
                            <Badge variant="default" className="bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs px-1.5 py-0">
                              <Crown className="h-3 w-3 mr-0.5" />
                              Super Admin
                            </Badge>
                          )}
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
                      <Link to="/brand" onClick={() => setIsOpen(false)}>
                        <Button variant="outline" className="w-full">
                          Join as Brand
                        </Button>
                      </Link>
                      <Link to="/creator" onClick={() => setIsOpen(false)}>
                        <Button className="w-full bg-accent hover:bg-accent-hover">
                          Join as Creator
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
    </nav>
  );
};

export default Navbar;
