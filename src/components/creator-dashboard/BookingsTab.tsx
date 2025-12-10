import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { toast } from "sonner";
import { format } from "date-fns";
import { Check, X, Clock, MessageSquare, CheckCircle, AlertCircle } from "lucide-react";

interface Booking {
  id: string;
  status: string;
  payment_status: string;
  message: string | null;
  booking_date: string | null;
  total_price_cents: number;
  created_at: string;
  brand_profile_id: string;
  brand_profiles: {
    company_name: string;
  };
  creator_services: {
    service_type: string;
  } | null;
}

const BookingsTab = () => {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(null);
  const [creatorProfileId, setCreatorProfileId] = useState<string>("");

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from("creator_profiles")
        .select("id")
        .eq("user_id", user.id)
        .single();

      if (!profile) return;
      setCreatorProfileId(profile.id);

      const { data, error } = await supabase
        .from("bookings")
        .select(`
          *,
          brand_profiles!inner(company_name),
          creator_services(service_type)
        `)
        .eq("creator_profile_id", profile.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setBookings(data || []);
    } catch (error) {
      console.error("Error fetching bookings:", error);
      toast.error("Failed to load bookings");
    } finally {
      setLoading(false);
    }
  };

  const updateBookingStatus = async (bookingId: string, status: string) => {
    try {
      const { error } = await supabase
        .from("bookings")
        .update({ status })
        .eq("id", bookingId);

      if (error) throw error;
      
      if (status === "accepted") {
        toast.success("Booking accepted! Start working on the deliverables.");
      } else if (status === "completed") {
        toast.success("Great work! The brand has been notified.");
      } else {
        toast.success(`Booking ${status}`);
      }
      
      fetchBookings();
    } catch (error) {
      console.error("Error updating booking:", error);
      toast.error("Failed to update booking");
    }
  };

  const handleMarkComplete = (bookingId: string) => {
    setSelectedBookingId(bookingId);
    setConfirmDialogOpen(true);
  };

  const confirmComplete = async () => {
    if (selectedBookingId) {
      await updateBookingStatus(selectedBookingId, "completed");
      setConfirmDialogOpen(false);
      setSelectedBookingId(null);
    }
  };

  const handleMessageBrand = async (brandProfileId: string) => {
    // Check if conversation exists, if not create one
    try {
      const { data: existingConversation } = await supabase
        .from("conversations")
        .select("id")
        .eq("brand_profile_id", brandProfileId)
        .eq("creator_profile_id", creatorProfileId)
        .single();

      if (existingConversation) {
        navigate("/creator-dashboard?tab=messages");
      } else {
        // Just navigate to messages, brand should have initiated
        navigate("/creator-dashboard?tab=messages");
      }
    } catch {
      navigate("/creator-dashboard?tab=messages");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending": return "bg-yellow-500";
      case "accepted": return "bg-blue-500";
      case "completed": return "bg-green-500";
      case "declined": return "bg-red-500";
      case "cancelled": return "bg-gray-500";
      default: return "bg-gray-500";
    }
  };

  const getPaymentStatusColor = (paymentStatus: string) => {
    switch (paymentStatus) {
      case "pending": return "bg-yellow-500";
      case "paid": return "bg-green-500";
      case "failed": return "bg-red-500";
      case "refunded": return "bg-gray-500";
      default: return "bg-gray-500";
    }
  };

  const filteredBookings = bookings.filter(b => 
    filter === "all" || b.status === filter
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-heading font-bold">Bookings</h2>
          <p className="text-muted-foreground">Manage your collaboration requests</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {["all", "pending", "accepted", "completed"].map((status) => (
            <Button
              key={status}
              variant={filter === status ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter(status)}
              className="capitalize"
            >
              {status}
            </Button>
          ))}
        </div>
      </div>

      {filteredBookings.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Clock className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No bookings found</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredBookings.map((booking) => (
            <Card key={booking.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle>{booking.brand_profiles.company_name}</CardTitle>
                    <CardDescription>
                      {booking.creator_services?.service_type.replace(/_/g, " ") || "Service removed"}
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Badge className={`${getStatusColor(booking.status)} text-white capitalize`}>
                      {booking.status}
                    </Badge>
                    <Badge className={`${getPaymentStatusColor(booking.payment_status)} text-white capitalize`}>
                      {booking.payment_status}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Status guidance messages */}
                {booking.status === "accepted" && (
                  <div className="flex items-start gap-3 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                    <CheckCircle className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-blue-600 dark:text-blue-400">You accepted this booking!</p>
                      <p className="text-sm text-muted-foreground">Work on the deliverables and mark as complete when done.</p>
                    </div>
                  </div>
                )}

                {booking.status === "completed" && (
                  <div className="flex items-start gap-3 p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-green-600 dark:text-green-400">Completed!</p>
                      <p className="text-sm text-muted-foreground">The brand has been notified. Payment will be processed soon.</p>
                    </div>
                  </div>
                )}

                {booking.status === "pending" && (
                  <div className="flex items-start gap-3 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                    <AlertCircle className="h-5 w-5 text-yellow-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-yellow-600 dark:text-yellow-400">New booking request</p>
                      <p className="text-sm text-muted-foreground">Review the details and accept or decline this collaboration.</p>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Your earnings</p>
                    <p className="font-semibold text-lg">${(booking.total_price_cents / 100).toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Requested</p>
                    <p className="font-semibold">
                      {format(new Date(booking.created_at), "MMM dd, yyyy")}
                    </p>
                  </div>
                </div>

                {booking.message && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Message from brand:</p>
                    <p className="text-sm bg-muted p-3 rounded-lg">{booking.message}</p>
                  </div>
                )}

                {booking.status === "pending" && (
                  <div className="flex gap-2">
                    <Button
                      onClick={() => updateBookingStatus(booking.id, "accepted")}
                      className="flex-1 gap-2"
                    >
                      <Check className="h-4 w-4" />
                      Accept
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => updateBookingStatus(booking.id, "declined")}
                      className="flex-1 gap-2"
                    >
                      <X className="h-4 w-4" />
                      Decline
                    </Button>
                  </div>
                )}

                {booking.status === "accepted" && (
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() => handleMessageBrand(booking.brand_profile_id)}
                      className="flex-1 gap-2"
                    >
                      <MessageSquare className="h-4 w-4" />
                      Message Brand
                    </Button>
                    <Button
                      onClick={() => handleMarkComplete(booking.id)}
                      className="flex-1 gap-2"
                    >
                      <Check className="h-4 w-4" />
                      Mark as Completed
                    </Button>
                  </div>
                )}

                {booking.status === "completed" && (
                  <Button
                    variant="outline"
                    onClick={() => handleMessageBrand(booking.brand_profile_id)}
                    className="w-full gap-2"
                  >
                    <MessageSquare className="h-4 w-4" />
                    Message Brand
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Confirmation Dialog for Completing Booking */}
      <Dialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Mark Booking as Completed?</DialogTitle>
            <DialogDescription>
              This will notify the brand that you've finished the deliverables and they're ready for review.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-muted-foreground">
              Make sure you've completed all the work agreed upon before marking this booking as complete.
            </p>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setConfirmDialogOpen(false)}>
              Not Yet
            </Button>
            <Button onClick={confirmComplete} className="gap-2">
              <CheckCircle className="h-4 w-4" />
              Yes, Mark Complete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BookingsTab;
