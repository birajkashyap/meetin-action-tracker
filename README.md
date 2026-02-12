# Meeting Action Items Tracker

A web application that extracts and manages action items from meeting transcripts using AI.

## 🚀 Live Demo

[Add your Vercel URL here after deployment]

## Features

- **AI-powered extraction**: Paste meeting transcripts and automatically extract action items with owners, due dates, and tags
- **Full CRUD operations**: Create, read, update, and delete action items
- **Task management**: Mark items as done/open, filter by status
- **File Upload**: Support for `.txt` and `.docx` transcript imports
- **History tracking**: View last 5 processed transcripts
- **Health monitoring**: Status page showing system health

## Tech Stack

- **Frontend**: Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS 4
- **Backend**: Next.js Server Actions
- **Database**: PostgreSQL (Prisma ORM)
- **AI**: Groq (Llama 3.1 8B Instant)
- **Hosting**: Vercel

## Setup Instructions

### Prerequisites

- Node.js 18+ installed
- PostgreSQL database (Neon, Vercel Postgres, or local)
- Groq API key (free from https://console.groq.com)

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd meeting-action-items-tracker
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

Edit `.env` and add:
- `DATABASE_URL`: Your PostgreSQL connection string
- `GROQ_API_KEY`: Your Groq API key

4. Initialize the database:
```bash
npx prisma generate
npx prisma db push
```

5. Run the development server:
```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000)

## Usage

1. **Process Transcript**: Paste a meeting transcript on the home page and click "Extract Action Items"
2. **Manage Items**: Edit descriptions, owners, due dates; mark as done; or delete items
3. **Filter**: Use "All", "Open", or "Done" filters to view specific items
4. **View History**: Navigate to `/history` to see past transcripts
5. **Check Status**: Visit `/status` to verify system health

## What's Implemented

✅ Meeting transcript input and processing  
✅ AI extraction of action items (description, owner, due date, tags)  
✅ CRUD operations on action items  
✅ Mark items as done/open  
✅ Filter by status (Open/Done)  
✅ Last 5 transcripts history  
✅ Status page with health checks  
✅ Input validation and error handling  

## What's NOT Implemented

❌ User authentication  
❌ Search functionality  
❌ Manual tag editing (tags are auto-generated, read-only)  
❌ Export/import features  
❌ Advanced analytics  

## Project Structure

```
├── app/
│   ├── actions.ts          # Server actions (process, CRUD)
│   ├── layout.tsx          # Root layout with navigation
│   ├── page.tsx            # Home page
│   ├── history/            # Transcript history page
│   └── status/             # System status page
├── components/
│   ├── TranscriptProcessor.tsx
│   └── ActionItemsList.tsx
├── lib/
│   ├── prisma.ts           # Prisma client
│   └── prompts.ts          # LLM prompts (versioned)
└── prisma/
    └── schema.prisma       # Database schema
```

## License

MIT
