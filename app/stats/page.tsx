import { prisma } from '@/lib/prisma';
import StatsContent from '@/components/StatsContent';

export const dynamic = 'force-dynamic';

export default async function StatsPage() {
  // Fetch all transcripts with action items
  const transcripts = await prisma.transcript.findMany({
    orderBy: { processedAt: 'desc' },
    include: {
      actionItems: {
        select: {
          id: true,
          description: true,
          owner: true,
          dueDate: true,
          isDone: true,
          tags: true,
          createdAt: true,
        },
      },
    },
  });

  // Aggregate stats
  const allItems = transcripts.flatMap((t) => t.actionItems);
  const totalItems = allItems.length;
  const completedItems = allItems.filter((i) => i.isDone).length;
  const openItems = totalItems - completedItems;
  const completionRate = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;

  // Owner breakdown
  const ownerMap = new Map<string, { total: number; done: number }>();
  allItems.forEach((item) => {
    const key = item.owner || 'Unassigned';
    const existing = ownerMap.get(key) || { total: 0, done: 0 };
    existing.total += 1;
    if (item.isDone) existing.done += 1;
    ownerMap.set(key, existing);
  });

  const ownerStats = Array.from(ownerMap.entries())
    .map(([name, stats]) => ({
      name,
      total: stats.total,
      done: stats.done,
      rate: stats.total > 0 ? Math.round((stats.done / stats.total) * 100) : 0,
    }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 8);

  // Tag breakdown
  const tagMap = new Map<string, number>();
  allItems.forEach((item) => {
    item.tags.forEach((tag) => {
      tagMap.set(tag, (tagMap.get(tag) || 0) + 1);
    });
  });
  const tagStats = Array.from(tagMap.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  // Per-transcript completion
  const transcriptStats = transcripts.map((t) => {
    const total = t.actionItems.length;
    const done = t.actionItems.filter((i) => i.isDone).length;
    return {
      id: t.id,
      date: t.processedAt.toISOString(),
      total,
      done,
      rate: total > 0 ? Math.round((done / total) * 100) : 0,
    };
  });

  // Items with upcoming due dates
  const now = new Date();
  const overdue = allItems.filter(
    (i) => !i.isDone && i.dueDate && new Date(i.dueDate) < now
  ).length;

  return (
    <StatsContent
      stats={{
        totalItems,
        completedItems,
        openItems,
        completionRate,
        totalTranscripts: transcripts.length,
        overdue,
        ownerStats,
        tagStats,
        transcriptStats,
      }}
    />
  );
}
