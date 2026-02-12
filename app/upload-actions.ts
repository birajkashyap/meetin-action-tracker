'use server';

import mammoth from 'mammoth';

export async function extractTextFromFile(formData: FormData) {
  try {
    const file = formData.get('file') as File;

    if (!file) {
      return { success: false, error: 'No file provided' };
    }

    const buffer = await file.arrayBuffer();
    const fileName = file.name.toLowerCase();

    if (fileName.endsWith('.txt')) {
      const text = new TextDecoder().decode(buffer);
      return { success: true, text };
    }

    if (fileName.endsWith('.docx') || fileName.endsWith('.doc')) {
      // Mammoth expects buffer for extractRawText
      const result = await mammoth.extractRawText({ buffer: Buffer.from(buffer) });
      return { success: true, text: result.value };
    }

    return { success: false, error: 'Unsupported file type. Please upload .txt or .docx.' };
  } catch (error) {
    console.error('Error extracting text:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to parse file',
    };
  }
}
