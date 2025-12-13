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

    // DEBUG: Log R2 configuration (mask sensitive data)
    console.log('=== R2 CONFIGURATION DEBUG ===');
    console.log('R2_ACCOUNT_ID:', r2AccountId || 'NOT SET');
    console.log('R2_BUCKET_NAME:', r2BucketName || 'NOT SET');
    console.log('R2_PUBLIC_URL:', r2PublicUrl || 'NOT SET');
    console.log('R2_ACCESS_KEY_ID:', r2AccessKeyId ? `${r2AccessKeyId.substring(0, 8)}...` : 'NOT SET');
    console.log('R2_SECRET_ACCESS_KEY:', r2SecretAccessKey ? 'SET (hidden)' : 'NOT SET');
    console.log('R2 Endpoint:', `https://${r2AccountId}.r2.cloudflarestorage.com`);
    console.log('==============================');

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

    // Get creator profile
    const { data: creatorProfile, error: profileError } = await supabase
      .from('creator_profiles')
      .select('id')
      .eq('user_id', user.id)
      .maybeSingle();

    if (profileError || !creatorProfile) {
      return new Response(JSON.stringify({ error: 'Creator profile not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Parse multipart form data
    const formData = await req.formData();
    const file = formData.get('file') as File;
    const mediaType = formData.get('media_type') as string || 'image'; // 'image' or 'video'

    if (!file) {
      return new Response(JSON.stringify({ error: 'No file provided' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Validate file type
    const imageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    const videoTypes = ['video/mp4', 'video/quicktime', 'video/webm'];
    const allowedTypes = mediaType === 'video' ? videoTypes : imageTypes;
    
    if (!allowedTypes.includes(file.type)) {
      return new Response(JSON.stringify({ 
        error: mediaType === 'video' 
          ? 'Invalid file type. Allowed videos: mp4, mov, webm' 
          : 'Invalid file type. Allowed images: jpg, png, gif, webp' 
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Validate file size
    const maxSize = mediaType === 'video' ? 100 * 1024 * 1024 : 5 * 1024 * 1024; // 100MB for video, 5MB for image
    if (file.size > maxSize) {
      return new Response(JSON.stringify({ 
        error: `File too large. Maximum size is ${mediaType === 'video' ? '100MB' : '5MB'}` 
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Check video limit (max 3 videos)
    if (mediaType === 'video') {
      const { data: existingVideos } = await supabase
        .from('creator_portfolio_media')
        .select('id')
        .eq('creator_profile_id', creatorProfile.id)
        .eq('media_type', 'video');
      
      if (existingVideos && existingVideos.length >= 3) {
        return new Response(JSON.stringify({ error: 'Maximum 3 videos allowed in portfolio' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }

    // Generate R2 key
    const timestamp = Date.now();
    const fileExt = file.name.split('.').pop() || (mediaType === 'video' ? 'mp4' : 'jpg');
    const r2Key = `portfolio-media/${user.id}/${timestamp}-${mediaType}.${fileExt}`;

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
    const uploadUrl = `${r2Endpoint}/${r2BucketName}/${r2Key}`;
    console.log('=== R2 UPLOAD DEBUG ===');
    console.log('Upload URL:', uploadUrl);
    console.log('R2 Key:', r2Key);
    console.log('File Type:', file.type);
    console.log('File Size:', file.size, 'bytes');
    console.log('=======================');

    const uploadResponse = await fetch(uploadUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': file.type,
        'x-amz-content-sha256': payloadHash,
        'x-amz-date': amzDate,
        'Authorization': authorizationHeader,
      },
      body: fileBuffer,
    });

    console.log('R2 Response Status:', uploadResponse.status);
    console.log('R2 Response Headers:', Object.fromEntries(uploadResponse.headers.entries()));

    if (!uploadResponse.ok) {
      const errorText = await uploadResponse.text();
      console.error('=== R2 UPLOAD FAILED ===');
      console.error('Status:', uploadResponse.status);
      console.error('Error Response:', errorText);
      console.error('========================');
      return new Response(JSON.stringify({ error: 'Failed to upload file to storage', details: errorText }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const publicUrl = `${r2PublicUrl}/${r2Key}`;

    // Get next display order
    const { data: existingMedia } = await supabase
      .from('creator_portfolio_media')
      .select('display_order')
      .eq('creator_profile_id', creatorProfile.id)
      .order('display_order', { ascending: false })
      .limit(1);

    const nextOrder = existingMedia && existingMedia.length > 0 
      ? (existingMedia[0].display_order || 0) + 1 
      : 0;

    // Insert into database
    const { data: insertedData, error: dbError } = await supabase
      .from('creator_portfolio_media')
      .insert({
        creator_profile_id: creatorProfile.id,
        media_type: mediaType,
        url: publicUrl,
        thumbnail_url: mediaType === 'image' ? publicUrl : null,
        display_order: nextOrder,
        file_size_bytes: file.size,
      })
      .select()
      .single();

    if (dbError) {
      console.error('Database insert failed:', dbError);
      return new Response(JSON.stringify({ error: 'Failed to save media record' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log(`Portfolio media uploaded successfully: ${r2Key}, size: ${file.size} bytes`);

    return new Response(JSON.stringify({
      success: true,
      media: {
        id: insertedData.id,
        url: publicUrl,
        r2_key: r2Key,
        media_type: mediaType,
        file_size: file.size,
        display_order: nextOrder,
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
