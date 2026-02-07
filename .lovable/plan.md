
## Full Careers System: Public Careers Page + Admin Management

### Overview
Build a complete careers system where you can create/manage job positions from the admin dashboard, and candidates can browse open positions and apply with a form + CV upload on a public Careers page. Applications are emailed to care@collabhunts.com.

---

### Database Tables

**1. `career_positions` table**
- `id` (uuid, primary key)
- `title` (text) -- e.g. "Social Media Manager"
- `department` (text, nullable) -- e.g. "Marketing"
- `location` (text, nullable) -- e.g. "Remote", "Beirut, Lebanon"
- `employment_type` (text) -- e.g. "Full-time", "Part-time", "Contract", "Internship"
- `description` (text) -- rich description of the role
- `requirements` (text) -- what's required from candidates
- `responsibilities` (text, nullable) -- key responsibilities
- `salary_range` (text, nullable) -- optional salary info
- `is_active` (boolean, default true) -- toggle positions on/off
- `created_at`, `updated_at` timestamps
- RLS: public read for active positions, admin-only write

**2. `career_applications` table**
- `id` (uuid, primary key)
- `position_id` (uuid, FK to career_positions)
- `full_name` (text)
- `email` (text)
- `phone` (text, nullable)
- `cover_letter` (text, nullable)
- `cv_url` (text) -- URL to uploaded CV in storage
- `linkedin_url` (text, nullable)
- `portfolio_url` (text, nullable)
- `status` (text, default 'pending') -- pending/reviewed/shortlisted/rejected
- `admin_notes` (text, nullable)
- `created_at` timestamp
- RLS: insert for anyone (public applications), admin-only read/update

**3. Storage bucket: `career-cvs`**
- Public: false (private bucket, admin-only access)
- RLS: anyone can upload, only admins can read

---

### Edge Function: `send-career-application-email`
- Triggered after a successful application submission
- Sends email to care@collabhunts.com using the existing RESEND_API_KEY
- Email includes: candidate name, email, phone, position applied for, cover letter, and a link to the CV

---

### New Pages & Components

**1. `src/pages/Careers.tsx` -- Public Careers Page**
- Hero section with heading "Join Our Team" and a brief intro
- Lists all active positions from `career_positions`
- Each position shows: title, department, location, employment type, short description
- Click a position to expand and see full details + "Apply Now" button
- Application form (dialog or inline) with fields:
  - Full Name (required)
  - Email (required)
  - Phone (optional)
  - LinkedIn URL (optional)
  - Portfolio URL (optional)
  - Cover Letter (textarea, optional)
  - Upload CV (required, PDF/DOC/DOCX, max 10MB)
- On submit: uploads CV to storage, inserts into `career_applications`, calls edge function to email care@collabhunts.com
- Success confirmation message

**2. `src/components/admin/AdminCareersTab.tsx` -- Admin Management**
- **Positions Management section:**
  - Table of all positions (active and inactive)
  - Create new position dialog with all fields (title, department, location, type, description, requirements, responsibilities, salary range)
  - Edit existing positions
  - Toggle active/inactive with a switch
  - Delete positions
- **Applications section:**
  - Table of all applications with: candidate name, email, position title, date, status
  - Click to view full application details
  - Update status (pending/reviewed/shortlisted/rejected)
  - Add admin notes
  - Download CV link

---

### Routing & Footer Changes

**`src/App.tsx`**
- Add lazy import for Careers page
- Add route: `/careers` (public, no auth required)

**`src/components/Footer.tsx`**
- Add "Careers" link in the Company section (always visible)

**`src/pages/Admin.tsx`**
- Add new "Careers" tab trigger with Briefcase icon
- Add `TabsContent` rendering `AdminCareersTab`

---

### Technical Details

- Uses existing patterns: Tabs for admin, Dialog for forms, Card for position listings
- CV upload goes to a private `career-cvs` storage bucket
- Email sent via Resend (RESEND_API_KEY already configured)
- No authentication required to apply -- public form
- Admin tab follows the same pattern as other admin tabs (separate component file)
- Position toggle (active/inactive) controls visibility on the public page
- Form validation with required fields enforced client-side

### Files to Create
- `src/pages/Careers.tsx`
- `src/components/admin/AdminCareersTab.tsx`
- `supabase/functions/send-career-application-email/index.ts`

### Files to Modify
- `src/App.tsx` (add route)
- `src/components/Footer.tsx` (add Careers link)
- `src/pages/Admin.tsx` (add Careers tab)

### Database Migration
- Create `career_positions` table with RLS
- Create `career_applications` table with RLS
- Create `career-cvs` storage bucket with policies
