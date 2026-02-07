import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "https://esm.sh/resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// AWS Signature V4 implementation for S3
async function signAWSRequest(
  method: string,
  url: URL,
  headers: Record<string, string>,
  body: Uint8Array | string,
  accessKeyId: string,
  secretAccessKey: string,
  region: string,
  service: string
): Promise<Record<string, string>> {
  const encoder = new TextEncoder();
  const bodyBytes = typeof body === "string" ? encoder.encode(body) : body;
  
  const date = new Date();
  const amzDate = date.toISOString().replace(/[:-]|\.\d{3}/g, "");
  const dateStamp = amzDate.slice(0, 8);
  
  const payloadHash = await crypto.subtle.digest("SHA-256", bodyBytes);
  const payloadHashHex = Array.from(new Uint8Array(payloadHash))
    .map(b => b.toString(16).padStart(2, "0"))
    .join("");
  
  const signedHeaders = "host;x-amz-content-sha256;x-amz-date";
  const canonicalHeaders = `host:${url.host}\nx-amz-content-sha256:${payloadHashHex}\nx-amz-date:${amzDate}\n`;
  
  const canonicalRequest = [
    method,
    url.pathname,
    url.search.slice(1),
    canonicalHeaders,
    signedHeaders,
    payloadHashHex,
  ].join("\n");
  
  const canonicalRequestHash = await crypto.subtle.digest("SHA-256", encoder.encode(canonicalRequest));
  const canonicalRequestHashHex = Array.from(new Uint8Array(canonicalRequestHash))
    .map(b => b.toString(16).padStart(2, "0"))
    .join("");
  
  const credentialScope = `${dateStamp}/${region}/${service}/aws4_request`;
  const stringToSign = `AWS4-HMAC-SHA256\n${amzDate}\n${credentialScope}\n${canonicalRequestHashHex}`;
  
  async function hmacSHA256(key: BufferSource, data: string): Promise<ArrayBuffer> {
    const cryptoKey = await crypto.subtle.importKey(
      "raw", key as ArrayBuffer, { name: "HMAC", hash: "SHA-256" }, false, ["sign"]
    );
    return await crypto.subtle.sign("HMAC", cryptoKey, encoder.encode(data));
  }
  
  const kDate = await hmacSHA256(encoder.encode(`AWS4${secretAccessKey}`) as BufferSource, dateStamp);
  const kRegion = await hmacSHA256(kDate, region);
  const kService = await hmacSHA256(kRegion, service);
  const kSigning = await hmacSHA256(kService, "aws4_request");
  
  const signature = await hmacSHA256(kSigning, stringToSign);
  const signatureHex = Array.from(new Uint8Array(signature))
    .map(b => b.toString(16).padStart(2, "0"))
    .join("");
  
  const authorizationHeader = `AWS4-HMAC-SHA256 Credential=${accessKeyId}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signatureHex}`;
  
  return {
    ...headers,
    "x-amz-date": amzDate,
    "x-amz-content-sha256": payloadHashHex,
    Authorization: authorizationHeader,
  };
}

