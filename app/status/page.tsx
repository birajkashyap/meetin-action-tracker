import { prisma } from '@/lib/prisma';
import { GoogleGenerativeAI } from '@google/generative-ai';

export const dynamic = 'force-dynamic';

async function checkDatabaseConnection(): Promise<boolean> {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return true;
  } catch {
    return false;
  }
}

async function checkLLMConnection(): Promise<boolean> {
  try {
    if (!process.env.GEMINI_API_KEY) {
      return false;
    }
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    // Simple ping test
    await model.generateContent('Hello');
    return true;
  } catch {
    return false;
  }
}

export default async function StatusPage() {
  const dbConnected = await checkDatabaseConnection();
  const llmConnected = await checkLLMConnection();

  const allHealthy = dbConnected && llmConnected;

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-semibold mb-2">System Status</h2>
        <p className="text-gray-600">Health check for backend services</p>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="space-y-6">
          {/* Overall Status */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Overall Status</h3>
            <div
              className={`px-4 py-3 rounded-lg flex items-center gap-3 ${
                allHealthy
                  ? 'bg-green-50 border border-green-200'
                  : 'bg-red-50 border border-red-200'
              }`}
            >
              <span className="text-2xl">{allHealthy ? '✅' : '❌'}</span>
              <div>
                <p
                  className={`font-semibold ${
                    allHealthy ? 'text-green-900' : 'text-red-900'
                  }`}
                >
                  {allHealthy ? 'All Systems Operational' : 'System Issues Detected'}
                </p>
                <p className="text-sm text-gray-600">
                  Last checked: {new Date().toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          <hr />

          {/* Database Status */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Database</h3>
            <div className="flex items-center gap-3">
              <span className="text-2xl">{dbConnected ? '✅' : '❌'}</span>
              <div>
                <p className="font-medium text-gray-900">
                  {dbConnected ? 'Connected' : 'Disconnected'}
                </p>
                <p className="text-sm text-gray-600">PostgreSQL Database</p>
              </div>
            </div>
            {!dbConnected && (
              <div className="mt-2 bg-red-50 border border-red-200 rounded p-3 text-sm text-red-800">
                Unable to connect to database. Check DATABASE_URL environment variable.
              </div>
            )}
          </div>

          <hr />

          {/* LLM Status */}
          <div>
            <h3 className="text-lg font-semibold mb-3">LLM API</h3>
            <div className="flex items-center gap-3">
              <span className="text-2xl">{llmConnected ? '✅' : '❌'}</span>
              <div>
                <p className="font-medium text-gray-900">
                  {llmConnected ? 'Connected' : 'Disconnected'}
                </p>
                <p className="text-sm text-gray-600">Google Gemini 1.5 Flash</p>
              </div>
            </div>
            {!llmConnected && (
              <div className="mt-2 bg-red-50 border border-red-200 rounded p-3 text-sm text-red-800">
                Unable to connect to Gemini API. Check GEMINI_API_KEY environment
                variable.
              </div>
            )}
          </div>

          <hr />

          {/* Environment Info */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Environment</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Node Environment:</span>
                <span className="font-medium">
                  {process.env.NODE_ENV || 'development'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Database Configured:</span>
                <span className="font-medium">
                  {process.env.DATABASE_URL ? '✅ Yes' : '❌ No'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Gemini Key Configured:</span>
                <span className="font-medium">
                  {process.env.GEMINI_API_KEY ? '✅ Yes' : '❌ No'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
