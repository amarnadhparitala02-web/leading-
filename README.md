# Leading Light Educational Services

Admission guidance website for B.Tech and Agriculture students (Hyderabad): rank-based college guidance from verified historical cutoffs, a college directory, student accounts, and an admin panel for staff.

Built with Next.js (App Router) and Tailwind CSS.

## What is in it

- **Public site:** Home, Rank Guidance, Colleges, Courses, About, Contact, Privacy notice.
- **Student panel** (`/account`): sign up with a mobile number and password, rank searches, saved colleges, counselling requests, profile.
- **Admin panel** (`/admin`): dashboard, leads, colleges, courses, cutoff CSV import and verification, photos, students, and staff accounts with `admin` and `staff` roles.

## Run it

```bash
npm install
npm run dev        # http://localhost:3000
```

Create a file named `.env.local` in this folder (it is git-ignored and must never be committed):

```
ADMIN_USERNAME=choose-an-admin-id
ADMIN_PASSWORD=choose-a-long-password
SESSION_SECRET=a-long-random-string
```

The first sign-in at `/admin` with that username and password creates the first admin account. After that the stored password is used, and further staff are added in the admin panel.

Generate a session secret with:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## Business details

Edit `lib/site.js` to set the phone number, WhatsApp number, email, address and hours. The call and WhatsApp buttons appear once a number is set.

## Data (Supabase)

The site stores its data in **Supabase** (PostgreSQL) and its uploaded photos in a private Supabase **Storage** bucket named `photos`. Add these to `.env.local` (never commit it):

```
SUPABASE_URL=https://YOUR-PROJECT.supabase.co
SUPABASE_SERVICE_ROLE_KEY=the secret service_role key (server only, never in browser code)
DATABASE_URL=postgresql://postgres:YOUR-PASSWORD@db.YOUR-PROJECT.supabase.co:5432/postgres   # only for the setup script
```

First-time setup:

```bash
node scripts/setup-supabase.mjs        # creates the tables and functions (supabase/schema.sql)
node scripts/migrate-to-supabase.mjs   # optional: copies existing local data/ and photos into Supabase
```

Without the two SUPABASE variables the site falls back to JSON files in `data/` (handy for development). Row level security is on and the tables have no public policies, so only the website server, using the service key, can read or write the data.

Cutoff, college and fee data shown on the site must be verified. The "demo data" button in the admin Cutoffs section loads clearly labelled DEMO records for testing only. Keep regular backups (Supabase dashboard, Database, Backups) before launch.

## Sharing a temporary public link

Set `ADMIN_LOCAL_ONLY=1` when running `npm run build && npx next start` behind a tunnel. Admin sign-in and admin APIs then work only from `localhost`.
