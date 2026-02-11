# Deployment Guide

This guide will help you deploy the Meeting Action Items Tracker to Vercel.

## Prerequisites

1. A Vercel account (free at https://vercel.com)
2. An OpenAI API key (from https://platform.openai.com/api-keys)
3. A PostgreSQL database (use Neon, Vercel Postgres, or any other provider)

## Step 1: Set Up Database

### Option A: Neon (Recommended - Free Tier)

1. Go to https://neon.tech
2. Create a free account
3. Create a new project
4. Copy your connection string (should look like `postgresql://user:pass@host/dbname`)

### Option B: Vercel Postgres

1. In your Vercel project, go to Storage → Create Database
2. Select Postgres
3. Copy the connection string

## Step 2: Deploy to Vercel

### Using Vercel CLI (Recommended)

1. Install Vercel CLI:
```bash
npm i -g vercel
```

2. Deploy:
```bash
vercel
```

3. Follow the prompts to link/create a project

4. Set environment variables:
```bash
vercel env add DATABASE_URL
vercel env add OPENAI_API_KEY
```

Paste the values when prompted.

### Using Vercel Dashboard

1. Push your code to GitHub
2. Go to https://vercel.com/new
3. Import your repository
4. Add environment variables:
   - `DATABASE_URL`: Your PostgreSQL connection string
   - `OPENAI_API_KEY`: Your OpenAI API key
5. Deploy

## Step 3: Initialize Database

After deployment, you need to push the Prisma schema to your database:

```bash
# If using Vercel CLI
vercel env pull .env.production
npx prisma db push

# Or run directly in Vercel
# Go to your project settings → Functions → Add Edge Function
# Or use Vercel's built-in PostgreSQL which auto-migrates
```

## Step 4: Test Your Deployment

1. Visit your deployed URL (e.g., `your-app.vercel.app`)
2. Go to `/status` to verify all connections are healthy
3. Try processing a sample transcript on the home page

## Troubleshooting

### Database Connection Issues

- Ensure your `DATABASE_URL` includes `?sslmode=require` for hosted databases
- Example: `postgresql://user:pass@host/db?sslmode=require`

### OpenAI API Errors

- Verify your API key is active
- Check you have credits in your OpenAI account

### Build Failures

- Make sure all dependencies are in `package.json`
- Check that TypeScript types are correct
- Review build logs in Vercel dashboard

## Environment Variables Reference

```env
DATABASE_URL="postgresql://user:password@host:5432/dbname?sslmode=require"
OPENAI_API_KEY="sk-proj-..."
```

## Post-Deployment

- Your app should now be live!
- The `/status` page will show system health
- Transcripts are automatically limited to last 5
- No further configuration needed
