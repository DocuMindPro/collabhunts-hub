
# Calendar Feature for Creators and Brands

## Overview
Add a shared calendar system that automatically shows all confirmed bookings and signed agreements, helping both creators and brands track their upcoming commitments with automated reminders.

## What You'll Get

### Calendar View
- A new "Calendar" tab in both Creator and Brand dashboards
- Monthly, weekly, and daily view options
- Color-coded events by type (bookings, agreements, deadlines)
- Click on any event to see full details

### Automatic Event Population
Events will automatically appear when:
- A booking is confirmed (status changes to "confirmed")
- An agreement is signed (both parties confirm)
- An offer is accepted

### Event Types Displayed
- **Bookings**: Shows event date, time, venue/creator, package type
- **Agreements**: Shows deliverable deadlines, event dates
- **Reminders**: Deadlines for content delivery

### Reminder System
- **7 days before**: First reminder notification
- **1 day before**: Reminder the day before the event
- **Day of**: Morning-of reminder
- Reminders sent via:
  - In-app notifications (existing system)
  - Browser notifications
  - Push notifications (for mobile app users)

---

## Technical Implementation

### Phase 1: Database Setup

Create a `calendar_events` table to store unified calendar entries:

```text
calendar_events
├── id (uuid)
├── user_id (references auth user)
├── event_type ('booking' | 'agreement' | 'deadline')
├── title (text)
├── description (text, nullable)
├── start_date (date)
├── start_time (time, nullable)
├── end_time (time, nullable)
├── source_table (text: 'bookings' | 'creator_agreements')
├── source_id (uuid: reference to original record)
├── metadata (jsonb: additional info like package type, price)
├── reminder_7d_sent (boolean)
├── reminder_1d_sent (boolean)
├── reminder_0d_sent (boolean)
├── created_at (timestamp)
└── updated_at (timestamp)
```

### Phase 2: Database Triggers

Create triggers to automatically populate calendar events:

1. **On booking confirmation** - Insert calendar event for both creator and brand
2. **On agreement signing** - Insert calendar event with event date

### Phase 3: Calendar Components

Create new UI components:
- `src/components/calendar/CalendarView.tsx` - Main calendar component using react-day-picker
- `src/components/calendar/CalendarEventCard.tsx` - Event detail cards
- `src/components/calendar/CalendarTab.tsx` - Wrapper for dashboard integration

### Phase 4: Dashboard Integration

Add "Calendar" tab to both dashboards:
- Creator Dashboard: New tab between "Bookings" and "Opportunities"
- Brand Dashboard: New tab between "Events" and "Messages"

### Phase 5: Reminder Edge Function

Create `supabase/functions/send-calendar-reminders/index.ts`:
- Runs daily via cron job
- Queries upcoming events
- Sends notifications for 7-day, 1-day, and day-of reminders
- Uses existing notification infrastructure

### Phase 6: Cron Job Setup

Schedule the reminder function to run twice daily (9 AM and 6 PM) to catch all reminders.

---

## Data Flow

```text
Booking Confirmed
       │
       ▼
Database Trigger Fires
       │
       ├──► Insert calendar_event for Creator
       │
       └──► Insert calendar_event for Brand
       
Daily Cron Job
       │
       ▼
Check calendar_events for upcoming dates
       │
       ├──► 7 days away? Send 7d reminder
       ├──► 1 day away? Send 1d reminder
       └──► Today? Send day-of reminder
```

---

## Files to Create/Modify

### New Files
1. `src/components/calendar/CalendarView.tsx` - Main calendar component
2. `src/components/calendar/CalendarEventCard.tsx` - Event detail display
3. `src/components/calendar/CalendarTab.tsx` - Dashboard tab wrapper
4. `supabase/functions/send-calendar-reminders/index.ts` - Reminder edge function

### Modified Files
1. `src/pages/CreatorDashboard.tsx` - Add Calendar tab
2. `src/pages/BrandDashboard.tsx` - Add Calendar tab
3. Database migration for `calendar_events` table and triggers
