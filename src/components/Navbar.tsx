import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, Shield, LogOut, LayoutDashboard } from "lucide-react";
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
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [hasCreatorProfile, setHasCreatorProfile] = useState(false);
  const [hasBrandProfile, setHasBrandProfile] = useState(false);

  const navLinks = [
    { to: "/influencers", label: "Search" },
    { to: "/campaigns", label: "Campaigns" },
    { to: "/#how-it-works", label: "How It Works" },
    { to: "/pricing", label: "Pricing" },
  ];

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
          <Link to="/" className="flex items-center space-x-2">
            <div className="flex items-center">
              <span className="text-2xl font-heading font-bold bg-gradient-accent bg-clip-text text-transparent">
                CollabHunts
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="text-sm font-medium text-foreground/80 hover:text-primary transition-colors"
              >
                {link.label}
              </Link>
            ))}
            
            {user ? (
              <>
                <Notifications />
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
                      {isAdmin && (
                        <Link to="/admin" onClick={() => setIsOpen(false)}>
                          <Button variant="outline" className="w-full gap-2">
                            <Shield className="h-4 w-4" />
                            Admin Dashboard
                          </Button>
                        </Link>
                      )}
                      {hasCreatorProfile && (
                        <Link to="/creator-dashboard" onClick={() => setIsOpen(false)}>
                          <Button variant="outline" className="w-full gap-2">
                            <LayoutDashboard className="h-4 w-4" />
                            Creator Dashboard
                          </Button>
                        </Link>
                      )}
                      {hasBrandProfile && (
                        <Link to="/brand-dashboard" onClick={() => setIsOpen(false)}>
                          <Button variant="outline" className="w-full gap-2">
                            <LayoutDashboard className="h-4 w-4" />
                            Brand Dashboard
                          </Button>
                        </Link>
                      )}
                      <div className="pt-4 border-t">
                        <p className="text-sm text-muted-foreground mb-2">{user.email}</p>
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
