import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { format } from "date-fns";
import { Check, X, Clock } from "lucide-react";

interface Booking {
  id: string;
  status: string;
  message: string | null;
  booking_date: string | null;
  total_price_cents: number;
  created_at: string;
  brand_profiles: {
    company_name: string;
  };
  creator_services: {
    service_type: string;
  } | null;
}

const BookingsTab = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");

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
      toast.success(`Booking ${status}`);
      fetchBookings();
    } catch (error) {
      console.error("Error updating booking:", error);
      toast.error("Failed to update booking");
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
          <h2 className="text-2xl font-heading font-bold">Bookings</h2>
          <p className="text-muted-foreground">Manage your collaboration requests</p>
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
                    <CardTitle>{booking.brand_profiles.company_name}</CardTitle>
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
                  <Button
                    onClick={() => updateBookingStatus(booking.id, "completed")}
                    className="w-full"
                  >
                    Mark as Completed
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default BookingsTab;
