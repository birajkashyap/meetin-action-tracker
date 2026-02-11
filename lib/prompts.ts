// LLM Extraction Prompt - Version 1
// Created: 2026-02-11
// Updated: 2026-02-12 (switched to Gemini)
// Purpose: Extract action items from meeting transcripts

export const EXTRACTION_PROMPT_V1 = `Extract action items from the meeting transcript.

RULES:
1. Only extract clear, actionable tasks (not discussions or questions)
2. Infer owner from context (e.g., "John will...", "Sarah to...", "assigned to Mike")
3. Infer due dates from explicit mentions (e.g., "by Friday", "next week", "end of month")
4. If no owner/date is clear, set to null
5. Be conservative: skip ambiguous items
6. Generate 1-2 relevant tags per item (e.g., "urgent", "follow-up", "research", "review")

Return a JSON object with this structure:
{
  "actionItems": [
    {
      "description": "Clear, concise task description",
      "owner": "Name" or null,
      "dueDate": "YYYY-MM-DD" or null,
      "tags": ["tag1", "tag2"]
    }
  ]
}`;

