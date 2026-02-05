import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    
    // Calculate dates for reminders
    const oneDayFromNow = new Date(today);
    oneDayFromNow.setDate(oneDayFromNow.getDate() + 1);
    const oneDayStr = oneDayFromNow.toISOString().split('T')[0];
    
    const sevenDaysFromNow = new Date(today);
    sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);
    const sevenDaysStr = sevenDaysFromNow.toISOString().split('T')[0];

    const results = {
      day_of_reminders: 0,
      one_day_reminders: 0,
      seven_day_reminders: 0,
      errors: [] as string[],
    };

    // 1. Send day-of reminders (events happening today)
    const { data: todayEvents, error: todayError } = await supabase
      .from('calendar_events')
      .select('*')
      .eq('start_date', todayStr)
      .eq('reminder_0d_sent', false);

    if (todayError) {
      results.errors.push(`Day-of query error: ${todayError.message}`);
    } else if (todayEvents && todayEvents.length > 0) {
      for (const event of todayEvents) {
        const title = `📅 Today: ${event.title}`;
        const message = event.start_time 
          ? `Starting at ${event.start_time.slice(0, 5)}` 
          : 'Happening today';

        // Create notification
        const { error: notifError } = await supabase
          .from('notifications')
          .insert({
            user_id: event.user_id,
            title,
            message,
            type: 'calendar_reminder',
            link: event.source_table === 'bookings' 
              ? '/creator-dashboard?tab=calendar' 
              : '/brand-dashboard?tab=calendar',
          });

        if (notifError) {
          results.errors.push(`Notification error for event ${event.id}: ${notifError.message}`);
        } else {
          // Mark reminder as sent
          await supabase
            .from('calendar_events')
            .update({ reminder_0d_sent: true })
            .eq('id', event.id);
          results.day_of_reminders++;
        }
      }
    }

    // 2. Send 1-day reminders (events happening tomorrow)
    const { data: tomorrowEvents, error: tomorrowError } = await supabase
      .from('calendar_events')
      .select('*')
      .eq('start_date', oneDayStr)
      .eq('reminder_1d_sent', false);

    if (tomorrowError) {
      results.errors.push(`1-day query error: ${tomorrowError.message}`);
    } else if (tomorrowEvents && tomorrowEvents.length > 0) {
      for (const event of tomorrowEvents) {
        const title = `⏰ Tomorrow: ${event.title}`;
        const message = event.start_time 
          ? `Starting at ${event.start_time.slice(0, 5)}` 
          : 'Happening tomorrow';

        const { error: notifError } = await supabase
          .from('notifications')
          .insert({
            user_id: event.user_id,
            title,
            message,
            type: 'calendar_reminder',
            link: event.source_table === 'bookings' 
              ? '/creator-dashboard?tab=calendar' 
              : '/brand-dashboard?tab=calendar',
          });

        if (notifError) {
          results.errors.push(`Notification error for event ${event.id}: ${notifError.message}`);
        } else {
          await supabase
            .from('calendar_events')
            .update({ reminder_1d_sent: true })
            .eq('id', event.id);
          results.one_day_reminders++;
        }
      }
    }

    // 3. Send 7-day reminders (events in 7 days)
    const { data: weekEvents, error: weekError } = await supabase
      .from('calendar_events')
      .select('*')
      .eq('start_date', sevenDaysStr)
      .eq('reminder_7d_sent', false);

    if (weekError) {
      results.errors.push(`7-day query error: ${weekError.message}`);
    } else if (weekEvents && weekEvents.length > 0) {
      for (const event of weekEvents) {
        const title = `🗓️ In 7 days: ${event.title}`;
        const message = `Coming up on ${new Date(event.start_date).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}`;

        const { error: notifError } = await supabase
          .from('notifications')
          .insert({
            user_id: event.user_id,
            title,
            message,
            type: 'calendar_reminder',
            link: event.source_table === 'bookings' 
              ? '/creator-dashboard?tab=calendar' 
              : '/brand-dashboard?tab=calendar',
          });

        if (notifError) {
          results.errors.push(`Notification error for event ${event.id}: ${notifError.message}`);
        } else {
          await supabase
            .from('calendar_events')
            .update({ reminder_7d_sent: true })
            .eq('id', event.id);
          results.seven_day_reminders++;
        }
      }
    }

    console.log('Calendar reminder results:', results);

    return new Response(
      JSON.stringify({ 
        success: true, 
        results,
        timestamp: new Date().toISOString(),
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Calendar reminder error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
