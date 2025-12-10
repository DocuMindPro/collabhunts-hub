import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { toast } from "sonner";
import { format } from "date-fns";
import { Clock, Star, Upload, MessageSquare, CheckCircle, Loader2, PartyPopper } from "lucide-react";
import { ReviewDialog } from "@/components/ReviewDialog";

interface Booking {
  id: string;
  status: string;
  payment_status: string;
  message: string | null;
  booking_date: string | null;
  total_price_cents: number;
  created_at: string;
  creator_profile_id: string;
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
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [brandProfileId, setBrandProfileId] = useState<string>("");
  const [uploadPromptOpen, setUploadPromptOpen] = useState(false);
  const [completedBooking, setCompletedBooking] = useState<Booking | null>(null);

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

  const handleMessageCreator = (creatorProfileId: string) => {
    navigate(`/brand-dashboard?tab=messages`);
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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-heading font-bold">My Bookings</h2>
          <p className="text-muted-foreground">Track your collaboration requests</p>
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
                {/* Status guidance messages */}
                {booking.status === "pending" && (
                  <div className="flex items-start gap-3 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                    <Loader2 className="h-5 w-5 text-yellow-500 mt-0.5 flex-shrink-0 animate-spin" />
                    <div>
                      <p className="font-medium text-yellow-600 dark:text-yellow-400">Waiting for creator</p>
                      <p className="text-sm text-muted-foreground">The creator will review your request and respond soon.</p>
                    </div>
                  </div>
                )}

                {booking.status === "accepted" && (
                  <div className="flex items-start gap-3 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                    <CheckCircle className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-blue-600 dark:text-blue-400">Creator accepted!</p>
                      <p className="text-sm text-muted-foreground">They're working on your deliverables. You can message them for updates.</p>
                    </div>
                  </div>
                )}

                {booking.status === "completed" && (
                  <div className="flex items-start gap-3 p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                    <PartyPopper className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-green-600 dark:text-green-400">Deliverables ready!</p>
                      <p className="text-sm text-muted-foreground">The creator has completed your booking. Upload content to your library and leave a review!</p>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Amount</p>
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
                    <p className="text-sm text-muted-foreground mb-1">Your message:</p>
                    <p className="text-sm bg-muted p-3 rounded-lg">{booking.message}</p>
                  </div>
                )}

                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="outline"
                    className="flex-1 min-w-[120px] gap-2"
                    onClick={() => window.location.href = `/creator/${booking.creator_profiles.id}`}
                  >
                    View Profile
                  </Button>
                  
                  {(booking.status === "accepted" || booking.status === "completed") && (
                    <Button
                      variant="outline"
                      onClick={() => handleMessageCreator(booking.creator_profile_id)}
                      className="flex-1 min-w-[120px] gap-2"
                    >
                      <MessageSquare className="h-4 w-4" />
                      Message
                    </Button>
                  )}

                  {booking.status === "pending" && (
                    <Button
                      variant="outline"
                      onClick={() => cancelBooking(booking.id)}
                      className="flex-1 min-w-[120px]"
                    >
                      Cancel Request
                    </Button>
                  )}
                  
                  {booking.status === "completed" && booking.payment_status === "paid" && (
                    <>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setCompletedBooking(booking);
                          setUploadPromptOpen(true);
                        }}
                        className="flex-1 min-w-[120px] gap-2"
                      >
                        <Upload className="h-4 w-4" />
                        Upload Content
                      </Button>
                      <Button
                        variant={booking.reviews && booking.reviews.length > 0 ? "outline" : "default"}
                        onClick={() => {
                          setSelectedBooking(booking);
                          setReviewDialogOpen(true);
                        }}
                        className="flex-1 min-w-[120px] gap-2"
                      >
                        <Star className="h-4 w-4" />
                        {booking.reviews && booking.reviews.length > 0 ? "Edit Review" : "Leave Review"}
                      </Button>
                    </>
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

      {/* Upload Deliverables Prompt Dialog */}
      <Dialog open={uploadPromptOpen} onOpenChange={setUploadPromptOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upload Deliverables</DialogTitle>
            <DialogDescription>
              Would you like to upload the content from {completedBooking?.creator_profiles.display_name} to your Content Library?
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-muted-foreground">
              Content will be automatically organized in a folder named after the creator for easy access.
            </p>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setUploadPromptOpen(false)}>
              Maybe Later
            </Button>
            <Button 
              onClick={() => {
                setUploadPromptOpen(false);
                navigate(`/brand-dashboard?tab=content-library&creatorId=${completedBooking?.creator_profiles.id}`);
              }}
              className="gap-2"
            >
              <Upload className="h-4 w-4" />
              Upload Now
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BrandBookingsTab;
