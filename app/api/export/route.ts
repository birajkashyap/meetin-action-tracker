import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const transcriptId = searchParams.get('transcriptId');

    // Build query filter
    const where = transcriptId ? { transcriptId } : {};

    const items = await prisma.actionItem.findMany({
      where,
      include: {
        transcript: {
          select: { processedAt: true, rawText: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // CSV header
    const header = 'Description,Owner,Due Date,Status,Tags,Transcript Date\n';

    // CSV rows
    const rows = items.map((item) => {
      const desc = `"${item.description.replace(/"/g, '""')}"`;
      const owner = item.owner || '';
      const dueDate = item.dueDate
        ? new Date(item.dueDate).toLocaleDateString('en-US')
        : '';
      const status = item.isDone ? 'Done' : 'Open';
      const tags = item.tags.join('; ');
      const transcriptDate = new Date(
        item.transcript.processedAt
      ).toLocaleDateString('en-US');
      return `${desc},${owner},${dueDate},${status},${tags},${transcriptDate}`;
    });

    const csv = header + rows.join('\n');

    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="action-items-${new Date().toISOString().slice(0, 10)}.csv"`,
      },
    });
  } catch (error) {
    console.error('Export error:', error);
    return NextResponse.json(
      { error: 'Failed to export' },
      { status: 500 }
    );
  }
}
