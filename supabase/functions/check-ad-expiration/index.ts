import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Starting ad expiration check...");

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const now = new Date().toISOString();

    // Find all active ads where end_date has passed
    const { data: expiredAds, error: fetchError } = await supabase
      .from("ad_placements")
      .select("id, placement_name, advertiser_name, end_date")
      .eq("is_active", true)
      .not("end_date", "is", null)
      .lt("end_date", now);

    if (fetchError) {
      console.error("Error fetching expired ads:", fetchError);
      throw fetchError;
    }

    console.log(`Found ${expiredAds?.length || 0} expired ads`);

    if (!expiredAds || expiredAds.length === 0) {
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: "No expired ads found",
          deactivated: 0,
          reset: 0
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Reset expired ads - clear all data and deactivate
    const { error: updateError } = await supabase
      .from("ad_placements")
      .update({
        is_active: false,
        advertiser_name: null,
        image_url: null,
        link_url: null,
        link_type: "external",
        advertiser_type: "external",
        start_date: null,
        end_date: null,
        notes: null,
      })
      .in("id", expiredAds.map(ad => ad.id));

    if (updateError) {
      console.error("Error resetting expired ads:", updateError);
      throw updateError;
    }

    console.log(`Reset ${expiredAds.length} expired ads`);

    // Log which ads were reset
    for (const ad of expiredAds) {
      console.log(`Reset ad: ${ad.placement_name} (advertiser: ${ad.advertiser_name}, expired: ${ad.end_date})`);
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Reset ${expiredAds.length} expired ads`,
        reset: expiredAds.length,
        ads: expiredAds.map(ad => ({ 
          placement_name: ad.placement_name, 
          advertiser_name: ad.advertiser_name 
        }))
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: any) {
    console.error("Ad expiration check failed:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});
