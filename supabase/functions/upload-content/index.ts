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

    // Get brand profile
    const { data: brandProfile, error: brandError } = await supabase
      .from('brand_profiles')
      .select('id')
      .eq('user_id', user.id)
      .maybeSingle();

    if (brandError || !brandProfile) {
      return new Response(JSON.stringify({ error: 'Brand profile not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Check subscription tier for Content Library access
    const { data: subscription } = await supabase
      .from('brand_subscriptions')
      .select('plan_type, status, current_period_end')
      .eq('brand_profile_id', brandProfile.id)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    const planType = subscription?.plan_type || 'basic';
    const hasAccess = planType === 'pro' || planType === 'premium';

    if (!hasAccess) {
      return new Response(JSON.stringify({ error: 'Content Library requires Pro or Premium subscription' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Parse multipart form data
    const formData = await req.formData();
    const file = formData.get('file') as File;
    const title = formData.get('title') as string || null;
    const description = formData.get('description') as string || null;
    const creatorProfileId = formData.get('creator_profile_id') as string || null;
    const bookingId = formData.get('booking_id') as string || null;
    const rightsType = formData.get('rights_type') as string || 'perpetual';
    const usageRightsStart = formData.get('usage_rights_start') as string || null;
    const usageRightsEnd = formData.get('usage_rights_end') as string || null;
    const tags = formData.get('tags') as string || null;

    if (!file) {
      return new Response(JSON.stringify({ error: 'No file provided' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'video/mp4', 'video/quicktime', 'video/webm'];
    if (!allowedTypes.includes(file.type)) {
      return new Response(JSON.stringify({ error: 'Invalid file type. Allowed: jpg, png, gif, webp, mp4, mov, webm' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Validate file size (100MB max)
    const maxSize = 100 * 1024 * 1024;
    if (file.size > maxSize) {
      return new Response(JSON.stringify({ error: 'File too large. Maximum size is 100MB' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Check storage limits
    const storageLimit = planType === 'premium' ? 50 * 1024 * 1024 * 1024 : 10 * 1024 * 1024 * 1024; // 50GB or 10GB

    // Get current usage
    const { data: usageData } = await supabase
      .from('content_library')
      .select('file_size_bytes')
      .eq('brand_profile_id', brandProfile.id);

    const currentUsage = usageData?.reduce((sum, item) => sum + (item.file_size_bytes || 0), 0) || 0;

    // Get extra storage from purchases
    const { data: purchases } = await supabase
      .from('storage_purchases')
      .select('storage_amount_bytes')
      .eq('brand_profile_id', brandProfile.id)
      .eq('status', 'active');

    const extraStorage = purchases?.reduce((sum, p) => sum + (p.storage_amount_bytes || 0), 0) || 0;
    const effectiveLimit = storageLimit + extraStorage;

    if (currentUsage + file.size > effectiveLimit) {
      return new Response(JSON.stringify({ 
        error: 'Storage limit exceeded',
        currentUsage,
        limit: effectiveLimit,
        fileSize: file.size
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Generate R2 key
    const timestamp = Date.now();
    const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const r2Key = `content-library/${brandProfile.id}/${timestamp}-${sanitizedFileName}`;

    // Determine file type category
    const fileType = file.type.startsWith('video/') ? 'video' : 'image';

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

    // Insert record into content_library
    const { data: contentRecord, error: insertError } = await supabase
      .from('content_library')
      .insert({
        brand_profile_id: brandProfile.id,
        creator_profile_id: creatorProfileId,
        booking_id: bookingId,
        file_name: file.name,
        file_type: fileType,
        mime_type: file.type,
        file_size_bytes: file.size,
        r2_key: r2Key,
        title,
        description,
        rights_type: rightsType,
        usage_rights_start: usageRightsStart,
        usage_rights_end: usageRightsEnd,
        tags: tags ? tags.split(',').map(t => t.trim()) : null,
      })
      .select()
      .single();

    if (insertError) {
      console.error('Database insert failed:', insertError);
      return new Response(JSON.stringify({ error: 'Failed to save content record' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const publicUrl = `${r2PublicUrl}/${r2Key}`;

    console.log(`Content uploaded successfully: ${r2Key}, size: ${file.size} bytes`);

    return new Response(JSON.stringify({
      success: true,
      content: {
        ...contentRecord,
        public_url: publicUrl,
      },
      storage: {
        used: currentUsage + file.size,
        limit: effectiveLimit,
        remaining: effectiveLimit - (currentUsage + file.size),
      },
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
