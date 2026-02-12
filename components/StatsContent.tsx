'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import {
  BarChart3,
  TrendingUp,
  Users,
  CheckCircle2,
  Circle,
  AlertTriangle,
  FileText,
  Tag,
  Download,
} from 'lucide-react';

interface StatsProps {
  stats: {
    totalItems: number;
    completedItems: number;
    openItems: number;
    completionRate: number;
    totalTranscripts: number;
    overdue: number;
    ownerStats: { name: string; total: number; done: number; rate: number }[];
    tagStats: { name: string; count: number }[];
    transcriptStats: { id: string; date: string; total: number; done: number; rate: number }[];
  };
}

const COLORS = [
  '#7c3aed', '#2dd4bf', '#3b82f6', '#f59e0b',
  '#ef4444', '#10b981', '#ec4899', '#6366f1',
];

export default function StatsContent({ stats }: StatsProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const cards = containerRef.current.querySelectorAll('.stat-card-anim');
    gsap.fromTo(
      cards,
      { opacity: 0, y: 24 },
      { opacity: 1, y: 0, duration: 0.5, stagger: 0.08, ease: 'power2.out' }
    );

    // Animate progress bars
    const bars = containerRef.current.querySelectorAll('.bar-fill');
    bars.forEach((bar) => {
      const width = bar.getAttribute('data-width') || '0';
      gsap.fromTo(bar, { width: '0%' }, { width: `${width}%`, duration: 0.8, ease: 'power2.out', delay: 0.4 });
    });

    // Animate ring
    const ring = containerRef.current.querySelector('.ring-progress');
    if (ring) {
      const circumference = 2 * Math.PI * 54;
      const offset = circumference - (stats.completionRate / 100) * circumference;
      gsap.fromTo(
        ring,
        { strokeDashoffset: circumference },
        { strokeDashoffset: offset, duration: 1.2, ease: 'power2.out', delay: 0.3 }
      );
    }
  }, [stats]);

  const handleExport = (transcriptId?: string) => {
    const url = transcriptId
      ? `/api/export?transcriptId=${transcriptId}`
      : '/api/export';
    window.open(url, '_blank');
  };

  const maxTag = stats.tagStats.length > 0 ? stats.tagStats[0].count : 1;
  const maxOwner = stats.ownerStats.length > 0 ? stats.ownerStats[0].total : 1;

  return (
    <div ref={containerRef}>
      {/* Header */}
      <div style={{ marginBottom: '32px', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '36px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '8px' }}>
            <BarChart3 size={32} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '12px', color: '#7c3aed' }} />
            Statistics <span className="gradient-text">Dashboard</span>
          </h1>
          <p style={{ fontSize: '15px', color: 'var(--text-muted)' }}>
            Track your team&apos;s progress and action item trends
          </p>
        </div>
        <button
          onClick={() => handleExport()}
          className="btn-primary"
          style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', fontSize: '14px' }}
        >
          <Download size={16} />
          Export All to CSV
        </button>
      </div>

      {/* KPI Cards Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '16px', marginBottom: '32px' }}>
        {[
          { label: 'Total Items', value: stats.totalItems, icon: FileText, color: '#7c3aed', bg: 'var(--brand-50)' },
          { label: 'Completed', value: stats.completedItems, icon: CheckCircle2, color: '#10b981', bg: 'var(--success-bg)' },
          { label: 'Open', value: stats.openItems, icon: Circle, color: '#3b82f6', bg: 'rgba(59,130,246,0.08)' },
          { label: 'Overdue', value: stats.overdue, icon: AlertTriangle, color: '#ef4444', bg: 'var(--error-bg)' },
          { label: 'Transcripts', value: stats.totalTranscripts, icon: FileText, color: '#f59e0b', bg: 'rgba(245,158,11,0.08)' },
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="card-static stat-card-anim" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Icon size={20} color={color} />
            </div>
            <div>
              <p style={{ fontSize: '26px', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1 }}>{value}</p>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 600 }}>{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Main Content — Two Column */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '32px' }}>

        {/* Completion Ring */}
        <div className="card-static stat-card-anim" style={{ padding: '28px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <p className="section-label" style={{ alignSelf: 'flex-start' }}>OVERALL COMPLETION</p>
          <div style={{ position: 'relative', width: '140px', height: '140px', margin: '16px 0' }}>
            <svg width="140" height="140" viewBox="0 0 120 120">
              <circle
                cx="60" cy="60" r="54"
                fill="none"
                stroke="var(--border-light)"
                strokeWidth="10"
              />
              <circle
                className="ring-progress"
                cx="60" cy="60" r="54"
                fill="none"
                stroke="url(#ringGradient)"
                strokeWidth="10"
                strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 54}`}
                strokeDashoffset={`${2 * Math.PI * 54}`}
                transform="rotate(-90 60 60)"
              />
              <defs>
                <linearGradient id="ringGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#7c3aed" />
                  <stop offset="100%" stopColor="#2dd4bf" />
                </linearGradient>
              </defs>
            </svg>
            <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: '32px', fontWeight: 800, color: 'var(--text-primary)' }}>{stats.completionRate}%</span>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '20px', marginTop: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#10b981' }} />
              <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{stats.completedItems} done</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#3b82f6' }} />
              <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{stats.openItems} open</span>
            </div>
          </div>
        </div>

        {/* Top Assignees */}
        <div className="card-static stat-card-anim" style={{ padding: '28px' }}>
          <p className="section-label" style={{ marginBottom: '16px' }}>
            <Users size={14} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '6px' }} />
            TOP ASSIGNEES
          </p>
          {stats.ownerStats.length === 0 ? (
            <p style={{ fontSize: '14px', color: 'var(--text-muted)', textAlign: 'center', padding: '24px' }}>No assignees yet</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {stats.ownerStats.map((owner, i) => (
                <div key={owner.name}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>{owner.name}</span>
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{owner.done}/{owner.total} done ({owner.rate}%)</span>
                  </div>
                  <div style={{ height: '8px', borderRadius: '4px', background: 'var(--brand-50)', overflow: 'hidden' }}>
                    <div
                      className="bar-fill"
                      data-width={Math.round((owner.total / maxOwner) * 100)}
                      style={{ height: '100%', borderRadius: '4px', background: COLORS[i % COLORS.length], width: '0%' }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Bottom Row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '32px' }}>

        {/* Tags Breakdown */}
        <div className="card-static stat-card-anim" style={{ padding: '28px' }}>
          <p className="section-label" style={{ marginBottom: '16px' }}>
            <Tag size={14} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '6px' }} />
            POPULAR TAGS
          </p>
          {stats.tagStats.length === 0 ? (
            <p style={{ fontSize: '14px', color: 'var(--text-muted)', textAlign: 'center', padding: '24px' }}>No tags used yet</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {stats.tagStats.map((tag, i) => (
                <div key={tag.name} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', minWidth: '80px' }}>{tag.name}</span>
                  <div style={{ flex: 1, height: '8px', borderRadius: '4px', background: 'var(--brand-50)', overflow: 'hidden' }}>
                    <div
                      className="bar-fill"
                      data-width={Math.round((tag.count / maxTag) * 100)}
                      style={{ height: '100%', borderRadius: '4px', background: COLORS[i % COLORS.length], width: '0%' }}
                    />
                  </div>
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)', minWidth: '20px', textAlign: 'right' }}>{tag.count}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Per-Transcript Completion */}
        <div className="card-static stat-card-anim" style={{ padding: '28px' }}>
          <p className="section-label" style={{ marginBottom: '16px' }}>
            <TrendingUp size={14} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '6px' }} />
            COMPLETION BY TRANSCRIPT
          </p>
          {stats.transcriptStats.length === 0 ? (
            <p style={{ fontSize: '14px', color: 'var(--text-muted)', textAlign: 'center', padding: '24px' }}>No transcripts yet</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {stats.transcriptStats.map((t) => (
                <div key={t.id}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                      {new Date(t.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                        {t.done}/{t.total}
                      </span>
                      <button
                        onClick={() => {
                          const url = `/api/export?transcriptId=${t.id}`;
                          window.open(url, '_blank');
                        }}
                        style={{
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          padding: '2px',
                          color: 'var(--text-muted)',
                          display: 'flex',
                          alignItems: 'center',
                        }}
                        title="Export this transcript's items"
                      >
                        <Download size={12} />
                      </button>
                    </div>
                  </div>
                  <div style={{ height: '8px', borderRadius: '4px', background: 'var(--brand-50)', overflow: 'hidden' }}>
                    <div
                      className="bar-fill"
                      data-width={t.rate}
                      style={{
                        height: '100%',
                        borderRadius: '4px',
                        background: t.rate === 100
                          ? '#10b981'
                          : t.rate >= 50
                            ? 'linear-gradient(90deg, #7c3aed, #2dd4bf)'
                            : '#3b82f6',
                        width: '0%',
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
