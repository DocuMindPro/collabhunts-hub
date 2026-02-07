import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { HardDrive, Image, Cloud, Database, RefreshCw, FolderOpen, Package, FileVideo, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";

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
    portfolioMedia: {
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
  const [isOpen, setIsOpen] = useState(false);

  const { data: storageStats, isLoading, error } = useQuery({
    queryKey: ["storage-stats"],
    queryFn: async () => {
      const { data: session } = await supabase.auth.getSession();
      if (!session?.session?.access_token) throw new Error("Not authenticated");
      const response = await supabase.functions.invoke("get-storage-stats", {
        headers: { Authorization: `Bearer ${session.session.access_token}` },
      });
      if (response.error) throw new Error(response.error.message);
      return response.data as StorageStats;
    },
    retry: false,
    staleTime: 5 * 60 * 1000,
  });

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-3">
          <div className="flex items-center gap-2 text-muted-foreground">
            <RefreshCw className="h-4 w-4 animate-spin" />
            <span className="text-sm">Loading storage stats...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !storageStats?.success) {
    return (
      <Card>
        <CardContent className="py-3">
          <div className="text-sm text-muted-foreground">Unable to fetch storage stats</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <Card>
        <CollapsibleTrigger asChild>
          <Button variant="ghost" className="w-full justify-between px-4 py-3 h-auto">
            <div className="flex items-center gap-2 text-sm font-medium">
              <HardDrive className="h-4 w-4 text-muted-foreground" />
              Storage Overview
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Badge variant="outline" className="text-xs font-normal">
                  {storageStats.combined.formattedTotalSize} · {storageStats.combined.totalFiles} files
                </Badge>
              </div>
              <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${isOpen ? "rotate-180" : ""}`} />
            </div>
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <CardContent className="pt-0 pb-4">
            <div className="grid gap-3 md:grid-cols-3">
              {/* Supabase Storage */}
              <div className="rounded-lg border border-border/50 p-3 space-y-2">
                <div className="flex items-center gap-2 text-xs font-medium">
                  <Database className="h-3.5 w-3.5 text-green-500" />
                  Supabase Storage
                  <Badge variant="outline" className="text-xs ml-auto">{storageStats.supabase.totalFiles} files</Badge>
                </div>
                <p className="text-lg font-bold">{storageStats.supabase.formattedTotalSize}</p>
                {storageStats.supabase.buckets.length > 0 && (
                  <div className="space-y-1 pt-1 border-t border-border/30">
                    {storageStats.supabase.buckets.map((bucket) => (
                      <div key={bucket.name} className="flex items-center justify-between text-xs text-muted-foreground">
                        <span className="flex items-center gap-1"><FolderOpen className="h-3 w-3" />{bucket.name}</span>
                        <span>{bucket.fileCount}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Cloudflare R2 */}
              <div className="rounded-lg border border-border/50 p-3 space-y-2">
                <div className="flex items-center gap-2 text-xs font-medium">
                  <Cloud className="h-3.5 w-3.5 text-orange-500" />
                  Cloudflare R2
                  <Badge variant="outline" className="text-xs ml-auto">{storageStats.r2.totalFiles} files</Badge>
                </div>
                <p className="text-lg font-bold">{storageStats.r2.formattedTotalSize}</p>
                <div className="space-y-1 pt-1 border-t border-border/30">
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><Package className="h-3 w-3" />Content Library</span>
                    <span>{storageStats.r2.contentLibrary.fileCount} · {storageStats.r2.contentLibrary.formattedSize}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><FileVideo className="h-3 w-3" />Deliverables</span>
                    <span>{storageStats.r2.deliverables.fileCount} · {storageStats.r2.deliverables.formattedSize}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><Image className="h-3 w-3" />Portfolio</span>
                    <span>{storageStats.r2.portfolioMedia?.fileCount || 0} · {storageStats.r2.portfolioMedia?.formattedSize || '0 B'}</span>
                  </div>
                </div>
              </div>

              {/* AWS S3 */}
              <div className="rounded-lg border border-border/50 p-3 space-y-2">
                <div className="flex items-center gap-2 text-xs font-medium">
                  <HardDrive className="h-3.5 w-3.5 text-yellow-500" />
                  AWS S3 Backups
                  <Badge variant="outline" className="text-xs ml-auto">{storageStats.s3.backupCount} backups</Badge>
                </div>
                <p className="text-lg font-bold">{storageStats.s3.formattedTotalSize}</p>
                <div className="space-y-1 pt-1 border-t border-border/30">
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>Latest backup</span>
                    <span>{storageStats.s3.formattedLatestBackupSize}</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
};

export default StorageMonitorCard;
