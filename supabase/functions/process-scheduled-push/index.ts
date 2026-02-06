import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

async function getFirebaseAccessToken(): Promise<string> {
  const projectId = Deno.env.get('FIREBASE_PROJECT_ID');
  const clientEmail = Deno.env.get('FIREBASE_CLIENT_EMAIL');
  const privateKey = Deno.env.get('FIREBASE_PRIVATE_KEY')?.replace(/\\n/g, '\n');

  if (!projectId || !clientEmail || !privateKey) {
    throw new Error('Missing Firebase credentials');
  }

  const header = { alg: 'RS256', typ: 'JWT' };
  const now = Math.floor(Date.now() / 1000);
  const payload = {
    iss: clientEmail,
    sub: clientEmail,
    aud: 'https://oauth2.googleapis.com/token',
    iat: now,
    exp: now + 3600,
    scope: 'https://www.googleapis.com/auth/firebase.messaging',
  };

  const base64UrlEncode = (obj: unknown) => {
    const json = JSON.stringify(obj);
    const base64 = btoa(json);
    return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
  };

  const headerEncoded = base64UrlEncode(header);
  const payloadEncoded = base64UrlEncode(payload);
  const unsignedToken = `${headerEncoded}.${payloadEncoded}`;

  const encoder = new TextEncoder();
  const keyData = privateKey
    .replace('-----BEGIN PRIVATE KEY-----', '')
    .replace('-----END PRIVATE KEY-----', '')
    .replace(/\s/g, '');

  const binaryKey = Uint8Array.from(atob(keyData), c => c.charCodeAt(0));

  const cryptoKey = await crypto.subtle.importKey(
    'pkcs8',
    binaryKey,
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
    false,
    ['sign']
  );

  const signature = await crypto.subtle.sign(
    'RSASSA-PKCS1-v1_5',
    cryptoKey,
    encoder.encode(unsignedToken)
  );

  const signatureBase64 = btoa(String.fromCharCode(...new Uint8Array(signature)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');

  const jwt = `${unsignedToken}.${signatureBase64}`;

  const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: jwt,
    }),
  });

  if (!tokenResponse.ok) {
    const error = await tokenResponse.text();
    throw new Error(`Failed to get Firebase access token: ${error}`);
  }

  const tokenData = await tokenResponse.json();
  return tokenData.access_token;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Find pending notifications that are due
    const { data: dueNotifications, error: fetchError } = await supabase
      .from('scheduled_push_notifications')
      .select('*')
      .eq('status', 'pending')
      .lte('scheduled_at', new Date().toISOString())
      .order('scheduled_at', { ascending: true });

    if (fetchError) throw fetchError;

    if (!dueNotifications || dueNotifications.length === 0) {
      return new Response(JSON.stringify({ processed: 0 }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get all approved creator user_ids
    const { data: creators, error: creatorsError } = await supabase
      .from('creator_profiles')
      .select('user_id')
      .eq('status', 'approved');

    if (creatorsError) throw creatorsError;
    const creatorUserIds = creators?.map(c => c.user_id) || [];

    if (creatorUserIds.length === 0) {
      // Mark all as sent with 0 results
      for (const notif of dueNotifications) {
        await supabase
          .from('scheduled_push_notifications')
          .update({ status: 'sent', sent_at: new Date().toISOString(), result: { sent: 0, failed: 0, message: 'No creators found' } })
          .eq('id', notif.id);
      }
      return new Response(JSON.stringify({ processed: dueNotifications.length, sent: 0 }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get device tokens
    const { data: tokens, error: tokensError } = await supabase
      .from('device_tokens')
      .select('token, platform, user_id')
      .in('user_id', creatorUserIds)
      .eq('is_active', true);

    if (tokensError) throw tokensError;

    // Get Firebase access token once for all notifications
    const firebaseProjectId = Deno.env.get('FIREBASE_PROJECT_ID');
    let accessToken: string;
    try {
      accessToken = await getFirebaseAccessToken();
    } catch (e) {
      // Mark all as failed
      for (const notif of dueNotifications) {
        await supabase
          .from('scheduled_push_notifications')
          .update({ status: 'sent', sent_at: new Date().toISOString(), result: { error: `Firebase auth failed: ${e.message}` } })
          .eq('id', notif.id);
      }
      return new Response(JSON.stringify({ error: `Firebase auth failed: ${e.message}` }), {
        status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    let totalProcessed = 0;

    for (const notif of dueNotifications) {
      let successCount = 0;
      const failedTokens: string[] = [];

      if (tokens && tokens.length > 0) {
        for (const { token, platform } of tokens) {
          try {
            const message = {
              message: {
                token,
                notification: { title: notif.title, body: notif.body },
                data: { notification_type: 'scheduled_broadcast', platform },
                android: { priority: 'high', notification: { sound: 'default' } },
                apns: { payload: { aps: { sound: 'default', badge: 1 } } },
              },
            };

            const response = await fetch(
              `https://fcm.googleapis.com/v1/projects/${firebaseProjectId}/messages:send`,
              {
                method: 'POST',
                headers: {
                  'Authorization': `Bearer ${accessToken}`,
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify(message),
              }
            );

            if (response.ok) {
              successCount++;
            } else {
              failedTokens.push(token);
            }
          } catch {
            failedTokens.push(token);
          }
        }

        // Deactivate failed tokens
        if (failedTokens.length > 0) {
          await supabase
            .from('device_tokens')
            .update({ is_active: false })
            .in('token', failedTokens);
        }
      }

      // Update notification status
      await supabase
        .from('scheduled_push_notifications')
        .update({
          status: 'sent',
          sent_at: new Date().toISOString(),
          result: {
            sent: successCount,
            failed: failedTokens.length,
            total_tokens: tokens?.length || 0,
            total_creators: creatorUserIds.length,
          },
        })
        .eq('id', notif.id);

      totalProcessed++;
    }

    return new Response(JSON.stringify({ processed: totalProcessed }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Process scheduled push error:', error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
