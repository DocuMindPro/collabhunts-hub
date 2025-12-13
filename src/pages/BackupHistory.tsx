import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { format, formatDistanceToNow } from "date-fns";
import {
  Database,
  CheckCircle,
  XCircle,
  RefreshCw,
  Download,
  Shield,
  Clock,
  HardDrive,
  ArrowLeft,
  Calendar,
  Timer,
  AlertTriangle,
  Upload,
  Image,
} from "lucide-react";
import { Link } from "react-router-dom";
import StorageMonitorCard from "@/components/backup/StorageMonitorCard";

interface BackupRecord {
  id: string;
  backup_type: string;
  status: string;
  file_name: string | null;
  s3_url: string | null;
  file_size: number | null;
  execution_time_ms: number | null;
  tables_backed_up: string[] | null;
  components_backed_up: Record<string, unknown> | null;
  error_message: string | null;
  backup_version: string;
  created_at: string;
}

interface CronStatus {
  success: boolean;
  cron: {
    jobName: string;
    schedule: string;
    scheduleDescription: string;
    isActive: boolean;
    functionName: string;
    nextRun: string;
    lastExpectedRun: string;
  };
  recentScheduledBackups: Array<{
    id: string;
    status: string;
    created_at: string;
    execution_time_ms: number | null;
    error_message: string | null;
  }>;
}

