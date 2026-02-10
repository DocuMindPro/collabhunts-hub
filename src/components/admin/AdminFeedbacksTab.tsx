import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ThumbsDown, ThumbsUp, Trophy } from "lucide-react";
import { format } from "date-fns";

interface Feedback {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  details: string;
  rating: number;
  status: string;
  created_at: string;
}

const ratingDisplay = (rating: number) => {
  switch (rating) {
    case 1: return { label: "Needs Improvement", icon: ThumbsDown, color: "text-red-500" };
    case 2: return { label: "Good", icon: ThumbsUp, color: "text-amber-500" };
    case 3: return { label: "Excellent", icon: Trophy, color: "text-green-500" };
    default: return { label: "Unknown", icon: ThumbsUp, color: "text-muted-foreground" };
  }
};

const statusVariant = (status: string) => {
  switch (status) {
    case "new": return "destructive" as const;
    case "reviewed": return "default" as const;
    case "archived": return "secondary" as const;
    default: return "outline" as const;
  }
};

const AdminFeedbacksTab = () => {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const { toast } = useToast();

  const fetchFeedbacks = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from("feedbacks")
        .select("*")
        .order("created_at", { ascending: false });

      if (statusFilter !== "all") {
        query = query.eq("status", statusFilter);
      }

      const { data, error } = await query;
      if (error) throw error;
      setFeedbacks((data as Feedback[]) || []);
    } catch (error) {
      console.error("Error fetching feedbacks:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeedbacks();
  }, [statusFilter]);

  const updateStatus = async (id: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from("feedbacks")
        .update({ status: newStatus })
        .eq("id", id);

      if (error) throw error;

      setFeedbacks(prev =>
        prev.map(f => f.id === id ? { ...f, status: newStatus } : f)
      );

      toast({ title: `Feedback marked as ${newStatus}` });
    } catch (error) {
      console.error("Error updating feedback:", error);
      toast({ title: "Error", description: "Failed to update status", variant: "destructive" });
    }
  };

  return (
    <Card>
      <CardHeader className="p-4 md:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <CardTitle className="text-lg md:text-xl">Feedbacks</CardTitle>
            <CardDescription className="text-xs md:text-sm">
              Review and manage user feedback submissions
            </CardDescription>
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="new">New</SelectItem>
              <SelectItem value="reviewed">Reviewed</SelectItem>
              <SelectItem value="archived">Archived</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent className="p-4 md:p-6 pt-0 md:pt-0">
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        ) : feedbacks.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">No feedbacks found.</p>
        ) : (
          <div className="overflow-x-auto -mx-4 md:mx-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Rating</TableHead>
                  <TableHead className="max-w-[300px]">Feedback</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {feedbacks.map((feedback) => {
                  const rd = ratingDisplay(feedback.rating);
                  const Icon = rd.icon;
                  return (
                    <TableRow key={feedback.id}>
                      <TableCell className="font-medium whitespace-nowrap">
                        {feedback.first_name} {feedback.last_name}
                      </TableCell>
                      <TableCell className="text-sm">{feedback.email}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1.5">
                          <Icon className={`h-4 w-4 ${rd.color}`} />
                          <span className="text-xs">{rd.label}</span>
                        </div>
                      </TableCell>
                      <TableCell className="max-w-[300px] truncate text-sm">
                        {feedback.details}
                      </TableCell>
                      <TableCell>
                        <Badge variant={statusVariant(feedback.status)} className="capitalize text-xs">
                          {feedback.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm whitespace-nowrap">
                        {format(new Date(feedback.created_at), "MMM d, yyyy")}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          {feedback.status === "new" && (
                            <Button size="sm" variant="outline" onClick={() => updateStatus(feedback.id, "reviewed")}>
                              Reviewed
                            </Button>
                          )}
                          {feedback.status !== "archived" && (
                            <Button size="sm" variant="ghost" onClick={() => updateStatus(feedback.id, "archived")}>
                              Archive
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AdminFeedbacksTab;
