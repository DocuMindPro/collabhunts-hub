import { format } from "date-fns";
import { CheckCircle, Clock, Upload, RotateCcw, DollarSign, XCircle } from "lucide-react";

interface TimelineEvent {
  status: string;
  date: string;
  label: string;
  icon: React.ReactNode;
  isActive: boolean;
  isCompleted: boolean;
}

interface BookingTimelineProps {
  status: string;
  deliveryStatus: string;
  paymentStatus: string;
  createdAt: string;
  confirmedAt?: string | null;
  deliveryDeadline?: string | null;
}

const BookingTimeline = ({
  status,
  deliveryStatus,
  paymentStatus,
  createdAt,
  confirmedAt,
  deliveryDeadline,
}: BookingTimelineProps) => {
  const getTimelineEvents = (): TimelineEvent[] => {
    const events: TimelineEvent[] = [];

    // 1. Booking Created
    events.push({
      status: "created",
      date: createdAt,
      label: "Booking created",
      icon: <Clock className="h-4 w-4" />,
      isActive: status === "pending",
      isCompleted: status !== "pending",
    });

    // 2. Creator Accepted
    if (status === "declined" || status === "cancelled") {
      events.push({
        status: status,
        date: "",
        label: status === "declined" ? "Creator declined" : "Booking cancelled",
        icon: <XCircle className="h-4 w-4" />,
        isActive: false,
        isCompleted: true,
      });
      return events;
    }

    events.push({
      status: "accepted",
      date: "",
      label: "Creator accepted",
      icon: <CheckCircle className="h-4 w-4" />,
      isActive: status === "accepted" && deliveryStatus === "pending",
      isCompleted: status === "accepted" || status === "completed",
    });

    // 3. Work in Progress / Delivered
    const isDelivered = deliveryStatus === "delivered" || deliveryStatus === "confirmed";
    events.push({
      status: "delivered",
      date: deliveryDeadline || "",
      label: isDelivered ? "Deliverables submitted" : "Awaiting delivery",
      icon: <Upload className="h-4 w-4" />,
      isActive: status === "accepted" && (deliveryStatus === "in_progress" || deliveryStatus === "revision_requested"),
      isCompleted: isDelivered,
    });

    // 4. Revision (if applicable)
    if (deliveryStatus === "revision_requested") {
      events.push({
        status: "revision",
        date: "",
        label: "Revision requested",
        icon: <RotateCcw className="h-4 w-4" />,
        isActive: true,
        isCompleted: false,
      });
    }

    // 5. Approved & Payment Released
    events.push({
      status: "confirmed",
      date: confirmedAt || "",
      label: deliveryStatus === "confirmed" ? "Approved & paid" : "Awaiting approval",
      icon: <DollarSign className="h-4 w-4" />,
      isActive: deliveryStatus === "delivered",
      isCompleted: deliveryStatus === "confirmed",
    });

    return events;
  };

  const events = getTimelineEvents();

  return (
    <div className="flex flex-col space-y-0">
      {events.map((event, index) => (
        <div key={event.status} className="flex items-start gap-3">
          {/* Timeline Line & Dot */}
          <div className="flex flex-col items-center">
            <div
              className={`
                w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-colors
                ${event.isCompleted 
                  ? "bg-green-500 text-white" 
                  : event.isActive 
                    ? "bg-primary text-primary-foreground" 
                    : "bg-muted text-muted-foreground"}
              `}
            >
              {event.icon}
            </div>
            {index < events.length - 1 && (
              <div
                className={`
                  w-0.5 h-8 transition-colors
                  ${event.isCompleted ? "bg-green-500" : "bg-muted"}
                `}
              />
            )}
          </div>

          {/* Content */}
          <div className="flex-1 pb-4">
            <p
              className={`
                text-sm font-medium
                ${event.isCompleted 
                  ? "text-foreground" 
                  : event.isActive 
                    ? "text-primary" 
                    : "text-muted-foreground"}
              `}
            >
              {event.label}
            </p>
            {event.date && (
              <p className="text-xs text-muted-foreground">
                {format(new Date(event.date), "MMM dd, yyyy 'at' h:mm a")}
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default BookingTimeline;
