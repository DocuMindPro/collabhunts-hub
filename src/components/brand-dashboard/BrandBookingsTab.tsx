import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { format } from "date-fns";
import { Clock, Star } from "lucide-react";
import { ReviewDialog } from "@/components/ReviewDialog";

interface Booking {
  id: string;
  status: string;
  payment_status: string;
  message: string | null;
  booking_date: string | null;
  total_price_cents: number;
  created_at: string;
  creator_profiles: {
    display_name: string;
    id: string;
  };
  creator_services: {
    service_type: string;
  } | null;
  reviews?: Array<{
    id: string;
    rating: number;
    review_text: string | null;
  }>;
}

const BrandBookingsTab = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [brandProfileId, setBrandProfileId] = useState<string>("");

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from("brand_profiles")
        .select("id")
        .eq("user_id", user.id)
        .single();

      if (!profile) return;
      setBrandProfileId(profile.id);

      const { data, error } = await supabase
        .from("bookings")
        .select(`
          *,
          creator_profiles!inner(display_name, id),
          creator_services(service_type),
          reviews!left(id, rating, review_text)
        `)
        .eq("brand_profile_id", profile.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      
      // Transform the data to ensure reviews is always an array
      const bookingsWithReviews = (data || []).map(booking => ({
        ...booking,
        reviews: booking.reviews ? [booking.reviews].flat() : []
      }));
      
      setBookings(bookingsWithReviews as any);
    } catch (error) {
      console.error("Error fetching bookings:", error);
      toast.error("Failed to load bookings");
    } finally {
      setLoading(false);
    }
  };

  const cancelBooking = async (bookingId: string) => {
    if (!confirm("Are you sure you want to cancel this booking?")) return;

    try {
      const { error } = await supabase
        .from("bookings")
        .update({ status: "cancelled" })
        .eq("id", bookingId);

      if (error) throw error;
      toast.success("Booking cancelled");
      fetchBookings();
    } catch (error) {
      console.error("Error cancelling booking:", error);
      toast.error("Failed to cancel booking");
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
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-heading font-bold">My Bookings</h2>
          <p className="text-muted-foreground">Track your collaboration requests</p>
        </div>
        <div className="flex gap-2">
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
                    <CardTitle>{booking.creator_profiles.display_name}</CardTitle>
                    <CardDescription>
                      {booking.creator_services?.service_type.replace(/_/g, " ") || "Service removed"}
                    </CardDescription>
                  </div>
                  <Badge className={`${getStatusColor(booking.status)} text-white capitalize`}>
                    {booking.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Amount</p>
                    <p className="font-semibold">${(booking.total_price_cents / 100).toFixed(2)}</p>
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
                    <p className="text-sm text-muted-foreground mb-1">Your message:</p>
                    <p className="text-sm bg-muted p-3 rounded-lg">{booking.message}</p>
                  </div>
                )}

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    className="flex-1 gap-2"
                    onClick={() => window.location.href = `/creator/${booking.creator_profiles.id}`}
                  >
                    View Profile
                  </Button>
                  {booking.status === "pending" && (
                    <Button
                      variant="outline"
                      onClick={() => cancelBooking(booking.id)}
                      className="flex-1"
                    >
                      Cancel Request
                    </Button>
                  )}
                  {booking.status === "completed" && booking.payment_status === "paid" && (
                    <Button
                      variant={booking.reviews && booking.reviews.length > 0 ? "outline" : "default"}
                      onClick={() => {
                        setSelectedBooking(booking);
                        setReviewDialogOpen(true);
                      }}
                      className="flex-1 gap-2"
                    >
                      <Star className="h-4 w-4" />
                      {booking.reviews && booking.reviews.length > 0 ? "Edit Review" : "Leave Review"}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {selectedBooking && (
        <ReviewDialog
          open={reviewDialogOpen}
          onOpenChange={(open) => {
            setReviewDialogOpen(open);
            if (!open) {
              setSelectedBooking(null);
              fetchBookings();
            }
          }}
          bookingId={selectedBooking.id}
          creatorName={selectedBooking.creator_profiles.display_name}
          creatorProfileId={selectedBooking.creator_profiles.id}
          brandProfileId={brandProfileId}
          existingReview={selectedBooking.reviews?.[0]}
        />
      )}
    </div>
  );
};

export default BrandBookingsTab;
