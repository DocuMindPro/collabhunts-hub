import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface Dispute {
  id: string;
  booking_id: string;
  opened_by_role: string;
  status: string;
  response_deadline: string;
  resolution_deadline: string | null;
  reminder_sent_day2: boolean;
  reminder_sent_day3: boolean;
  escalated_to_admin: boolean;
  bookings: {
    brand_profiles: {
      user_id: string;
      company_name: string;
    };
    creator_profiles: {
      user_id: string;
      display_name: string;
    };
  };
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log('Checking dispute deadlines...');

    // Fetch all active disputes
    const { data: disputes, error: fetchError } = await supabase
      .from('booking_disputes')
      .select(`
        *,
        bookings!inner(
          brand_profiles!inner(user_id, company_name),
          creator_profiles!inner(user_id, display_name)
        )
      `)
      .in('status', ['pending_response', 'pending_admin_review']);

    if (fetchError) {
      throw fetchError;
    }

    const now = new Date();
    const notifications: Array<{
      user_id: string;
      title: string;
      message: string;
      type: string;
      link: string;
    }> = [];

    for (const dispute of (disputes as Dispute[]) || []) {
      const responseDeadline = new Date(dispute.response_deadline);
      const hoursUntilDeadline = (responseDeadline.getTime() - now.getTime()) / (1000 * 60 * 60);

      // Determine who needs to respond
      const responderUserId = dispute.opened_by_role === 'brand' 
        ? dispute.bookings.creator_profiles.user_id 
        : dispute.bookings.brand_profiles.user_id;
      const responderLink = dispute.opened_by_role === 'brand'
        ? '/creator-dashboard?tab=bookings'
        : '/brand-dashboard?tab=bookings';

      if (dispute.status === 'pending_response') {
        // Day 2 reminder (24-48 hours remaining)
        if (hoursUntilDeadline <= 48 && hoursUntilDeadline > 24 && !dispute.reminder_sent_day2) {
          notifications.push({
            user_id: responderUserId,
            title: '⏰ Dispute Response Reminder',
            message: 'You have 2 days left to respond to the dispute.',
            type: 'dispute',
            link: responderLink
          });

          await supabase
            .from('booking_disputes')
            .update({ reminder_sent_day2: true })
            .eq('id', dispute.id);

          console.log(`Sent day 2 reminder for dispute ${dispute.id}`);
        }

        // Day 3 reminder (less than 24 hours remaining)
        if (hoursUntilDeadline <= 24 && hoursUntilDeadline > 0 && !dispute.reminder_sent_day3) {
          notifications.push({
            user_id: responderUserId,
            title: '🚨 Final Warning: Dispute Response Due',
            message: 'Less than 24 hours to respond! Failure may result in automatic resolution.',
            type: 'dispute',
            link: responderLink
          });

          await supabase
            .from('booking_disputes')
            .update({ reminder_sent_day3: true })
            .eq('id', dispute.id);

          console.log(`Sent day 3 warning for dispute ${dispute.id}`);
        }

        // Auto-escalate to admin if deadline passed
        if (hoursUntilDeadline <= 0 && !dispute.escalated_to_admin) {
          // Update dispute status to pending admin review
          await supabase
            .from('booking_disputes')
            .update({ 
              status: 'pending_admin_review',
              escalated_to_admin: true
            })
            .eq('id', dispute.id);

          // Notify admins
          const { data: admins } = await supabase
            .from('user_roles')
            .select('user_id')
            .eq('role', 'admin');

          for (const admin of admins || []) {
            notifications.push({
              user_id: admin.user_id,
              title: '⚠️ Dispute Auto-Escalated',
              message: 'Response deadline passed. Requires immediate admin review.',
              type: 'dispute',
              link: '/admin?tab=disputes'
            });
          }

          console.log(`Auto-escalated dispute ${dispute.id} to admin review`);
        }
      }

      // Check resolution deadline for admin review
      if (dispute.status === 'pending_admin_review' && dispute.resolution_deadline) {
        const resolutionDeadline = new Date(dispute.resolution_deadline);
        const hoursUntilResolution = (resolutionDeadline.getTime() - now.getTime()) / (1000 * 60 * 60);

        // Warn admins if resolution is due soon (24 hours)
        if (hoursUntilResolution <= 24 && hoursUntilResolution > 0) {
          const { data: admins } = await supabase
            .from('user_roles')
            .select('user_id')
            .eq('role', 'admin');

          for (const admin of admins || []) {
            notifications.push({
              user_id: admin.user_id,
              title: '⏰ Dispute Resolution Due Soon',
              message: `Dispute between ${dispute.bookings.brand_profiles.company_name} and ${dispute.bookings.creator_profiles.display_name} needs resolution within 24 hours.`,
              type: 'dispute',
              link: '/admin?tab=disputes'
            });
          }
        }
      }
    }

    // Insert all notifications
    if (notifications.length > 0) {
      const { error: notifyError } = await supabase
        .from('notifications')
        .insert(notifications);

      if (notifyError) {
        console.error('Error inserting notifications:', notifyError);
      }
    }

    console.log(`Processed ${disputes?.length || 0} disputes, sent ${notifications.length} notifications`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        disputesProcessed: disputes?.length || 0,
        notificationsSent: notifications.length
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: unknown) {
    console.error('Error checking dispute deadlines:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
