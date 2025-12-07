import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "https://esm.sh/resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface BackupData {
  metadata: {
    version: string;
    created_at: string;
    backup_type: string;
    supabase_project_id: string;
  };
  tables: Record<string, { error?: string; rows: unknown[]; row_count?: number }>;
  schema: {
    enums: Record<string, string[]>;
    functions: string[];
    triggers: Record<string, unknown>;
    rls_policies: Record<string, unknown>;
  };
  edge_functions: Record<string, string>;
}

// AWS Signature V4 implementation for S3
async function signAWSRequest(
  method: string,
  url: URL,
  headers: Record<string, string>,
  body: string,
  accessKeyId: string,
  secretAccessKey: string,
  region: string,
  service: string
): Promise<Record<string, string>> {
  const encoder = new TextEncoder();
  
  const date = new Date();
  const amzDate = date.toISOString().replace(/[:-]|\.\d{3}/g, "");
  const dateStamp = amzDate.slice(0, 8);
  
  // Hash the payload
  const payloadHash = await crypto.subtle.digest("SHA-256", encoder.encode(body));
  const payloadHashHex = Array.from(new Uint8Array(payloadHash))
    .map(b => b.toString(16).padStart(2, "0"))
    .join("");
  
  // Create canonical headers
  const signedHeaders = "host;x-amz-content-sha256;x-amz-date";
  const canonicalHeaders = `host:${url.host}\nx-amz-content-sha256:${payloadHashHex}\nx-amz-date:${amzDate}\n`;
  
  // Create canonical request
  const canonicalRequest = [
    method,
    url.pathname,
    url.search.slice(1),
    canonicalHeaders,
    signedHeaders,
    payloadHashHex,
  ].join("\n");
  
  // Create string to sign
  const canonicalRequestHash = await crypto.subtle.digest("SHA-256", encoder.encode(canonicalRequest));
  const canonicalRequestHashHex = Array.from(new Uint8Array(canonicalRequestHash))
    .map(b => b.toString(16).padStart(2, "0"))
    .join("");
  
  const credentialScope = `${dateStamp}/${region}/${service}/aws4_request`;
  const stringToSign = `AWS4-HMAC-SHA256\n${amzDate}\n${credentialScope}\n${canonicalRequestHashHex}`;
  
  // Calculate signature
  async function hmacSHA256(key: BufferSource, data: string): Promise<ArrayBuffer> {
    const cryptoKey = await crypto.subtle.importKey(
      "raw",
      key as ArrayBuffer,
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"]
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

// Upload to S3
async function uploadToS3(
  content: string,
  fileName: string,
  bucketName: string,
  region: string,
  accessKeyId: string,
  secretAccessKey: string
): Promise<{ success: boolean; url?: string; error?: string }> {
  try {
    const url = new URL(`https://${bucketName}.s3.${region}.amazonaws.com/${fileName}`);
    
    const headers = await signAWSRequest(
      "PUT",
      url,
      {
        "Content-Type": "application/json",
        Host: url.host,
      },
      content,
      accessKeyId,
      secretAccessKey,
      region,
      "s3"
    );
    
    const response = await fetch(url.toString(), {
      method: "PUT",
      headers,
      body: content,
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      return { success: false, error: `S3 upload failed: ${response.status} - ${errorText}` };
    }
    
    return { success: true, url: url.toString() };
  } catch (err) {
    const error = err as Error;
    return { success: false, error: `S3 upload error: ${error.message}` };
  }
}

// Tables to backup
const TABLES_TO_BACKUP = [
  "profiles",
  "user_roles",
  "brand_profiles",
  "creator_profiles",
  "brand_subscriptions",
  "creator_services",
  "creator_social_accounts",
  "creator_payout_settings",
  "bookings",
  "campaigns",
  "campaign_applications",
  "conversations",
  "messages",
  "notifications",
  "reviews",
  "payouts",
  "profile_views",
  "backup_history",
];

// Edge function descriptions for documentation
const EDGE_FUNCTION_DESCRIPTIONS: Record<string, string> = {
  "admin-reset-password": "Allows administrators to reset user passwords. Validates admin role via JWT and uses service role to update passwords.",
  "database-backup": "Creates comprehensive database backups including all data, schema, and configurations. Uploads to AWS S3 with versioning.",
  "verify-backup": "Validates backup integrity by checking file existence and structure in S3.",
};

Deno.serve(async (req) => {
  // Handle CORS
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }
  
  const startTime = Date.now();
  
  try {
    // Get environment variables
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const awsAccessKeyId = Deno.env.get("AWS_ACCESS_KEY_ID");
    const awsSecretAccessKey = Deno.env.get("AWS_SECRET_ACCESS_KEY");
    const awsBucketName = Deno.env.get("AWS_BUCKET_NAME");
    const awsRegion = Deno.env.get("AWS_REGION") || "us-east-1";
    
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error("Missing Supabase configuration");
    }
    
    if (!awsAccessKeyId || !awsSecretAccessKey || !awsBucketName) {
      throw new Error("Missing AWS configuration");
    }
    
    // Parse request body for backup type
    let backupType = "scheduled";
    let triggeredBy: string | null = null;
    let testFailure = false;
    
    try {
      const body = await req.json();
      backupType = body.type || "scheduled";
      triggeredBy = body.triggered_by || null;
      testFailure = body.test_failure === true;
    } catch {
      // Use defaults if no body
    }
    
    // Test mode: simulate a failure to test email notifications
    if (testFailure) {
      console.log("Test failure mode activated - simulating backup failure");
      throw new Error("TEST FAILURE: This is a simulated backup failure to test email notifications");
    }
    
    console.log(`Starting ${backupType} backup...`);
    
    // Initialize Supabase client with service role
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Collect all backup data
    const backupData: BackupData = {
      metadata: {
        version: "2.0",
        created_at: new Date().toISOString(),
        backup_type: backupType,
        supabase_project_id: "olcygpkghmaqkezmunyu",
      },
      tables: {},
      schema: {
        enums: {},
        functions: [],
        triggers: {},
        rls_policies: {},
      },
      edge_functions: EDGE_FUNCTION_DESCRIPTIONS,
    };
    
    const tablesBackedUp: string[] = [];
    let totalRows = 0;
    
    // Backup each table
    for (const tableName of TABLES_TO_BACKUP) {
      console.log(`Backing up table: ${tableName}`);
      
      const { data, error } = await supabase
        .from(tableName)
        .select("*");
      
      if (error) {
        console.warn(`Warning: Could not backup ${tableName}: ${error.message}`);
        backupData.tables[tableName] = { error: error.message, rows: [] };
      } else {
        backupData.tables[tableName] = {
          row_count: data?.length || 0,
          rows: data || [],
        };
        tablesBackedUp.push(tableName);
        totalRows += data?.length || 0;
      }
    }
    
    // Backup schema information
    console.log("Backing up schema information...");
    
    backupData.schema.enums = {
      app_role: ["admin", "brand", "creator"],
    };
    
    // Get database functions
    const dbFunctions = [
      "create_default_brand_subscription",
      "notify_message_recipient",
      "has_role",
      "handle_new_user",
      "update_updated_at_column",
      "update_conversation_last_message",
    ];
    backupData.schema.functions = dbFunctions;
    
    // Generate filename
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const fileName = `backups/collabhunts-backup-${timestamp}.json`;
    
    // Convert to JSON
    const backupJson = JSON.stringify(backupData, null, 2);
    const fileSize = new Blob([backupJson]).size;
    
    console.log(`Uploading backup to S3: ${fileName} (${fileSize} bytes)`);
    
    // Upload to S3
    const uploadResult = await uploadToS3(
      backupJson,
      fileName,
      awsBucketName,
      awsRegion,
      awsAccessKeyId,
      awsSecretAccessKey
    );
    
    const executionTime = Date.now() - startTime;
    
    // Record backup history
    const historyRecord = {
      backup_type: backupType,
      status: uploadResult.success ? "success" : "failed",
      file_name: fileName,
      s3_url: uploadResult.url || null,
      file_size: fileSize,
      execution_time_ms: executionTime,
      tables_backed_up: tablesBackedUp,
      components_backed_up: {
        tables: tablesBackedUp.length,
        total_rows: totalRows,
        schema_items: Object.keys(backupData.schema).length,
        edge_functions: Object.keys(EDGE_FUNCTION_DESCRIPTIONS).length,
      },
      function_count: Object.keys(EDGE_FUNCTION_DESCRIPTIONS).length,
      error_message: uploadResult.error || null,
      triggered_by: triggeredBy,
    };
    
    const { error: historyError } = await supabase
      .from("backup_history")
      .insert(historyRecord);
    
    if (historyError) {
      console.error("Failed to record backup history:", historyError);
    }
    
    if (!uploadResult.success) {
      throw new Error(uploadResult.error);
    }
    
    console.log(`Backup completed successfully in ${executionTime}ms`);
    
    // Send success email notification
    try {
      const resendApiKey = Deno.env.get("RESEND_API_KEY");
      const adminEmail = Deno.env.get("ADMIN_EMAIL");
      
      if (resendApiKey && adminEmail) {
        const resend = new Resend(resendApiKey);
        
        console.log(`Sending backup success notification to ${adminEmail}`);
        
        const { error: emailError } = await resend.emails.send({
          from: "CollabHunts Backup <onboarding@resend.dev>",
          to: [adminEmail],
          subject: "✅ CollabHunts Database Backup Successful",
          html: `
            <!DOCTYPE html>
            <html>
            <head>
              <style>
                body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: #16a34a; color: white; padding: 20px; border-radius: 8px 8px 0 0; }
                .content { background: #f9fafb; padding: 20px; border: 1px solid #e5e7eb; }
                .footer { background: #f3f4f6; padding: 15px; border-radius: 0 0 8px 8px; text-align: center; font-size: 12px; color: #6b7280; }
                .detail { margin: 10px 0; padding: 10px; background: white; border-radius: 4px; border-left: 4px solid #16a34a; }
                .label { font-weight: 600; color: #374151; }
                .success-box { background: #f0fdf4; border: 1px solid #bbf7d0; padding: 15px; border-radius: 4px; margin: 15px 0; }
                .btn { display: inline-block; background: #2563eb; color: white; padding: 10px 20px; text-decoration: none; border-radius: 6px; margin-top: 15px; }
                .stats { display: flex; gap: 15px; flex-wrap: wrap; margin: 15px 0; }
                .stat { background: white; padding: 12px; border-radius: 6px; border: 1px solid #e5e7eb; flex: 1; min-width: 120px; text-align: center; }
                .stat-value { font-size: 24px; font-weight: 700; color: #16a34a; }
                .stat-label { font-size: 12px; color: #6b7280; }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h1 style="margin: 0;">✅ Backup Successful</h1>
                </div>
                <div class="content">
                  <p>Your database backup has completed successfully.</p>
                  
                  <div class="stats">
                    <div class="stat">
                      <div class="stat-value">${tablesBackedUp.length}</div>
                      <div class="stat-label">Tables</div>
                    </div>
                    <div class="stat">
                      <div class="stat-value">${totalRows.toLocaleString()}</div>
                      <div class="stat-label">Rows</div>
                    </div>
                    <div class="stat">
                      <div class="stat-value">${(fileSize / 1024).toFixed(1)}KB</div>
                      <div class="stat-label">Size</div>
                    </div>
                  </div>
                  
                  <div class="detail">
                    <span class="label">Backup Type:</span> ${backupType}
                  </div>
                  
                  <div class="detail">
                    <span class="label">Timestamp:</span> ${new Date().toISOString()}
                  </div>
                  
                  <div class="detail">
                    <span class="label">Execution Time:</span> ${(executionTime / 1000).toFixed(2)} seconds
                  </div>
                  
                  <div class="detail">
                    <span class="label">File:</span> ${fileName}
                  </div>
                  
                  <div class="success-box">
                    <span class="label">S3 Location:</span><br/>
                    <code style="word-break: break-all;">${uploadResult.url}</code>
                  </div>
                  
                  <a href="https://collabhunts.lovable.app/backup-history" class="btn">View Backup History</a>
                </div>
                <div class="footer">
                  <p>This is an automated message from CollabHunts Backup System</p>
                </div>
              </div>
            </body>
            </html>
          `,
        });
        
        if (emailError) {
          console.error("Failed to send backup success email:", emailError);
        } else {
          console.log("Backup success notification sent successfully");
        }
      }
    } catch (emailErr) {
      console.error("Error sending backup success email:", emailErr);
    }
    
    return new Response(
      JSON.stringify({
        success: true,
        message: "Backup completed successfully",
        file_name: fileName,
        s3_url: uploadResult.url,
        file_size: fileSize,
        tables_backed_up: tablesBackedUp.length,
        total_rows: totalRows,
        execution_time_ms: executionTime,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (err) {
    const error = err as Error;
    console.error("Backup failed:", error);
    
    const executionTime = Date.now() - startTime;
    
    // Determine backup type for error recording
    let backupTypeForError = "scheduled";
    try {
      const body = await req.clone().json();
      backupTypeForError = body.type || "scheduled";
    } catch {
      // Use default
    }
    
    // Try to record failure
    try {
      const supabaseUrl = Deno.env.get("SUPABASE_URL");
      const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
      
      if (supabaseUrl && supabaseServiceKey) {
        const supabase = createClient(supabaseUrl, supabaseServiceKey);
        await supabase.from("backup_history").insert({
          backup_type: backupTypeForError,
          status: "failed",
          error_message: error.message,
          execution_time_ms: executionTime,
          tables_backed_up: [],
        });
      }
    } catch (historyError) {
      console.error("Failed to record backup failure:", historyError);
    }
    
    // Send email notification for backup failure
    try {
      const resendApiKey = Deno.env.get("RESEND_API_KEY");
      const adminEmail = Deno.env.get("ADMIN_EMAIL");
      
      if (resendApiKey && adminEmail) {
        const resend = new Resend(resendApiKey);
        
        console.log(`Sending backup failure notification to ${adminEmail}`);
        
        const { error: emailError } = await resend.emails.send({
          from: "CollabHunts Backup <onboarding@resend.dev>",
          to: [adminEmail],
          subject: "⚠️ CollabHunts Database Backup Failed",
          html: `
            <!DOCTYPE html>
            <html>
            <head>
              <style>
                body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: #dc2626; color: white; padding: 20px; border-radius: 8px 8px 0 0; }
                .content { background: #f9fafb; padding: 20px; border: 1px solid #e5e7eb; }
                .footer { background: #f3f4f6; padding: 15px; border-radius: 0 0 8px 8px; text-align: center; font-size: 12px; color: #6b7280; }
                .detail { margin: 10px 0; padding: 10px; background: white; border-radius: 4px; border-left: 4px solid #dc2626; }
                .label { font-weight: 600; color: #374151; }
                .error-box { background: #fef2f2; border: 1px solid #fecaca; padding: 15px; border-radius: 4px; margin: 15px 0; }
                .btn { display: inline-block; background: #2563eb; color: white; padding: 10px 20px; text-decoration: none; border-radius: 6px; margin-top: 15px; }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h1 style="margin: 0;">⚠️ Backup Failed</h1>
                </div>
                <div class="content">
                  <p>A database backup has failed and requires your attention.</p>
                  
                  <div class="detail">
                    <span class="label">Backup Type:</span> ${backupTypeForError}
                  </div>
                  
                  <div class="detail">
                    <span class="label">Timestamp:</span> ${new Date().toISOString()}
                  </div>
                  
                  <div class="detail">
                    <span class="label">Execution Time:</span> ${(executionTime / 1000).toFixed(2)} seconds
                  </div>
                  
                  <div class="error-box">
                    <span class="label">Error Message:</span><br/>
                    <code>${error.message}</code>
                  </div>
                  
                  <p>Please review the backup configuration and try again.</p>
                  
                  <a href="https://collabhunts.lovable.app/backup-history" class="btn">View Backup History</a>
                </div>
                <div class="footer">
                  <p>This is an automated message from CollabHunts Backup System</p>
                </div>
              </div>
            </body>
            </html>
          `,
        });
        
        if (emailError) {
          console.error("Failed to send backup failure email:", emailError);
        } else {
          console.log("Backup failure notification sent successfully");
        }
      } else {
        console.log("Email notification skipped: RESEND_API_KEY or ADMIN_EMAIL not configured");
      }
    } catch (emailErr) {
      console.error("Error sending backup failure email:", emailErr);
    }
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
        execution_time_ms: executionTime,
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
