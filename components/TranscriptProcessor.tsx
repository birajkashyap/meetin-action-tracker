'use client';

import { useState } from 'react';
import { processTranscript } from '@/app/actions';
import { ActionItemsList } from './ActionItemsList';

interface ActionItem {
  id: string;
  description: string;
  owner: string | null;
  dueDate: Date | null;
  isDone: boolean;
  tags: string[];
}

interface Transcript {
  id: string;
  actionItems: ActionItem[];
}

export function TranscriptProcessor() {
  const [transcript, setTranscript] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<Transcript | null>(null);

  const handleProcess = async () => {
    setLoading(true);
    setError(null);
    
    const response = await processTranscript(transcript);
    
    if (response.success && response.transcript) {
      setResult(response.transcript);
      setTranscript('');
    } else {
      setError(response.error || 'An error occurred');
    }
    
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      <div>
        <label htmlFor="transcript" className="block text-sm font-medium text-gray-700 mb-2">
          Meeting Transcript
        </label>
        <textarea
          id="transcript"
          value={transcript}
          onChange={(e) => setTranscript(e.target.value)}
          rows={10}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Paste your meeting transcript here..."
          disabled={loading}
        />
        <p className="mt-1 text-sm text-gray-500">
          {transcript.length} characters
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      <button
        onClick={handleProcess}
        disabled={loading || !transcript.trim()}
        className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
      >
        {loading ? 'Processing...' : 'Extract Action Items'}
      </button>

      {result && (
        <div className="mt-8">
          <h3 className="text-lg font-semibold mb-4">
            Extracted Action Items ({result.actionItems.length})
          </h3>
          <ActionItemsList
            transcriptId={result.id}
            initialItems={result.actionItems}
          />
        </div>
      )}
    </div>
  );
}
