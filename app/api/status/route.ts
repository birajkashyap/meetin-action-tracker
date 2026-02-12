import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import Groq from 'groq-sdk';

export const dynamic = 'force-dynamic';

export async function GET() {
  let dbConnected = false;
  let llmConnected = false;

  // Test DB connection
  try {
    await prisma.$queryRaw`SELECT 1`;
    dbConnected = true;
  } catch {
    dbConnected = false;
  }

  // Test Groq LLM connection
  try {
    if (process.env.GROQ_API_KEY) {
      const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
      await groq.chat.completions.create({
        model: 'llama-3.1-8b-instant',
        messages: [{ role: 'user', content: 'Hello' }],
        max_tokens: 5,
      });
      llmConnected = true;
    }
  } catch {
    llmConnected = false;
  }

  return NextResponse.json({ dbConnected, llmConnected });
}
