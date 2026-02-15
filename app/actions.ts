'use server';

import { prisma } from '@/lib/prisma';
import { EXTRACTION_PROMPT_V1 } from '@/lib/prompts';
import { logger } from '@/lib/logger';
import Groq from 'groq-sdk';
import { z } from 'zod';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

// Zod Schemas
const ActionItemSchema = z.object({
  description: z.string().min(1, "Description is required"),
  owner: z.string().nullable().optional(),
  dueDate: z.string().nullable().optional(),
  priority: z.enum(['high', 'medium', 'low']).default('medium'),
  tags: z.array(z.string()).default([]),
});

const LLMResponseSchema = z.object({
  actionItems: z.array(ActionItemSchema),
});

type ActionItemInput = z.infer<typeof ActionItemSchema>;

export async function processTranscript(text: string) {
  try {
    // Validation
    if (!text || text.trim().length < 10) {
      logger.warn('Transcript validation failed: too short');
      return {
        success: false,
        error: 'Transcript must be at least 10 characters long',
      };
    }

    if (text.length > 50000) {
      logger.warn('Transcript validation failed: too long');
      return {
        success: false,
        error: 'Transcript is too long (max 50,000 characters)',
      };
    }

    const currentDate = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    const systemPrompt = `${EXTRACTION_PROMPT_V1}\n\nCurrent Date: ${currentDate}`;

    logger.info({ transcriptLength: text.length }, 'Processing transcript');

    let attempt = 0;
    const maxRetries = 3;
    let finalActionItems: ActionItemInput[] = [];

    while (attempt < maxRetries) {
      try {
        attempt++;
        logger.info({ attempt }, 'Calling Groq API');

        const completion = await groq.chat.completions.create({
          model: 'llama-3.1-8b-instant',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: `Extract action items from this transcript:\n\n${text}` },
          ],
          response_format: { type: 'json_object' },
          temperature: 0.3,
        });

        const responseText = completion.choices[0]?.message?.content;

        if (!responseText) {
          throw new Error('No response from LLM');
        }

        // Parse response
        const jsonResponse = JSON.parse(responseText);
        const parsed = LLMResponseSchema.safeParse(jsonResponse);

        if (!parsed.success) {
          logger.warn({ errors: parsed.error.format() }, 'LLM response validation failed');
          throw new Error('Invalid LLM response format');
        }

        finalActionItems = parsed.data.actionItems;
        break; // Success
      } catch (error) {
        logger.error({ err: error, attempt }, 'Error during LLM extraction attempt');
        if (attempt === maxRetries) {
          throw new Error(`Failed to extract action items after ${maxRetries} attempts`);
        }
        // Small delay before retry
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    // Create transcript and action items in database
    const transcript = await prisma.transcript.create({
      data: {
        rawText: text,
        metadata: {
          wordCount: text.split(/\s+/).length,
          itemCount: finalActionItems.length,
          modelUsed: 'llama-3.1-8b-instant',
        },
        actionItems: {
          create: finalActionItems.map((item) => ({
            description: item.description,
            owner: item.owner || null,
            dueDate: item.dueDate ? new Date(item.dueDate) : null,
            priority: item.priority || 'medium',
            tags: item.tags || [],
            isDone: false,
          })),
        },
      },
      include: {
        actionItems: true,
      },
    });

    logger.info({ transcriptId: transcript.id, itemCount: finalActionItems.length }, 'Transcript processed successfully');

    // Keep only last 5 transcripts
    const allTranscripts = await prisma.transcript.findMany({
      orderBy: { processedAt: 'desc' },
      select: { id: true },
    });

    if (allTranscripts.length > 5) {
      const transcriptsToDelete = allTranscripts.slice(5);
      await prisma.transcript.deleteMany({
        where: {
          id: {
            in: transcriptsToDelete.map((t) => t.id),
          },
        },
      });
    }

    return {
      success: true,
      transcript,
    };
  } catch (error) {
    logger.error({ err: error }, 'Fatal error processing transcript');
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An unknown error occurred',
    };
  }
}

export async function updateActionItem(
  id: string,
  data: { description?: string; owner?: string | null; dueDate?: Date | null }
) {
  try {
    const updated = await prisma.actionItem.update({
      where: { id },
      data,
    });
    logger.info({ actionItemId: id }, 'Action item updated');
    return { success: true, actionItem: updated };
  } catch (error) {
    logger.error({ err: error, actionItemId: id }, 'Error updating action item');
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update',
    };
  }
}

export async function deleteActionItem(id: string) {
  try {
    await prisma.actionItem.delete({
      where: { id },
    });
    logger.info({ actionItemId: id }, 'Action item deleted');
    return { success: true };
  } catch (error) {
    logger.error({ err: error, actionItemId: id }, 'Error deleting action item');
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete',
    };
  }
}

export async function toggleActionItemDone(id: string) {
  try {
    const item = await prisma.actionItem.findUnique({
      where: { id },
    });

    if (!item) {
      return { success: false, error: 'Action item not found' };
    }

    const updated = await prisma.actionItem.update({
      where: { id },
      data: { isDone: !item.isDone },
    });
    
    logger.info({ actionItemId: id, isDone: updated.isDone }, 'Action item toggled');

    return { success: true, actionItem: updated };
  } catch (error) {
    logger.error({ err: error, actionItemId: id }, 'Error toggling action item');
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to toggle',
    };
  }
}

export async function createActionItem(transcriptId: string, data: ActionItemInput) {
  try {
    const item = await prisma.actionItem.create({
      data: {
        transcriptId,
        description: data.description,
        owner: data.owner || null,
        dueDate: data.dueDate ? new Date(data.dueDate) : null,
        priority: data.priority || 'medium',
        tags: data.tags || [],
        isDone: false,
      },
    });
    logger.info({ actionItemId: item.id, transcriptId }, 'Action item created manually');
    return { success: true, actionItem: item };
  } catch (error) {
    logger.error({ err: error, transcriptId }, 'Error creating action item');
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create',
    };
  }
}
