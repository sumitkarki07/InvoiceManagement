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
   This creates an admin user:
   - Email: `admin@example.com`
   - Password: `admin123`

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

## Deployment

This application is ready for deployment on Vercel:

1. Push your code to GitHub
2. Import the project in Vercel
3. Add environment variables in Vercel dashboard
4. Deploy!

Make sure to:
- Set `DATABASE_URL` to your production database
- Set a strong `SESSION_SECRET`
- Run migrations: `npx prisma migrate deploy`

## License

MIT
