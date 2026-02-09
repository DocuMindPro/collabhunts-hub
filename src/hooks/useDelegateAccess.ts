import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface DelegateAccess {
  profileId: string;
  accountType: "brand" | "creator";
}

/**
 * Hook that checks if the current user has delegate access to any brand/creator profiles.
 * Also auto-links pending invites on login.
 */
export const useDelegateAccess = () => {
  const [delegateAccess, setDelegateAccess] = useState<DelegateAccess[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const check = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user?.email) {
          setLoading(false);
          return;
        }

        // Auto-link pending invites for this email
        const { data: pending } = await supabase
          .from("account_delegates")
          .select("id")
          .eq("delegate_email", user.email.toLowerCase())
          .eq("status", "pending");

        if (pending && pending.length > 0) {
          for (const invite of pending) {
            await supabase
              .from("account_delegates")
              .update({
                delegate_user_id: user.id,
                status: "active",
                accepted_at: new Date().toISOString(),
              })
              .eq("id", invite.id);
          }
        }

        // Fetch all active delegate access
        const { data: active } = await supabase
          .from("account_delegates")
          .select("profile_id, account_type")
          .eq("delegate_user_id", user.id)
          .eq("status", "active");

        if (active) {
          setDelegateAccess(
            active.map((a) => ({
              profileId: a.profile_id,
              accountType: a.account_type as "brand" | "creator",
            }))
          );
        }
      } catch (error) {
        console.error("Error checking delegate access:", error);
      } finally {
        setLoading(false);
      }
    };

    check();
  }, []);

  return { delegateAccess, loading };
};
