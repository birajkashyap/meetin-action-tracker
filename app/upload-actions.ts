'use server';

import mammoth from 'mammoth';
import { logger } from '@/lib/logger';

export async function extractTextFromFile(formData: FormData) {
  try {
    const file = formData.get('file') as File;

    if (!file) {
      logger.warn('File upload failed: No file provided');
      return { success: false, error: 'No file provided' };
    }

    const buffer = await file.arrayBuffer();
    const fileName = file.name.toLowerCase();

    logger.info({ fileName, fileSize: file.size }, 'Processing file upload');

    if (fileName.endsWith('.txt')) {
      const text = new TextDecoder().decode(buffer);
      return { success: true, text };
    }

    if (fileName.endsWith('.docx') || fileName.endsWith('.doc')) {
      // Mammoth expects buffer for extractRawText
      const result = await mammoth.extractRawText({ buffer: Buffer.from(buffer) });
      return { success: true, text: result.value };
    }

    logger.warn({ fileName }, 'Unsupported file type upload attempted');
    return { success: false, error: 'Unsupported file type. Please upload .txt or .docx.' };
  } catch (error) {
    logger.error({ err: error }, 'Error extracting text from file');
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to parse file',
    };
  }
}
