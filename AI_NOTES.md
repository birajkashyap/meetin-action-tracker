# AI Usage Notes

## What I Used AI For

### Code Generation
- **Initial project structure**: Used AI (Claude/ChatGPT) to generate boilerplate for Next.js App Router setup
- **Prisma schema**: Generated initial database schema structure for Transcript and ActionItem models
- **Component scaffolding**: Created initial React component structures for TranscriptProcessor and ActionItemsList
- **Server actions**: Generated base patterns for CRUD operations and OpenAI integration
- **Tailwind styling**: Used AI suggestions for responsive layouts and color schemes

### Problem Solving
- **TypeScript types**: AI helped define proper type interfaces for ActionItem and Transcript
- **Prisma queries**: Generated complex queries with relations and filtering
- **Error handling patterns**: AI suggested try-catch structures and error message formatting

## What I Checked/Verified Manually

### Functionality Testing
- **LLM prompt effectiveness**: Manually tested with 5+ different meeting transcript formats to ensure consistent extraction quality
- **CRUD operations**: Verified all create, read, update, delete operations work correctly in the UI
- **Filter logic**: Tested Open/Done filters with various item combinations
- **"Last 5 transcripts" cleanup**: Verified old transcripts are properly deleted
- **Date handling**: Confirmed due date parsing and display works correctly across timezones

### Code Quality
- **Type safety**: Reviewed all TypeScript types for correctness and consistency
- **Database schema**: Verified foreign key relationships and cascading deletes
- **Server action security**: Ensured all mutations use 'use server' directive
- **Environment variables**: Tested that missing env vars show proper error messages

### Edge Cases
- **Empty transcripts**: Verified proper validation for too-short input
- **Very long transcripts**: Tested 50k character limit enforcement
- **Malformed LLM responses**: Confirmed error handling when OpenAI returns unexpected JSON
- **Database connection failures**: Tested status page correctly detects DB issues

## LLM Provider Choice

### Selected: Groq (Llama 3.1 8B Instant)

**Rationale:**
1.  **Speed**: Extremely fast inference (~200ms) suitable for real-time interaction.
2.  **Cost**: Free tier available (currently) with high limits.
3.  **Quality**: Llama 3.1 8B is sufficient for extraction tasks.
4.  **JSON mode**: JSON mode enforcement ensures reliable output.
5.  **API simplicity**: API compatible with OpenAI SDK, making integration trivial.
6.  **Availability**: Easy to obtain API key.

**Alternatives Considered:**
- **Google Gemini 2.0 Flash**: Good alternative, fast and cheap.
- **OpenAI GPT-4o-mini**: Robust but paid.
- **Anthropic Claude**: Good but pricier/slower.

## Prompt Engineering Approach

- **Version control**: Prompt stored in `lib/prompts.ts` as `EXTRACTION_PROMPT_V1` for auditability
- **Explicit rules**: Clear enumeration of what to extract and what to skip
- **Output schema**: Detailed JSON structure specification to minimize parsing errors
- **JSON response mode**: Groq configured with `response_format: { type: 'json_object' }` for reliable parsing
- **Testing**: Iterated based on Gemini's response format to optimize quality

## AI Tools Used During Development

- **Cursor AI**: Code completion and refactoring suggestions
- **ChatGPT**: Architecture planning and documentation writing assistance
- **GitHub Copilot**: Inline code suggestions (minor usage)

## Manual Implementation

The following were implemented WITHOUT AI assistance:
- Overall architecture decisions (Next.js Server Actions vs API routes)
- Database relationship design
- UI/UX flow and user journey
- Deployment strategy
- This documentation file
