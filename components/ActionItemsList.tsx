'use client';

import { useState, useEffect, useRef } from 'react';
import {
  updateActionItem,
  deleteActionItem,
  toggleActionItemDone,
  createActionItem,
} from '@/app/actions';
import { Check, X, Pencil, Trash2, Plus, Circle, CheckCircle2, Download, ArrowUp, ArrowRight, ArrowDown } from 'lucide-react';
import gsap from 'gsap';
import { useToast } from './ToastProvider';
import { triggerConfetti } from '@/lib/confetti';

interface ActionItem {
  id: string;
  description: string;
  owner: string | null;
  dueDate: Date | null;
  priority: string;
  isDone: boolean;
  tags: string[];
}

interface ActionItemsListProps {
  transcriptId: string;
  initialItems: ActionItem[];
}

const PRIORITY_CONFIG: Record<string, { label: string; color: string; bg: string; icon: typeof ArrowUp }> = {
  high: { label: 'High', color: '#ef4444', bg: 'rgba(239,68,68,0.1)', icon: ArrowUp },
  medium: { label: 'Med', color: '#f59e0b', bg: 'rgba(245,158,11,0.1)', icon: ArrowRight },
  low: { label: 'Low', color: '#3b82f6', bg: 'rgba(59,130,246,0.1)', icon: ArrowDown },
};

