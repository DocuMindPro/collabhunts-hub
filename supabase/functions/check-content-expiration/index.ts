import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "https://esm.sh/resend@2.0.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ExpiringContent {
  id: string;
  title: string | null;
  file_name: string;
  usage_rights_end: string;
  days_remaining: number;
}

interface BrandNotification {
  brand_email: string;
  company_name: string;
  expiring_7_days: ExpiringContent[];
  expiring_3_days: ExpiringContent[];
  expiring_1_day: ExpiringContent[];
  already_expired: ExpiringContent[];
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const resendApiKey = Deno.env.get('RESEND_API_KEY');

    if (!resendApiKey) {
      console.error('RESEND_API_KEY not configured');
      return new Response(JSON.stringify({ error: 'Email service not configured' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const resend = new Resend(resendApiKey);

    console.log('Checking for expiring content...');

    // Get all content with limited rights that hasn't been notified recently
    const now = new Date();
    const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    const { data: expiringContent, error: queryError } = await supabase
      .from('content_library')
      .select(`
        id,
        title,
        file_name,
        usage_rights_end,
        last_expiry_notification_sent,
        brand_profile_id
      `)
      .neq('rights_type', 'perpetual')
      .not('usage_rights_end', 'is', null)
      .lte('usage_rights_end', sevenDaysFromNow.toISOString())
      .or(`last_expiry_notification_sent.is.null,last_expiry_notification_sent.lt.${oneDayAgo.toISOString()}`);

    if (queryError) {
      console.error('Error querying content:', queryError);
      throw queryError;
    }

    if (!expiringContent || expiringContent.length === 0) {
      console.log('No expiring content found');
      return new Response(JSON.stringify({ 
        success: true, 
        message: 'No expiring content to notify about',
        processed: 0 
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log(`Found ${expiringContent.length} expiring content items`);

    // Group content by brand
    const brandNotifications = new Map<string, BrandNotification>();

    for (const content of expiringContent) {
      const brandId = content.brand_profile_id;
      const endDate = new Date(content.usage_rights_end!);
      const daysRemaining = Math.ceil((endDate.getTime() - now.getTime()) / (24 * 60 * 60 * 1000));

      // Get brand profile info
      const { data: brandProfile } = await supabase
        .from('brand_profiles')
        .select('id, company_name, user_id')
        .eq('id', brandId)
        .single();

      if (!brandProfile) continue;

      // Get brand email
      const { data: profile } = await supabase
        .from('profiles')
        .select('email')
        .eq('id', brandProfile.user_id)
        .single();

      if (!profile) continue;

      if (!brandNotifications.has(brandId)) {
        brandNotifications.set(brandId, {
          brand_email: profile.email,
          company_name: brandProfile.company_name,
          expiring_7_days: [],
          expiring_3_days: [],
          expiring_1_day: [],
          already_expired: [],
        });
      }

      const notification = brandNotifications.get(brandId)!;
      const contentInfo: ExpiringContent = {
        id: content.id,
        title: content.title,
        file_name: content.file_name,
        usage_rights_end: content.usage_rights_end,
        days_remaining: daysRemaining,
      };

      if (daysRemaining < 0) {
        notification.already_expired.push(contentInfo);
      } else if (daysRemaining <= 1) {
        notification.expiring_1_day.push(contentInfo);
      } else if (daysRemaining <= 3) {
        notification.expiring_3_days.push(contentInfo);
      } else {
        notification.expiring_7_days.push(contentInfo);
      }
    }

    // Send emails to each brand
    let emailsSent = 0;
    const contentIdsToUpdate: string[] = [];

    for (const [brandId, notification] of brandNotifications) {
      const totalItems = 
        notification.expiring_7_days.length + 
        notification.expiring_3_days.length + 
        notification.expiring_1_day.length + 
        notification.already_expired.length;

      if (totalItems === 0) continue;

      // Build email HTML
      const emailHtml = buildExpirationEmailHtml(notification);

      try {
        await resend.emails.send({
          from: 'CollabHunts <notifications@collabhunts.com>',
          to: [notification.brand_email],
          subject: `⚠️ ${totalItems} Content Usage Rights ${notification.already_expired.length > 0 ? 'Expired or ' : ''}Expiring Soon`,
          html: emailHtml,
        });

        console.log(`Email sent to ${notification.brand_email}`);
        emailsSent++;

        // Collect content IDs to update
        [...notification.expiring_7_days, ...notification.expiring_3_days, ...notification.expiring_1_day, ...notification.already_expired]
          .forEach(c => contentIdsToUpdate.push(c.id));

      } catch (emailError) {
        console.error(`Failed to send email to ${notification.brand_email}:`, emailError);
      }
    }

    // Update last_expiry_notification_sent for all notified content
    if (contentIdsToUpdate.length > 0) {
      const { error: updateError } = await supabase
        .from('content_library')
        .update({ last_expiry_notification_sent: now.toISOString() })
        .in('id', contentIdsToUpdate);

      if (updateError) {
        console.error('Error updating notification timestamps:', updateError);
      }
    }

    console.log(`Expiration check complete. Sent ${emailsSent} emails.`);

    return new Response(JSON.stringify({
      success: true,
      emailsSent,
      contentProcessed: contentIdsToUpdate.length,
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Expiration check error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

function buildExpirationEmailHtml(notification: BrandNotification): string {
  const dashboardUrl = 'https://collabhunts.com/brand-dashboard?tab=content';

  let html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Content Usage Rights Expiring</title>
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f5f5f5; margin: 0; padding: 20px;">
      <div style="max-width: 600px; margin: 0 auto; background-color: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
        <div style="background: linear-gradient(135deg, #FF7A00, #FFC300); padding: 32px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 24px;">⚠️ Content Usage Rights Alert</h1>
        </div>
        
        <div style="padding: 32px;">
          <p style="font-size: 16px; color: #333; margin-bottom: 24px;">
            Hi ${notification.company_name},
          </p>
          <p style="font-size: 16px; color: #333; margin-bottom: 24px;">
            Some content in your library has usage rights that are expiring or have already expired. Please review and take action.
          </p>
  `;

  // Already expired section
  if (notification.already_expired.length > 0) {
    html += `
          <div style="background-color: #FEE2E2; border-left: 4px solid #DC2626; padding: 16px; margin-bottom: 20px; border-radius: 4px;">
            <h3 style="color: #DC2626; margin: 0 0 12px 0; font-size: 16px;">🚨 Already Expired (${notification.already_expired.length})</h3>
            <ul style="margin: 0; padding-left: 20px; color: #991B1B;">
              ${notification.already_expired.map(c => `<li style="margin-bottom: 8px;">${c.title || c.file_name}</li>`).join('')}
            </ul>
          </div>
    `;
  }

  // Expiring in 1 day
  if (notification.expiring_1_day.length > 0) {
    html += `
          <div style="background-color: #FEF3C7; border-left: 4px solid #D97706; padding: 16px; margin-bottom: 20px; border-radius: 4px;">
            <h3 style="color: #D97706; margin: 0 0 12px 0; font-size: 16px;">⏰ Expiring Tomorrow (${notification.expiring_1_day.length})</h3>
            <ul style="margin: 0; padding-left: 20px; color: #92400E;">
              ${notification.expiring_1_day.map(c => `<li style="margin-bottom: 8px;">${c.title || c.file_name}</li>`).join('')}
            </ul>
          </div>
    `;
  }

  // Expiring in 3 days
  if (notification.expiring_3_days.length > 0) {
    html += `
          <div style="background-color: #FEF9C3; border-left: 4px solid #CA8A04; padding: 16px; margin-bottom: 20px; border-radius: 4px;">
            <h3 style="color: #CA8A04; margin: 0 0 12px 0; font-size: 16px;">📅 Expiring in 3 Days (${notification.expiring_3_days.length})</h3>
            <ul style="margin: 0; padding-left: 20px; color: #854D0E;">
              ${notification.expiring_3_days.map(c => `<li style="margin-bottom: 8px;">${c.title || c.file_name}</li>`).join('')}
            </ul>
          </div>
    `;
  }

  // Expiring in 7 days
  if (notification.expiring_7_days.length > 0) {
    html += `
          <div style="background-color: #DBEAFE; border-left: 4px solid #2563EB; padding: 16px; margin-bottom: 20px; border-radius: 4px;">
            <h3 style="color: #2563EB; margin: 0 0 12px 0; font-size: 16px;">📋 Expiring in 7 Days (${notification.expiring_7_days.length})</h3>
            <ul style="margin: 0; padding-left: 20px; color: #1E40AF;">
              ${notification.expiring_7_days.map(c => `<li style="margin-bottom: 8px;">${c.title || c.file_name}</li>`).join('')}
            </ul>
          </div>
    `;
  }

  html += `
          <div style="text-align: center; margin-top: 32px;">
            <a href="${dashboardUrl}" style="display: inline-block; background: linear-gradient(135deg, #FF7A00, #FFC300); color: white; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-weight: 600; font-size: 16px;">
              View Content Library
            </a>
          </div>
          
          <p style="font-size: 14px; color: #666; margin-top: 32px; text-align: center;">
            Consider renewing your rights or archiving expired content to stay organized.
          </p>
        </div>
        
        <div style="background-color: #f5f5f5; padding: 24px; text-align: center;">
          <p style="font-size: 12px; color: #999; margin: 0;">
            © ${new Date().getFullYear()} CollabHunts. All rights reserved.
          </p>
        </div>
      </div>
    </body>
    </html>
  `;

  return html;
}