// Upload binary or text to S3
async function uploadToS3(
  content: Uint8Array | string,
  fileName: string,
  contentType: string,
  bucketName: string,
  region: string,
  accessKeyId: string,
  secretAccessKey: string
): Promise<{ success: boolean; url?: string; error?: string }> {
  try {
    const url = new URL(`https://${bucketName}.s3.${region}.amazonaws.com/${fileName}`);
    const bodyBytes = typeof content === "string" ? new TextEncoder().encode(content) : content;
    
    const headers = await signAWSRequest(
      "PUT", url,
      { "Content-Type": contentType, Host: url.host },
      bodyBytes, accessKeyId, secretAccessKey, region, "s3"
    );
    
    const response = await fetch(url.toString(), {
      method: "PUT",
      headers,
      body: bodyBytes,
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      return { success: false, error: `S3 upload failed: ${response.status} - ${errorText}` };
    }
    
    return { success: true, url: url.toString() };
  } catch (err) {
    return { success: false, error: `S3 upload error: ${(err as Error).message}` };
  }
}

// Supabase Storage buckets to back up
const STORAGE_BUCKETS = [
  "profile-images",
  "portfolio-media",
  "brand-logos",
  "career-cvs",
];

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }
  
  const startTime = Date.now();
  
  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const awsAccessKeyId = Deno.env.get("AWS_ACCESS_KEY_ID");
    const awsSecretAccessKey = Deno.env.get("AWS_SECRET_ACCESS_KEY");
    const awsBucketName = Deno.env.get("AWS_BUCKET_NAME");
    const awsRegion = Deno.env.get("AWS_REGION") || "us-east-1";
    
    if (!supabaseUrl || !supabaseServiceKey) throw new Error("Missing Supabase configuration");
    if (!awsAccessKeyId || !awsSecretAccessKey || !awsBucketName) throw new Error("Missing AWS configuration");
    
    // Parse request
    let backupType = "media";
    let triggeredBy: string | null = null;
    let isChainedCall = false;
    
    try {
      const body = await req.json();
      backupType = body.type || "media";
      triggeredBy = body.triggered_by || null;
      isChainedCall = body.chained_from_db_backup === true;
    } catch { /* defaults */ }
    
    // Auth check - skip if chained from database-backup (internal call)
    if (!isChainedCall) {
      const authHeader = req.headers.get("Authorization");
      if (!authHeader?.startsWith("Bearer ")) {
        return new Response(
          JSON.stringify({ success: false, error: "Unauthorized" }),
          { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      const token = authHeader.replace("Bearer ", "");
      const supabaseClient = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY") || supabaseServiceKey, {
        global: { headers: { Authorization: `Bearer ${token}` } }
      });
      
      const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
      if (authError || !user) {
        return new Response(
          JSON.stringify({ success: false, error: "Unauthorized: Invalid token" }),
          { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
      const { data: isAdmin } = await supabaseAdmin.rpc("has_role", { _user_id: user.id, _role: "admin" });
      
      if (!isAdmin) {
        return new Response(
          JSON.stringify({ success: false, error: "Forbidden: Admin access required" }),
          { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      if (!triggeredBy) triggeredBy = user.id;
    }
    
    console.log(`Starting media backup (${backupType})...`);
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    let totalFilesBackedUp = 0;
    let totalBytesBackedUp = 0;
    const manifest: Record<string, Array<{ name: string; size: number; s3_key: string }>> = {};
    const errors: string[] = [];
    
    // === PART 1: Backup Supabase Storage buckets ===
    for (const bucket of STORAGE_BUCKETS) {
      console.log(`Processing bucket: ${bucket}`);
      manifest[bucket] = [];
      
      const { data: files, error: listError } = await supabase.storage
        .from(bucket)
        .list("", { limit: 1000, sortBy: { column: "name", order: "asc" } });
      
      if (listError) {
        console.warn(`Could not list ${bucket}: ${listError.message}`);
        errors.push(`List ${bucket}: ${listError.message}`);
        continue;
      }
      
      if (!files || files.length === 0) {
        console.log(`Bucket ${bucket} is empty, skipping`);
        continue;
      }
      
      // Process files - handle both root files and folders
      const allFiles = await listAllFiles(supabase, bucket, "");
      
      for (const file of allFiles) {
        try {
          const { data: fileData, error: downloadError } = await supabase.storage
            .from(bucket)
            .download(file.path);
          
          if (downloadError || !fileData) {
            console.warn(`Could not download ${bucket}/${file.path}: ${downloadError?.message}`);
            errors.push(`Download ${bucket}/${file.path}: ${downloadError?.message}`);
            continue;
          }
          
          const arrayBuffer = await fileData.arrayBuffer();
          const bytes = new Uint8Array(arrayBuffer);
          const s3Key = `media-backups/${timestamp}/${bucket}/${file.path}`;
          
          const uploadResult = await uploadToS3(
            bytes, s3Key, fileData.type || "application/octet-stream",
            awsBucketName, awsRegion, awsAccessKeyId, awsSecretAccessKey
          );
          
          if (uploadResult.success) {
            totalFilesBackedUp++;
            totalBytesBackedUp += bytes.length;
            manifest[bucket].push({ name: file.path, size: bytes.length, s3_key: s3Key });
            console.log(`✓ Backed up ${bucket}/${file.path} (${bytes.length} bytes)`);
          } else {
            errors.push(`Upload ${bucket}/${file.path}: ${uploadResult.error}`);
          }
        } catch (fileErr) {
          errors.push(`Process ${bucket}/${file.path}: ${(fileErr as Error).message}`);
        }
      }
    }
    
    // === PART 2: Generate R2 Inventory ===
    console.log("Generating R2 inventory...");
    
    const { data: contentLibrary } = await supabase
      .from("content_library")
      .select("id, brand_profile_id, file_name, file_size_bytes, file_type, mime_type, r2_key, thumbnail_r2_key, created_at");
    
    const { data: deliverables } = await supabase
      .from("booking_deliverables")
      .select("id, booking_id, creator_profile_id, file_name, file_size_bytes, file_type, mime_type, r2_key, thumbnail_r2_key, created_at");
    
    const { data: portfolioMedia } = await supabase
      .from("creator_portfolio_media")
      .select("id, creator_profile_id, media_url, media_type, file_size_bytes, r2_key, created_at");
    
    const r2Inventory = {
      generated_at: new Date().toISOString(),
      r2_bucket: Deno.env.get("R2_BUCKET_NAME") || "unknown",
      r2_public_url: Deno.env.get("R2_PUBLIC_URL") || "unknown",
      content_library: {
        count: contentLibrary?.length || 0,
        total_size_bytes: contentLibrary?.reduce((sum, f) => sum + (f.file_size_bytes || 0), 0) || 0,
        files: contentLibrary || [],
      },
      booking_deliverables: {
        count: deliverables?.length || 0,
        total_size_bytes: deliverables?.reduce((sum, f) => sum + (f.file_size_bytes || 0), 0) || 0,
        files: deliverables || [],
      },
      portfolio_media_r2: {
        count: portfolioMedia?.filter(p => p.r2_key)?.length || 0,
        files: portfolioMedia?.filter(p => p.r2_key) || [],
      },
    };
    
    const r2InventoryJson = JSON.stringify(r2Inventory, null, 2);
    const r2InventoryKey = `media-backups/${timestamp}/r2-inventory.json`;
    
    await uploadToS3(
      r2InventoryJson, r2InventoryKey, "application/json",
      awsBucketName, awsRegion, awsAccessKeyId, awsSecretAccessKey
    );
    console.log("R2 inventory uploaded to S3");
    
    // === PART 3: Upload manifest ===
    const manifestData = {
      generated_at: new Date().toISOString(),
      backup_type: backupType,
      supabase_storage: {
        total_files: totalFilesBackedUp,
        total_bytes: totalBytesBackedUp,
        buckets: manifest,
      },
      r2_inventory: {
        content_library_count: r2Inventory.content_library.count,
        deliverables_count: r2Inventory.booking_deliverables.count,
        portfolio_r2_count: r2Inventory.portfolio_media_r2.count,
        total_r2_size_bytes: r2Inventory.content_library.total_size_bytes + r2Inventory.booking_deliverables.total_size_bytes,
      },
      errors: errors,
    };
    
    const manifestJson = JSON.stringify(manifestData, null, 2);
    const manifestKey = `media-backups/${timestamp}/manifest.json`;
    
    await uploadToS3(
      manifestJson, manifestKey, "application/json",
      awsBucketName, awsRegion, awsAccessKeyId, awsSecretAccessKey
    );
    
    const executionTime = Date.now() - startTime;
    
    // Record in backup_history
    await supabase.from("backup_history").insert({
      backup_type: backupType,
      status: errors.length === 0 ? "success" : "partial",
      file_name: manifestKey,
      file_size: totalBytesBackedUp,
      execution_time_ms: executionTime,
      tables_backed_up: STORAGE_BUCKETS,
      components_backed_up: {
        supabase_storage_files: totalFilesBackedUp,
        supabase_storage_bytes: totalBytesBackedUp,
        r2_content_library: r2Inventory.content_library.count,
        r2_deliverables: r2Inventory.booking_deliverables.count,
        r2_portfolio: r2Inventory.portfolio_media_r2.count,
        errors: errors.length,
      },
      error_message: errors.length > 0 ? errors.join("; ") : null,
      triggered_by: triggeredBy,
    });
    
    console.log(`Media backup completed in ${executionTime}ms: ${totalFilesBackedUp} files, ${totalBytesBackedUp} bytes`);
    
    return new Response(
      JSON.stringify({
        success: true,
        message: "Media backup completed",
        files_backed_up: totalFilesBackedUp,
        total_bytes: totalBytesBackedUp,
        r2_inventory: {
          content_library: r2Inventory.content_library.count,
          deliverables: r2Inventory.booking_deliverables.count,
        },
        errors: errors,
        execution_time_ms: executionTime,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    const error = err as Error;
    console.error("Media backup failed:", error);
    
    const executionTime = Date.now() - startTime;
    
    try {
      const supabaseUrl = Deno.env.get("SUPABASE_URL");
      const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
      if (supabaseUrl && supabaseServiceKey) {
        const supabase = createClient(supabaseUrl, supabaseServiceKey);
        await supabase.from("backup_history").insert({
          backup_type: "media",
          status: "failed",
          error_message: error.message,
          execution_time_ms: executionTime,
          tables_backed_up: [],
        });
      }
    } catch { /* ignore */ }
    
    return new Response(
      JSON.stringify({ success: false, error: error.message, execution_time_ms: executionTime }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

// Recursively list all files in a bucket (handles folders)
async function listAllFiles(
  supabase: ReturnType<typeof createClient>,
  bucket: string,
  prefix: string
): Promise<Array<{ path: string }>> {
  const results: Array<{ path: string }> = [];
  
  const { data: items, error } = await supabase.storage
    .from(bucket)
    .list(prefix, { limit: 1000, sortBy: { column: "name", order: "asc" } });
  
  if (error || !items) return results;
  
  for (const item of items) {
    const fullPath = prefix ? `${prefix}/${item.name}` : item.name;
    
    if (item.id === null) {
      // It's a folder, recurse
      const subFiles = await listAllFiles(supabase, bucket, fullPath);
      results.push(...subFiles);
    } else {
      results.push({ path: fullPath });
    }
  }
  
  return results;
}
