import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface BucketStats {
  name: string;
  fileCount: number;
  totalSize: number;
  largestFile: { name: string; size: number } | null;
}

serve(async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Verify admin access
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("No authorization header");
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      throw new Error("Unauthorized");
    }

    // Check if user is admin
    const { data: adminRole } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "admin")
      .single();

    if (!adminRole) {
      throw new Error("Admin access required");
    }

    console.log("Fetching storage statistics...");

    // Get list of buckets
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
    
    if (bucketsError) {
      console.error("Error listing buckets:", bucketsError);
      throw new Error(`Failed to list buckets: ${bucketsError.message}`);
    }

    const bucketStats: BucketStats[] = [];
    let totalFiles = 0;
    let totalSize = 0;

    // Get stats for each bucket
    for (const bucket of buckets) {
      console.log(`Analyzing bucket: ${bucket.name}`);
      
      let bucketFileCount = 0;
      let bucketTotalSize = 0;
      let largestFile: { name: string; size: number } | null = null;

      // List all files in the bucket (recursively through folders)
      const { data: files, error: filesError } = await supabase.storage
        .from(bucket.name)
        .list("", { limit: 1000 });

      if (filesError) {
        console.error(`Error listing files in ${bucket.name}:`, filesError);
        continue;
      }

      // Process files and folders
      const processFolder = async (folderPath: string) => {
        const { data: items } = await supabase.storage
          .from(bucket.name)
          .list(folderPath, { limit: 1000 });

        if (!items) return;

        for (const item of items) {
          const fullPath = folderPath ? `${folderPath}/${item.name}` : item.name;
          
          if (item.id === null) {
            // It's a folder, recurse
            await processFolder(fullPath);
          } else {
            // It's a file
            const fileSize = item.metadata?.size || 0;
            bucketFileCount++;
            bucketTotalSize += fileSize;
            
            if (!largestFile || fileSize > largestFile.size) {
              largestFile = { name: fullPath, size: fileSize };
            }
          }
        }
      };

      // Process root level
      if (files) {
        for (const item of files) {
          if (item.id === null) {
            // It's a folder
            await processFolder(item.name);
          } else {
            // It's a file
            const fileSize = item.metadata?.size || 0;
            bucketFileCount++;
            bucketTotalSize += fileSize;
            
            if (!largestFile || fileSize > largestFile.size) {
              largestFile = { name: item.name, size: fileSize };
            }
          }
        }
      }

      bucketStats.push({
        name: bucket.name,
        fileCount: bucketFileCount,
        totalSize: bucketTotalSize,
        largestFile,
      });

      totalFiles += bucketFileCount;
      totalSize += bucketTotalSize;
    }

    // Get database size estimate from backup history
    const { data: latestBackup } = await supabase
      .from("backup_history")
      .select("file_size")
      .eq("status", "success")
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    const response = {
      success: true,
      storage: {
        buckets: bucketStats,
        totalFiles,
        totalSize,
        formattedTotalSize: formatBytes(totalSize),
      },
      database: {
        latestBackupSize: latestBackup?.file_size || 0,
        formattedBackupSize: formatBytes(latestBackup?.file_size || 0),
      },
      recommendations: {
        storageWarning: totalSize > 1024 * 1024 * 1024, // > 1GB
        filesWarning: totalFiles > 10000,
        message: totalSize > 1024 * 1024 * 1024 
          ? "Consider implementing image optimization to reduce storage usage"
          : "Storage usage is within normal limits",
      },
    };

    console.log("Storage stats:", JSON.stringify(response, null, 2));

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Error in get-storage-stats function:", errorMessage);
    
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});

function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}
