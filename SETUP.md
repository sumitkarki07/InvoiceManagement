# Quick Setup Guide

## Prerequisites
- Node.js 18+ installed
- PostgreSQL database (local or cloud like Supabase/Neon)

## Step-by-Step Setup

### 1. Install Dependencies (Already Done)
```bash
npm install
```

### 2. Create Environment File
Create a `.env` file in the root directory with:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/grishma_bill?schema=public"
SESSION_SECRET="your-random-secret-key-here"
```

**For Supabase/Neon:**
- Get your connection string from your database provider
- Replace the DATABASE_URL with your actual connection string
- Generate a random SESSION_SECRET (you can use: `openssl rand -hex 32`)

### 3. Set Up Database Schema
```bash
npx prisma db push
npx prisma generate
```

### 4. Seed Database (Create Admin User)
```bash
npm run db:seed
```

This creates:
- **Email:** admin@example.com
- **Password:** admin123

### 5. Start Development Server
```bash
npm run dev
```

### 6. Open in Browser
Navigate to: **http://localhost:3000**

You'll be redirected to the login page. Use the credentials above to log in.

## Quick Commands Reference

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run db:push` - Push schema to database
- `npm run db:studio` - Open Prisma Studio (database GUI)
- `npm run db:seed` - Seed database with initial data

## Troubleshooting

**Database Connection Error:**
- Make sure your DATABASE_URL is correct
- Ensure your PostgreSQL database is running
- For cloud databases, check firewall/network settings

**Prisma Errors:**
- Run `npx prisma generate` after schema changes
- Make sure DATABASE_URL is set correctly

**Port Already in Use:**
- Change port: `npm run dev -- -p 3001`
