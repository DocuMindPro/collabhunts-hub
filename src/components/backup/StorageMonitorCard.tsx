import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { HardDrive, Image, Cloud, Database, RefreshCw, FolderOpen, Package, FileVideo } from "lucide-react";

interface BucketStats {
  name: string;
  fileCount: number;
  totalSize: number;
  largestFile: { name: string; size: number } | null;
}

interface StorageStats {
  success: boolean;
  supabase: {
    buckets: BucketStats[];
    totalFiles: number;
    totalSize: number;
    formattedTotalSize: string;
  };
  r2: {
    contentLibrary: {
      fileCount: number;
      totalSize: number;
      formattedSize: string;
    };
    deliverables: {
      fileCount: number;
      totalSize: number;
      formattedSize: string;
    };
    totalFiles: number;
    totalSize: number;
    formattedTotalSize: string;
  };
  s3: {
    backupCount: number;
    totalSize: number;
    formattedTotalSize: string;
    latestBackupSize: number;
    formattedLatestBackupSize: string;
    latestBackupDate: string | null;
  };
  combined: {
    totalFiles: number;
    totalSize: number;
    formattedTotalSize: string;
  };
  recommendations: {
    storageWarning: boolean;
    filesWarning: boolean;
    message: string;
  };
}

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
    staleTime: 5 * 60 * 1000,
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <HardDrive className="h-4 w-4" />
            Storage Overview
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
            Storage Overview
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
    <div className="grid gap-4 md:grid-cols-3">
      {/* Supabase Storage Card */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <Database className="h-4 w-4 text-green-500" />
            Supabase Storage
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold">
              {storageStats.supabase.formattedTotalSize}
            </span>
            <Badge variant="outline" className="text-xs">
              {storageStats.supabase.totalFiles} files
            </Badge>
          </div>

          <p className="text-xs text-muted-foreground">
            Profile images & portfolio media
          </p>

          {storageStats.supabase.buckets.length > 0 && (
            <div className="pt-2 border-t border-border/50 space-y-2">
              {storageStats.supabase.buckets.map((bucket) => (
                <div key={bucket.name} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1">
                    <FolderOpen className="h-3 w-3 text-muted-foreground" />
                    <span>{bucket.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">{bucket.fileCount} files</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Cloudflare R2 Card */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <Cloud className="h-4 w-4 text-orange-500" />
            Cloudflare R2
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold">
              {storageStats.r2.formattedTotalSize}
            </span>
            <Badge variant="outline" className="text-xs">
              {storageStats.r2.totalFiles} files
            </Badge>
          </div>

          <p className="text-xs text-muted-foreground">
            Content Library & deliverables
          </p>

          <div className="pt-2 border-t border-border/50 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-1">
                <Package className="h-3 w-3 text-muted-foreground" />
                <span>Content Library</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">{storageStats.r2.contentLibrary.fileCount} files</span>
                <Badge variant="secondary" className="text-xs">
                  {storageStats.r2.contentLibrary.formattedSize}
                </Badge>
              </div>
            </div>
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-1">
                <FileVideo className="h-3 w-3 text-muted-foreground" />
                <span>Deliverables</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">{storageStats.r2.deliverables.fileCount} files</span>
                <Badge variant="secondary" className="text-xs">
                  {storageStats.r2.deliverables.formattedSize}
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* AWS S3 Backups Card */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <HardDrive className="h-4 w-4 text-yellow-500" />
            AWS S3 Backups
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold">
              {storageStats.s3.formattedTotalSize}
            </span>
            <Badge variant="outline" className="text-xs">
              {storageStats.s3.backupCount} backups
            </Badge>
          </div>

          <p className="text-xs text-muted-foreground">
            Database backups & recovery docs
          </p>

          <div className="pt-2 border-t border-border/50 space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Latest backup:</span>
              <Badge variant="secondary" className="text-xs">
                {storageStats.s3.formattedLatestBackupSize}
              </Badge>
            </div>
            {storageStats.s3.latestBackupDate && (
              <div className="text-xs text-muted-foreground">
                {new Date(storageStats.s3.latestBackupDate).toLocaleDateString()}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Combined Total Card */}
      <Card className={`md:col-span-3 ${storageStats.recommendations.storageWarning ? "border-amber-500/50" : ""}`}>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <Image className="h-4 w-4" />
            Total Platform Storage
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span className="text-3xl font-bold">
                {storageStats.combined.formattedTotalSize}
              </span>
              <Badge variant="outline">
                {storageStats.combined.totalFiles} total files
              </Badge>
            </div>
            {storageStats.recommendations.storageWarning && (
              <p className="text-xs text-amber-600">
                Consider enabling image optimization
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StorageMonitorCard;
