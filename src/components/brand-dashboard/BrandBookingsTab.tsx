import { Card, CardContent } from "@/components/ui/card";
import FeatureLockedCard from "./FeatureLockedCard";
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
  ExternalLink,
} from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { EVENT_PACKAGES } from "@/config/packages";

interface Booking {
  id: string;
  package_type: string | null;
  event_date: string | null;
  event_time_start: string | null;
  event_time_end: string | null;
  total_price_cents: number;
  deposit_amount_cents: number | null;
  status: string | null;
  escrow_status: string | null;
  message: string | null;
  max_capacity: number | null;
  created_at: string;
  creator_profile: {
    id: string;
    display_name: string;
    profile_image_url: string | null;
  } | null;
}

interface BrandBookingsTabProps {
  registrationCompleted?: boolean;
}

const BrandBookingsTab = ({ registrationCompleted = true }: BrandBookingsTabProps) => {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: brandProfile } = await supabase
        .from("brand_profiles")
        .select("id")
        .eq("user_id", user.id)
        .single();

      if (!brandProfile) return;

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
          status,
          escrow_status,
          message,
          max_capacity,
          created_at,
          creator_profiles!bookings_creator_profile_id_fkey (
            id,
            display_name,
            profile_image_url
          )
        `)
        .eq("brand_profile_id", brandProfile.id)
        .order("created_at", { ascending: false });

      if (error) throw error;

      setBookings(
        (data || []).map((b) => ({
          ...b,
          creator_profile: b.creator_profiles,
        }))
      );
    } catch (error) {
      console.error("Error fetching bookings:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string | null) => {
    switch (status) {
      case "confirmed":
        return <Badge className="bg-green-500">Confirmed</Badge>;
      case "pending":
        return <Badge variant="secondary">Pending</Badge>;
      case "completed":
        return <Badge className="bg-blue-500">Completed</Badge>;
      case "cancelled":
        return <Badge variant="destructive">Cancelled</Badge>;
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

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!registrationCompleted) {
    return (
      <FeatureLockedCard 
        title="Bookings Locked" 
        description="Complete your brand registration to book creators for events." 
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header - Mobile Responsive */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-heading font-bold">My Bookings</h2>
          <p className="text-sm text-muted-foreground">Manage your creator event bookings</p>
        </div>
        <Button onClick={() => navigate("/influencers")} className="w-full sm:w-auto">
          <Users className="mr-2 h-4 w-4" />
          Book a Creator
        </Button>
      </div>

      {bookings.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-6">
              <Calendar className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-2xl font-heading font-bold mb-2">No Bookings Yet</h3>
            <p className="text-muted-foreground max-w-md mb-6">
              Browse our marketplace to find creators and book them for live events at your venue.
            </p>
            <Button onClick={() => navigate("/influencers")}>
              <Users className="mr-2 h-4 w-4" />
              Find Creators
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {bookings.map((booking) => {
            const pkg = booking.package_type
              ? EVENT_PACKAGES[booking.package_type as keyof typeof EVENT_PACKAGES]
              : null;

            return (
              <Card key={booking.id} className="overflow-hidden">
                <CardContent className="p-0">
                  <div className="flex flex-col md:flex-row">
                    {/* Creator Info */}
                    <div className="p-4 md:p-6 flex items-center gap-4 md:w-1/3 bg-muted/30">
                      <div className="w-16 h-16 rounded-full overflow-hidden bg-muted flex-shrink-0">
                        {booking.creator_profile?.profile_image_url ? (
                          <img
                            src={booking.creator_profile.profile_image_url}
                            alt={booking.creator_profile.display_name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Users className="h-8 w-8 text-muted-foreground" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold truncate">
                          {booking.creator_profile?.display_name || "Creator"}
                        </h3>
                        {pkg && (
                          <p className="text-sm text-muted-foreground">{pkg.name}</p>
                        )}
                        <Link
                          to={`/creator/${booking.creator_profile?.id}`}
                          className="text-xs text-primary hover:underline inline-flex items-center gap-1 mt-1"
                        >
                          View Profile <ExternalLink className="h-3 w-3" />
                        </Link>
                      </div>
                    </div>

                    {/* Booking Details */}
                    <div className="flex-1 p-4 md:p-6">
                      <div className="flex flex-wrap gap-2 mb-3">
                        {getStatusBadge(booking.status)}
                      </div>

                      <div className="grid sm:grid-cols-2 gap-3 text-sm">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Calendar className="h-4 w-4" />
                          {booking.event_date
                            ? format(new Date(booking.event_date), "PPP")
                            : "Date TBD"}
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Clock className="h-4 w-4" />
                          {formatEventTime(booking.event_time_start, booking.event_time_end)}
                        </div>
                        {booking.max_capacity && (
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Users className="h-4 w-4" />
                            Up to {booking.max_capacity} attendees
                          </div>
                        )}
                      </div>

                      <Separator className="my-4" />

                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
                        <div>
                          <p className="text-sm text-muted-foreground">Total</p>
                          <p className="text-lg font-bold">
                            ${(booking.total_price_cents / 100).toFixed(2)}
                          </p>
                          {booking.deposit_amount_cents && (
                            <p className="text-xs text-muted-foreground">
                              Deposit: ${(booking.deposit_amount_cents / 100).toFixed(2)}
                            </p>
                          )}
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            navigate(`/brand-dashboard?tab=messages&creator=${booking.creator_profile?.id}`)
                          }
                          className="w-full sm:w-auto"
                        >
                          <MessageSquare className="h-4 w-4 mr-1" />
                          Message
                        </Button>
                      </div>
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

export default BrandBookingsTab;
