import { format } from "date-fns";
import { Calendar, Clock, DollarSign, User } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export interface CalendarEvent {
  id: string;
  user_id: string;
  event_type: 'booking' | 'agreement' | 'deadline';
  title: string;
  description: string | null;
  start_date: string;
  start_time: string | null;
  end_time: string | null;
  source_table: string;
  source_id: string;
  metadata: {
    package_type?: string;
    total_price_cents?: number;
    proposed_price_cents?: number;
    brand_name?: string;
    creator_name?: string;
    template_type?: string;
    duration_hours?: number;
  };
}

interface CalendarEventCardProps {
  event: CalendarEvent;
  compact?: boolean;
}

const eventTypeConfig = {
  booking: {
    color: 'bg-blue-500',
    bgColor: 'bg-blue-50 dark:bg-blue-950',
    borderColor: 'border-blue-200 dark:border-blue-800',
    label: 'Booking',
  },
  agreement: {
    color: 'bg-green-500',
    bgColor: 'bg-green-50 dark:bg-green-950',
    borderColor: 'border-green-200 dark:border-green-800',
    label: 'Agreement',
  },
  deadline: {
    color: 'bg-orange-500',
    bgColor: 'bg-orange-50 dark:bg-orange-950',
    borderColor: 'border-orange-200 dark:border-orange-800',
    label: 'Deadline',
  },
};

export const CalendarEventCard = ({ event, compact = false }: CalendarEventCardProps) => {
  const config = eventTypeConfig[event.event_type];
  const priceCents = event.metadata.total_price_cents || event.metadata.proposed_price_cents;
  const otherParty = event.metadata.brand_name || event.metadata.creator_name;

  if (compact) {
    return (
      <div className={cn(
        "flex items-center gap-2 p-2 rounded-md text-sm",
        config.bgColor,
        "border",
        config.borderColor
      )}>
        <div className={cn("w-2 h-2 rounded-full", config.color)} />
        <span className="truncate font-medium">{event.title}</span>
        {event.start_time && (
          <span className="text-muted-foreground text-xs ml-auto">
            {event.start_time.slice(0, 5)}
          </span>
        )}
      </div>
    );
  }

  return (
    <Card className={cn("border-l-4", config.borderColor)} style={{ borderLeftColor: config.color.replace('bg-', '').includes('blue') ? '#3b82f6' : config.color.replace('bg-', '').includes('green') ? '#22c55e' : '#f97316' }}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="secondary" className="text-xs">
                {config.label}
              </Badge>
              {event.metadata.package_type && (
                <Badge variant="outline" className="text-xs">
                  {event.metadata.package_type}
                </Badge>
              )}
            </div>
            <h4 className="font-semibold text-base truncate">{event.title}</h4>
            {event.description && (
              <p className="text-sm text-muted-foreground mt-1">{event.description}</p>
            )}
          </div>
        </div>
        
        <div className="flex flex-wrap gap-3 mt-3 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Calendar className="h-3.5 w-3.5" />
            <span>{format(new Date(event.start_date), 'MMM d, yyyy')}</span>
          </div>
          
          {event.start_time && (
            <div className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              <span>
                {event.start_time.slice(0, 5)}
                {event.end_time && ` - ${event.end_time.slice(0, 5)}`}
              </span>
            </div>
          )}
          
          {otherParty && (
            <div className="flex items-center gap-1">
              <User className="h-3.5 w-3.5" />
              <span>{otherParty}</span>
            </div>
          )}
          
          {priceCents && (
            <div className="flex items-center gap-1">
              <DollarSign className="h-3.5 w-3.5" />
              <span>${(priceCents / 100).toLocaleString()}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
