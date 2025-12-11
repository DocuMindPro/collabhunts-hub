import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

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
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const r2AccountId = Deno.env.get('R2_ACCOUNT_ID')!;
    const r2AccessKeyId = Deno.env.get('R2_ACCESS_KEY_ID')!;
    const r2SecretAccessKey = Deno.env.get('R2_SECRET_ACCESS_KEY')!;
    const r2BucketName = Deno.env.get('R2_BUCKET_NAME')!;
    const r2PublicUrl = Deno.env.get('R2_PUBLIC_URL')!;

    // Authenticate user
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Missing authorization header' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Check if user is admin
    const { data: roleData, error: roleError } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'admin')
      .maybeSingle();

    if (roleError || !roleData) {
      return new Response(JSON.stringify({ error: 'Admin access required' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Parse multipart form data
    const formData = await req.formData();
    const file = formData.get('file') as File;
    const placementId = formData.get('placement_id') as string;

    if (!file) {
      return new Response(JSON.stringify({ error: 'No file provided' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (!placementId) {
      return new Response(JSON.stringify({ error: 'Placement ID required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Validate file type - images only
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return new Response(JSON.stringify({ error: 'Invalid file type. Allowed: jpg, png, gif, webp' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Validate file size (5MB max for ads)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      return new Response(JSON.stringify({ error: 'File too large. Maximum size is 5MB' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Generate R2 key
    const timestamp = Date.now();
    const fileExtension = file.name.split('.').pop() || 'jpg';
    const sanitizedPlacementId = placementId.replace(/[^a-zA-Z0-9_-]/g, '_');
    const r2Key = `ads/${sanitizedPlacementId}/${timestamp}.${fileExtension}`;

    // Upload to R2 using S3-compatible API
    const r2Endpoint = `https://${r2AccountId}.r2.cloudflarestorage.com`;
    const fileBuffer = await file.arrayBuffer();

    // Create AWS Signature V4 for R2
    const date = new Date();
    const dateString = date.toISOString().slice(0, 10).replace(/-/g, '');
    const amzDate = date.toISOString().replace(/[:-]|\.\d{3}/g, '');
    const region = 'auto';
    const service = 's3';

    // Create canonical request
    const method = 'PUT';
    const canonicalUri = `/${r2BucketName}/${r2Key}`;
    const canonicalQueryString = '';
    const payloadHash = await crypto.subtle.digest('SHA-256', fileBuffer)
      .then(hash => Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, '0')).join(''));

    const canonicalHeaders = [
      `content-type:${file.type}`,
      `host:${r2AccountId}.r2.cloudflarestorage.com`,
      `x-amz-content-sha256:${payloadHash}`,
      `x-amz-date:${amzDate}`,
    ].join('\n') + '\n';

    const signedHeaders = 'content-type;host;x-amz-content-sha256;x-amz-date';

    const canonicalRequest = [
      method,
      canonicalUri,
      canonicalQueryString,
      canonicalHeaders,
      signedHeaders,
      payloadHash,
    ].join('\n');

    // Create string to sign
    const algorithm = 'AWS4-HMAC-SHA256';
    const credentialScope = `${dateString}/${region}/${service}/aws4_request`;
    const canonicalRequestHash = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(canonicalRequest))
      .then(hash => Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, '0')).join(''));

    const stringToSign = [
      algorithm,
      amzDate,
      credentialScope,
      canonicalRequestHash,
    ].join('\n');

    // Calculate signature
    const encoder = new TextEncoder();
    
    // deno-lint-ignore no-explicit-any
    async function hmacSha256(key: any, message: string): Promise<ArrayBuffer> {
      const cryptoKey = await crypto.subtle.importKey(
        'raw',
        key,
        { name: 'HMAC', hash: 'SHA-256' },
        false,
        ['sign']
      );
      return crypto.subtle.sign('HMAC', cryptoKey, encoder.encode(message));
    }

    const kDate = await hmacSha256(encoder.encode(`AWS4${r2SecretAccessKey}`), dateString);
    const kRegion = await hmacSha256(kDate, region);
    const kService = await hmacSha256(kRegion, service);
    const kSigning = await hmacSha256(kService, 'aws4_request');
    const signature = await hmacSha256(kSigning, stringToSign)
      .then(sig => Array.from(new Uint8Array(sig)).map(b => b.toString(16).padStart(2, '0')).join(''));

    const authorizationHeader = `${algorithm} Credential=${r2AccessKeyId}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`;

    // Upload to R2
    const uploadResponse = await fetch(`${r2Endpoint}/${r2BucketName}/${r2Key}`, {
      method: 'PUT',
      headers: {
        'Content-Type': file.type,
        'x-amz-content-sha256': payloadHash,
        'x-amz-date': amzDate,
        'Authorization': authorizationHeader,
      },
      body: fileBuffer,
    });

    if (!uploadResponse.ok) {
      const errorText = await uploadResponse.text();
      console.error('R2 upload failed:', errorText);
      return new Response(JSON.stringify({ error: 'Failed to upload file to storage' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const publicUrl = `${r2PublicUrl}/${r2Key}`;

    console.log(`Ad image uploaded successfully: ${r2Key}, size: ${file.size} bytes`);

    return new Response(JSON.stringify({
      success: true,
      image_url: publicUrl,
      r2_key: r2Key,
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Upload error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
