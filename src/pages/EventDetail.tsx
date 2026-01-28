import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  MapPin,
  Calendar,
  Clock,
  Users,
  Star,
  Ticket,
  CheckCircle,
  Share2,
  ArrowLeft,
  Loader2,
  Instagram,
  Youtube,
  ExternalLink,
  MessageCircle,
} from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { EVENT_TYPES, type EventType } from "@/config/packages";
import WhatsAppButton from "@/components/WhatsAppButton";
import { WHATSAPP_CONFIG, formatDualCurrency } from "@/config/lebanese-market";

interface EventDetails {
  id: string;
  title: string;
  description: string | null;
  event_date: string;
  start_time: string;
  end_time: string;
  event_type: string;
  package_type: string | null;
  max_attendees: number | null;
  current_attendees: number | null;
  ticket_price_cents: number | null;
  is_public: boolean;
  status: string;
  creator_profile: {
    id: string;
    display_name: string;
    profile_image_url: string | null;
    bio: string | null;
    categories: string[];
  } | null;
  venue: {
    id: string;
    company_name: string;
    venue_name: string | null;
    venue_address: string | null;
    venue_city: string | null;
    venue_type: string | null;
    parking_available: boolean | null;
    amenities: string[] | null;
  } | null;
}

const EventDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [event, setEvent] = useState<EventDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [isRegistrationOpen, setIsRegistrationOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [registrationComplete, setRegistrationComplete] = useState(false);

  // Registration form
  const [fanName, setFanName] = useState("");
  const [fanEmail, setFanEmail] = useState("");
  const [fanPhone, setFanPhone] = useState("");

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    if (id) fetchEventDetails();
  }, [id]);

  const fetchEventDetails = async () => {
    try {
      setLoading(true);

      const { data, error } = await supabase
        .from("events")
        .select(`
          id,
          title,
          description,
          event_date,
          start_time,
          end_time,
          event_type,
          package_type,
          max_attendees,
          current_attendees,
          ticket_price_cents,
          is_public,
          status,
          creator_profiles!events_creator_profile_id_fkey (
            id,
            display_name,
            profile_image_url,
            bio,
            categories
          ),
          brand_profiles!events_venue_id_fkey (
            id,
            company_name,
            venue_name,
            venue_address,
            venue_city,
            venue_type,
            parking_available,
            amenities
          )
        `)
        .eq("id", id)
        .eq("is_public", true)
        .single();

      if (error) throw error;

      setEvent({
        ...data,
        is_public: data.is_public ?? true,
        status: data.status ?? "scheduled",
        creator_profile: data.creator_profiles,
        venue: data.brand_profiles,
      });
    } catch (error: any) {
      console.error("Error fetching event:", error);
      toast({
        title: "Event Not Found",
        description: "This event doesn't exist or is no longer available.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    if (!fanName || !fanEmail) {
      toast({
        title: "Missing Information",
        description: "Please enter your name and email",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase.from("event_registrations").insert({
        event_id: id,
        fan_name: fanName,
        fan_email: fanEmail,
        fan_phone: fanPhone || null,
        status: "registered",
      });

      if (error) {
        if (error.code === "23505") {
          throw new Error("You're already registered for this event");
        }
        throw error;
      }

      // Update attendee count
      await supabase
        .from("events")
        .update({
          current_attendees: (event?.current_attendees || 0) + 1,
        })
        .eq("id", id);

      setRegistrationComplete(true);

      toast({
        title: "Registration Successful!",
        description: "You're registered for this event. Check your email for details.",
      });
    } catch (error: any) {
      console.error("Registration error:", error);
      toast({
        title: "Registration Failed",
        description: error.message || "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleShare = async () => {
    const url = window.location.href;
    const text = `Check out this event: ${event?.title}`;

    if (navigator.share) {
      try {
        await navigator.share({ title: event?.title, text, url });
      } catch (err) {
        // User cancelled share
      }
    } else {
      await navigator.clipboard.writeText(url);
      toast({
        title: "Link Copied",
        description: "Event link copied to clipboard",
      });
    }
  };

  const formatEventTime = (start: string, end: string) => {
    const formatTime = (time: string) => {
      const [hours, minutes] = time.split(":");
      const hour = parseInt(hours);
      const ampm = hour >= 12 ? "PM" : "AM";
      const displayHour = hour % 12 || 12;
      return `${displayHour}:${minutes} ${ampm}`;
    };
    return `${formatTime(start)} - ${formatTime(end)}`;
  };

  const getSpotsLeft = () => {
    if (!event?.max_attendees) return null;
    const current = event.current_attendees || 0;
    return event.max_attendees - current;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </main>
        <Footer />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-4xl font-heading font-bold mb-4">Event Not Found</h1>
            <p className="text-muted-foreground mb-8">
              This event doesn't exist or is no longer available.
            </p>
            <Link to="/events">
              <Button>Browse Events</Button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const spotsLeft = getSpotsLeft();
  const isFree = !event.ticket_price_cents || event.ticket_price_cents === 0;
  const isSoldOut = spotsLeft !== null && spotsLeft <= 0;
  const eventDate = new Date(event.event_date);
  const isPast = eventDate < new Date();

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 py-8">
        <div className="container mx-auto px-4 max-w-5xl">
          {/* Back Button */}
          <Button
            variant="ghost"
            className="mb-6"
            onClick={() => navigate("/events")}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Events
          </Button>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Hero Image */}
              <div className="relative aspect-video rounded-xl overflow-hidden bg-gradient-to-br from-primary/20 to-accent/20">
                {event.creator_profile?.profile_image_url ? (
                  <img
                    src={event.creator_profile.profile_image_url}
                    alt={event.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Users className="h-24 w-24 text-muted-foreground/30" />
                  </div>
                )}
              </div>

              {/* Event Info */}
              <div>
                <div className="flex flex-wrap gap-2 mb-3">
                  <Badge variant="outline">
                    {EVENT_TYPES[event.event_type as EventType] || event.event_type}
                  </Badge>
                  {isPast && <Badge variant="secondary">Past Event</Badge>}
                  {isSoldOut && !isPast && <Badge variant="destructive">Sold Out</Badge>}
                </div>

                <h1 className="text-3xl md:text-4xl font-heading font-bold mb-4">
                  {event.title}
                </h1>

                {event.description && (
                  <p className="text-lg text-muted-foreground whitespace-pre-wrap">
                    {event.description}
                  </p>
                )}
              </div>

              {/* Creator Card */}
              {event.creator_profile && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Hosted by</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Link
                      to={`/creator/${event.creator_profile.id}`}
                      className="flex items-center gap-4 hover:opacity-80 transition-opacity"
                    >
                      <div className="w-16 h-16 rounded-full overflow-hidden bg-muted">
                        {event.creator_profile.profile_image_url ? (
                          <img
                            src={event.creator_profile.profile_image_url}
                            alt={event.creator_profile.display_name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Users className="h-8 w-8 text-muted-foreground" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg flex items-center gap-2">
                          {event.creator_profile.display_name}
                          <ExternalLink className="h-4 w-4 text-muted-foreground" />
                        </h3>
                        {event.creator_profile.categories?.length > 0 && (
                          <p className="text-sm text-muted-foreground">
                            {event.creator_profile.categories.slice(0, 3).join(" • ")}
                          </p>
                        )}
                      </div>
                    </Link>
                    {event.creator_profile.bio && (
                      <p className="mt-4 text-sm text-muted-foreground line-clamp-3">
                        {event.creator_profile.bio}
                      </p>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Venue Card */}
              {event.venue && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <MapPin className="h-5 w-5" />
                      Venue
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <h3 className="font-semibold">
                      {event.venue.venue_name || event.venue.company_name}
                    </h3>
                    {event.venue.venue_address && (
                      <p className="text-muted-foreground mt-1">
                        {event.venue.venue_address}
                        {event.venue.venue_city && `, ${event.venue.venue_city}`}
                      </p>
                    )}
                    {event.venue.parking_available && (
                      <Badge variant="secondary" className="mt-3">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Parking Available
                      </Badge>
                    )}
                    {event.venue.amenities && event.venue.amenities.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-3">
                        {event.venue.amenities.map((amenity, i) => (
                          <Badge key={i} variant="outline">
                            {amenity}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-4">
              {/* Event Details Card */}
              <Card className="sticky top-4">
                <CardContent className="p-6 space-y-4">
                  {/* Date & Time */}
                  <div className="flex items-start gap-3">
                    <Calendar className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <p className="font-semibold">
                        {format(eventDate, "EEEE, MMMM d, yyyy")}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {formatEventTime(event.start_time, event.end_time)}
                      </p>
                    </div>
                  </div>

                  {/* Price */}
                  <div className="flex items-start gap-3">
                    <Ticket className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <p className="font-semibold">
                        {isFree ? "Free Event" : `$${(event.ticket_price_cents! / 100).toFixed(0)}`}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {isFree ? "No ticket required" : (
                          <>Per person <span className="text-xs">(~{formatDualCurrency(event.ticket_price_cents!).lbp})</span></>
                        )}
                      </p>
                    </div>
                  </div>

                  {/* Capacity */}
                  {event.max_attendees && (
                    <div className="flex items-start gap-3">
                      <Users className="h-5 w-5 text-primary mt-0.5" />
                      <div>
                        <p className="font-semibold">
                          {spotsLeft !== null && spotsLeft > 0
                            ? `${spotsLeft} spots left`
                            : spotsLeft === 0
                            ? "Sold Out"
                            : `${event.max_attendees} capacity`}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {event.current_attendees || 0} registered
                        </p>
                      </div>
                    </div>
                  )}

                  <Separator />

                  {/* Action Buttons */}
                  {!isPast && !isSoldOut && (
                    <Button
                      className="w-full"
                      size="lg"
                      onClick={() => setIsRegistrationOpen(true)}
                    >
                      {isFree ? "Register for Free" : "Get Tickets"}
                    </Button>
                  )}

                  {isPast && (
                    <Button className="w-full" size="lg" disabled>
                      Event Ended
                    </Button>
                  )}

                  {isSoldOut && !isPast && (
                    <Button className="w-full" size="lg" disabled>
                      Sold Out
                    </Button>
                  )}

                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={handleShare}
                  >
                    <Share2 className="mr-2 h-4 w-4" />
                    Share Event
                  </Button>

                  {/* WhatsApp Share */}
                  <WhatsAppButton
                    phoneNumber={WHATSAPP_CONFIG.platformNumber}
                    message={WHATSAPP_CONFIG.templates.eventReminder(
                      event.title,
                      format(eventDate, "MMMM d, yyyy"),
                      formatEventTime(event.start_time, event.end_time)
                    )}
                    variant="outline"
                    className="w-full"
                  >
                    Share on WhatsApp
                  </WhatsAppButton>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>

      {/* Registration Dialog */}
      <Dialog open={isRegistrationOpen} onOpenChange={setIsRegistrationOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {registrationComplete ? "You're Registered!" : "Register for Event"}
            </DialogTitle>
            <DialogDescription>
              {registrationComplete
                ? "We've sent confirmation details to your email."
                : `Reserve your spot for "${event.title}"`}
            </DialogDescription>
          </DialogHeader>

          {registrationComplete ? (
            <div className="text-center py-6">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="h-8 w-8 text-primary" />
              </div>
              <p className="text-muted-foreground mb-6">
                See you at the event! Don't forget to bring a valid ID.
              </p>
              <Button onClick={() => setIsRegistrationOpen(false)}>
                Done
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  placeholder="Your name"
                  value={fanName}
                  onChange={(e) => setFanName(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  value={fanEmail}
                  onChange={(e) => setFanEmail(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone (optional)</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+1 (555) 000-0000"
                  value={fanPhone}
                  onChange={(e) => setFanPhone(e.target.value)}
                />
              </div>

              {!isFree && (
                <div className="bg-muted/50 rounded-lg p-4">
                  <p className="text-sm text-muted-foreground">
                    <strong>Note:</strong> Ticket payment will be collected at the venue.
                  </p>
                </div>
              )}

              <Button
                className="w-full"
                onClick={handleRegister}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Registering...
                  </>
                ) : (
                  "Confirm Registration"
                )}
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
};

export default EventDetail;
