
import { processTranscript } from '@/app/actions';
import { prisma } from '@/lib/prisma';
import Groq from 'groq-sdk';

// Mock dependencies
jest.mock('@/lib/prisma', () => ({
  prisma: {
    transcript: {
      create: jest.fn(),
      findMany: jest.fn(),
      deleteMany: jest.fn(),
    },
  },
}));

// Mock Logger
jest.mock('@/lib/logger', () => ({
  logger: {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  },
}));

// Mock Groq
const mockCreate = jest.fn();
jest.mock('groq-sdk', () => {
  return jest.fn().mockImplementation(() => ({
    chat: {
      completions: {
        create: (...args: any[]) => mockCreate(...args),
      },
    },
  }));
});

describe('processTranscript', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should validate transcript length (too short)', async () => {
    const result = await processTranscript('short');
    expect(result.success).toBe(false);
    expect(result.error).toContain('at least 10 characters');
  });

  it('should successfully process a valid transcript', async () => {
    const mockActionItems = [
      {
        description: 'Test task',
        owner: 'John',
        priority: 'high',
        tags: ['test'],
      },
    ];

    mockCreate.mockResolvedValueOnce({
      choices: [
        {
          message: {
            content: JSON.stringify({ actionItems: mockActionItems }),
          },
        },
      ],
    });

    (prisma.transcript.create as jest.Mock).mockResolvedValue({
      id: 'test-id',
      actionItems: mockActionItems,
    });
    (prisma.transcript.findMany as jest.Mock).mockResolvedValue([]);

    const result = await processTranscript('This is a valid transcript that is long enough.');

    expect(result.success).toBe(true);
    expect(mockCreate).toHaveBeenCalledTimes(1);
    expect(prisma.transcript.create).toHaveBeenCalled();
  });

  it('should retry on invalid JSON response', async () => {
    // First attempt: Invalid JSON
    mockCreate.mockResolvedValueOnce({
      choices: [{ message: { content: 'invalid json' } }],
    });
    
    // Second attempt: Valid JSON
    mockCreate.mockResolvedValueOnce({
      choices: [{ message: { content: JSON.stringify({ actionItems: [] }) } }],
    });

    (prisma.transcript.create as jest.Mock).mockResolvedValue({ id: 'test-id', actionItems: [] });
    (prisma.transcript.findMany as jest.Mock).mockResolvedValue([]);

    const result = await processTranscript('This is a valid transcript that is long enough.');

    expect(result.success).toBe(true);
    expect(mockCreate).toHaveBeenCalledTimes(2);
  });

  it('should fail after max retries', async () => {
    // All 3 attempts fail
    mockCreate.mockResolvedValue({
      choices: [{ message: { content: 'invalid json' } }],
    });

    const result = await processTranscript('This is a valid transcript that is long enough.');

    expect(result.success).toBe(false);
    expect(result.error).toContain('Failed to extract action items after 3 attempts');
    expect(mockCreate).toHaveBeenCalledTimes(3);
  }, 10000); // Increase timeout for retries
});
