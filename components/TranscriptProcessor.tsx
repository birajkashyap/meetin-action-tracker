'use client';

import { useState, useEffect, useRef } from 'react';
import { processTranscript } from '@/app/actions';
import { extractTextFromFile } from '@/app/upload-actions';
import { ActionItemsList } from './ActionItemsList';
import { Send, Sparkles, Loader2, Zap, FileText, Users, Clock, FileUp } from 'lucide-react';
import gsap from 'gsap';

interface ActionItem {
  id: string;
  description: string;
  owner: string | null;
  dueDate: Date | null;
  priority: string;
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
  const containerRef = useRef<HTMLDivElement>(null);
  const resultRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      gsap.fromTo(
        containerRef.current.children,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.6, stagger: 0.12, ease: 'power3.out' }
      );
    }
  }, []);

  useEffect(() => {
    if (result && resultRef.current) {
      gsap.fromTo(
        resultRef.current,
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.5, ease: 'power3.out' }
      );
    }
  }, [result]);

  const handleProcess = async () => {
    setLoading(true);
    setError(null);

    const response = await processTranscript(transcript);

    if (response.success && response.transcript) {
      setResult(response.transcript as any);
      setTranscript('');
    } else {
      setError(response.error || 'An error occurred');
    }

    setLoading(false);
  };

  return (
    <div ref={containerRef}>
      {/* Hero Section — content floats on the global animated background */}
      <div style={{ textAlign: 'center', marginBottom: '48px', paddingTop: '32px' }}>
        <div style={{ display: 'inline-flex', marginBottom: '20px' }}>
          <span className="badge badge-brand">
            <Sparkles size={14} />
            AI-Powered Extraction
          </span>
        </div>

        <h1
          style={{
            fontSize: '52px',
            fontWeight: 800,
            lineHeight: 1.08,
            marginBottom: '16px',
            color: 'var(--text-primary)',
            letterSpacing: '-0.02em',
            transition: 'color 0.3s ease',
          }}
        >
          Turn Meetings into
          <br />
          <span className="gradient-text" style={{ fontSize: '56px' }}>
            Action Items
          </span>
        </h1>

        <p
          style={{
            fontSize: '17px',
            color: 'var(--text-muted)',
            maxWidth: '480px',
            margin: '0 auto 32px',
            lineHeight: 1.6,
            transition: 'color 0.3s ease',
          }}
        >
          Paste your meeting transcript and let AI extract actionable tasks
          with owners, deadlines, and priority levels — instantly.
        </p>

        {/* Feature Pills */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', flexWrap: 'wrap' }}>
          {[
            { icon: Zap, label: 'Instant Extraction' },
            { icon: Users, label: 'Auto-assign Owners' },
            { icon: Clock, label: 'Due Date Detection' },
            { icon: FileText, label: 'Export to CSV' },
          ].map(({ icon: Icon, label }) => (
            <div
              key={label}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '13px',
                color: 'var(--text-secondary)',
                fontWeight: 500,
                transition: 'color 0.3s ease',
              }}
            >
              <Icon size={14} style={{ opacity: 0.7 }} />
              {label}
            </div>
          ))}
        </div>
      </div>

      {/* Input Card */}
      <div className="card-static" style={{ maxWidth: '700px', margin: '0 auto', padding: '28px' }}>
        <textarea
          className="transcript-textarea"
          value={transcript}
          onChange={(e) => setTranscript(e.target.value)}
          rows={8}
          placeholder="Paste your meeting transcript here...  Example: 'John mentioned that the Q3 report is due by Friday. Sarah agreed to handle the client presentation next week...'"
          disabled={loading}
        />

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px', marginBottom: '16px', fontSize: '13px', color: 'var(--text-muted)' }}>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <span>Supports plain text transcripts</span>
            <label 
              style={{ 
                cursor: 'pointer', 
                color: 'var(--text-brand)', 
                display: 'flex', 
                alignItems: 'center', 
                gap: '4px',
                fontWeight: 500,
                transition: 'opacity 0.2s',
              }}
              className="hover:opacity-80"
              title="Import transcript from .txt or .docx (No images supported)"
            >
              <input 
                type="file" 
                accept=".txt,.docx,.doc" 
                style={{ display: 'none' }} 
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  
                  try {
                    // Show a quick loading state if we want, but usually fast enough
                    // We can reuse isProcessing or add a new state, but for simplicity let's just do it
                    setLoading(true); // Reuse loader or add separate one
                    const formData = new FormData();
                    formData.append('file', file);
                    
                    const result = await extractTextFromFile(formData);
                    
                    if (result.success && result.text) {
                      setTranscript(result.text);
                    } else {
                      alert(result.error || 'Failed to read file');
                    }
                  } catch (err) {
                    console.error(err);
                    alert('Error uploading file');
                  } finally {
                    setLoading(false);
                    // Reset input
                    e.target.value = '';
                  }
                }}
              />
              <FileUp size={14} />
              Import File
            </label>
          </div>
          <span>{transcript.length.toLocaleString()} / 10,000</span>
        </div>

        {error && (
          <div className="error-banner" style={{ marginBottom: '16px' }}>
            {error}
          </div>
        )}

        <button
          onClick={handleProcess}
          disabled={loading || !transcript.trim()}
          className="btn-gradient"
        >
          {loading ? (
            <>
              <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} />
              <span>Processing...</span>
            </>
          ) : (
            <>
              <Send size={16} />
              <span>Extract Action Items</span>
            </>
          )}
        </button>
      </div>

      {/* Results */}
      {result && (
        <div ref={resultRef} style={{ maxWidth: '700px', margin: '32px auto 0' }}>
          <h2 style={{ fontSize: '22px', fontWeight: 700, marginBottom: '16px', color: 'var(--text-primary)' }}>
            Extracted Action Items <span className="badge-count">{result.actionItems.length}</span>
          </h2>
          <ActionItemsList
            transcriptId={result.id}
            initialItems={result.actionItems}
          />
        </div>
      )}
    </div>
  );
}
