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

    // Parse request body
    const { content_id } = await req.json();

    if (!content_id) {
      return new Response(JSON.stringify({ error: 'Content ID is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get content record and verify ownership
    const { data: contentRecord, error: contentError } = await supabase
      .from('content_library')
      .select('*')
      .eq('id', content_id)
      .eq('brand_profile_id', brandProfile.id)
      .single();

    if (contentError || !contentRecord) {
      return new Response(JSON.stringify({ error: 'Content not found or access denied' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const r2Key = contentRecord.r2_key;

    // Delete from R2 using S3-compatible API
    const r2Endpoint = `https://${r2AccountId}.r2.cloudflarestorage.com`;

    const date = new Date();
    const dateString = date.toISOString().slice(0, 10).replace(/-/g, '');
    const amzDate = date.toISOString().replace(/[:-]|\.\d{3}/g, '');
    const region = 'auto';
    const service = 's3';

    // Create canonical request for DELETE
    const method = 'DELETE';
    const canonicalUri = `/${r2BucketName}/${r2Key}`;
    const canonicalQueryString = '';
    const payloadHash = 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'; // Empty payload hash

    const canonicalHeaders = [
      `host:${r2AccountId}.r2.cloudflarestorage.com`,
      `x-amz-content-sha256:${payloadHash}`,
      `x-amz-date:${amzDate}`,
    ].join('\n') + '\n';

    const signedHeaders = 'host;x-amz-content-sha256;x-amz-date';

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

    // Delete from R2
    const deleteResponse = await fetch(`${r2Endpoint}/${r2BucketName}/${r2Key}`, {
      method: 'DELETE',
      headers: {
        'x-amz-content-sha256': payloadHash,
        'x-amz-date': amzDate,
        'Authorization': authorizationHeader,
      },
    });

    // R2 returns 204 on successful delete, 404 if already deleted
    if (!deleteResponse.ok && deleteResponse.status !== 404) {
      const errorText = await deleteResponse.text();
      console.error('R2 delete failed:', errorText);
      return new Response(JSON.stringify({ error: 'Failed to delete file from storage' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Delete thumbnail if exists
    if (contentRecord.thumbnail_r2_key) {
      // Similar delete for thumbnail (simplified - reusing same auth logic)
      const thumbUri = `/${r2BucketName}/${contentRecord.thumbnail_r2_key}`;
      const thumbCanonicalHeaders = [
        `host:${r2AccountId}.r2.cloudflarestorage.com`,
        `x-amz-content-sha256:${payloadHash}`,
        `x-amz-date:${amzDate}`,
      ].join('\n') + '\n';

      const thumbCanonicalRequest = [
        method,
        thumbUri,
        canonicalQueryString,
        thumbCanonicalHeaders,
        signedHeaders,
        payloadHash,
      ].join('\n');

      const thumbCanonicalRequestHash = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(thumbCanonicalRequest))
        .then(hash => Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, '0')).join(''));

      const thumbStringToSign = [
        algorithm,
        amzDate,
        credentialScope,
        thumbCanonicalRequestHash,
      ].join('\n');

      const thumbSignature = await hmacSha256(kSigning, thumbStringToSign)
        .then(sig => Array.from(new Uint8Array(sig)).map(b => b.toString(16).padStart(2, '0')).join(''));

      const thumbAuthHeader = `${algorithm} Credential=${r2AccessKeyId}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${thumbSignature}`;

      await fetch(`${r2Endpoint}/${r2BucketName}/${contentRecord.thumbnail_r2_key}`, {
        method: 'DELETE',
        headers: {
          'x-amz-content-sha256': payloadHash,
          'x-amz-date': amzDate,
          'Authorization': thumbAuthHeader,
        },
      });
    }

    // Delete from database
    const { error: deleteError } = await supabase
      .from('content_library')
      .delete()
      .eq('id', content_id);

    if (deleteError) {
      console.error('Database delete failed:', deleteError);
      return new Response(JSON.stringify({ error: 'Failed to delete content record' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get updated storage usage
    const { data: usageData } = await supabase
      .from('content_library')
      .select('file_size_bytes')
      .eq('brand_profile_id', brandProfile.id);

    const currentUsage = usageData?.reduce((sum, item) => sum + (item.file_size_bytes || 0), 0) || 0;

    // Get subscription for limit
    const { data: subscription } = await supabase
      .from('brand_subscriptions')
      .select('plan_type')
      .eq('brand_profile_id', brandProfile.id)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    const planType = subscription?.plan_type || 'basic';
    const storageLimit = planType === 'premium' ? 50 * 1024 * 1024 * 1024 : 10 * 1024 * 1024 * 1024;

    const { data: purchases } = await supabase
      .from('storage_purchases')
      .select('storage_amount_bytes')
      .eq('brand_profile_id', brandProfile.id)
      .eq('status', 'active');

    const extraStorage = purchases?.reduce((sum, p) => sum + (p.storage_amount_bytes || 0), 0) || 0;
    const effectiveLimit = storageLimit + extraStorage;

    console.log(`Content deleted successfully: ${r2Key}, freed: ${contentRecord.file_size_bytes} bytes`);

    return new Response(JSON.stringify({
      success: true,
      deleted: {
        id: content_id,
        file_name: contentRecord.file_name,
        file_size_bytes: contentRecord.file_size_bytes,
      },
      storage: {
        used: currentUsage,
        limit: effectiveLimit,
        remaining: effectiveLimit - currentUsage,
      },
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Delete error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
