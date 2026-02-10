import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { safeNativeAsync } from "@/lib/supabase-native";

const LAST_VIEWED_KEY = "opportunities_last_viewed";

export const useNewOpportunitiesCount = (enabled: boolean) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!enabled) return;

    const fetchCount = async () => {
      const lastViewed = localStorage.getItem(LAST_VIEWED_KEY);
      
      const result = await safeNativeAsync(
        async () => {
          let query = supabase
            .from("brand_opportunities")
            .select("id", { count: "exact", head: true })
            .eq("status", "open")
            .gte("event_date", new Date().toISOString().split('T')[0]);

          if (lastViewed) {
            query = query.gte("created_at", lastViewed);
          }

          const { count } = await query;
          return count || 0;
        },
        0
      );

      setCount(result);
    };

    fetchCount();
  }, [enabled]);

  const markAsViewed = () => {
    localStorage.setItem(LAST_VIEWED_KEY, new Date().toISOString());
    setCount(0);
  };

  return { count, markAsViewed };
};
