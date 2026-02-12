'use client';

import { FileText, Clock, Circle, CheckCircle2, ChevronRight } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { ActionItemsList } from './ActionItemsList';
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

interface HistoryPageProps {
  transcripts: Array<{
    id: string;
    rawText: string;
    processedAt: Date;
    metadata: Record<string, unknown> | null;
    actionItems: ActionItem[];
  }>;
}

function HistoryContent({ transcripts }: HistoryPageProps) {
  const cardsRef = useRef<HTMLDivElement>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    if (cardsRef.current) {
      gsap.fromTo(
        cardsRef.current.children,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.5, stagger: 0.1, ease: 'power3.out' }
      );
    }
  }, []);

  // Animate expanded content in
  useEffect(() => {
    if (expandedId) {
      const el = document.getElementById(`expanded-${expandedId}`);
      if (el) {
        gsap.fromTo(el, { opacity: 0, height: 0 }, { opacity: 1, height: 'auto', duration: 0.35, ease: 'power2.out' });
      }
    }
  }, [expandedId]);

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <div>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '36px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '8px' }}>
          Transcript <span className="gradient-text">History</span>
        </h1>
        <p style={{ fontSize: '15px', color: 'var(--text-muted)' }}>
          Review your previously processed meeting transcripts
        </p>
      </div>

      <div ref={cardsRef} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {transcripts.map((t) => {
          const openCount = t.actionItems.filter(i => !i.isDone).length;
          const doneCount = t.actionItems.filter(i => i.isDone).length;
          const wordCount = (t.metadata as Record<string, number>)?.wordCount || t.rawText.split(/\s+/).length;
          const firstLine = t.rawText.split('\n')[0]?.substring(0, 60) || 'Untitled transcript';
          const isExpanded = expandedId === t.id;

          return (
            <div key={t.id} style={{ borderRadius: '14px', overflow: 'hidden' }}>
              {/* Card Header — clickable */}
              <div
                className="history-card"
                onClick={() => toggleExpand(t.id)}
                style={{
                  borderRadius: isExpanded ? '14px 14px 0 0' : '14px',
                  borderBottom: isExpanded ? '1px solid rgba(124,58,237,0.08)' : undefined,
                }}
              >
                <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: isExpanded ? 'var(--brand-200)' : 'var(--brand-50)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'background 0.2s' }}>
                  <FileText size={18} color="#7c3aed" />
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                    <p style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {firstLine}
                    </p>
                    <span className="badge-count">{t.actionItems.length} items</span>
                  </div>
                  <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
                    <span className="meta-text">
                      <Clock size={12} />
                      {new Date(t.processedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <span className="meta-text">{wordCount.toLocaleString()} words</span>
                    <span className="meta-text">
                      <Circle size={10} color="#3b82f6" fill="#3b82f6" /> {openCount} open
                    </span>
                    <span className="meta-text">
                      <CheckCircle2 size={12} color="#10b981" /> {doneCount} done
                    </span>
                  </div>
                </div>

                <div style={{ flexShrink: 0, transition: 'transform 0.25s ease', transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)' }}>
                  <ChevronRight size={20} color="#9ca3af" />
                </div>
              </div>

              {/* Expanded — full interactive ActionItemsList */}
              {isExpanded && (
                <div
                  id={`expanded-${t.id}`}
                  style={{
                    background: 'var(--bg-expanded)',
                    borderLeft: '1px solid var(--border-light)',
                    borderRight: '1px solid var(--border-light)',
                    borderBottom: '1px solid var(--border-light)',
                    borderRadius: '0 0 14px 14px',
                    overflow: 'hidden',
                  }}
                >
                  {/* Transcript snippet */}
                  <div style={{ padding: '16px 24px 0 24px' }}>
                    <div style={{ padding: '12px 16px', background: 'rgba(124,58,237,0.04)', borderRadius: '10px', fontSize: '13px', color: '#6b7280', lineHeight: 1.6, maxHeight: '100px', overflow: 'auto', marginBottom: '16px', border: '1px solid rgba(124,58,237,0.06)' }}>
                      {t.rawText.substring(0, 400)}{t.rawText.length > 400 ? '…' : ''}
                    </div>
                  </div>

                  {/* Fully interactive action items */}
                  <div style={{ padding: '0 24px 20px 24px' }}>
                    <ActionItemsList
                      transcriptId={t.id}
                      initialItems={t.actionItems}
                    />
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {transcripts.length === 0 && (
        <div className="card-static" style={{ textAlign: 'center', padding: '48px', color: '#9ca3af' }}>
          <FileText size={32} color="#d1d5db" style={{ margin: '0 auto 12px' }} />
          <p style={{ fontSize: '15px' }}>No transcripts processed yet</p>
          <p style={{ fontSize: '13px', marginTop: '4px' }}>Process your first meeting transcript on the Home page</p>
        </div>
      )}
    </div>
  );
}

export default HistoryContent;
