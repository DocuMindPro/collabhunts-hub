import { useState, useEffect } from "react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isSameMonth, addMonths, subMonths, isToday } from "date-fns";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { CalendarEventCard, type CalendarEvent } from "./CalendarEventCard";
import { Skeleton } from "@/components/ui/skeleton";

type ViewMode = 'month' | 'week' | 'day';

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export const CalendarView = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>('month');

  useEffect(() => {
    fetchEvents();
  }, [currentDate]);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const monthStart = startOfMonth(currentDate);
      const monthEnd = endOfMonth(currentDate);

      const { data, error } = await supabase
        .from('calendar_events')
        .select('*')
        .eq('user_id', user.id)
        .gte('start_date', format(monthStart, 'yyyy-MM-dd'))
        .lte('start_date', format(monthEnd, 'yyyy-MM-dd'))
        .order('start_date', { ascending: true })
        .order('start_time', { ascending: true });

      if (error) throw error;
      setEvents((data as CalendarEvent[]) || []);
    } catch (error) {
      console.error('Error fetching calendar events:', error);
    } finally {
      setLoading(false);
    }
  };

  const goToPreviousMonth = () => setCurrentDate(subMonths(currentDate, 1));
  const goToNextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const goToToday = () => {
    setCurrentDate(new Date());
    setSelectedDate(new Date());
  };

  const daysInMonth = eachDayOfInterval({
    start: startOfMonth(currentDate),
    end: endOfMonth(currentDate),
  });

  const firstDayOfMonth = startOfMonth(currentDate).getDay();
  const emptyDays = Array(firstDayOfMonth).fill(null);

  const getEventsForDay = (date: Date) => {
    return events.filter(event => isSameDay(new Date(event.start_date), date));
  };

  const selectedDateEvents = selectedDate ? getEventsForDay(selectedDate) : [];

  const eventTypeColors: Record<string, string> = {
    booking: 'bg-blue-500',
    agreement: 'bg-green-500',
    deadline: 'bg-orange-500',
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-2">
          <CalendarIcon className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold">
            {format(currentDate, 'MMMM yyyy')}
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={goToToday}>
            Today
          </Button>
          <div className="flex items-center border rounded-md">
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={goToPreviousMonth}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={goToNextMonth}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-[1fr_320px] gap-4">
        {/* Calendar Grid */}
        <Card>
          <CardContent className="p-2 sm:p-4">
            {/* Day Headers */}
            <div className="grid grid-cols-7 mb-2">
              {DAY_NAMES.map(day => (
                <div key={day} className="text-center text-xs font-medium text-muted-foreground py-2">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Days */}
            {loading ? (
              <div className="grid grid-cols-7 gap-1">
                {Array(35).fill(null).map((_, i) => (
                  <Skeleton key={i} className="h-16 sm:h-24" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-7 gap-1">
                {emptyDays.map((_, index) => (
                  <div key={`empty-${index}`} className="h-16 sm:h-24" />
                ))}
                {daysInMonth.map(day => {
                  const dayEvents = getEventsForDay(day);
                  const isSelected = selectedDate && isSameDay(day, selectedDate);
                  const isTodayDate = isToday(day);

                  return (
                    <button
                      key={day.toISOString()}
                      onClick={() => setSelectedDate(day)}
                      className={cn(
                        "h-16 sm:h-24 p-1 text-left rounded-md transition-colors relative",
                        "hover:bg-muted/50",
                        isSelected && "ring-2 ring-primary bg-primary/5",
                        isTodayDate && "bg-primary/10"
                      )}
                    >
                      <span className={cn(
                        "text-xs sm:text-sm font-medium",
                        isTodayDate && "text-primary font-bold",
                        !isSameMonth(day, currentDate) && "text-muted-foreground"
                      )}>
                        {format(day, 'd')}
                      </span>
                      
                      {/* Event Indicators */}
                      <div className="flex flex-wrap gap-0.5 mt-1">
                        {dayEvents.slice(0, 3).map(event => (
                          <div
                            key={event.id}
                            className={cn(
                              "w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full",
                              eventTypeColors[event.event_type]
                            )}
                            title={event.title}
                          />
                        ))}
                        {dayEvents.length > 3 && (
                          <span className="text-[10px] text-muted-foreground">
                            +{dayEvents.length - 3}
                          </span>
                        )}
                      </div>

                      {/* Compact event list for larger screens */}
                      <div className="hidden sm:block mt-1 space-y-0.5">
                        {dayEvents.slice(0, 2).map(event => (
                          <div
                            key={event.id}
                            className={cn(
                              "text-[10px] truncate px-1 rounded",
                              event.event_type === 'booking' && "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300",
                              event.event_type === 'agreement' && "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300",
                              event.event_type === 'deadline' && "bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300"
                            )}
                          >
                            {event.title}
                          </div>
                        ))}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Selected Day Events */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">
              {selectedDate 
                ? format(selectedDate, 'EEEE, MMMM d')
                : 'Select a date'
              }
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {!selectedDate ? (
              <p className="text-sm text-muted-foreground">
                Click on a date to see events
              </p>
            ) : selectedDateEvents.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No events on this day
              </p>
            ) : (
              selectedDateEvents.map(event => (
                <CalendarEventCard key={event.id} event={event} />
              ))
            )}
          </CardContent>
        </Card>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-blue-500" />
          <span className="text-muted-foreground">Bookings</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-green-500" />
          <span className="text-muted-foreground">Agreements</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-orange-500" />
          <span className="text-muted-foreground">Deadlines</span>
        </div>
      </div>
    </div>
  );
};
