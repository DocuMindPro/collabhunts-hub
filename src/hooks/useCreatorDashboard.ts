import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { safeNativeAsync } from "@/lib/supabase-native";
import { checkFollowerEligibility } from "@/config/follower-ranges";

// Fetch and cache creator profile ID — shared across tabs
export const useCreatorProfileId = () =>
  useQuery({
    queryKey: ["creatorProfileId"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data } = await supabase
        .from("creator_profiles")
        .select("id, stats_update_required, display_name")
        .eq("user_id", user.id)
        .maybeSingle();

      if (data) return data;

      // Check delegate access
      const { data: delegate } = await supabase
        .from("account_delegates")
        .select("profile_id")
        .eq("delegate_user_id", user.id)
        .eq("account_type", "creator")
        .eq("status", "active")
        .limit(1)
        .maybeSingle();

      return delegate ? { id: delegate.profile_id, stats_update_required: false, display_name: null } : null;
    },
    staleTime: 5 * 60 * 1000, // 5 min cache
  });

// Fetch and cache creator dashboard stats
export const useCreatorStats = () =>
  useQuery({
    queryKey: ["creatorStats"],
    queryFn: async () => {
      const defaultStats = {
        profileViews: 0,
        totalEarnings: 0,
        pendingBookings: 0,
        unreadMessages: 0,
        profileStatus: "pending" as string,
        matchedOpportunities: [] as any[],
        isFallback: false,
      };

      return safeNativeAsync(async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return defaultStats;

        const { data: profile } = await supabase
          .from("creator_profiles")
          .select("id, status, categories, location_city")
          .eq("user_id", user.id)
          .maybeSingle();

        if (!profile) return defaultStats;

        const { data: conversationsData } = await supabase
          .from("conversations")
          .select("id")
          .eq("creator_profile_id", profile.id);

        const conversationIds = conversationsData?.map(c => c.id) || [];

        const [viewsData, bookingsData, messagesData, socialData, oppsData] = await Promise.all([
          supabase.from("profile_views").select("*", { count: "exact", head: true }).eq("creator_profile_id", profile.id),
          supabase.from("bookings").select("status, total_price_cents").eq("creator_profile_id", profile.id),
          conversationIds.length > 0
            ? supabase.from("messages").select("id, is_read").eq("is_read", false).in("conversation_id", conversationIds)
            : { data: [] },
          supabase.from("creator_social_accounts").select("follower_count").eq("creator_profile_id", profile.id),
          supabase
            .from("brand_opportunities")
            .select("id, title, package_type, event_date, is_paid, budget_cents, required_categories, location_city, follower_ranges, min_followers, brand_profiles(company_name, venue_name, logo_url)")
            .eq("status", "open")
            .gte("event_date", new Date().toISOString().split('T')[0])
            .order("created_at", { ascending: false })
            .limit(30),
        ]);

        const maxFollowers = socialData.data?.reduce((max, acc) => {
          const count = Number(acc.follower_count) || 0;
          return count > max ? count : max;
        }, 0) || 0;

        const allOpps = oppsData.data || [];
        const scored = allOpps.map((opp: any) => {
          let score = 0;
          if (maxFollowers > 0 && checkFollowerEligibility(maxFollowers, opp.follower_ranges)) score += 3;
          if (opp.required_categories?.some((cat: string) => profile.categories?.includes(cat))) score += 2;
          if (opp.location_city && opp.location_city === profile.location_city) score += 1;
          return { ...opp, score };
        });

        const matched = scored.filter((o: any) => o.score > 0).sort((a: any, b: any) => b.score - a.score).slice(0, 5);
        const matchedOpportunities = matched.length > 0 ? matched : allOpps.slice(0, 3);
        const isFallback = matched.length === 0;

        const completedBookings = bookingsData.data?.filter(b => b.status === "completed") || [];
        const totalEarnings = completedBookings.reduce((sum, b) => sum + b.total_price_cents, 0);
        const pendingBookings = bookingsData.data?.filter(b => b.status === "pending").length || 0;

        return {
          profileViews: viewsData.count || 0,
          totalEarnings: totalEarnings / 100,
          pendingBookings,
          unreadMessages: messagesData.data?.length || 0,
          profileStatus: profile.status,
          matchedOpportunities,
          isFallback,
        };
      }, defaultStats, 8000);
    },
    staleTime: 60 * 1000, // 60s cache — avoids re-fetch on every tab switch
    gcTime: 5 * 60 * 1000,
  });

// Fetch and cache creator bookings
export const useCreatorBookings = (creatorProfileId: string | null | undefined) =>
  useQuery({
    queryKey: ["creatorBookings", creatorProfileId],
    enabled: !!creatorProfileId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("bookings")
        .select(`
          id, package_type, event_date, event_time_start, event_time_end,
          total_price_cents, deposit_amount_cents, platform_fee_cents,
          status, escrow_status, message, max_capacity, created_at,
          brand_profiles!bookings_brand_profile_id_fkey (id, company_name, venue_name, venue_city)
        `)
        .eq("creator_profile_id", creatorProfileId!)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return (data || []).map((b) => ({ ...b, brand_profile: b.brand_profiles }));
    },
    staleTime: 30 * 1000, // 30s cache
  });
