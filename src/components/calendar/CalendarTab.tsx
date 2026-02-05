import { CalendarView } from "./CalendarView";

interface CalendarTabProps {
  userType: 'creator' | 'brand';
}

export const CalendarTab = ({ userType }: CalendarTabProps) => {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold mb-1">Your Calendar</h2>
        <p className="text-sm text-muted-foreground">
          Track all your confirmed bookings and signed agreements in one place.
        </p>
      </div>
      <CalendarView />
    </div>
  );
};
