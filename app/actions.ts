'use server';

import { prisma } from '@/lib/prisma';
import { EXTRACTION_PROMPT_V1 } from '@/lib/prompts';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

interface ActionItemInput {
  description: string;
  owner?: string | null;
  dueDate?: string | null;
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

    // Call Gemini API
    const model = genAI.getGenerativeModel({
      model: 'gemini-1.5-flash',
      generationConfig: {
        responseMimeType: 'application/json',
      },
    });

    const prompt = `${EXTRACTION_PROMPT_V1}\n\nTranscript:\n${text}`;
    const result = await model.generateContent(prompt);
    const responseText = result.response.text();

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
          modelUsed: 'gemini-1.5-flash',
        },
        actionItems: {
          create: llmResponse.actionItems.map((item) => ({
            description: item.description,
            owner: item.owner || null,
            dueDate: item.dueDate ? new Date(item.dueDate) : null,
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
