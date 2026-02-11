# Quick Start Guide

## 🚀 Next Steps to Run Locally

1. **Add your Gemini API key to `.env`**
   - Get one FREE from: https://aistudio.google.com/app/apikey
   - Replace `your-gemini-api-key-here` in `.env` with your actual key

2. **Initialize the database**
   ```bash
   npx prisma db push
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Open http://localhost:3000**

## 🧪 Test the App

1. Go to home page and paste a sample transcript like:
   ```
   Team standup meeting - Jan 15, 2024
   
   John mentioned he will finish the API documentation by Friday.
   Sarah to review the pull request tomorrow.
   Mike assigned to fix the authentication bug before end of week.
   We need to schedule a design review next Monday.
   ```

2. Click "Extract Action Items"
3. Try editing, marking done, filtering
4. Check `/history` and `/status` pages

## 🚀 Deploy to Vercel

1. Push to GitHub:
   ```bash
   git add .
   git commit -m "Add environment configuration"
   git push origin main
   ```

2. Go to https://vercel.com/new
3. Import your repository
4. Add environment variables:
   - `DATABASE_URL` (your Neon URL - already configured)
   - `GEMINI_API_KEY` (your Gemini key)
5. Deploy!

6. After deployment, your database should auto-migrate. If not:
   - Go to Vercel project → Settings → Functions
   - Or manually run: `npx prisma db push`

## 📝 Before Submitting

1. Update `ABOUTME.md` with your name and resume
2. Ensure the app is live and working
3. Submit:
   - Live URL (e.g., `https://your-app.vercel.app`)
   - GitHub repository URL
