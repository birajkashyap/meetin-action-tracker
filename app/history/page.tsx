import { prisma } from '@/lib/prisma';
import Link from 'next/link';

export default async function HistoryPage() {
  const transcripts = await prisma.transcript.findMany({
    orderBy: { processedAt: 'desc' },
    take: 5,
    include: {
      actionItems: {
        orderBy: { createdAt: 'asc' },
      },
    },
  });

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-semibold mb-2">Transcript History</h2>
        <p className="text-gray-600">Last 5 processed meeting transcripts</p>
      </div>

      {transcripts.length === 0 ? (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
          <p className="text-gray-600">No transcripts processed yet.</p>
          <Link
            href="/"
            className="mt-4 inline-block text-blue-600 hover:text-blue-800 font-medium"
          >
            Process your first transcript →
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {transcripts.map((transcript) => {
            const metadata = transcript.metadata as any;
            const openItems = transcript.actionItems.filter((item) => !item.isDone).length;
            const doneItems = transcript.actionItems.filter((item) => item.isDone).length;

            return (
              <details
                key={transcript.id}
                className="bg-white border border-gray-200 rounded-lg overflow-hidden"
              >
                <summary className="px-6 py-4 cursor-pointer hover:bg-gray-50 transition-colors">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-sm font-medium text-gray-900">
                          {new Date(transcript.processedAt).toLocaleString()}
                        </span>
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded">
                          {transcript.actionItems.length} items
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {transcript.rawText.substring(0, 150)}...
                      </p>
                      {metadata && (
                        <div className="mt-2 flex gap-4 text-xs text-gray-500">
                          <span>{metadata.wordCount} words</span>
                          <span>{openItems} open</span>
                          <span>{doneItems} done</span>
                        </div>
                      )}
                    </div>
                  </div>
                </summary>

                <div className="border-t border-gray-200 px-6 py-4 bg-gray-50">
                  <h4 className="font-semibold mb-3 text-gray-900">Action Items:</h4>
                  {transcript.actionItems.length === 0 ? (
                    <p className="text-gray-500 text-sm">No action items extracted.</p>
                  ) : (
                    <div className="space-y-2">
                      {transcript.actionItems.map((item) => (
                        <div
                          key={item.id}
                          className={`bg-white border rounded p-3 text-sm ${
                            item.isDone
                              ? 'border-green-200 bg-green-50'
                              : 'border-gray-200'
                          }`}
                        >
                          <div className="flex items-start gap-2">
                            <span className="mt-0.5">
                              {item.isDone ? '✅' : '⬜'}
                            </span>
                            <div className="flex-1">
                              <p
                                className={`font-medium ${
                                  item.isDone
                                    ? 'line-through text-gray-500'
                                    : 'text-gray-900'
                                }`}
                              >
                                {item.description}
                              </p>
                              <div className="mt-1 flex flex-wrap gap-3 text-xs text-gray-600">
                                {item.owner && <span>👤 {item.owner}</span>}
                                {item.dueDate && (
                                  <span>
                                    📅 {new Date(item.dueDate).toLocaleDateString()}
                                  </span>
                                )}
                              </div>
                              {item.tags.length > 0 && (
                                <div className="mt-2 flex gap-1">
                                  {item.tags.map((tag, idx) => (
                                    <span
                                      key={idx}
                                      className="px-2 py-0.5 bg-gray-200 text-gray-700 text-xs rounded"
                                    >
                                      {tag}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </details>
            );
          })}
        </div>
      )}
    </div>
  );
}
