import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";

interface BrandProtectedRouteProps {
  children: React.ReactNode;
}

const BrandProtectedRoute = ({ children }: BrandProtectedRouteProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [hasBrandProfile, setHasBrandProfile] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      
      if (session?.user) {
        setTimeout(() => {
          checkBrandProfile(session.user.id);
        }, 0);
      } else {
        setLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      
      if (session?.user) {
        setTimeout(() => {
          checkBrandProfile(session.user.id);
        }, 0);
      } else {
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const checkBrandProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("brand_profiles")
        .select("id")
        .eq("user_id", userId)
        .maybeSingle();

      if (error) {
        console.error("Error checking brand profile:", error);
        setHasBrandProfile(false);
      } else {
        setHasBrandProfile(!!data);
      }
    } catch (error) {
      console.error("Error checking brand profile:", error);
      setHasBrandProfile(false);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!hasBrandProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <h1 className="text-3xl font-heading font-bold mb-4">No Brand Profile</h1>
          <p className="text-muted-foreground mb-6">
            You need to create a brand profile to access this dashboard.
          </p>
          <a href="/brand-signup" className="text-primary hover:underline">
            Create Brand Profile
          </a>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default BrandProtectedRoute;
