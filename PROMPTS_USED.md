# Prompts Used for Development

This file documents all prompts used during the development of this application.
No AI responses, API keys, or sensitive information is included.

---

## LLM Extraction Prompt (Used in Production)

**Location**: `lib/prompts.ts` - `EXTRACTION_PROMPT_V1`

```
You are an expert meeting minutes analyzer. Extract action items from meeting transcripts.

RULES:
1. Only extract clear, actionable tasks (not discussions or questions)
2. Infer owner from context (e.g., "John will...", "Sarah to...", "assigned to Mike")
3. Infer due dates from explicit mentions (e.g., "by Friday", "next week", "end of month")
4. If no owner/date is clear, set to null
5. Be conservative: skip ambiguous items
6. Generate 1-2 relevant tags per item (e.g., "urgent", "follow-up", "research", "review")

OUTPUT FORMAT:
Return a JSON object with this exact structure:
{
  "actionItems": [
    {
      "description": "Clear, concise task description",
      "owner": "Name" | null,
      "dueDate": "YYYY-MM-DD" | null,
      "tags": ["tag1", "tag2"]
    }
  ]
}

Return ONLY valid JSON. Do not include explanatory text.
```

---

## Development Prompts (to Cursor/ChatGPT/Claude)

### Initial Setup
```
Create a Next.js 14 project with TypeScript and Tailwind CSS using the App Router.
Set up the project structure for a meeting action items tracker application.
```

### Database Schema
```
Design a Prisma schema for a meeting action items tracker with the following requirements:
- Transcript model: id, rawText, processedAt timestamp, metadata (JSON)
- ActionItem model: id, description, owner (optional), dueDate (optional), isDone boolean, tags array
- One-to-many relationship: one transcript has many action items
- Cascade delete: when transcript is deleted, delete its action items
```

### Server Actions
```
Create Next.js server actions for:
1. Processing a transcript using Groq API with JSON mode
2. CRUD operations for action items (create, update, delete, toggle done)
3. Implement "keep last 5 transcripts" cleanup logic
4. Include proper error handling and TypeScript types
```

### UI Components
```
Build a React component for displaying action items with:
- Filter buttons (All, Open, Done)
- Inline editing capability
- Mark as done checkbox
- Delete confirmation
- Add new item form
- Display tags, owner, and due date
Use Tailwind CSS for styling.
```

### Status Page
```
Create a Next.js server component for a status page that checks:
- Database connectivity (PostgreSQL via Prisma)
- OpenAI API connectivity (via Groq SDK)
- Display overall system health
- Show environment configuration status
```

### History Page
```
Build a page to display the last 5 transcripts with:
- Expandable details (HTML details/summary)
- Show action items for each transcript
- Display metadata like word count, open/done counts
- Link back to home page if no transcripts exist
```

### Deployment Preparation
```
What environment variables do I need to configure for deploying a Next.js app
to Vercel with Prisma and Groq integration?
```

### Testing Prompts
```
Generate sample meeting transcripts for testing the action item extraction feature.
Include various formats: formal meetings, casual standups, and edge cases.
```

---

## Prompt Engineering Iterations

### Version 1 (Initial)
- Basic extraction prompt
- Issue: Missed some implicit action items

### Version 2 (Refined)
- Added explicit rules for owner inference
- Added conservative approach instruction
- Issue: Too conservative, missed valid items

### Version 3 (Final - EXTRACTION_PROMPT_V1)
- Balanced rules
- Added tag generation
- Clear JSON schema specification
- Result: Good balance of precision and recall

---

## Notes

- All prompts above were used to generate code or assist with development
- The production LLM prompt (EXTRACTION_PROMPT_V1) is version-controlled in the codebase
- Prompts were iterated based on manual testing with real transcript samples
- No AI-generated responses or API keys are included in this file
