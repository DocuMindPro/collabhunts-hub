import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    const assetType = formData.get('assetType') as string;
    const settingKey = formData.get('settingKey') as string;

    if (!file || !assetType || !settingKey) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: file, assetType, settingKey' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Uploading site asset: ${assetType}, key: ${settingKey}, file: ${file.name}`);

    // Get auth header and create supabase client
    const authHeader = req.headers.get('Authorization');
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    // Create client with user's token to verify they're an admin
    const supabaseClient = createClient(supabaseUrl, supabaseServiceKey, {
      global: {
        headers: { Authorization: authHeader || '' },
      },
    });

    // Get user ID from auth
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
    if (authError || !user) {
      console.error('Auth error:', authError);
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if user is admin
    const { data: roles, error: rolesError } = await supabaseClient
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'admin');

    if (rolesError || !roles || roles.length === 0) {
      console.error('Not an admin:', rolesError);
      return new Response(
        JSON.stringify({ error: 'Admin access required' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Upload to R2 via Cloudflare
    const R2_ACCOUNT_ID = Deno.env.get('R2_ACCOUNT_ID');
    const R2_ACCESS_KEY_ID = Deno.env.get('R2_ACCESS_KEY_ID');
    const R2_SECRET_ACCESS_KEY = Deno.env.get('R2_SECRET_ACCESS_KEY');
    const R2_BUCKET_NAME = Deno.env.get('R2_BUCKET_NAME') || 'collab-hunts-backup-storage';
    const R2_PUBLIC_URL = Deno.env.get('R2_PUBLIC_URL');

    if (!R2_ACCOUNT_ID || !R2_ACCESS_KEY_ID || !R2_SECRET_ACCESS_KEY || !R2_PUBLIC_URL) {
      console.error('Missing R2 credentials');
      return new Response(
        JSON.stringify({ error: 'Storage configuration error' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Generate unique filename
    const timestamp = Date.now();
    const ext = file.name.split('.').pop() || 'png';
    const r2Key = `site-assets/${assetType}/${timestamp}.${ext}`;

    // Read file buffer
    const fileBuffer = await file.arrayBuffer();

    // Upload to R2
    const r2Endpoint = `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`;
    const uploadUrl = `${r2Endpoint}/${R2_BUCKET_NAME}/${r2Key}`;

    // Create AWS4 signature for R2
    const date = new Date();
    const amzDate = date.toISOString().replace(/[:-]|\.\d{3}/g, '');
    const dateStamp = amzDate.slice(0, 8);
    const region = 'auto';
    const service = 's3';

    // Simple PUT request to R2 (using access key auth)
    const encoder = new TextEncoder();
    const keyData = encoder.encode(`AWS4${R2_SECRET_ACCESS_KEY}`);
    const dateKey = await crypto.subtle.importKey(
      'raw', keyData, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']
    );
    const dateRegionKey = await crypto.subtle.sign(
      'HMAC', dateKey, encoder.encode(dateStamp)
    );
    const dateRegionKeyImport = await crypto.subtle.importKey(
      'raw', dateRegionKey, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']
    );
    const dateRegionServiceKey = await crypto.subtle.sign(
      'HMAC', dateRegionKeyImport, encoder.encode(region)
    );
    const dateRegionServiceKeyImport = await crypto.subtle.importKey(
      'raw', dateRegionServiceKey, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']
    );
    const signingKey = await crypto.subtle.sign(
      'HMAC', dateRegionServiceKeyImport, encoder.encode(service)
    );
    const signingKeyImport = await crypto.subtle.importKey(
      'raw', signingKey, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']
    );

    // Create canonical request
    const method = 'PUT';
    const canonicalUri = `/${R2_BUCKET_NAME}/${r2Key}`;
    const canonicalQueryString = '';
    
    // Calculate content hash
    const contentHash = await crypto.subtle.digest('SHA-256', fileBuffer);
    const contentHashHex = Array.from(new Uint8Array(contentHash))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');

    const host = `${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`;
    const canonicalHeaders = `content-type:${file.type}\nhost:${host}\nx-amz-content-sha256:${contentHashHex}\nx-amz-date:${amzDate}\n`;
    const signedHeaders = 'content-type;host;x-amz-content-sha256;x-amz-date';

    const canonicalRequest = `${method}\n${canonicalUri}\n${canonicalQueryString}\n${canonicalHeaders}\n${signedHeaders}\n${contentHashHex}`;

    // Create string to sign
    const algorithm = 'AWS4-HMAC-SHA256';
    const credentialScope = `${dateStamp}/${region}/${service}/aws4_request`;
    const canonicalRequestHash = await crypto.subtle.digest('SHA-256', encoder.encode(canonicalRequest));
    const canonicalRequestHashHex = Array.from(new Uint8Array(canonicalRequestHash))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
    
    const stringToSign = `${algorithm}\n${amzDate}\n${credentialScope}\n${canonicalRequestHashHex}`;

    // Calculate signature
    const aws4RequestKey = await crypto.subtle.sign(
      'HMAC', signingKeyImport, encoder.encode('aws4_request')
    );
    const aws4RequestKeyImport = await crypto.subtle.importKey(
      'raw', aws4RequestKey, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']
    );
    const signature = await crypto.subtle.sign(
      'HMAC', aws4RequestKeyImport, encoder.encode(stringToSign)
    );
    const signatureHex = Array.from(new Uint8Array(signature))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');

    const authorizationHeader = `${algorithm} Credential=${R2_ACCESS_KEY_ID}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signatureHex}`;

    const uploadResponse = await fetch(uploadUrl, {
      method: 'PUT',
      body: fileBuffer,
      headers: {
        'Content-Type': file.type,
        'Host': host,
        'x-amz-content-sha256': contentHashHex,
        'x-amz-date': amzDate,
        'Authorization': authorizationHeader,
      },
    });

    if (!uploadResponse.ok) {
      const errorText = await uploadResponse.text();
      console.error('R2 upload failed:', uploadResponse.status, errorText);
      return new Response(
        JSON.stringify({ error: 'Failed to upload file to storage' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Construct public URL
    const publicUrl = `${R2_PUBLIC_URL}/${r2Key}`;
    console.log(`File uploaded successfully: ${publicUrl}`);

    // Update site_settings with service role client
    const serviceClient = createClient(supabaseUrl, supabaseServiceKey);
    
    const { error: updateError } = await serviceClient
      .from('site_settings')
      .update({ 
        value: publicUrl, 
        updated_at: new Date().toISOString(),
        updated_by: user.id 
      })
      .eq('key', settingKey);

    if (updateError) {
      console.error('Failed to update site_settings:', updateError);
      return new Response(
        JSON.stringify({ error: 'Failed to update settings' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Site setting ${settingKey} updated successfully`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        url: publicUrl,
        key: settingKey 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    console.error('Error in upload-site-asset:', error);
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});