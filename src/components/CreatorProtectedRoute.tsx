import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";

interface CreatorProtectedRouteProps {
  children: React.ReactNode;
}

const CreatorProtectedRoute = ({ children }: CreatorProtectedRouteProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [hasAccess, setHasAccess] = useState(false);
  const [isRejected, setIsRejected] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        setTimeout(() => checkAccess(session.user.id, session.user.email), 0);
      } else {
        setLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        setTimeout(() => checkAccess(session.user.id, session.user.email), 0);
      } else {
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const checkAccess = async (userId: string, email?: string) => {
    try {
      // Check direct ownership
      const { data: ownProfile } = await supabase
        .from("creator_profiles")
        .select("status")
        .eq("user_id", userId)
        .maybeSingle();

      if (ownProfile) {
        if (ownProfile.status === "rejected") {
          setIsRejected(true);
        } else {
          setHasAccess(true);
        }
        setLoading(false);
        return;
      }

      // Check delegate access
      const { data: delegateAccess } = await supabase
        .from("account_delegates")
        .select("id")
        .eq("delegate_user_id", userId)
        .eq("account_type", "creator")
        .eq("status", "active")
        .limit(1);

      if (delegateAccess && delegateAccess.length > 0) {
        setHasAccess(true);
        setLoading(false);
        return;
      }

      // Auto-link pending invites
      if (email) {
        const { data: pending } = await supabase
          .from("account_delegates")
          .select("id")
          .eq("delegate_email", email.toLowerCase())
          .eq("account_type", "creator")
          .eq("status", "pending");

        if (pending && pending.length > 0) {
          for (const invite of pending) {
            await supabase
              .from("account_delegates")
              .update({
                delegate_user_id: userId,
                status: "active",
                accepted_at: new Date().toISOString(),
              })
              .eq("id", invite.id);
          }
          setHasAccess(true);
          setLoading(false);
          return;
        }
      }

      setHasAccess(false);
    } catch (error) {
      console.error("Error checking creator access:", error);
      setHasAccess(false);
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

  if (isRejected) {
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

  if (!hasAccess) {
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

  return <>{children}</>;
};

export default CreatorProtectedRoute;
