import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { BrandRegistrationContext } from "@/contexts/BrandRegistrationContext";

interface BrandProtectedRouteProps {
  children: React.ReactNode;
}

const BrandProtectedRoute = ({ children }: BrandProtectedRouteProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [hasAccess, setHasAccess] = useState(false);
  const [registrationCompleted, setRegistrationCompleted] = useState(false);
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
        .from("brand_profiles")
        .select("id, registration_completed")
        .eq("user_id", userId)
        .maybeSingle();

      if (ownProfile) {
        setHasAccess(true);
        setRegistrationCompleted(ownProfile.registration_completed);
        setLoading(false);
        return;
      }

      // Check delegate access
      const { data: delegateAccess } = await supabase
        .from("account_delegates")
        .select("id, profile_id")
        .eq("delegate_user_id", userId)
        .eq("account_type", "brand")
        .eq("status", "active")
        .limit(1);

      if (delegateAccess && delegateAccess.length > 0) {
        // Fetch registration status for delegated profile
        const { data: delegatedProfile } = await supabase
          .from("brand_profiles")
          .select("registration_completed")
          .eq("id", delegateAccess[0].profile_id)
          .maybeSingle();

        setHasAccess(true);
        setRegistrationCompleted(delegatedProfile?.registration_completed ?? false);
        setLoading(false);
        return;
      }

      // Auto-link pending invites by email
      if (email) {
        const { data: pending } = await supabase
          .from("account_delegates")
          .select("id")
          .eq("delegate_email", email.toLowerCase())
          .eq("account_type", "brand")
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
          setRegistrationCompleted(true); // delegates get full access
          setLoading(false);
          return;
        }
      }

      setHasAccess(false);
    } catch (error) {
      console.error("Error checking brand access:", error);
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

  if (!hasAccess) {
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

  return (
    <BrandRegistrationContext.Provider value={{ registrationCompleted }}>
      {children}
    </BrandRegistrationContext.Provider>
  );
};

export default BrandProtectedRoute;
