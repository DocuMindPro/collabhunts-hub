import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  MessageSquare,
  CheckCircle,
  XCircle,
  Loader2,
  DollarSign,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { EVENT_PACKAGES } from "@/config/packages";
import { useToast } from "@/hooks/use-toast";
import { sendBrandEmail } from "@/lib/email-utils";

interface Booking {
  id: string;
  package_type: string | null;
  event_date: string | null;
  event_time_start: string | null;
  event_time_end: string | null;
  total_price_cents: number;
  deposit_amount_cents: number | null;
  platform_fee_cents: number | null;
  status: string | null;
  escrow_status: string | null;
  message: string | null;
  max_capacity: number | null;
  created_at: string;
  brand_profile: {
    id: string;
    company_name: string;
    venue_name: string | null;
    venue_city: string | null;
  } | null;
}

const BookingsTab = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: creatorProfile } = await supabase
        .from("creator_profiles")
        .select("id")
        .eq("user_id", user.id)
        .single();

      if (!creatorProfile) return;

      const { data, error } = await supabase
        .from("bookings")
        .select(`
          id,
          package_type,
          event_date,
          event_time_start,
          event_time_end,
          total_price_cents,
          deposit_amount_cents,
          platform_fee_cents,
          status,
          escrow_status,
          message,
          max_capacity,
          created_at,
          brand_profiles!bookings_brand_profile_id_fkey (
            id,
            company_name,
            venue_name,
            venue_city
          )
        `)
        .eq("creator_profile_id", creatorProfile.id)
        .order("created_at", { ascending: false });

      if (error) throw error;

      setBookings(
        (data || []).map((b) => ({
          ...b,
          brand_profile: b.brand_profiles,
        }))
      );
    } catch (error) {
      console.error("Error fetching bookings:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async (bookingId: string) => {
    setProcessingId(bookingId);
    try {
      const { error } = await supabase
        .from("bookings")
        .update({ status: "confirmed", confirmed_at: new Date().toISOString() })
        .eq("id", bookingId);

      if (error) throw error;

      toast({ title: "Booking Confirmed", description: "The venue has been notified." });
      
      // Send email to brand
      const booking = bookings.find(b => b.id === bookingId);
      if (booking?.brand_profile?.id) {
        sendBrandEmail("brand_booking_accepted", booking.brand_profile.id, {
          creator_name: "Creator",
          amount_cents: booking.total_price_cents,
        });
      }
      
      fetchBookings();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setProcessingId(null);
    }
  };

  const handleDecline = async (bookingId: string) => {
    setProcessingId(bookingId);
    try {
      const { error } = await supabase
        .from("bookings")
        .update({ status: "cancelled" })
        .eq("id", bookingId);

      if (error) throw error;

      toast({ title: "Booking Declined", description: "The venue has been notified." });
      
      // Send email to brand
      const booking = bookings.find(b => b.id === bookingId);
      if (booking?.brand_profile?.id) {
        sendBrandEmail("brand_booking_declined", booking.brand_profile.id, {
          creator_name: "Creator",
          amount_cents: booking.total_price_cents,
        });
      }
      
      fetchBookings();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setProcessingId(null);
    }
  };

  const getStatusBadge = (status: string | null) => {
    switch (status) {
      case "confirmed":
        return <Badge className="bg-green-500">Confirmed</Badge>;
      case "pending":
        return <Badge variant="secondary">Pending Review</Badge>;
      case "completed":
        return <Badge className="bg-blue-500">Completed</Badge>;
      case "cancelled":
        return <Badge variant="destructive">Declined</Badge>;
      default:
        return <Badge variant="outline">{status || "Unknown"}</Badge>;
    }
  };

  const getStatusLabel = (status: string | null) => {
    switch (status) {
      case "pending": return "Pending";
      case "confirmed": return "Confirmed";
      case "completed": return "Completed";
      case "cancelled": return "Cancelled";
      default: return status || "Unknown";
    }
  };

  const formatEventTime = (start: string | null, end: string | null) => {
    if (!start) return "TBD";
    const formatTime = (time: string) => {
      const [hours, minutes] = time.split(":");
      const hour = parseInt(hours);
      const ampm = hour >= 12 ? "PM" : "AM";
      const displayHour = hour % 12 || 12;
      return `${displayHour}:${minutes} ${ampm}`;
    };
    return end ? `${formatTime(start)} - ${formatTime(end)}` : formatTime(start);
  };

  const calculateEarnings = (total: number, platformFee: number | null) => {
    const fee = platformFee || Math.round(total * 0.15);
    return total - fee;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-heading font-bold">Bookings</h2>
        <p className="text-muted-foreground">Manage your event booking requests</p>
      </div>

      {bookings.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-6">
              <Calendar className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-2xl font-heading font-bold mb-2">No Bookings Yet</h3>
            <p className="text-muted-foreground max-w-md mb-6">
              When venues book you for events, their requests will appear here. Make sure your profile and packages are complete to attract bookings.
            </p>
            <Button onClick={() => navigate("/creator-dashboard?tab=services")}>
              Manage Your Packages
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {bookings.map((booking) => {
            const pkg = booking.package_type
              ? EVENT_PACKAGES[booking.package_type as keyof typeof EVENT_PACKAGES]
              : null;
            const isPending = booking.status === "pending";
            const earnings = calculateEarnings(booking.total_price_cents, booking.platform_fee_cents);

            return (
              <Card key={booking.id} className={isPending ? "border-primary" : ""}>
                <CardContent className="p-4 md:p-6">
                  <div className="flex flex-wrap gap-2 mb-4">
                    {getStatusBadge(booking.status)}
                    {isPending && (
                      <Badge variant="outline" className="bg-primary/10 text-primary">
                        Action Required
                      </Badge>
                    )}
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    {/* Left: Event Details */}
                    <div className="space-y-3">
                      {pkg && (
                        <h3 className="text-lg font-semibold">{pkg.name}</h3>
                      )}

                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <MapPin className="h-4 w-4" />
                          {booking.brand_profile?.venue_name || booking.brand_profile?.company_name}
                          {booking.brand_profile?.venue_city && `, ${booking.brand_profile.venue_city}`}
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Calendar className="h-4 w-4" />
                          {booking.event_date
                            ? format(new Date(booking.event_date), "EEEE, MMMM d, yyyy")
                            : "Date TBD"}
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Clock className="h-4 w-4" />
                          {formatEventTime(booking.event_time_start, booking.event_time_end)}
                        </div>
                        {booking.max_capacity && (
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Users className="h-4 w-4" />
                            Expected: {booking.max_capacity} attendees
                          </div>
                        )}
                      </div>

                      {booking.message && (
                        <div className="mt-3 p-3 bg-muted/50 rounded-lg">
                          <p className="text-sm text-muted-foreground line-clamp-3">
                            {booking.message}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Right: Earnings & Actions */}
                    <div className="space-y-4">
                      <div className="bg-muted/50 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <DollarSign className="h-5 w-5 text-primary" />
                          <span className="font-semibold">Your Earnings</span>
                        </div>
                        <p className="text-2xl font-bold text-primary">
                          ${(earnings / 100).toFixed(2)}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          After 15% platform fee
                        </p>
                      </div>

                      {isPending && (
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            className="flex-1"
                            onClick={() => handleDecline(booking.id)}
                            disabled={processingId === booking.id}
                          >
                            <XCircle className="h-4 w-4 mr-1" />
                            Decline
                          </Button>
                          <Button
                            className="flex-1"
                            onClick={() => handleConfirm(booking.id)}
                            disabled={processingId === booking.id}
                          >
                            {processingId === booking.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <>
                                <CheckCircle className="h-4 w-4 mr-1" />
                                Accept
                              </>
                            )}
                          </Button>
                        </div>
                      )}

                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={() =>
                          navigate(`/creator-dashboard?tab=messages&brand=${booking.brand_profile?.id}`)
                        }
                      >
                        <MessageSquare className="h-4 w-4 mr-2" />
                        Message Venue
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default BookingsTab;
