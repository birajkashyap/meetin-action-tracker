import { prisma } from '@/lib/prisma';
// @ts-ignore
import SearchContent from '@/components/SearchContent';

export const dynamic = 'force-dynamic';

export default async function SearchPage() {
  // Fetch all action items with transcript info
  const items = await prisma.actionItem.findMany({
    include: {
      transcript: {
        select: { processedAt: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  const serialized = items.map((item) => ({
    id: item.id,
    description: item.description,
    owner: item.owner,
    dueDate: item.dueDate ? item.dueDate.toISOString() : null,
    priority: (item as any).priority || 'medium',
    isDone: item.isDone,
    tags: item.tags,
    transcriptDate: item.transcript.processedAt.toISOString(),
  }));

  return <SearchContent items={serialized} />;
}
