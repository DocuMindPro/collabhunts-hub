import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { HardDrive, Image, AlertTriangle, RefreshCw, FolderOpen } from "lucide-react";

interface BucketStats {
  name: string;
  fileCount: number;
  totalSize: number;
  largestFile: { name: string; size: number } | null;
}

interface StorageStats {
  success: boolean;
  storage: {
    buckets: BucketStats[];
    totalFiles: number;
    totalSize: number;
    formattedTotalSize: string;
  };
  database: {
    latestBackupSize: number;
    formattedBackupSize: string;
  };
  recommendations: {
    storageWarning: boolean;
    filesWarning: boolean;
    message: string;
  };
}

const formatBytes = (bytes: number): string => {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
};

const StorageMonitorCard = () => {
  const { data: storageStats, isLoading, error } = useQuery({
    queryKey: ["storage-stats"],
    queryFn: async () => {
      const { data: session } = await supabase.auth.getSession();
      
      if (!session?.session?.access_token) {
        throw new Error("Not authenticated");
      }

      const response = await supabase.functions.invoke("get-storage-stats", {
        headers: {
          Authorization: `Bearer ${session.session.access_token}`,
        },
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      return response.data as StorageStats;
    },
    retry: false,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  // Assume 5GB soft limit for display purposes
  const storageLimit = 5 * 1024 * 1024 * 1024;
  const usagePercent = storageStats 
    ? Math.min((storageStats.storage.totalSize / storageLimit) * 100, 100)
    : 0;

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <HardDrive className="h-4 w-4" />
            Cloud Storage
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 text-muted-foreground">
            <RefreshCw className="h-4 w-4 animate-spin" />
            <span className="text-sm">Loading...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !storageStats?.success) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <HardDrive className="h-4 w-4" />
            Cloud Storage
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground">
            Unable to fetch storage stats
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={storageStats.recommendations.storageWarning ? "border-amber-500/50" : ""}>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
          <HardDrive className="h-4 w-4" />
          Cloud Storage (Files)
          {storageStats.recommendations.storageWarning && (
            <AlertTriangle className="h-4 w-4 text-amber-500" />
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center gap-2">
          <span className="text-2xl font-bold">
            {storageStats.storage.formattedTotalSize}
          </span>
          <Badge variant="outline" className="text-xs">
            {storageStats.storage.totalFiles} files
          </Badge>
        </div>

        <Progress value={usagePercent} className="h-2" />
        <p className="text-xs text-muted-foreground">
          {usagePercent.toFixed(1)}% of 5GB soft limit
        </p>

        {storageStats.storage.buckets.length > 0 && (
          <div className="pt-2 border-t border-border/50 space-y-2">
            <p className="text-xs font-medium text-muted-foreground">By Bucket:</p>
            {storageStats.storage.buckets.map((bucket) => (
              <div key={bucket.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1">
                  <FolderOpen className="h-3 w-3 text-muted-foreground" />
                  <span>{bucket.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">{bucket.fileCount} files</span>
                  <Badge variant="secondary" className="text-xs">
                    {formatBytes(bucket.totalSize)}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        )}

        {storageStats.recommendations.storageWarning && (
          <div className="pt-2 border-t border-border/50">
            <p className="text-xs text-amber-600 flex items-center gap-1">
              <Image className="h-3 w-3" />
              Consider enabling image optimization
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default StorageMonitorCard;
