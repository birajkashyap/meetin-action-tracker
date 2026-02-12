import { prisma } from '@/lib/prisma';
import HistoryContent from '@/components/HistoryContent';

export const dynamic = 'force-dynamic';

export default async function HistoryPage() {
  const transcripts = await prisma.transcript.findMany({
    orderBy: { processedAt: 'desc' },
    take: 5,
    include: {
      actionItems: {
        select: {
          id: true,
          description: true,
          owner: true,
          dueDate: true,
          priority: true,
          isDone: true,
          tags: true,
        },
      },
    },
  });

  // Serialize for client component
  const serialized = transcripts.map(t => ({
    ...t,
    processedAt: t.processedAt,
    metadata: t.metadata as Record<string, unknown> | null,
  }));

  return <HistoryContent transcripts={serialized} />;
}
