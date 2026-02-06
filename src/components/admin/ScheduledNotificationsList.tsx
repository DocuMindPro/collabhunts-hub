import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, CheckCircle, XCircle, Loader2, Trash2, Repeat } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { format } from "date-fns";

interface ScheduledNotification {
  id: string;
  title: string;
  body: string;
  scheduled_at: string;
  status: string;
  sent_at: string | null;
  result: Record<string, unknown> | null;
  created_at: string;
  repeat_type: string | null;
  repeat_end_date: string | null;
  parent_id: string | null;
}

const ScheduledNotificationsList = () => {
  const [notifications, setNotifications] = useState<ScheduledNotification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    const { data, error } = await supabase
      .from("scheduled_push_notifications")
      .select("*")
      .is("parent_id", null) // Only show parent/standalone rows
      .order("scheduled_at", { ascending: false })
      .limit(20);

    if (!error && data) {
      setNotifications(data as unknown as ScheduledNotification[]);
    }
    setIsLoading(false);
  };

  const cancelNotification = async (notif: ScheduledNotification) => {
    setCancellingId(notif.id);

    // If it's a recurring parent, cancel all children too
    if (notif.repeat_type && notif.repeat_type !== "none") {
      const { error: childErr } = await supabase
        .from("scheduled_push_notifications")
        .update({ status: "cancelled" } as any)
        .eq("parent_id", notif.id)
        .eq("status", "pending");

      if (childErr) {
        toast.error("Failed to cancel recurring series");
        setCancellingId(null);
        return;
      }
    }

    const { error } = await supabase
      .from("scheduled_push_notifications")
      .update({ status: "cancelled" })
      .eq("id", notif.id);

    if (error) {
      toast.error("Failed to cancel notification");
    } else {
      toast.success(notif.repeat_type && notif.repeat_type !== "none" ? "Recurring series cancelled" : "Notification cancelled");
      setNotifications(prev =>
        prev.map(n => n.id === notif.id ? { ...n, status: "cancelled" } : n)
      );
    }
    setCancellingId(null);
  };

  const repeatLabel = (type: string | null) => {
    if (!type || type === "none") return null;
    const labels: Record<string, string> = { daily: "Daily", weekly: "Weekly", monthly: "Monthly" };
    return (
      <Badge variant="outline" className="bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-950/30 dark:text-violet-400 dark:border-violet-800 gap-1">
        <Repeat className="h-3 w-3" />
        {labels[type] || type}
      </Badge>
    );
  };

  const statusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-800"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
      case "sent":
        return <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-800"><CheckCircle className="h-3 w-3 mr-1" />Sent</Badge>;
      case "cancelled":
        return <Badge variant="outline" className="bg-muted text-muted-foreground"><XCircle className="h-3 w-3 mr-1" />Cancelled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  if (notifications.length === 0) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Clock className="h-5 w-5" />
          Scheduled Notifications
        </CardTitle>
        <CardDescription>Recent and upcoming scheduled push notifications.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {notifications.map((notif) => (
            <div
              key={notif.id}
              className="flex items-start justify-between gap-4 p-3 rounded-lg border bg-card"
            >
              <div className="flex-1 min-w-0 space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-medium text-sm truncate">{notif.title}</span>
                  {statusBadge(notif.status)}
                  {repeatLabel(notif.repeat_type)}
                </div>
                <p className="text-sm text-muted-foreground line-clamp-1">{notif.body}</p>
                <p className="text-xs text-muted-foreground">
                  Scheduled: {format(new Date(notif.scheduled_at), "MMM d, yyyy 'at' h:mm a")}
                  {notif.repeat_type && notif.repeat_type !== "none" && notif.repeat_end_date && ` · Until: ${format(new Date(notif.repeat_end_date), "MMM d, yyyy")}`}
                  {notif.sent_at && ` · Sent: ${format(new Date(notif.sent_at), "MMM d, yyyy 'at' h:mm a")}`}
                  {notif.result && (notif.result as any).sent !== undefined && ` · ${(notif.result as any).sent} delivered`}
                </p>
              </div>
              {notif.status === "pending" && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => cancelNotification(notif)}
                  disabled={cancellingId === notif.id}
                  className="text-destructive hover:text-destructive shrink-0"
                >
                  {cancellingId === notif.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4" />
                  )}
                </Button>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default ScheduledNotificationsList;
