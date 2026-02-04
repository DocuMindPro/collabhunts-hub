import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { isNativePlatform, safeNativeAsync } from "@/lib/supabase-native";

export const useUnreadMessages = () => {
  const [unreadCount, setUnreadCount] = useState(0);
  const [profileType, setProfileType] = useState<"creator" | "brand" | null>(null);

  useEffect(() => {
    const isNative = isNativePlatform();
    let channel: ReturnType<typeof supabase.channel> | null = null;

    const fetchUnreadCount = async () => {
      const session = await safeNativeAsync(
        async () => {
          const { data } = await supabase.auth.getSession();
          return data.session;
        },
        null
      );

      if (!session?.user) {
        setUnreadCount(0);
        setProfileType(null);
        return;
      }

      const userId = session.user.id;

      // Check for creator profile first
      const creatorProfile = await safeNativeAsync(
        async () => {
          const { data } = await supabase
            .from("creator_profiles")
            .select("id")
            .eq("user_id", userId)
            .maybeSingle();
          return data;
        },
        null
      );

      // Check for brand profile
      const brandProfile = await safeNativeAsync(
        async () => {
          const { data } = await supabase
            .from("brand_profiles")
            .select("id")
            .eq("user_id", userId)
            .maybeSingle();
          return data;
        },
        null
      );

      // Determine profile type (prioritize creator)
      if (creatorProfile) {
        setProfileType("creator");
      } else if (brandProfile) {
        setProfileType("brand");
      } else {
        setProfileType(null);
        setUnreadCount(0);
        return;
      }

      // Get conversations for the user's profile
      let conversationIds: string[] = [];

      if (creatorProfile) {
        const conversations = await safeNativeAsync(
          async () => {
            const { data } = await supabase
              .from("conversations")
              .select("id")
              .eq("creator_profile_id", creatorProfile.id);
            return data;
          },
          []
        );
        conversationIds = conversations?.map((c) => c.id) || [];
      } else if (brandProfile) {
        const conversations = await safeNativeAsync(
          async () => {
            const { data } = await supabase
              .from("conversations")
              .select("id")
              .eq("brand_profile_id", brandProfile.id);
            return data;
          },
          []
        );
        conversationIds = conversations?.map((c) => c.id) || [];
      }

      if (conversationIds.length === 0) {
        setUnreadCount(0);
        return;
      }

      // Count unread messages not sent by current user
      const count = await safeNativeAsync(
        async () => {
          const { count } = await supabase
            .from("messages")
            .select("*", { count: "exact", head: true })
            .in("conversation_id", conversationIds)
            .eq("is_read", false)
            .neq("sender_id", userId);
          return count;
        },
        0
      );

      setUnreadCount(count || 0);
    };

    // Initial fetch with delay for native
    if (isNative) {
      setTimeout(fetchUnreadCount, 500);
    } else {
      fetchUnreadCount();
    }

    // Subscribe to auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        setTimeout(fetchUnreadCount, isNative ? 300 : 0);
      } else {
        setUnreadCount(0);
        setProfileType(null);
      }
    });

    // Subscribe to realtime updates for messages (web only)
    if (!isNative) {
      channel = supabase
        .channel("navbar-messages")
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "messages",
          },
          () => {
            // Refetch count when messages change
            fetchUnreadCount();
          }
        )
        .subscribe();
    }

    return () => {
      subscription.unsubscribe();
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, []);

  const getMessagesLink = () => {
    if (profileType === "creator") return "/creator-dashboard?tab=messages";
    if (profileType === "brand") return "/brand-dashboard?tab=messages";
    return "/login";
  };

  return { unreadCount, profileType, getMessagesLink };
};