const BackupHistory = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isBackingUp, setIsBackingUp] = useState(false);
  const [isTestingFailure, setIsTestingFailure] = useState(false);
  const [isTestingR2, setIsTestingR2] = useState(false);

  // Fetch backup history
  const { data: backups, isLoading } = useQuery({
    queryKey: ["backup-history"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("backup_history")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);

      if (error) throw error;
      return data as BackupRecord[];
    },
  });

  // Fetch cron status
  const { data: cronStatus, isLoading: cronLoading } = useQuery({
    queryKey: ["cron-status"],
    queryFn: async () => {
      const { data: session } = await supabase.auth.getSession();
      
      if (!session?.session?.access_token) {
        throw new Error("Not authenticated");
      }

      const response = await supabase.functions.invoke("get-cron-status", {
        headers: {
          Authorization: `Bearer ${session.session.access_token}`,
        },
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      return response.data as CronStatus;
    },
    retry: false,
  });

  // Trigger manual backup
  const triggerBackup = useMutation({
    mutationFn: async () => {
      setIsBackingUp(true);
      
      const { data: session } = await supabase.auth.getSession();
      
      const response = await supabase.functions.invoke("database-backup", {
        body: {
          type: "manual",
          triggered_by: session?.session?.user?.id,
        },
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      return response.data;
    },
    onSuccess: (data) => {
      toast({
        title: "Backup completed",
        description: `Successfully backed up ${data.tables_backed_up} tables (${data.total_rows} rows)`,
      });
      queryClient.invalidateQueries({ queryKey: ["backup-history"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Backup failed",
        description: error.message,
        variant: "destructive",
      });
    },
    onSettled: () => {
      setIsBackingUp(false);
    },
  });

  // Test backup failure (triggers email notification)
  const testFailure = useMutation({
    mutationFn: async () => {
      setIsTestingFailure(true);
      
      const { data: session } = await supabase.auth.getSession();
      
      const response = await supabase.functions.invoke("database-backup", {
        body: {
          type: "test",
          triggered_by: session?.session?.user?.id,
          test_failure: true,
        },
      });

      // This will always fail, which is expected
      if (response.error) {
        throw new Error(response.error.message);
      }

      return response.data;
    },
    onSuccess: () => {
      // This shouldn't happen in test mode
      toast({
        title: "Test completed",
        description: "Check your email for the failure notification",
      });
    },
    onError: () => {
      toast({
        title: "Test failure triggered",
        description: "Check your email (care@collabhunts.com) for the failure notification",
      });
      queryClient.invalidateQueries({ queryKey: ["backup-history"] });
    },
    onSettled: () => {
      setIsTestingFailure(false);
    },
  });

  // Verify backup
  const verifyBackup = useMutation({
    mutationFn: async (backupId: string) => {
      const { data: session } = await supabase.auth.getSession();
      
      const response = await supabase.functions.invoke("verify-backup", {
        body: { backup_id: backupId },
        headers: {
          Authorization: `Bearer ${session?.session?.access_token}`,
        },
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      return response.data;
    },
    onSuccess: (data) => {
      const isValid = data.verification.overall_valid;
      toast({
        title: isValid ? "Backup verified" : "Verification issues",
        description: isValid
          ? "Backup integrity confirmed"
          : "Some verification checks failed",
        variant: isValid ? "default" : "destructive",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Verification failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Test R2 Upload
  const testR2Upload = useMutation({
    mutationFn: async () => {
      setIsTestingR2(true);
      
      const { data: session } = await supabase.auth.getSession();
      
      if (!session?.session?.access_token) {
        throw new Error("Not authenticated");
      }

      // Create a small test image (1x1 transparent PNG)
      const testImageBase64 = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";
      const testImageBlob = await fetch(`data:image/png;base64,${testImageBase64}`).then(r => r.blob());
      
      const formData = new FormData();
      formData.append("file", testImageBlob, `r2-test-${Date.now()}.png`);
      formData.append("type", "profile");

      const response = await fetch(
        `https://olcygpkghmaqkezmunyu.supabase.co/functions/v1/upload-profile-image`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${session.session.access_token}`,
          },
          body: formData,
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Upload failed");
      }

      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "R2 Upload Test Successful",
        description: `File uploaded to: ${data.url}`,
      });
      queryClient.invalidateQueries({ queryKey: ["storage-stats"] });
    },
    onError: (error: Error) => {
      toast({
        title: "R2 Upload Test Failed",
        description: error.message,
        variant: "destructive",
      });
    },
    onSettled: () => {
      setIsTestingR2(false);
    },
  });

  // Calculate statistics
  const stats = {
    total: backups?.length || 0,
    successful: backups?.filter((b) => b.status === "success").length || 0,
    failed: backups?.filter((b) => b.status === "failed").length || 0,
    totalSize: backups?.reduce((acc, b) => acc + (b.file_size || 0), 0) || 0,
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/admin">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold">Backup History</h1>
              <p className="text-muted-foreground">
                Disaster recovery backup management
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={() => testR2Upload.mutate()}
              disabled={isTestingR2 || isBackingUp || isTestingFailure}
              variant="outline"
              className="gap-2 border-blue-500/50 text-blue-600 hover:bg-blue-500/10"
            >
              {isTestingR2 ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <Image className="h-4 w-4" />
              )}
              {isTestingR2 ? "Testing R2..." : "Test R2 Upload"}
            </Button>
            <Button
              onClick={() => testFailure.mutate()}
              disabled={isTestingFailure || isBackingUp || isTestingR2}
              variant="outline"
              className="gap-2 border-destructive/50 text-destructive hover:bg-destructive/10"
            >
              {isTestingFailure ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <AlertTriangle className="h-4 w-4" />
              )}
              {isTestingFailure ? "Testing..." : "Test Failure Email"}
            </Button>
            <Button
              onClick={() => triggerBackup.mutate()}
              disabled={isBackingUp || isTestingFailure || isTestingR2}
              className="gap-2"
            >
              {isBackingUp ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <Database className="h-4 w-4" />
              )}
              {isBackingUp ? "Backing up..." : "Trigger Backup"}
            </Button>
          </div>
        </div>

        {/* Scheduled Backup Status Card */}
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Timer className="h-5 w-5 text-primary" />
              Scheduled Backup Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            {cronLoading ? (
              <div className="flex items-center gap-2 text-muted-foreground">
                <RefreshCw className="h-4 w-4 animate-spin" />
                Loading cron status...
              </div>
            ) : cronStatus?.success ? (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      {cronStatus.cron.isActive ? (
                        <Badge className="bg-green-500/10 text-green-600 border-green-500/20">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Active
                        </Badge>
                      ) : (
                        <Badge variant="destructive">
                          <XCircle className="h-3 w-3 mr-1" />
                          Inactive
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Schedule:</span>
                    <span className="font-medium">{cronStatus.cron.scheduleDescription}</span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Next run:</span>
                    <span className="font-medium">
                      {format(new Date(cronStatus.cron.nextRun), "MMM d, yyyy HH:mm")} UTC
                      <span className="text-muted-foreground ml-1">
                        ({formatDistanceToNow(new Date(cronStatus.cron.nextRun), { addSuffix: true })})
                      </span>
                    </span>
                  </div>
                </div>

                {/* Recent Scheduled Backups */}
                {cronStatus.recentScheduledBackups.length > 0 && (
                  <div className="pt-3 border-t border-border/50">
                    <p className="text-sm font-medium mb-2">Recent Scheduled Backups:</p>
                    <div className="flex flex-wrap gap-2">
                      {cronStatus.recentScheduledBackups.map((backup) => (
                        <Badge
                          key={backup.id}
                          variant={backup.status === "success" ? "outline" : "destructive"}
                          className="gap-1"
                        >
                          {backup.status === "success" ? (
                            <CheckCircle className="h-3 w-3" />
                          ) : (
                            <XCircle className="h-3 w-3" />
                          )}
                          {format(new Date(backup.created_at), "MMM d, HH:mm")}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {cronStatus.recentScheduledBackups.length === 0 && (
                  <div className="pt-3 border-t border-border/50">
                    <p className="text-sm text-muted-foreground">
                      No scheduled backups yet. The cron job will run at the next scheduled time.
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-sm text-muted-foreground">
                Unable to fetch cron status. Make sure the cron job is configured.
              </div>
            )}
          </CardContent>
        </Card>

        {/* Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Backups
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Database className="h-5 w-5 text-primary" />
                <span className="text-2xl font-bold">{stats.total}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Successful
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <span className="text-2xl font-bold">{stats.successful}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Failed
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <XCircle className="h-5 w-5 text-destructive" />
                <span className="text-2xl font-bold">{stats.failed}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Backup Storage (S3)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <HardDrive className="h-5 w-5 text-blue-500" />
                <span className="text-2xl font-bold">
                  {formatBytes(stats.totalSize)}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Database backups only
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Storage Overview Section */}
        <StorageMonitorCard />

        {/* Backup History Table */}
        <Card>
          <CardHeader>
            <CardTitle>Backup Records</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : backups && backups.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Status</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Tables</TableHead>
                    <TableHead>Size</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {backups.map((backup) => (
                    <TableRow key={backup.id}>
                      <TableCell>
                        <Badge
                          variant={
                            backup.status === "success"
                              ? "default"
                              : "destructive"
                          }
                          className="gap-1"
                        >
                          {backup.status === "success" ? (
                            <CheckCircle className="h-3 w-3" />
                          ) : (
                            <XCircle className="h-3 w-3" />
                          )}
                          {backup.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{backup.backup_type}</Badge>
                      </TableCell>
                      <TableCell>
                        {format(new Date(backup.created_at), "MMM d, yyyy HH:mm")}
                      </TableCell>
                      <TableCell>
                        {backup.tables_backed_up?.length || 0} tables
                      </TableCell>
                      <TableCell>
                        {backup.file_size
                          ? formatBytes(backup.file_size)
                          : "-"}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3 text-muted-foreground" />
                          {backup.execution_time_ms
                            ? `${(backup.execution_time_ms / 1000).toFixed(1)}s`
                            : "-"}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => verifyBackup.mutate(backup.id)}
                            title="Verify backup"
                          >
                            <Shield className="h-4 w-4" />
                          </Button>
                          {backup.s3_url && (
                            <Button
                              variant="ghost"
                              size="sm"
                              asChild
                              title="Download backup"
                            >
                              <a
                                href={backup.s3_url}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                <Download className="h-4 w-4" />
                              </a>
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No backup records found. Trigger your first backup to get started.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default BackupHistory;
