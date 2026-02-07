

## Full Disaster Recovery: Add Media File Backup

### Current State

Your backup system currently covers:
- **Database**: All 60 tables backed up daily to AWS S3 (working)
- **Code**: Git/Lovable handles source code and edge functions
- **Recovery docs**: Uploaded to S3 with each backup

**What's NOT backed up (the gap):**

| Storage | Files | What's at Risk |
|---------|-------|---------------|
| Supabase Storage: profile-images | 36 files | User profile photos |
| Supabase Storage: portfolio-media | 7 files | Creator portfolio images |
| Supabase Storage: brand-logos | 0 files | Brand logo uploads |
| Supabase Storage: career-cvs | 0 files | Job application CVs |
| Cloudflare R2 | Unknown count | Content Library, deliverables, portfolio CDN copies |

If Supabase Storage or Cloudflare R2 has an outage, your database would have URLs pointing to files that no longer exist.

### What We'll Build

A new edge function `backup-media` that:
1. Lists all files in all 4 Supabase Storage buckets
2. Downloads each file and re-uploads it to AWS S3 under a `media-backups/` prefix
3. Optionally copies R2 file inventory metadata to S3 (actual R2-to-S3 file copy would be very slow for large media, so we catalog what exists in R2)
4. Records the media backup status in `backup_history`

The daily backup cron job will call this after the database backup.

### Changes

**New file: `supabase/functions/backup-media/index.ts`**
- Lists all objects in Supabase Storage buckets (profile-images, portfolio-media, brand-logos, career-cvs)
- Downloads each file using the service role key
- Uploads each file to S3 at `media-backups/{bucket-name}/{file-path}`
- Generates a manifest JSON listing all files backed up (with sizes, timestamps)
- Also queries `content_library` and `booking_deliverables` tables to create an R2 inventory manifest (file paths, URLs, sizes) and uploads that to S3 as `media-backups/r2-inventory.json`
- Records results in `backup_history` table

**Update: `supabase/config.toml`**
- Add `[functions.backup-media]` with `verify_jwt = false`

**Update: `supabase/functions/database-backup/index.ts`**
- After the database backup completes successfully, trigger the `backup-media` function automatically
- Add media backup status to the success email notification

**Update: `src/pages/BackupHistory.tsx`**
- Add a "Backup Media" button alongside the existing "Trigger Backup" button
- Show media backup stats (files backed up, total size) in the backup details

**Update: `public/DISASTER_RECOVERY.md`**
- Add media file restoration steps
- Document the S3 `media-backups/` folder structure
- Add Supabase Storage file restoration procedure

### How Media Restoration Would Work

In a disaster scenario:
1. Database backup restores all table data (including file URL references)
2. Supabase Storage files: Download from S3 `media-backups/{bucket}/` and re-upload to new Supabase Storage buckets
3. Cloudflare R2 files: Use the R2 inventory manifest to identify what needs re-uploading; source files from R2 backup or request re-upload from users

### Technical Considerations

- **Supabase Storage files are small** (profile images, portfolio photos) -- around 43 files currently, so backing them all up to S3 is fast and cheap
- **R2 files can be large** (video content, deliverables) -- copying them to S3 would be expensive and slow, so we only catalog them. R2 itself has built-in redundancy
- **Edge function timeout**: The media backup runs as a separate function to avoid timeout issues with the main database backup
- **S3 costs**: Minimal -- storing ~43 small image files costs fractions of a cent

