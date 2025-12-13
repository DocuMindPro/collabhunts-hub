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

    // ========== SUPABASE STORAGE STATS ==========
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
    
    if (bucketsError) {
      console.error("Error listing buckets:", bucketsError);
      throw new Error(`Failed to list buckets: ${bucketsError.message}`);
    }

    const bucketStats: BucketStats[] = [];
    let supabaseTotalFiles = 0;
    let supabaseTotalSize = 0;

    // Get stats for each Supabase bucket
    for (const bucket of buckets) {
      console.log(`Analyzing Supabase bucket: ${bucket.name}`);
      
      let bucketFileCount = 0;
      let bucketTotalSize = 0;
      let largestFile: { name: string; size: number } | null = null;

      const { data: files, error: filesError } = await supabase.storage
        .from(bucket.name)
        .list("", { limit: 1000 });

      if (filesError) {
        console.error(`Error listing files in ${bucket.name}:`, filesError);
        continue;
      }

      // Process files and folders recursively
      const processFolder = async (folderPath: string) => {
        const { data: items } = await supabase.storage
          .from(bucket.name)
          .list(folderPath, { limit: 1000 });

        if (!items) return;

        for (const item of items) {
          const fullPath = folderPath ? `${folderPath}/${item.name}` : item.name;
          
          if (item.id === null) {
            await processFolder(fullPath);
          } else {
            const fileSize = item.metadata?.size || 0;
            bucketFileCount++;
            bucketTotalSize += fileSize;
            
            if (!largestFile || fileSize > largestFile.size) {
              largestFile = { name: fullPath, size: fileSize };
            }
          }
        }
      };

      if (files) {
        for (const item of files) {
          if (item.id === null) {
            await processFolder(item.name);
          } else {
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

      supabaseTotalFiles += bucketFileCount;
      supabaseTotalSize += bucketTotalSize;
    }

    // ========== CLOUDFLARE R2 STATS (from database tables) ==========
    console.log("Fetching Cloudflare R2 stats from database...");

    // Content Library stats
    const { data: contentLibraryStats } = await supabase
      .from("content_library")
      .select("file_size_bytes");

    const contentLibrarySize = contentLibraryStats?.reduce((sum, item) => sum + (item.file_size_bytes || 0), 0) || 0;
    const contentLibraryCount = contentLibraryStats?.length || 0;

    // Booking Deliverables stats  
    const { data: deliverablesStats } = await supabase
      .from("booking_deliverables")
      .select("file_size_bytes");

    const deliverablesSize = deliverablesStats?.reduce((sum, item) => sum + (item.file_size_bytes || 0), 0) || 0;
    const deliverablesCount = deliverablesStats?.length || 0;

    // Portfolio Media stats (also stored in R2)
    const { data: portfolioStats } = await supabase
      .from("creator_portfolio_media")
      .select("file_size_bytes");

    const portfolioSize = portfolioStats?.reduce((sum, item) => sum + (item.file_size_bytes || 0), 0) || 0;
    const portfolioCount = portfolioStats?.length || 0;

    const r2TotalSize = contentLibrarySize + deliverablesSize + portfolioSize;
    const r2TotalFiles = contentLibraryCount + deliverablesCount + portfolioCount;

    // ========== AWS S3 BACKUP STATS ==========
    console.log("Fetching AWS S3 backup stats...");

    // Get total backup size from all successful backups
    const { data: backupStats } = await supabase
      .from("backup_history")
      .select("file_size, status")
      .eq("status", "success");

    const s3TotalSize = backupStats?.reduce((sum, item) => sum + (item.file_size || 0), 0) || 0;
    const s3BackupCount = backupStats?.length || 0;

    // Get latest backup info
    const { data: latestBackup } = await supabase
      .from("backup_history")
      .select("file_size, created_at")
      .eq("status", "success")
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    const response = {
      success: true,
      // Supabase Storage (profile-images, portfolio-media)
      supabase: {
        buckets: bucketStats,
        totalFiles: supabaseTotalFiles,
        totalSize: supabaseTotalSize,
        formattedTotalSize: formatBytes(supabaseTotalSize),
      },
      // Cloudflare R2 (Content Library + Deliverables + Portfolio Media)
      r2: {
        contentLibrary: {
          fileCount: contentLibraryCount,
          totalSize: contentLibrarySize,
          formattedSize: formatBytes(contentLibrarySize),
        },
        deliverables: {
          fileCount: deliverablesCount,
          totalSize: deliverablesSize,
          formattedSize: formatBytes(deliverablesSize),
        },
        portfolioMedia: {
          fileCount: portfolioCount,
          totalSize: portfolioSize,
          formattedSize: formatBytes(portfolioSize),
        },
        totalFiles: r2TotalFiles,
        totalSize: r2TotalSize,
        formattedTotalSize: formatBytes(r2TotalSize),
      },
      // AWS S3 (Database Backups)
      s3: {
        backupCount: s3BackupCount,
        totalSize: s3TotalSize,
        formattedTotalSize: formatBytes(s3TotalSize),
        latestBackupSize: latestBackup?.file_size || 0,
        formattedLatestBackupSize: formatBytes(latestBackup?.file_size || 0),
        latestBackupDate: latestBackup?.created_at || null,
      },
      // Combined totals
      combined: {
        totalFiles: supabaseTotalFiles + r2TotalFiles + s3BackupCount,
        totalSize: supabaseTotalSize + r2TotalSize + s3TotalSize,
        formattedTotalSize: formatBytes(supabaseTotalSize + r2TotalSize + s3TotalSize),
      },
      // Legacy fields for backwards compatibility
      storage: {
        buckets: bucketStats,
        totalFiles: supabaseTotalFiles,
        totalSize: supabaseTotalSize,
        formattedTotalSize: formatBytes(supabaseTotalSize),
      },
      database: {
        latestBackupSize: latestBackup?.file_size || 0,
        formattedBackupSize: formatBytes(latestBackup?.file_size || 0),
      },
      recommendations: {
        storageWarning: (supabaseTotalSize + r2TotalSize) > 1024 * 1024 * 1024,
        filesWarning: (supabaseTotalFiles + r2TotalFiles) > 10000,
        message: (supabaseTotalSize + r2TotalSize) > 1024 * 1024 * 1024 
          ? "Consider implementing image optimization to reduce storage usage"
          : "Storage usage is within normal limits",
      },
    };

    console.log("Storage stats fetched successfully");

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
