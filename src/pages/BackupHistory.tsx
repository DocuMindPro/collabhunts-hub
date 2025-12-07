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
import { format } from "date-fns";
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
} from "lucide-react";
import { Link } from "react-router-dom";

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

const BackupHistory = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isBackingUp, setIsBackingUp] = useState(false);

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
          <Button
            onClick={() => triggerBackup.mutate()}
            disabled={isBackingUp}
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

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
                Total Storage
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <HardDrive className="h-5 w-5 text-blue-500" />
                <span className="text-2xl font-bold">
                  {formatBytes(stats.totalSize)}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

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
