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

## Data

For now, data is stored as JSON files in `data/` and uploaded photos in `data/uploads/`. Both are git-ignored. This is fine for testing, but move to a real database (the tables are laid out to map to MySQL) and cloud storage before a real launch, because most hosts do not keep files between restarts.

Cutoff, college and fee data shown on the site must be verified. The "demo data" button in the admin Cutoffs tab loads clearly labelled DEMO records for testing only.

## Sharing a temporary public link

Set `ADMIN_LOCAL_ONLY=1` when running `npm run build && npx next start` behind a tunnel. Admin sign-in and admin APIs then work only from `localhost`.