export function ActionItemsList({ transcriptId, initialItems }: ActionItemsListProps) {
  const [items, setItems] = useState<ActionItem[]>(initialItems);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ description: '', owner: '', dueDate: '' });
  const [filter, setFilter] = useState<'all' | 'open' | 'done'>('all');
  const [showAddForm, setShowAddForm] = useState(false);
  const [newItem, setNewItem] = useState<{
    description: string;
    owner: string;
    dueDate: string;
    priority: 'high' | 'medium' | 'low';
  }>({ description: '', owner: '', dueDate: '', priority: 'medium' });
  const listRef = useRef<HTMLDivElement>(null);
  const { addToast } = useToast();

  useEffect(() => {
    if (listRef.current) {
      gsap.fromTo(
        listRef.current.children,
        { opacity: 0, x: -10 },
        { opacity: 1, x: 0, duration: 0.4, stagger: 0.06, ease: 'power2.out' }
      );
    }
  }, [filter]);

  const filteredItems = items.filter((item) => {
    if (filter === 'open') return !item.isDone;
    if (filter === 'done') return item.isDone;
    return true;
  });

  const openCount = items.filter(i => !i.isDone).length;
  const doneCount = items.filter(i => i.isDone).length;

  const handleToggle = async (id: string) => {
    const result = await toggleActionItemDone(id);
    if (result.success && result.actionItem) {
      const newItems = items.map((i) => (i.id === id ? { ...i, isDone: result.actionItem!.isDone } : i));
      setItems(newItems);

      if (result.actionItem.isDone) {
        addToast('✅ Action item completed!', 'success');
        // Check if ALL items are now done
        const allDone = newItems.every((i) => i.isDone);
        if (allDone && newItems.length > 0) {
          addToast('🎉 All action items complete! Great work!', 'success');
          triggerConfetti();
        }
      } else {
        addToast('Item re-opened', 'info');
      }
    }
  };

  const handleDelete = async (id: string) => {
    const result = await deleteActionItem(id);
    if (result.success) {
      setItems(items.filter((i) => i.id !== id));
      addToast('🗑️ Action item deleted', 'warning');
    } else {
      addToast('Failed to delete item', 'error');
    }
  };

  const startEdit = (item: ActionItem) => {
    setEditingId(item.id);
    setEditForm({
      description: item.description,
      owner: item.owner || '',
      dueDate: item.dueDate ? new Date(item.dueDate).toISOString().split('T')[0] : '',
    });
  };

  const handleSaveEdit = async () => {
    if (!editingId) return;
    const result = await updateActionItem(editingId, {
      description: editForm.description,
      owner: editForm.owner || null,
      dueDate: editForm.dueDate ? new Date(editForm.dueDate) : null,
    });
    if (result.success && result.actionItem) {
      setItems(
        items.map((i) =>
          i.id === editingId ? { ...i, ...result.actionItem as unknown as ActionItem } : i
        )
      );
      setEditingId(null);
      addToast('💾 Changes saved', 'success');
    } else {
      addToast('Failed to save changes', 'error');
    }
  };

  const handleAddItem = async () => {
    if (!newItem.description.trim()) return;
    const result = await createActionItem(transcriptId, {
      description: newItem.description,
      owner: newItem.owner || null,
      dueDate: newItem.dueDate || null,
      priority: newItem.priority,
      tags: [],
    });
    if (result.success && result.actionItem) {
      setItems([...items, result.actionItem as unknown as ActionItem]);
      setNewItem({ description: '', owner: '', dueDate: '', priority: 'medium' });
      setShowAddForm(false);
      addToast('➕ New action item added', 'success');
    } else {
      addToast('Failed to add item', 'error');
    }
  };

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
      {/* Filters */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
        <button className={`filter-btn ${filter === 'all' ? 'active' : ''}`} onClick={() => setFilter('all')}>
          All ({items.length})
        </button>
        <button className={`filter-btn ${filter === 'open' ? 'active' : ''}`} onClick={() => setFilter('open')}>
          Open ({openCount})
        </button>
        <button className={`filter-btn ${filter === 'done' ? 'active' : ''}`} onClick={() => setFilter('done')}>
          Done ({doneCount})
        </button>
        <div style={{ flex: 1 }} />
        <button
          className="filter-btn"
          onClick={() => setShowAddForm(!showAddForm)}
          style={{ display: 'flex', alignItems: 'center', gap: '4px' }}
        >
          <Plus size={14} />
          Add Item
        </button>
        <button
          className="filter-btn"
          onClick={() => window.open(`/api/export?transcriptId=${transcriptId}`, '_blank')}
          style={{ display: 'flex', alignItems: 'center', gap: '4px' }}
          title="Export these items as CSV"
        >
          <Download size={14} />
          Export
        </button>
      </div>

      {/* Add Form */}
      {showAddForm && (
        <div className="action-item-card" style={{ marginBottom: '12px', padding: '16px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <input
              type="text"
              placeholder="Task description..."
              value={newItem.description}
              onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
              style={{ padding: '8px 12px', border: '1px solid var(--border-input)', borderRadius: '8px', fontSize: '14px', outline: 'none', background: 'var(--bg-input)', color: 'var(--text-primary)' }}
            />
            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                type="text"
                placeholder="Owner"
                value={newItem.owner}
                onChange={(e) => setNewItem({ ...newItem, owner: e.target.value })}
                style={{ flex: 1, padding: '8px 12px', border: '1px solid var(--border-input)', borderRadius: '8px', fontSize: '13px', outline: 'none', background: 'var(--bg-input)', color: 'var(--text-primary)' }}
              />
              <input
                type="date"
                value={newItem.dueDate}
                onChange={(e) => setNewItem({ ...newItem, dueDate: e.target.value })}
                style={{ padding: '8px 12px', border: '1px solid var(--border-input)', borderRadius: '8px', fontSize: '13px', outline: 'none', background: 'var(--bg-input)', color: 'var(--text-primary)' }}
              />
              <select
                value={newItem.priority}
                onChange={(e) => setNewItem({ ...newItem, priority: e.target.value as 'high' | 'medium' | 'low' })}
                style={{ padding: '8px 12px', border: '1px solid var(--border-input)', borderRadius: '8px', fontSize: '13px', outline: 'none', background: 'var(--bg-input)', color: 'var(--text-primary)' }}
              >
                <option value="high">🔴 High</option>
                <option value="medium">🟡 Medium</option>
                <option value="low">🔵 Low</option>
              </select>
            </div>
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
              <button className="action-btn" onClick={() => setShowAddForm(false)}>
                <X size={13} /> Cancel
              </button>
              <button className="action-btn" onClick={handleAddItem} style={{ background: '#7c3aed', color: 'white', border: 'none' }}>
                <Check size={13} /> Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Items List */}
      <div ref={listRef} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {filteredItems.map((item) => (
          <div key={item.id} className={`action-item-card ${item.isDone ? 'action-item-done' : ''}`}>
            {editingId === item.id ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <input
                  type="text"
                  value={editForm.description}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  style={{ padding: '8px 12px', border: '1px solid var(--border-input)', borderRadius: '8px', fontSize: '14px', outline: 'none', background: 'var(--bg-input)', color: 'var(--text-primary)' }}
                />
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input
                    type="text"
                    placeholder="Owner"
                    value={editForm.owner}
                    onChange={(e) => setEditForm({ ...editForm, owner: e.target.value })}
                    style={{ flex: 1, padding: '8px 12px', border: '1px solid var(--border-input)', borderRadius: '8px', fontSize: '13px', outline: 'none', background: 'var(--bg-input)', color: 'var(--text-primary)' }}
                  />
                  <input
                    type="date"
                    value={editForm.dueDate}
                    onChange={(e) => setEditForm({ ...editForm, dueDate: e.target.value })}
                    style={{ padding: '8px 12px', border: '1px solid var(--border-input)', borderRadius: '8px', fontSize: '13px', outline: 'none', background: 'var(--bg-input)', color: 'var(--text-primary)' }}
                  />
                </div>
                <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                  <button className="action-btn" onClick={() => setEditingId(null)}>
                    <X size={13} /> Cancel
                  </button>
                  <button className="action-btn" onClick={handleSaveEdit} style={{ background: '#7c3aed', color: 'white', border: 'none' }}>
                    <Check size={13} /> Save
                  </button>
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                {/* Checkbox */}
                <button
                  onClick={() => handleToggle(item.id)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '2px', flexShrink: 0, marginTop: '1px' }}
                >
                  {item.isDone ? (
                    <CheckCircle2 size={20} color="#10b981" />
                  ) : (
                    <Circle size={20} color="var(--checkbox-empty)" />
                  )}
                </button>

                {/* Content */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <p className="action-item-text" style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text-primary)', margin: 0 }}>
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
                    {item.tags?.map((tag) => (
                      <span key={tag} className="tag-badge">{tag}</span>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: '4px', flexShrink: 0 }}>
                  <button className="action-btn" onClick={() => startEdit(item)}>
                    <Pencil size={12} />
                  </button>
                  <button className="action-btn action-btn-danger" onClick={() => handleDelete(item.id)}>
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {filteredItems.length === 0 && (
        <div style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)', fontSize: '14px' }}>
          No action items found for this filter.
        </div>
      )}
    </div>
  );
}
