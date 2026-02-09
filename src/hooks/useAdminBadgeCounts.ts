import { useEffect, useState, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";

interface BadgeCounts {
  venues: number;
  approvals: number;
  careers: number;
  disputes: number;
  verifications: number;
  revenue: number;
}

const EMPTY_COUNTS: BadgeCounts = {
  venues: 0,
  approvals: 0,
  careers: 0,
  disputes: 0,
  verifications: 0,
  revenue: 0,
};

type TabKey = keyof BadgeCounts;

export function useAdminBadgeCounts() {
  const [counts, setCounts] = useState<BadgeCounts>(EMPTY_COUNTS);
  const [seenCounts, setSeenCounts] = useState<Partial<BadgeCounts>>({});
  const [loading, setLoading] = useState(true);
  const intervalRef = useRef<ReturnType<typeof setInterval>>();

  const fetchCounts = useCallback(async () => {
    try {
      const [
        { count: venues },
        { count: approvals },
        { count: careers },
        { count: disputes },
        { count: verifications },
        { count: franchisePayouts },
        { count: affiliatePayouts },
      ] = await Promise.all([
        supabase.from("quotation_inquiries").select("*", { count: "exact", head: true }).eq("status", "pending"),
        supabase.from("creator_profiles").select("*", { count: "exact", head: true }).eq("status", "pending"),
        supabase.from("career_applications").select("*", { count: "exact", head: true }).eq("status", "pending"),
        supabase.from("booking_disputes").select("*", { count: "exact", head: true }).in("status", ["open", "awaiting_response", "pending_response", "pending_admin_review"]),
        supabase.from("brand_profiles").select("*", { count: "exact", head: true }).eq("verification_status", "pending"),
        supabase.from("franchise_payout_requests").select("*", { count: "exact", head: true }).eq("status", "pending"),
        supabase.from("affiliate_payout_requests").select("*", { count: "exact", head: true }).eq("status", "pending"),
      ]);

      setCounts({
        venues: venues || 0,
        approvals: approvals || 0,
        careers: careers || 0,
        disputes: disputes || 0,
        verifications: verifications || 0,
        revenue: (franchisePayouts || 0) + (affiliatePayouts || 0),
      });
    } catch (error) {
      console.error("Error fetching admin badge counts:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCounts();
    intervalRef.current = setInterval(fetchCounts, 2 * 60 * 1000);
    return () => clearInterval(intervalRef.current);
  }, [fetchCounts]);

  const markSeen = useCallback((tab: string) => {
    const key = tab as TabKey;
    if (key in EMPTY_COUNTS) {
      setSeenCounts(prev => ({ ...prev, [key]: counts[key] }));
    }
  }, [counts]);

  // A badge is visible if count > 0 AND (tab hasn't been seen OR count changed since seen)
  const getBadgeCount = useCallback((tab: string): number => {
    const key = tab as TabKey;
    if (!(key in counts)) return 0;
    const count = counts[key];
    if (count === 0) return 0;
    if (seenCounts[key] === count) return 0;
    return count;
  }, [counts, seenCounts]);

  return { counts, loading, markSeen, getBadgeCount, refetch: fetchCounts };
}
