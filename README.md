# Vero Patient Booking Flow

## Live Demo

https://vero-patient-booking.onrender.com

## Overview

A clean, full-stack patient booking workflow with a patient-facing multi-step booking form and an admin dashboard. Patients can request appointments with available physicians; clinic staff can review, confirm, or cancel bookings from the admin panel.

## Features

- Choose a physician from a card-based selector
- Select an available appointment time slot
- Submit patient details and reason for visit
- Booking is created with **pending** status for clinic review
- Confirmation page with booking reference and status
- Admin dashboard to view all upcoming bookings
- Confirm or cancel bookings with status badges
- Double-booking prevention enforced server-side
- Cancelled bookings free up their slot

## Tech Stack

- **Next.js** (App Router)
- **TypeScript**
- **Tailwind CSS**
- **Prisma**
- **PostgreSQL**
- **Zod** (validation)
- **React Hook Form**
- **Render** (deployment)

## How to Run Locally

1. **Clone the repo**
   ```bash
   git clone <repo-url>
   cd vero-patient-booking
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Add DATABASE_URL to .env**
   ```bash
   cp .env.example .env
   # Edit .env and set your PostgreSQL DATABASE_URL
   ```

4. **Run migrations**
   ```bash
   # For first-time local setup, push the schema:
   npx prisma migrate dev --name init
   # Or to deploy existing migrations:
   npm run db:migrate
   ```

5. **Seed the database**
   ```bash
   npm run db:seed
   ```

6. **Start the dev server**
   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) to use the booking form.
   Open [http://localhost:3000/admin](http://localhost:3000/admin) for the admin dashboard.

## Render Deployment

**Build command:**
```
npm install && npx prisma generate && npx prisma migrate deploy && npm run build
```

**Start command:**
```
npm start
```

**Required environment variable:**
```
DATABASE_URL=your_render_postgres_connection_string
```

After deploying, seed the database via Render Shell:
```bash
npm run db:seed
```

## Key Product Decisions

- **Bookings start as `PENDING`** — clinic staff may need to review requests before confirming. This reflects real clinical workflow.
- **Server-side availability checks** — the API validates that a slot is not already taken before creating a booking, preventing race conditions.
- **No authentication on admin** — full auth is out of scope for this demo. The `/admin` route is intentionally accessible for evaluation purposes.
- **Demo data only** — seed data uses fictional patients and should not be used with real health information.

## What I Would Improve With More Time

- Add authentication to admin and patient portals
- Email/SMS confirmation notifications
- Calendar integration (Google Calendar, iCal)
- Physician-specific availability rules and blocked dates
- Patient rescheduling and self-service cancellation links
- Audit log for admin actions
- Automated tests (unit + integration)
- Pagination and search on the admin dashboard

---

> **Privacy Notice:** This is a demo application. Do not enter real patient health information.
