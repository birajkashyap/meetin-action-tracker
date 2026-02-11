import { TranscriptProcessor } from '@/components/TranscriptProcessor';

export default function HomePage() {
  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-semibold mb-2">Process Meeting Transcript</h2>
        <p className="text-gray-600">
          Paste your meeting transcript below to automatically extract action items.
        </p>
      </div>
      <TranscriptProcessor />
    </div>
  );
}

