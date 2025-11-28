import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";

interface CreatorProtectedRouteProps {
  children: React.ReactNode;
}

const CreatorProtectedRoute = ({ children }: CreatorProtectedRouteProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [creatorStatus, setCreatorStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      
      if (session?.user) {
        setTimeout(() => {
          checkCreatorStatus(session.user.id);
        }, 0);
      } else {
        setLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      
      if (session?.user) {
        setTimeout(() => {
          checkCreatorStatus(session.user.id);
        }, 0);
      } else {
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const checkCreatorStatus = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("creator_profiles")
        .select("status")
        .eq("user_id", userId)
        .maybeSingle();

      if (error) {
        console.error("Error checking creator status:", error);
        setCreatorStatus(null);
      } else {
        setCreatorStatus(data?.status || null);
      }
    } catch (error) {
      console.error("Error checking creator status:", error);
      setCreatorStatus(null);
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

  if (!creatorStatus) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <h1 className="text-3xl font-heading font-bold mb-4">No Creator Profile</h1>
          <p className="text-muted-foreground mb-6">
            You need to create a creator profile to access this dashboard.
          </p>
          <a href="/creator-signup" className="text-primary hover:underline">
            Create Creator Profile
          </a>
        </div>
      </div>
    );
  }

  if (creatorStatus === "pending") {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <h1 className="text-3xl font-heading font-bold mb-4">Profile Under Review</h1>
          <p className="text-muted-foreground">
            Your creator profile is currently being reviewed by our team. 
            You'll receive an email once it's approved.
          </p>
        </div>
      </div>
    );
  }

  if (creatorStatus === "rejected") {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <h1 className="text-3xl font-heading font-bold mb-4">Profile Not Approved</h1>
          <p className="text-muted-foreground">
            Unfortunately, your creator profile was not approved. Please contact support for more information.
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default CreatorProtectedRoute;
