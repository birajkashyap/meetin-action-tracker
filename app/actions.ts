'use server';

import { prisma } from '@/lib/prisma';
import { EXTRACTION_PROMPT_V1 } from '@/lib/prompts';
import Groq from 'groq-sdk';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

interface ActionItemInput {
  description: string;
  owner?: string | null;
  dueDate?: string | null;
  priority?: string;
  tags?: string[];
}

interface LLMResponse {
  actionItems: ActionItemInput[];
}

export async function processTranscript(text: string) {
  try {
    // Validation
    if (!text || text.trim().length < 10) {
      return {
        success: false,
        error: 'Transcript must be at least 10 characters long',
      };
    }

    if (text.length > 50000) {
      return {
        success: false,
        error: 'Transcript is too long (max 50,000 characters)',
      };
    }

    const currentDate = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    const systemPrompt = `${EXTRACTION_PROMPT_V1}\n\nCurrent Date: ${currentDate}`;

    // Call Groq API
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
    const llmResponse: LLMResponse = JSON.parse(responseText);

    if (!llmResponse.actionItems || !Array.isArray(llmResponse.actionItems)) {
      throw new Error('Invalid LLM response format');
    }

    // Create transcript and action items in database
    const transcript = await prisma.transcript.create({
      data: {
        rawText: text,
        metadata: {
          wordCount: text.split(/\s+/).length,
          itemCount: llmResponse.actionItems.length,
          modelUsed: 'llama-3.1-8b-instant',
        },
        actionItems: {
          create: llmResponse.actionItems.map((item) => ({
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
    console.error('Error processing transcript:', error);
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
    return { success: true, actionItem: updated };
  } catch (error) {
    console.error('Error updating action item:', error);
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
    return { success: true };
  } catch (error) {
    console.error('Error deleting action item:', error);
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

    return { success: true, actionItem: updated };
  } catch (error) {
    console.error('Error toggling action item:', error);
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
    return { success: true, actionItem: item };
  } catch (error) {
    console.error('Error creating action item:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create',
    };
  }
}
