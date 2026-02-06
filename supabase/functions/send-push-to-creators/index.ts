import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PushToCreatorsRequest {
  title: string;
  body: string;
  data?: Record<string, string>;
  target_user_ids?: string[]; // optional: specific creators, otherwise all
}

// Get Firebase access token using service account credentials
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

    // Verify admin auth
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Missing authorization' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Check admin role
    const { data: profile } = await supabase
      .from('profiles')
      .select('roles')
      .eq('id', user.id)
      .single();

    if (!profile?.roles?.includes('admin')) {
      return new Response(JSON.stringify({ error: 'Admin access required' }), {
        status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { title, body, data, target_user_ids }: PushToCreatorsRequest = await req.json();

    if (!title || !body) {
      return new Response(JSON.stringify({ error: 'Missing required fields: title, body' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get creator user_ids
    let creatorUserIds: string[];
    if (target_user_ids && target_user_ids.length > 0) {
      creatorUserIds = target_user_ids;
    } else {
      const { data: creators, error: creatorsError } = await supabase
        .from('creator_profiles')
        .select('user_id')
        .eq('status', 'approved');

      if (creatorsError) throw creatorsError;
      creatorUserIds = creators?.map(c => c.user_id) || [];
    }

    if (creatorUserIds.length === 0) {
      return new Response(JSON.stringify({ success: true, sent: 0, failed: 0, message: 'No creators found' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Fetch all active device tokens for these creators
    const { data: tokens, error: tokensError } = await supabase
      .from('device_tokens')
      .select('token, platform, user_id')
      .in('user_id', creatorUserIds)
      .eq('is_active', true);

    if (tokensError) throw tokensError;

    if (!tokens || tokens.length === 0) {
      return new Response(JSON.stringify({ success: true, sent: 0, failed: 0, message: 'No active device tokens found' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get Firebase access token
    const projectId = Deno.env.get('FIREBASE_PROJECT_ID');
    let accessToken: string;
    try {
      accessToken = await getFirebaseAccessToken();
    } catch (e) {
      return new Response(JSON.stringify({ error: `Firebase auth failed: ${e.message}` }), {
        status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Send to all tokens
    let successCount = 0;
    const failedTokens: string[] = [];

    for (const { token, platform } of tokens) {
      try {
        const message = {
          message: {
            token,
            notification: { title, body },
            data: { ...data, notification_type: 'admin_broadcast', platform },
            android: {
              priority: 'high',
              notification: { sound: 'default' },
            },
            apns: {
              payload: { aps: { sound: 'default', badge: 1 } },
            },
          },
        };

        const response = await fetch(
          `https://fcm.googleapis.com/v1/projects/${projectId}/messages:send`,
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

    return new Response(JSON.stringify({
      success: true,
      sent: successCount,
      failed: failedTokens.length,
      total_tokens: tokens.length,
      total_creators: creatorUserIds.length,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Push to creators error:', error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
