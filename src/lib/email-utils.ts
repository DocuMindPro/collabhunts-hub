import { supabase } from "@/integrations/supabase/client";

/**
 * Fire-and-forget email notification utility.
 * Never blocks the UI or throws errors to the caller.
 */
export function sendNotificationEmail(
  type: string,
  toEmail: string,
  data: Record<string, any>,
  toName?: string
) {
  // Fire-and-forget: don't await this in calling code
  supabase.functions
    .invoke("send-notification-email", {
      body: { type, to_email: toEmail, to_name: toName, data },
    })
    .then(({ error }) => {
      if (error) {
        console.error(`[email-utils] Failed to send ${type} email:`, error);
      } else {
        console.log(`[email-utils] Sent ${type} email to ${toEmail}`);
      }
    })
    .catch((err) => {
      console.error(`[email-utils] Network error sending ${type} email:`, err);
    });
}

/**
 * Look up the email for a brand profile and send a notification.
 */
export async function sendBrandEmail(
  type: string,
  brandProfileId: string,
  data: Record<string, any>
) {
  try {
    const { data: brand } = await supabase
      .from("brand_profiles")
      .select("user_id, company_name")
      .eq("id", brandProfileId)
      .single();

    if (!brand) return;

    const { data: profile } = await supabase
      .from("profiles")
      .select("email")
      .eq("id", brand.user_id)
      .single();

    if (!profile?.email) return;

    sendNotificationEmail(type, profile.email, data, brand.company_name);
  } catch (err) {
    console.error(`[email-utils] Error looking up brand for ${type}:`, err);
  }
}

/**
 * Look up the email for a creator profile and send a notification.
 */
export async function sendCreatorEmail(
  type: string,
  creatorProfileId: string,
  data: Record<string, any>
) {
  try {
    const { data: creator } = await supabase
      .from("creator_profiles")
      .select("user_id, display_name")
      .eq("id", creatorProfileId)
      .single();

    if (!creator) return;

    const { data: profile } = await supabase
      .from("profiles")
      .select("email")
      .eq("id", creator.user_id)
      .single();

    if (!profile?.email) return;

    sendNotificationEmail(type, profile.email, data, creator.display_name);
  } catch (err) {
    console.error(`[email-utils] Error looking up creator for ${type}:`, err);
  }
}

/**
 * Send email to admin(s).
 */
export function sendAdminEmail(type: string, data: Record<string, any>) {
  // Admin email - send to the platform admin address
  sendNotificationEmail(type, "care@collabhunts.com", data, "Admin");
}
