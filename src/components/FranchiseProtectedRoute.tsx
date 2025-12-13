import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";

interface FranchiseProtectedRouteProps {
  children: React.ReactNode;
}

const FranchiseProtectedRoute = ({ children }: FranchiseProtectedRouteProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [franchiseStatus, setFranchiseStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        setTimeout(() => {
          checkFranchiseStatus(session.user.id);
        }, 0);
      } else {
        setFranchiseStatus(null);
        setLoading(false);
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        checkFranchiseStatus(session.user.id);
      } else {
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const checkFranchiseStatus = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("franchise_owners")
        .select("status")
        .eq("user_id", userId)
        .maybeSingle();

      if (error) throw error;
      setFranchiseStatus(data?.status ?? null);
    } catch (error) {
      console.error("Error checking franchise status:", error);
      setFranchiseStatus(null);
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

  if (!franchiseStatus) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Access Denied</h2>
          <p className="text-muted-foreground">You don't have a franchise account.</p>
        </div>
      </div>
    );
  }

  if (franchiseStatus !== "active") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Account Pending</h2>
          <p className="text-muted-foreground">Your franchise account is awaiting activation.</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default FranchiseProtectedRoute;
