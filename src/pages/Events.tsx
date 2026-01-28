import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Search,
  MapPin,
  CalendarIcon,
  Users,
  Clock,
  Star,
  Filter,
  Ticket,
} from "lucide-react";
import { format, isSameDay, isAfter } from "date-fns";
import { cn } from "@/lib/utils";
import { EVENT_TYPES, VENUE_TYPES, type EventType } from "@/config/packages";
import { LEBANESE_CITIES } from "@/config/lebanese-market";
import LebaneseCitySelect from "@/components/LebaneseCitySelect";

interface EventWithDetails {
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
    categories: string[];
  } | null;
  venue: {
    id: string;
    company_name: string;
    venue_name: string | null;
    venue_city: string | null;
    venue_type: string | null;
  } | null;
}

const Events = () => {
  const [events, setEvents] = useState<EventWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCity, setSelectedCity] = useState("all");
  const [selectedType, setSelectedType] = useState("all");
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [cities, setCities] = useState<string[]>([]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);

      const today = new Date().toISOString().split("T")[0];

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
            categories
          ),
          brand_profiles!events_venue_id_fkey (
            id,
            company_name,
            venue_name,
            venue_city,
            venue_type
          )
        `)
        .eq("is_public", true)
        .eq("status", "scheduled")
        .gte("event_date", today)
        .order("event_date", { ascending: true });

      if (error) throw error;

      const formattedEvents: EventWithDetails[] = (data || []).map((event) => ({
        id: event.id,
        title: event.title,
        description: event.description,
        event_date: event.event_date,
        start_time: event.start_time,
        end_time: event.end_time,
        event_type: event.event_type,
        package_type: event.package_type,
        max_attendees: event.max_attendees,
        current_attendees: event.current_attendees,
        ticket_price_cents: event.ticket_price_cents,
        is_public: event.is_public ?? true,
        status: event.status ?? "scheduled",
        creator_profile: event.creator_profiles,
        venue: event.brand_profiles,
      }));

      setEvents(formattedEvents);

      // Extract unique cities
      const uniqueCities = [...new Set(
        formattedEvents
          .map((e) => e.venue?.venue_city)
          .filter((city): city is string => !!city)
      )];
      setCities(uniqueCities);
    } catch (error: any) {
      console.error("Error fetching events:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredEvents = events.filter((event) => {
    const matchesSearch =
      searchQuery === "" ||
      event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.creator_profile?.display_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.venue?.venue_name?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCity =
      selectedCity === "all" || event.venue?.venue_city === selectedCity;

    const matchesType =
      selectedType === "all" || event.event_type === selectedType;

    const matchesDate =
      !selectedDate || isSameDay(new Date(event.event_date), selectedDate);

    return matchesSearch && matchesCity && matchesType && matchesDate;
  });

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

  const getSpotsLeft = (event: EventWithDetails) => {
    if (!event.max_attendees) return null;
    const current = event.current_attendees || 0;
    return event.max_attendees - current;
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 py-12">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl md:text-5xl font-heading font-bold mb-4">
              Upcoming Creator Events
            </h1>
            <p className="text-xl text-muted-foreground">
              Meet your favorite creators in person at live experiences
            </p>
          </div>

          {/* Filters */}
          <div className="bg-card rounded-xl border border-border p-6 mb-8 shadow-card">
            <div className="grid md:grid-cols-5 gap-4">
              {/* Search */}
              <div className="md:col-span-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="Search events, creators, or venues..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* City Filter - Lebanese Cities */}
              <LebaneseCitySelect
                value={selectedCity}
                onValueChange={setSelectedCity}
                includeAllOption={true}
                allOptionLabel="All Cities"
                placeholder="Filter by city"
              />

              {/* Event Type Filter */}
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger>
                  <SelectValue placeholder="Event Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  {Object.entries(EVENT_TYPES).map(([key, label]) => (
                    <SelectItem key={key} value={key}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Date Filter */}
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "justify-start text-left font-normal",
                      !selectedDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {selectedDate ? format(selectedDate, "PPP") : "Any date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    disabled={(date) => date < new Date()}
                    initialFocus
                  />
                  {selectedDate && (
                    <div className="p-2 border-t">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full"
                        onClick={() => setSelectedDate(undefined)}
                      >
                        Clear date
                      </Button>
                    </div>
                  )}
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* Events Grid */}
          {loading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <Card key={i}>
                  <CardContent className="p-0">
                    <Skeleton className="h-48 w-full rounded-t-lg" />
                    <div className="p-4 space-y-3">
                      <Skeleton className="h-6 w-3/4" />
                      <Skeleton className="h-4 w-1/2" />
                      <Skeleton className="h-4 w-full" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : filteredEvents.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                <CalendarIcon className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-semibold mb-2">No Events Found</h3>
              <p className="text-muted-foreground mb-6">
                {searchQuery || selectedCity !== "all" || selectedType !== "all" || selectedDate
                  ? "Try adjusting your filters"
                  : "Check back soon for upcoming creator events"}
              </p>
              {(searchQuery || selectedCity !== "all" || selectedType !== "all" || selectedDate) && (
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedCity("all");
                    setSelectedType("all");
                    setSelectedDate(undefined);
                  }}
                >
                  Clear Filters
                </Button>
              )}
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredEvents.map((event) => {
                const spotsLeft = getSpotsLeft(event);
                const isFree = !event.ticket_price_cents || event.ticket_price_cents === 0;

                return (
                  <Link key={event.id} to={`/event/${event.id}`}>
                    <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer overflow-hidden">
                      {/* Event Image (Creator's profile image as placeholder) */}
                      <div className="relative h-48 bg-gradient-to-br from-primary/20 to-accent/20">
                        {event.creator_profile?.profile_image_url ? (
                          <img
                            src={event.creator_profile.profile_image_url}
                            alt={event.creator_profile.display_name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Users className="h-16 w-16 text-muted-foreground/30" />
                          </div>
                        )}
                        {/* Date Badge */}
                        <div className="absolute top-3 left-3 bg-background/95 backdrop-blur-sm rounded-lg px-3 py-2 text-center shadow">
                          <div className="text-xs text-muted-foreground uppercase">
                            {format(new Date(event.event_date), "MMM")}
                          </div>
                          <div className="text-xl font-bold">
                            {format(new Date(event.event_date), "d")}
                          </div>
                        </div>
                        {/* Price Badge */}
                        <Badge
                          className="absolute top-3 right-3"
                          variant={isFree ? "secondary" : "default"}
                        >
                          {isFree ? "Free" : `$${(event.ticket_price_cents! / 100).toFixed(0)}`}
                        </Badge>
                      </div>

                      <CardContent className="p-4">
                        {/* Event Type */}
                        <Badge variant="outline" className="mb-2">
                          {EVENT_TYPES[event.event_type as EventType] || event.event_type}
                        </Badge>

                        {/* Title */}
                        <h3 className="font-semibold text-lg mb-2 line-clamp-2">
                          {event.title}
                        </h3>

                        {/* Creator */}
                        {event.creator_profile && (
                          <p className="text-sm text-muted-foreground mb-2 flex items-center gap-2">
                            <Star className="h-3 w-3" />
                            {event.creator_profile.display_name}
                          </p>
                        )}

                        {/* Venue & Time */}
                        <div className="space-y-1 text-sm text-muted-foreground">
                          {event.venue && (
                            <p className="flex items-center gap-2">
                              <MapPin className="h-3 w-3" />
                              {event.venue.venue_name || event.venue.company_name}
                              {event.venue.venue_city && `, ${event.venue.venue_city}`}
                            </p>
                          )}
                          <p className="flex items-center gap-2">
                            <Clock className="h-3 w-3" />
                            {formatEventTime(event.start_time, event.end_time)}
                          </p>
                        </div>

                        {/* Spots Left */}
                        {spotsLeft !== null && (
                          <div className="mt-3 pt-3 border-t">
                            <p className={cn(
                              "text-sm font-medium flex items-center gap-2",
                              spotsLeft <= 10 ? "text-destructive" : "text-muted-foreground"
                            )}>
                              <Ticket className="h-3 w-3" />
                              {spotsLeft > 0
                                ? `${spotsLeft} spots left`
                                : "Fully booked"}
                            </p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Events;
