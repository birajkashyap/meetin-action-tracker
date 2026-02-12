# Project Submission: Meeting Action Items Tracker

## Problem Statement: "Mini Workspace" (Option A)

The goal was to build a web application for extracting and managing action items from meeting transcripts using AI.

## Implementation Summary

### Core Requirements Met

- [x] **Paste Meeting Transcript**: Implemented a textarea for raw text input.
- [x] **AI Extraction**: Uses **Groq (Llama 3.1 8B)** to extract:
  - Task Description
  - Owner (inferred from context)
  - Due Date (parsed from text like "next Friday")
  - Tags (auto-generated categories)
- [x] **CRUD Operations**: Complete ability to:
  - **Create** new items manually
  - **Read** items in a list view
  - **Update** descriptions, owners, dates, and priorities
  - **Delete** items with confirmation
- [x] **Mark as Done**: Toggle status with visual feedback (strikethrough & confetti).
- [x] **History**: Tracks the last 5 processed transcripts at `/history`.
- [x] **Filter**: "All", "Open", and "Done" filters implemented.

### "Make it Your Own" (Bonus Features)

To enhance the user experience, I added several advanced features:

1.  **File Upload Support**:
    - Users can upload **.txt** and **.docx** files directly instead of copy-pasting text.
    - Implemented using server-side parsing (mammoth.js).

2.  **Modern UI/UX**:
    - **Glassmorphism Design**: Frosted glass cards and floating elements.
    - **Dark/Light Mode**: Fully responsive theme with a global animated gradient background.
    - **Floating Dock Navigation**: Interactive, Mac-style dock for easy access to pages.
    - **Confetti Celebration**: Triggers when all tasks are completed.

3.  **Enhanced Task Management**:
    - **Priority Levels**: Assign High/Medium/Low priority to tasks.
    - **Export to CSV**: Download action items for external use.
    - **Inline Editing**: Sophisticated form for quick updates.

4.  **Robust Architecture**:
    - **Status Page**: Real-time health checks for Database and AI API connection (`/status`).
    - **Error Handling**: Graceful loading states and toast notifications for all actions.

## Tech Stack

- **Frontend**: Next.js 16 (App Router), React 19, Tailwind CSS 4, Framer Motion (GSAP).
- **Backend**: Next.js Server Actions.
- **Database**: PostgreSQL (Prisma ORM) on Neon.
- **AI**: Groq API (Llama 3.1 8B Instant).
- **Deployment**: Vercel.

## Documentation Included

- `README.md`: Setup and usage instructions.
- `AI_NOTES.md`: Details on AI prompts and manual verification.
- `PROMPTS_USED.md`: Log of prompts used during development.

## Live Demo

[https://meetin-action-tracker.vercel.app/](https://meetin-action-tracker.vercel.app/)
