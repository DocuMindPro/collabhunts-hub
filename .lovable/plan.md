

## Add Feedback Page + Admin Feedback Tab

### Overview
Create a public Feedback page accessible from the footer where anyone can submit feedback (first name, last name, email, feedback details, rating 1-3). Submissions are stored in the database, emailed to care@collabhunts.com, and viewable in a new "Feedbacks" tab on the Admin dashboard.

### Database

**New table: `feedbacks`**
| Column | Type | Notes |
|--------|------|-------|
| id | uuid (PK) | default gen_random_uuid() |
| first_name | text | required |
| last_name | text | required |
| email | text | required |
| details | text | required |
| rating | integer | 1, 2, or 3 |
| status | text | default 'new' (new, reviewed, archived) |
| created_at | timestamptz | default now() |

- RLS: Allow anonymous inserts (public form), admin-only select/update
- Validation trigger to ensure rating is 1-3

### New Files

| File | Purpose |
|------|---------|
| `src/pages/Feedback.tsx` | Public feedback form page with first name, last name, email, details, and 1-3 star/emoji rating. On submit: inserts into `feedbacks` table and calls the email edge function to notify care@collabhunts.com |
| `src/components/admin/AdminFeedbacksTab.tsx` | Admin tab showing all feedbacks in a table (name, email, rating, details, date, status). Ability to mark as reviewed/archived |

### Modified Files

| File | Change |
|------|--------|
| `src/App.tsx` | Add `/feedback` route (public, no auth required) |
| `src/components/Footer.tsx` | Add "Feedback" link in the Company section |
| `src/pages/Admin.tsx` | Import and add "Feedbacks" tab with badge count for new feedbacks |
| `supabase/functions/send-notification-email/index.ts` | Add `feedback_submitted` email type that sends feedback details to care@collabhunts.com |

### Feedback Page Design

- Navbar + Footer (consistent with other pages like Contact)
- Hero section: "Share Your Feedback"
- Form fields: First Name, Last Name, Email, Feedback Details (textarea), Rating (3 clickable options: 1 = Needs Improvement, 2 = Good, 3 = Excellent)
- Zod validation on all fields
- Success toast on submission

### Admin Feedbacks Tab

- Table with columns: Name, Email, Rating, Feedback, Status, Date
- Filter by status (All, New, Reviewed, Archived)
- Click to mark as reviewed/archived
- Badge on tab showing count of "new" feedbacks

### Email Notification

When feedback is submitted, the edge function sends a branded email to care@collabhunts.com with the submitter's details, rating, and feedback content.

