import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { format, formatDistanceToNow } from "date-fns";
import {
  Database, CheckCircle, XCircle, RefreshCw, Download, Shield, Clock,
  ArrowLeft, Calendar, Timer, AlertTriangle, Upload, Image, MoreVertical,
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

const formatBytes = (bytes: number) => {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
};

const BackupHistory = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isBackingUp, setIsBackingUp] = useState(false);
  const [isTestingFailure, setIsTestingFailure] = useState(false);
  const [isTestingR2, setIsTestingR2] = useState(false);
  const [isBackingUpMedia, setIsBackingUpMedia] = useState(false);
  const [statusFilter, setStatusFilter] = useState<"all" | "success" | "failed">("all");

  const { data: backups, isLoading } = useQuery({
    queryKey: ["backup-history"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("backup_history")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(20);
      if (error) throw error;
      return data as BackupRecord[];
    },
  });

  const { data: cronStatus, isLoading: cronLoading } = useQuery({
    queryKey: ["cron-status"],
    queryFn: async () => {
      const { data: session } = await supabase.auth.getSession();
      if (!session?.session?.access_token) throw new Error("Not authenticated");
      const response = await supabase.functions.invoke("get-cron-status", {
        headers: { Authorization: `Bearer ${session.session.access_token}` },
      });
      if (response.error) throw new Error(response.error.message);
      return response.data as CronStatus;
    },
    retry: false,
  });

  const triggerBackup = useMutation({
    mutationFn: async () => {
      setIsBackingUp(true);
      const { data: session } = await supabase.auth.getSession();
      const response = await supabase.functions.invoke("database-backup", {
        body: { type: "manual", triggered_by: session?.session?.user?.id },
      });
      if (response.error) throw new Error(response.error.message);
      return response.data;
    },
    onSuccess: (data) => {
      toast({ title: "Backup completed", description: `Backed up ${data.tables_backed_up} tables (${data.total_rows} rows)` });
      queryClient.invalidateQueries({ queryKey: ["backup-history"] });
    },
    onError: (error: Error) => {
      toast({ title: "Backup failed", description: error.message, variant: "destructive" });
    },
    onSettled: () => setIsBackingUp(false),
  });

  const testFailure = useMutation({
    mutationFn: async () => {
      setIsTestingFailure(true);
      const { data: session } = await supabase.auth.getSession();
      const response = await supabase.functions.invoke("database-backup", {
        body: { type: "test", triggered_by: session?.session?.user?.id, test_failure: true },
      });
      if (response.error) throw new Error(response.error.message);
      return response.data;
    },
    onSuccess: () => { toast({ title: "Test completed", description: "Check your email for the failure notification" }); },
    onError: () => {
      toast({ title: "Test failure triggered", description: "Check your email for the failure notification" });
      queryClient.invalidateQueries({ queryKey: ["backup-history"] });
    },
    onSettled: () => setIsTestingFailure(false),
  });

  const verifyBackup = useMutation({
    mutationFn: async (backupId: string) => {
      const { data: session } = await supabase.auth.getSession();
      const response = await supabase.functions.invoke("verify-backup", {
        body: { backup_id: backupId },
        headers: { Authorization: `Bearer ${session?.session?.access_token}` },
      });
      if (response.error) throw new Error(response.error.message);
      return response.data;
    },
    onSuccess: (data) => {
      const isValid = data.verification.overall_valid;
      toast({
        title: isValid ? "Backup verified" : "Verification issues",
        description: isValid ? "Backup integrity confirmed" : "Some verification checks failed",
        variant: isValid ? "default" : "destructive",
      });
    },
    onError: (error: Error) => {
      toast({ title: "Verification failed", description: error.message, variant: "destructive" });
    },
  });

  const testR2Upload = useMutation({
    mutationFn: async () => {
      setIsTestingR2(true);
      const { data: session } = await supabase.auth.getSession();
      if (!session?.session?.access_token) throw new Error("Not authenticated");
      const testImageBase64 = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";
      const testImageBlob = await fetch(`data:image/png;base64,${testImageBase64}`).then(r => r.blob());
      const formData = new FormData();
      formData.append("file", testImageBlob, `r2-test-${Date.now()}.png`);
      formData.append("type", "profile");
      const response = await fetch(
        `https://olcygpkghmaqkezmunyu.supabase.co/functions/v1/upload-profile-image`,
        { method: "POST", headers: { Authorization: `Bearer ${session.session.access_token}` }, body: formData }
      );
      if (!response.ok) { const errorData = await response.json(); throw new Error(errorData.error || "Upload failed"); }
      return response.json();
    },
    onSuccess: (data) => {
      toast({ title: "R2 Upload Test Successful", description: `File uploaded to: ${data.url}` });
      queryClient.invalidateQueries({ queryKey: ["storage-stats"] });
    },
    onError: (error: Error) => {
      toast({ title: "R2 Upload Test Failed", description: error.message, variant: "destructive" });
    },
    onSettled: () => setIsTestingR2(false),
  });

  const triggerMediaBackup = useMutation({
    mutationFn: async () => {
      setIsBackingUpMedia(true);
      const { data: session } = await supabase.auth.getSession();
      if (!session?.session?.access_token) throw new Error("Not authenticated");
      const response = await supabase.functions.invoke("backup-media", {
        body: { type: "media-manual", triggered_by: session.session.user?.id },
        headers: { Authorization: `Bearer ${session.session.access_token}` },
      });
      if (response.error) throw new Error(response.error.message);
      return response.data;
    },
    onSuccess: (data) => {
      toast({ title: "Media backup completed", description: `Backed up ${data.files_backed_up} files (${formatBytes(data.total_bytes)})` });
      queryClient.invalidateQueries({ queryKey: ["backup-history"] });
    },
    onError: (error: Error) => {
      toast({ title: "Media backup failed", description: error.message, variant: "destructive" });
    },
    onSettled: () => setIsBackingUpMedia(false),
  });

  const anyBusy = isBackingUp || isTestingFailure || isTestingR2 || isBackingUpMedia;

  const stats = {
    total: backups?.length || 0,
    successful: backups?.filter((b) => b.status === "success").length || 0,
    failed: backups?.filter((b) => b.status === "failed").length || 0,
    totalSize: backups?.reduce((acc, b) => acc + (b.file_size || 0), 0) || 0,
  };

  const filteredBackups = backups?.filter((b) => {
    if (statusFilter === "all") return true;
    return b.status === statusFilter;
  });

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-7xl mx-auto space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/admin">
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold">Backup History</h1>
              <p className="text-xs text-muted-foreground">Disaster recovery management</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={() => triggerMediaBackup.mutate()}
              disabled={anyBusy}
              variant="outline"
              size="sm"
              className="gap-1.5"
            >
              {isBackingUpMedia ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />}
              {isBackingUpMedia ? "Backing up..." : "Media"}
            </Button>
            <Button
              onClick={() => triggerBackup.mutate()}
              disabled={anyBusy}
              size="sm"
              className="gap-1.5"
            >
              {isBackingUp ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Database className="h-3.5 w-3.5" />}
              {isBackingUp ? "Backing up..." : "Full Backup"}
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="px-2" disabled={anyBusy}>
                  <MoreVertical className="h-3.5 w-3.5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-popover">
                <DropdownMenuItem onClick={() => testR2Upload.mutate()} disabled={anyBusy}>
                  <Image className="h-3.5 w-3.5 mr-2" />
                  {isTestingR2 ? "Testing R2..." : "Test R2 Upload"}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => testFailure.mutate()} disabled={anyBusy}>
                  <AlertTriangle className="h-3.5 w-3.5 mr-2" />
                  {isTestingFailure ? "Testing..." : "Test Failure Email"}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Cron Status + Inline Stats */}
        <div className="flex flex-col md:flex-row gap-3">
          {/* Cron Status */}
          <Card className="flex-1 border-primary/20 bg-primary/5">
            <CardContent className="py-3 px-4">
              {cronLoading ? (
                <div className="flex items-center gap-2 text-muted-foreground text-sm">
                  <RefreshCw className="h-3.5 w-3.5 animate-spin" /> Loading cron...
                </div>
              ) : cronStatus?.success ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-3 flex-wrap">
                    <div className="flex items-center gap-1.5 text-sm font-medium">
                      <Timer className="h-3.5 w-3.5 text-primary" />
                      Scheduled Backup
                    </div>
                    {cronStatus.cron.isActive ? (
                      <Badge className="bg-green-500/10 text-green-600 border-green-500/20 text-xs">
                        <CheckCircle className="h-3 w-3 mr-1" />Active
                      </Badge>
                    ) : (
                      <Badge variant="destructive" className="text-xs">
                        <XCircle className="h-3 w-3 mr-1" />Inactive
                      </Badge>
                    )}
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Calendar className="h-3 w-3" />{cronStatus.cron.scheduleDescription}
                    </span>
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="h-3 w-3" />Next: {formatDistanceToNow(new Date(cronStatus.cron.nextRun), { addSuffix: true })}
                    </span>
                  </div>
                  {cronStatus.recentScheduledBackups.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {cronStatus.recentScheduledBackups.map((backup) => (
                        <Badge key={backup.id} variant={backup.status === "success" ? "outline" : "destructive"} className="gap-1 text-xs">
                          {backup.status === "success" ? <CheckCircle className="h-2.5 w-2.5" /> : <XCircle className="h-2.5 w-2.5" />}
                          {format(new Date(backup.created_at), "MMM d, HH:mm")}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-sm text-muted-foreground">Unable to fetch cron status.</div>
              )}
            </CardContent>
          </Card>

          {/* Inline Stats */}
          <Card>
            <CardContent className="py-3 px-4 flex items-center gap-4 flex-wrap">
              <div className="flex items-center gap-1.5">
                <Database className="h-3.5 w-3.5 text-primary" />
                <span className="text-sm font-bold">{stats.total}</span>
                <span className="text-xs text-muted-foreground">total</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle className="h-3.5 w-3.5 text-green-500" />
                <span className="text-sm font-bold">{stats.successful}</span>
                <span className="text-xs text-muted-foreground">success</span>
              </div>
              <div className="flex items-center gap-1.5">
                <XCircle className="h-3.5 w-3.5 text-destructive" />
                <span className="text-sm font-bold">{stats.failed}</span>
                <span className="text-xs text-muted-foreground">failed</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Storage Overview (collapsible) */}
        <StorageMonitorCard />

        {/* Backup Records Table */}
        <Card>
          <CardHeader className="py-3 px-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">Backup Records</CardTitle>
              <div className="flex gap-1">
                {(["all", "success", "failed"] as const).map((filter) => (
                  <Button
                    key={filter}
                    variant={statusFilter === filter ? "default" : "ghost"}
                    size="sm"
                    className="h-7 text-xs px-2.5"
                    onClick={() => setStatusFilter(filter)}
                  >
                    {filter === "all" ? "All" : filter === "success" ? "Success" : "Failed"}
                  </Button>
                ))}
              </div>
            </div>
          </CardHeader>
          <CardContent className="px-4 pb-4 pt-0">
            {isLoading ? (
              <div className="flex items-center justify-center py-6">
                <RefreshCw className="h-5 w-5 animate-spin text-muted-foreground" />
              </div>
            ) : filteredBackups && filteredBackups.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs">Status</TableHead>
                    <TableHead className="text-xs">Type</TableHead>
                    <TableHead className="text-xs">Date</TableHead>
                    <TableHead className="text-xs">Tables</TableHead>
                    <TableHead className="text-xs">Size</TableHead>
                    <TableHead className="text-xs">Duration</TableHead>
                    <TableHead className="text-xs">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredBackups.map((backup) => (
                    <TableRow key={backup.id}>
                      <TableCell className="py-2">
                        <Badge
                          variant={backup.status === "success" ? "default" : "destructive"}
                          className="gap-1 text-xs"
                        >
                          {backup.status === "success" ? <CheckCircle className="h-2.5 w-2.5" /> : <XCircle className="h-2.5 w-2.5" />}
                          {backup.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="py-2">
                        <Badge variant="outline" className="text-xs">{backup.backup_type}</Badge>
                      </TableCell>
                      <TableCell className="py-2 text-xs">
                        {format(new Date(backup.created_at), "MMM d, HH:mm")}
                      </TableCell>
                      <TableCell className="py-2 text-xs">
                        {backup.tables_backed_up?.length || 0}
                      </TableCell>
                      <TableCell className="py-2 text-xs">
                        {backup.file_size ? formatBytes(backup.file_size) : "-"}
                      </TableCell>
                      <TableCell className="py-2 text-xs">
                        {backup.execution_time_ms ? `${(backup.execution_time_ms / 1000).toFixed(1)}s` : "-"}
                      </TableCell>
                      <TableCell className="py-2">
                        <div className="flex gap-1">
                          <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => verifyBackup.mutate(backup.id)} title="Verify">
                            <Shield className="h-3.5 w-3.5" />
                          </Button>
                          {backup.s3_url && (
                            <Button variant="ghost" size="sm" className="h-7 w-7 p-0" asChild title="Download">
                              <a href={backup.s3_url} target="_blank" rel="noopener noreferrer">
                                <Download className="h-3.5 w-3.5" />
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
              <div className="text-center py-6 text-sm text-muted-foreground">
                {statusFilter !== "all" ? `No ${statusFilter} backups found.` : "No backup records found."}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default BackupHistory;
