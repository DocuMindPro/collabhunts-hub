import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { formatDistanceToNow } from "date-fns";

// Fetch and cache brand profile ID
export const useBrandProfileId = () =>
  useQuery({
    queryKey: ["brandProfileId"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data } = await supabase
        .from("brand_profiles")
        .select("id")
        .eq("user_id", user.id)
        .maybeSingle();

      if (data) return data.id as string;

      const { data: delegate } = await supabase
        .from("account_delegates")
        .select("profile_id")
        .eq("delegate_user_id", user.id)
        .eq("account_type", "brand")
        .eq("status", "active")
        .limit(1)
        .maybeSingle();

      return delegate ? (delegate.profile_id as string) : null;
    },
    staleTime: 5 * 60 * 1000,
  });

// Fetch and cache brand overview stats
export const useBrandStats = () =>
  useQuery({
    queryKey: ["brandStats"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data: profile } = await supabase
        .from("brand_profiles")
        .select("id")
        .eq("user_id", user.id)
        .single();

      if (!profile) return null;

      const { data: bookingsData } = await supabase
        .from("bookings")
        .select("id, status, total_price_cents, created_at, creator_profile_id")
        .eq("brand_profile_id", profile.id)
        .order("created_at", { ascending: false });

      const completedBookings = bookingsData?.filter(b => b.status === "completed") || [];
      const totalSpent = completedBookings.reduce((sum, b) => sum + b.total_price_cents, 0);
      const activeEvents = bookingsData?.filter(b => b.status === "accepted").length || 0;
      const pendingRequests = bookingsData?.filter(b => b.status === "pending").length || 0;

      // Build recent activity
      const activities: Array<{ id: string; description: string; timeAgo: string }> = [];

      if (bookingsData && bookingsData.length > 0) {
        const creatorIds = [...new Set(bookingsData.map(b => b.creator_profile_id))];
        const { data: creators } = await supabase
          .from("creator_profiles")
          .select("id, display_name")
          .in("id", creatorIds);

        const creatorMap = new Map(creators?.map(c => [c.id, c.display_name]) || []);

        bookingsData.slice(0, 5).forEach(booking => {
          const creatorName = creatorMap.get(booking.creator_profile_id) || "Creator";
          const descriptions: Record<string, string> = {
            completed: `Booking completed with ${creatorName}`,
            accepted: `Booking confirmed with ${creatorName}`,
            pending: `Booking request sent to ${creatorName}`,
            cancelled: `Booking cancelled with ${creatorName}`,
          };
          activities.push({
            id: booking.id,
            description: descriptions[booking.status] || `Booking with ${creatorName}`,
            timeAgo: formatDistanceToNow(new Date(booking.created_at), { addSuffix: true }),
          });
        });
      }

      return {
        totalSpent: totalSpent / 100,
        activeEvents,
        completedEvents: completedBookings.length,
        pendingRequests,
        recentActivity: activities.slice(0, 3),
      };
    },
    staleTime: 60 * 1000,
    gcTime: 5 * 60 * 1000,
  });

// Fetch and cache brand bookings
export const useBrandBookings = (brandProfileId: string | null | undefined) =>
  useQuery({
    queryKey: ["brandBookings", brandProfileId],
    enabled: !!brandProfileId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("bookings")
        .select(`
          id, package_type, event_date, event_time_start, event_time_end,
          total_price_cents, deposit_amount_cents, status, escrow_status,
          message, max_capacity, created_at,
          creator_profiles!bookings_creator_profile_id_fkey (id, display_name, profile_image_url)
        `)
        .eq("brand_profile_id", brandProfileId!)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return (data || []).map((b) => ({ ...b, creator_profile: b.creator_profiles }));
    },
    staleTime: 30 * 1000,
  });
