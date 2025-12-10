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

interface Booking {
  id: string;
  delivery_status: string;
  delivered_at: string;
  payment_status: string;
  total_price_cents: number;
  brand_profile_id: string;
  creator_profile_id: string;
  brand_profiles: {
    user_id: string;
    company_name: string;
  };
  creator_profiles: {
    user_id: string;
    display_name: string;
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

    console.log('Checking dispute deadlines and auto-release conditions...');

    const now = new Date();
    const notifications: Array<{
      user_id: string;
      title: string;
      message: string;
      type: string;
      link: string;
    }> = [];

    // =============== PART 1: AUTO-RELEASE PAYMENT (72 hours) ===============
    console.log('Checking for auto-release eligible bookings...');

    // Get all bookings with delivery_status = 'delivered' and delivered_at set
    const { data: deliveredBookings, error: bookingsError } = await supabase
      .from('bookings')
      .select(`
        id,
        delivery_status,
        delivered_at,
        payment_status,
        total_price_cents,
        brand_profile_id,
        creator_profile_id,
        brand_profiles!inner(user_id, company_name),
        creator_profiles!inner(user_id, display_name)
      `)
      .eq('delivery_status', 'delivered')
      .eq('payment_status', 'paid')
      .not('delivered_at', 'is', null);

    if (bookingsError) {
      console.error('Error fetching delivered bookings:', bookingsError);
    } else {
      for (const booking of (deliveredBookings as unknown as Booking[]) || []) {
        if (!booking.delivered_at) continue;

        const deliveredAt = new Date(booking.delivered_at);
        const hoursSinceDelivery = (now.getTime() - deliveredAt.getTime()) / (1000 * 60 * 60);

        // Check if there's an active dispute for this booking
        const { data: activeDispute } = await supabase
          .from('booking_disputes')
          .select('id')
          .eq('booking_id', booking.id)
          .not('status', 'like', 'resolved_%')
          .maybeSingle();

        if (activeDispute) {
          // Skip auto-release if there's an active dispute
          continue;
        }

        // 48-hour reminder (brand has 24 hours left)
        if (hoursSinceDelivery >= 48 && hoursSinceDelivery < 72) {
          // Check if we already sent this reminder (we'll use a simple approach - send once in this window)
          const hoursLeft = Math.round(72 - hoursSinceDelivery);
          
          if (hoursSinceDelivery >= 48 && hoursSinceDelivery < 49) {
            notifications.push({
              user_id: booking.brand_profiles.user_id,
              title: '⏰ Review Reminder: 24 Hours Left',
              message: `You have ${hoursLeft} hours to review ${booking.creator_profiles.display_name}'s deliverables before payment auto-releases.`,
              type: 'delivery',
              link: '/brand-dashboard?tab=bookings'
            });
            console.log(`Sent 48h reminder for booking ${booking.id}`);
          }
        }

        // 24-hour final warning
        if (hoursSinceDelivery >= 71 && hoursSinceDelivery < 72) {
          notifications.push({
            user_id: booking.brand_profiles.user_id,
            title: '🚨 Final Warning: 1 Hour Left!',
            message: `Payment for ${booking.creator_profiles.display_name}'s work will auto-release in less than 1 hour!`,
            type: 'delivery',
            link: '/brand-dashboard?tab=bookings'
          });
          console.log(`Sent final warning for booking ${booking.id}`);
        }

        // AUTO-RELEASE: 72 hours passed
        if (hoursSinceDelivery >= 72) {
          console.log(`Auto-releasing payment for booking ${booking.id} (${hoursSinceDelivery.toFixed(1)} hours since delivery)`);

          // Update booking status to confirmed (this will trigger the notification trigger)
          const { error: updateError } = await supabase
            .from('bookings')
            .update({
              delivery_status: 'confirmed',
              status: 'completed'
            })
            .eq('id', booking.id);

          if (updateError) {
            console.error(`Error auto-releasing booking ${booking.id}:`, updateError);
          } else {
            console.log(`Successfully auto-released booking ${booking.id}`);
          }
        }
      }
    }

    // =============== PART 2: DISPUTE DEADLINES ===============
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
              escalated_to_admin: true,
              resolution_deadline: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString()
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

    // Insert all notifications (deduplicate by user_id + title combo for this run)
    if (notifications.length > 0) {
      const uniqueNotifications = notifications.filter((n, i, self) => 
        i === self.findIndex(t => t.user_id === n.user_id && t.title === n.title)
      );

      const { error: notifyError } = await supabase
        .from('notifications')
        .insert(uniqueNotifications);

      if (notifyError) {
        console.error('Error inserting notifications:', notifyError);
      }
    }

    console.log(`Processed ${deliveredBookings?.length || 0} delivered bookings, ${disputes?.length || 0} disputes, sent ${notifications.length} notifications`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        bookingsProcessed: deliveredBookings?.length || 0,
        disputesProcessed: disputes?.length || 0,
        notificationsSent: notifications.length
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: unknown) {
    console.error('Error checking deadlines:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});