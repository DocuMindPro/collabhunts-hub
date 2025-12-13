# CollabHunts - Creator Marketplace Platform

## Project Info

**URL**: https://lovable.dev/projects/f0d3858a-e7f2-4892-88d2-32504acaef78  
**Production**: https://collabhunts.lovable.app

---

## 🚨 DISASTER RECOVERY - READ THIS FIRST

**If the website is down and you need to restore it:**

### Step 1: Access Backups
1. Go to AWS S3 Console: https://s3.console.aws.amazon.com
2. Navigate to bucket: `collabhunts-backups`
3. Find folder: `recovery-docs/`
4. Download: `DISASTER_RECOVERY.md` (full recovery guide)
5. Find latest backup in: `backups/collabhunts-backup-{timestamp}.json`

### Step 2: Required Access
- **AWS S3**: For backups (region: us-east-1, bucket: collabhunts-backups)
- **Supabase**: Project ID `olcygpkghmaqkezmunyu`
- **Cloudflare R2**: For content library/deliverables
- **Git Repository**: For edge functions and migrations

### Step 3: Critical Secrets (18 total)
```
SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY
AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_BUCKET_NAME, AWS_REGION
R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET_NAME, R2_PUBLIC_URL
SENDGRID_API_KEY, RESEND_API_KEY, ADMIN_EMAIL
SUPABASE_PUBLISHABLE_KEY, SUPABASE_DB_URL, BACKUP_CRON_SECRET, LOVABLE_API_KEY
```

### Step 4: Quick Recovery
1. Run migrations: `supabase/migrations/` (in order)
2. Restore data from backup JSON
3. Deploy edge functions: `supabase/functions/`
4. Configure secrets in Supabase dashboard
5. Recreate cron jobs

**Full documentation**: `public/DISASTER_RECOVERY.md` or S3 `recovery-docs/DISASTER_RECOVERY.md`

---

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/f0d3858a-e7f2-4892-88d2-32504acaef78) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/f0d3858a-e7f2-4892-88d2-32504acaef78) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/features/custom-domain#custom-domain)
