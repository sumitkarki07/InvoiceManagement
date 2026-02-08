# Grishma Bill - Invoice Management System

A production-ready admin invoice and offer management system built with Next.js 14, TypeScript, Prisma, and PostgreSQL.

## Features

- **Authentication**: Secure admin-only login system
- **Document Management**: Create and manage Offers and Invoices
- **Transaction-Safe Numbering**: Sequential, gap-free document numbering
- **PDF Generation**: Professional PDF generation matching exact invoice template
- **Offer to Invoice Conversion**: One-click conversion from offers to invoices
- **Client Management**: Manage client information

## Tech Stack

- Next.js 14 (App Router)
- TypeScript (strict mode)
- Prisma ORM
- PostgreSQL (Supabase/Neon compatible)
- @react-pdf/renderer for PDF generation
- Tailwind CSS for styling

## Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment variables:**
   ```bash
   cp .env.example .env
   ```
   Edit `.env` and add your database URL and session secret.

3. **Set up the database:**
   ```bash
   npx prisma db push
   npx prisma generate
   ```

4. **Seed the database:**
   ```bash
   npm run db:seed
   ```
   - **Production:** Set `ADMIN_EMAIL` and `ADMIN_PASSWORD` in `.env` (or Vercel); the seed creates that admin.
   - **Local dev:** If those are not set, the seed creates a dev admin: `admin@example.com` / `admin123`.

5. **Run the development server:**
   ```bash
   npm run dev
   ```

6. **Open your browser:**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Database Schema

- **User**: Admin users
- **Client**: Client information
- **Document**: Offers and Invoices (unified table)
- **LineItem**: Line items for documents
- **Counter**: Transaction-safe numbering system

## Document Numbering

- **Offers**: `OFF-YYYY-001` format
- **Invoices**: `INV-YYYY-001` format
- Numbers are generated transactionally to prevent gaps and duplicates

## PDF Generation

PDFs are generated using @react-pdf/renderer and match the exact invoice template provided. Access PDFs via:
- `/api/pdf/[document-id]`

## Deployment (Vercel) – Production admin

For a live deployment, use real admin credentials via environment variables.

### Required environment variables (Vercel)

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | PostgreSQL connection string (e.g. Supabase) |
| `SESSION_SECRET` | Yes | Random secret for session cookies (e.g. `openssl rand -hex 32`) |
| `ADMIN_EMAIL` | Yes* | Email for your admin login |
| `ADMIN_PASSWORD` | Yes* | Password for your admin login |
| `ALLOWED_ADMIN_EMAILS` | No | Comma-separated list of emails allowed to log in (optional whitelist) |

\* For production, set `ADMIN_EMAIL` and `ADMIN_PASSWORD` so the seed creates your real admin. If not set in production, no default admin is created.

### One-time setup after deploy

1. In Vercel: **Settings → Environment Variables** add:
   - `DATABASE_URL` (your Supabase/Postgres URL)
   - `SESSION_SECRET` (strong random string)
   - `ADMIN_EMAIL` (e.g. your real email)
   - `ADMIN_PASSWORD` (strong password you will use to log in)
   - Optionally: `ALLOWED_ADMIN_EMAILS` = `your@email.com` (comma-separated if multiple)

2. Deploy the app (Vercel will use these env vars).

3. Create the admin user in the database by running the seed **once** with the same env vars. Either:
   - **Option A:** In your project directory, set the same env vars locally and run:
     ```bash
     npm run db:seed
     ```
   - **Option B:** Use Vercel’s deploy hook or run the seed from a script that has access to `DATABASE_URL`, `ADMIN_EMAIL`, and `ADMIN_PASSWORD`.

4. Log in at `https://your-app.vercel.app/login` with `ADMIN_EMAIL` and `ADMIN_PASSWORD`.

### Security notes

- **SESSION_SECRET** is required in production; the app will throw if it’s missing.
- **ALLOWED_ADMIN_EMAILS**: If set, only these emails can log in (even if they exist in the database).
- Do not rely on the default `admin@example.com` / `admin123` in production; that user is only created in development when `ADMIN_EMAIL`/`ADMIN_PASSWORD` are not set.

## License

MIT
