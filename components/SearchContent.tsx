'use client';

import { useState, useMemo } from 'react';
import { Search, Filter, Circle, CheckCircle2, ArrowUp, ArrowRight, ArrowDown, X } from 'lucide-react';

interface SearchItem {
  id: string;
  description: string;
  owner: string | null;
  dueDate: string | null;
  priority: string;
  isDone: boolean;
  tags: string[];
  transcriptDate: string;
}

interface SearchContentProps {
  items: SearchItem[];
}

const PRIORITY_CONFIG: Record<string, { label: string; color: string; bg: string; icon: typeof ArrowUp }> = {
  high: { label: 'High', color: '#ef4444', bg: 'rgba(239,68,68,0.1)', icon: ArrowUp },
  medium: { label: 'Med', color: '#f59e0b', bg: 'rgba(245,158,11,0.1)', icon: ArrowRight },
  low: { label: 'Low', color: '#3b82f6', bg: 'rgba(59,130,246,0.1)', icon: ArrowDown },
};

export default function SearchContent({ items }: SearchContentProps) {
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'open' | 'done'>('all');
  const [priorityFilter, setPriorityFilter] = useState<'all' | 'high' | 'medium' | 'low'>('all');

  const filtered = useMemo(() => {
    return items.filter((item) => {
      // Status filter
      if (statusFilter === 'open' && item.isDone) return false;
      if (statusFilter === 'done' && !item.isDone) return false;

      // Priority filter
      if (priorityFilter !== 'all' && item.priority !== priorityFilter) return false;

      // Text search
      if (!query.trim()) return true;
      const q = query.toLowerCase();
      return (
        item.description.toLowerCase().includes(q) ||
        (item.owner && item.owner.toLowerCase().includes(q)) ||
        item.tags.some((tag) => tag.toLowerCase().includes(q))
      );
    });
  }, [items, query, statusFilter, priorityFilter]);

  const PriorityBadge = ({ priority }: { priority: string }) => {
    const config = PRIORITY_CONFIG[priority] || PRIORITY_CONFIG.medium;
    const Icon = config.icon;
    return (
      <span style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '3px',
        fontSize: '11px',
        fontWeight: 600,
        padding: '2px 8px',
        borderRadius: '6px',
        color: config.color,
        background: config.bg,
        border: `1px solid ${config.color}25`,
        textTransform: 'uppercase',
        letterSpacing: '0.03em',
      }}>
        <Icon size={10} />
        {config.label}
      </span>
    );
  };

  return (
    <div>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '32px' }}>
        <h1 style={{ fontSize: '36px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '8px' }}>
          <Search size={30} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '12px', color: '#7c3aed' }} />
          Search <span className="gradient-text">Action Items</span>
        </h1>
        <p style={{ fontSize: '15px', color: 'var(--text-muted)' }}>
          Find action items across all transcripts by keyword, owner, or tag
        </p>
      </div>

      {/* Search Bar */}
      <div className="card-static" style={{ maxWidth: '700px', margin: '0 auto 24px', padding: '20px' }}>
        <div style={{ position: 'relative', marginBottom: '14px' }}>
          <Search size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by description, owner, or tag..."
            style={{
              width: '100%',
              padding: '12px 14px 12px 44px',
              border: '1px solid var(--border-input)',
              borderRadius: '12px',
              fontSize: '15px',
              outline: 'none',
              background: 'var(--bg-input)',
              color: 'var(--text-primary)',
              fontFamily: 'var(--font-sans)',
            }}
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex' }}
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* Filter Row */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
          <Filter size={14} style={{ color: 'var(--text-muted)' }} />

          {/* Status */}
          {(['all', 'open', 'done'] as const).map((s) => (
            <button
              key={s}
              className={`filter-btn ${statusFilter === s ? 'active' : ''}`}
              onClick={() => setStatusFilter(s)}
              style={{ fontSize: '12px', padding: '4px 12px' }}
            >
              {s === 'all' ? 'All' : s === 'open' ? '○ Open' : '✓ Done'}
            </button>
          ))}

          <div style={{ width: '1px', height: '20px', background: 'var(--border-light)', margin: '0 4px' }} />

          {/* Priority */}
          {(['all', 'high', 'medium', 'low'] as const).map((p) => (
            <button
              key={p}
              className={`filter-btn ${priorityFilter === p ? 'active' : ''}`}
              onClick={() => setPriorityFilter(p)}
              style={{ fontSize: '12px', padding: '4px 12px' }}
            >
              {p === 'all' ? 'Any Priority' : p === 'high' ? '🔴 High' : p === 'medium' ? '🟡 Med' : '🔵 Low'}
            </button>
          ))}
        </div>
      </div>

      {/* Results */}
      <div style={{ maxWidth: '700px', margin: '0 auto' }}>
        <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '12px' }}>
          {filtered.length} result{filtered.length !== 1 ? 's' : ''} found
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {filtered.map((item) => (
            <div key={item.id} className={`action-item-card ${item.isDone ? 'action-item-done' : ''}`}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                <div style={{ flexShrink: 0, marginTop: '1px' }}>
                  {item.isDone ? (
                    <CheckCircle2 size={18} color="#10b981" />
                  ) : (
                    <Circle size={18} color="var(--checkbox-empty)" />
                  )}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px', flexWrap: 'wrap' }}>
                    <p style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text-primary)', margin: 0 }}>
                      {item.description}
                    </p>
                    <PriorityBadge priority={item.priority || 'medium'} />
                  </div>
                  <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
                    {item.owner && (
                      <span className="meta-text">👤 {item.owner}</span>
                    )}
                    {item.dueDate && (
                      <span className="meta-text">📅 {new Date(item.dueDate).toLocaleDateString()}</span>
                    )}
                    <span className="meta-text" style={{ opacity: 0.7 }}>
                      🕐 {new Date(item.transcriptDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </span>
                    {item.tags?.map((tag) => (
                      <span
                        key={tag}
                        className="tag-badge"
                        style={{ cursor: 'pointer' }}
                        onClick={() => setQuery(tag)}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="card-static" style={{ textAlign: 'center', padding: '48px 24px' }}>
            <Search size={36} style={{ color: 'var(--text-muted)', marginBottom: '12px', opacity: 0.4 }} />
            <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>
              {items.length === 0 ? 'No action items yet. Process a transcript first!' : 'No items match your search.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
