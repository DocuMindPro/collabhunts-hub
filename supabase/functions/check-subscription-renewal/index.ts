import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    // Get all active paid subscriptions
    const { data: subscriptions, error: fetchError } = await supabase
      .from("brand_subscriptions")
      .select(`
        id,
        brand_profile_id,
        plan_type,
        status,
        current_period_end,
        brand_profiles (
          company_name,
          user_id
        )
      `)
      .eq("status", "active")
      .neq("plan_type", "none");

    if (fetchError) {
      throw fetchError;
    }

    const results = {
      sevenDayReminders: 0,
      threeDayReminders: 0,
      expired: 0,
      winbackEmails: 0,
    };

    for (const sub of subscriptions ?? []) {
      const periodEnd = new Date(sub.current_period_end);
      const brandProfiles = sub.brand_profiles as { company_name: string; user_id: string } | { company_name: string; user_id: string }[];
      const brandProfile = Array.isArray(brandProfiles) ? brandProfiles[0] : brandProfiles;
      
      if (!brandProfile) continue;

      // Get brand email
      const { data: profile } = await supabase
        .from("profiles")
        .select("email")
        .eq("id", brandProfile.user_id)
        .single();

      if (!profile?.email) continue;

      const daysUntilExpiry = Math.ceil((periodEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

      // 7 days before expiry
      if (daysUntilExpiry === 7) {
        await sendNotificationEmail(supabase, {
          type: "brand_subscription_expiring_7days",
          to_email: profile.email,
          to_name: brandProfile.company_name,
          data: {
            plan_type: sub.plan_type,
            expiry_date: periodEnd.toLocaleDateString(),
          },
        });

        // In-app notification
        await supabase.from("notifications").insert({
          user_id: brandProfile.user_id,
          title: "⏰ Subscription Expiring Soon",
          message: `Your ${sub.plan_type} subscription expires in 7 days. Renew to keep your features!`,
          type: "subscription",
          link: "/brand-dashboard?tab=subscription",
        });

        results.sevenDayReminders++;
      }

      // 3 days before expiry
      if (daysUntilExpiry === 3) {
        await sendNotificationEmail(supabase, {
          type: "brand_subscription_expiring_3days",
          to_email: profile.email,
          to_name: brandProfile.company_name,
          data: {
            plan_type: sub.plan_type,
            expiry_date: periodEnd.toLocaleDateString(),
          },
        });

        // In-app notification
        await supabase.from("notifications").insert({
          user_id: brandProfile.user_id,
          title: "🚨 3 Days Left on Your Subscription",
          message: `Your ${sub.plan_type} subscription expires in 3 days. Don't lose access!`,
          type: "subscription",
          link: "/brand-dashboard?tab=subscription",
        });

        results.threeDayReminders++;
      }

      // On expiry day - auto-downgrade
      if (daysUntilExpiry <= 0) {
        // Mark subscription as expired
        await supabase
          .from("brand_subscriptions")
          .update({ status: "expired" })
          .eq("id", sub.id);

        // Check if they already have a 'none' subscription
        const { data: existingNone } = await supabase
          .from("brand_subscriptions")
          .select("id")
          .eq("brand_profile_id", sub.brand_profile_id)
          .eq("plan_type", "none")
          .eq("status", "active")
          .maybeSingle();

        // Create new 'none' subscription if needed
        if (!existingNone) {
          const nonePeriodEnd = new Date();
          nonePeriodEnd.setFullYear(nonePeriodEnd.getFullYear() + 1);

          await supabase.from("brand_subscriptions").insert({
            brand_profile_id: sub.brand_profile_id,
            plan_type: "none",
            status: "active",
            current_period_end: nonePeriodEnd.toISOString(),
          });
        }

        await sendNotificationEmail(supabase, {
          type: "brand_subscription_expired",
          to_email: profile.email,
          to_name: brandProfile.company_name,
          data: {
            plan_type: sub.plan_type,
          },
        });

        // In-app notification
        await supabase.from("notifications").insert({
          user_id: brandProfile.user_id,
          title: "❌ Subscription Expired",
          message: `Your ${sub.plan_type} subscription has expired. Upgrade to restore your features.`,
          type: "subscription",
          link: "/brand-dashboard?tab=subscription",
        });

        results.expired++;
      }
    }

    // Win-back emails for subscriptions that expired 7 days ago
    const { data: expiredSubs } = await supabase
      .from("brand_subscriptions")
      .select(`
        id,
        brand_profile_id,
        plan_type,
        current_period_end,
        brand_profiles (
          company_name,
          user_id
        )
      `)
      .eq("status", "expired")
      .neq("plan_type", "none")
      .gte("current_period_end", sevenDaysAgo.toISOString())
      .lt("current_period_end", new Date(sevenDaysAgo.getTime() + 24 * 60 * 60 * 1000).toISOString());

    for (const sub of expiredSubs ?? []) {
      const brandProfiles = sub.brand_profiles as { company_name: string; user_id: string } | { company_name: string; user_id: string }[];
      const brandProfile = Array.isArray(brandProfiles) ? brandProfiles[0] : brandProfiles;

      if (!brandProfile) continue;

      const { data: profile } = await supabase
        .from("profiles")
        .select("email")
        .eq("id", brandProfile.user_id)
        .single();

      if (!profile?.email) continue;

      // Check if they haven't resubscribed
      const { data: activeSub } = await supabase
        .from("brand_subscriptions")
        .select("id")
        .eq("brand_profile_id", sub.brand_profile_id)
        .eq("status", "active")
        .neq("plan_type", "none")
        .maybeSingle();

      if (!activeSub) {
        await sendNotificationEmail(supabase, {
          type: "brand_subscription_winback",
          to_email: profile.email,
          to_name: brandProfile.company_name,
          data: {
            plan_type: sub.plan_type,
          },
        });

        results.winbackEmails++;
      }
    }

    console.log("Subscription renewal check completed:", results);

    return new Response(JSON.stringify({ success: true, results }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: unknown) {
    console.error("Error in subscription renewal check:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function sendNotificationEmail(
  supabase: any,
  params: {
    type: string;
    to_email: string;
    to_name: string;
    data: Record<string, unknown>;
  }
) {
  try {
    await supabase.functions.invoke("send-notification-email", {
      body: params,
    });
  } catch (error) {
    console.error("Error sending email:", error);
  }
}
