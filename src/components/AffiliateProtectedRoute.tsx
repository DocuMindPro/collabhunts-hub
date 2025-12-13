import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";

interface AffiliateProtectedRouteProps {
  children: React.ReactNode;
}

const AffiliateProtectedRoute = ({ children }: AffiliateProtectedRouteProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [affiliateStatus, setAffiliateStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        setTimeout(() => {
          checkAffiliateStatus(session.user.id);
        }, 0);
      } else {
        setAffiliateStatus(null);
        setLoading(false);
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        checkAffiliateStatus(session.user.id);
      } else {
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const checkAffiliateStatus = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("affiliates")
        .select("status")
        .eq("user_id", userId)
        .maybeSingle();

      if (error) throw error;
      setAffiliateStatus(data?.status ?? null);
    } catch (error) {
      console.error("Error checking affiliate status:", error);
      setAffiliateStatus(null);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!affiliateStatus) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Access Denied</h2>
          <p className="text-muted-foreground">You don't have an affiliate account.</p>
        </div>
      </div>
    );
  }

  if (affiliateStatus !== "active") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Account Pending</h2>
          <p className="text-muted-foreground">Your affiliate account is awaiting activation.</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default AffiliateProtectedRoute;
