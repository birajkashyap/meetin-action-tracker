'use client';

import { useState } from 'react';
import {
  updateActionItem,
  deleteActionItem,
  toggleActionItemDone,
  createActionItem,
} from '@/app/actions';

interface ActionItem {
  id: string;
  description: string;
  owner: string | null;
  dueDate: Date | null;
  isDone: boolean;
  tags: string[];
}

interface ActionItemsListProps {
  transcriptId: string;
  initialItems: ActionItem[];
}

export function ActionItemsList({ transcriptId, initialItems }: ActionItemsListProps) {
  const [items, setItems] = useState<ActionItem[]>(initialItems);
  const [filter, setFilter] = useState<'all' | 'open' | 'done'>('all');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ description: '', owner: '', dueDate: '' });
  const [showAddForm, setShowAddForm] = useState(false);
  const [addForm, setAddForm] = useState({ description: '', owner: '', dueDate: '' });

  const filteredItems = items.filter((item) => {
    if (filter === 'open') return !item.isDone;
    if (filter === 'done') return item.isDone;
    return true;
  });

  const handleToggleDone = async (id: string) => {
    const response = await toggleActionItemDone(id);
    if (response.success && response.actionItem) {
      setItems(
        items.map((item) => (item.id === id ? response.actionItem! : item))
      );
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this action item?')) return;
    
    const response = await deleteActionItem(id);
    if (response.success) {
      setItems(items.filter((item) => item.id !== id));
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

  const handleUpdate = async (id: string) => {
    const response = await updateActionItem(id, {
      description: editForm.description,
      owner: editForm.owner || null,
      dueDate: editForm.dueDate ? new Date(editForm.dueDate) : null,
    });

    if (response.success && response.actionItem) {
      setItems(
        items.map((item) => (item.id === id ? response.actionItem! : item))
      );
      setEditingId(null);
    }
  };

  const handleAdd = async () => {
    if (!addForm.description.trim()) return;

    const response = await createActionItem(transcriptId, {
      description: addForm.description,
      owner: addForm.owner || null,
      dueDate: addForm.dueDate || null,
    });

    if (response.success && response.actionItem) {
      setItems([...items, response.actionItem]);
      setAddForm({ description: '', owner: '', dueDate: '' });
      setShowAddForm(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Filter buttons */}
      <div className="flex gap-2">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            filter === 'all'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          All ({items.length})
        </button>
        <button
          onClick={() => setFilter('open')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            filter === 'open'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Open ({items.filter((i) => !i.isDone).length})
        </button>
        <button
          onClick={() => setFilter('done')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            filter === 'done'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Done ({items.filter((i) => i.isDone).length})
        </button>
      </div>

      {/* Add new item button */}
      {!showAddForm && (
        <button
          onClick={() => setShowAddForm(true)}
          className="w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-blue-500 hover:text-blue-600 transition-colors"
        >
          + Add Action Item
        </button>
      )}

      {/* Add form */}
      {showAddForm && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-3">
          <input
            type="text"
            value={addForm.description}
            onChange={(e) => setAddForm({ ...addForm, description: e.target.value })}
            placeholder="Task description"
            className="w-full px-3 py-2 border border-gray-300 rounded"
          />
          <div className="grid grid-cols-2 gap-2">
            <input
              type="text"
              value={addForm.owner}
              onChange={(e) => setAddForm({ ...addForm, owner: e.target.value })}
              placeholder="Owner (optional)"
              className="px-3 py-2 border border-gray-300 rounded"
            />
            <input
              type="date"
              value={addForm.dueDate}
              onChange={(e) => setAddForm({ ...addForm, dueDate: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleAdd}
              className="flex-1 bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
            >
              Add
            </button>
            <button
              onClick={() => {
                setShowAddForm(false);
                setAddForm({ description: '', owner: '', dueDate: '' });
              }}
              className="flex-1 bg-gray-200 text-gray-700 py-2 rounded hover:bg-gray-300"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Action items list */}
      {filteredItems.length === 0 ? (
        <p className="text-gray-500 text-center py-8">No action items found</p>
      ) : (
        <div className="space-y-3">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className={`bg-white border rounded-lg p-4 ${
                item.isDone ? 'border-green-200 bg-green-50' : 'border-gray-200'
              }`}
            >
              {editingId === item.id ? (
                // Edit mode
                <div className="space-y-3">
                  <textarea
                    value={editForm.description}
                    onChange={(e) =>
                      setEditForm({ ...editForm, description: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded"
                    rows={3}
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      value={editForm.owner}
                      onChange={(e) =>
                        setEditForm({ ...editForm, owner: e.target.value })
                      }
                      placeholder="Owner"
                      className="px-3 py-2 border border-gray-300 rounded"
                    />
                    <input
                      type="date"
                      value={editForm.dueDate}
                      onChange={(e) =>
                        setEditForm({ ...editForm, dueDate: e.target.value })
                      }
                      className="px-3 py-2 border border-gray-300 rounded"
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleUpdate(item.id)}
                      className="flex-1 bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      className="flex-1 bg-gray-200 text-gray-700 py-2 rounded hover:bg-gray-300"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                // View mode
                <div>
                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      checked={item.isDone}
                      onChange={() => handleToggleDone(item.id)}
                      className="mt-1 w-5 h-5 text-blue-600 rounded cursor-pointer"
                    />
                    <div className="flex-1">
                      <p
                        className={`font-medium ${
                          item.isDone ? 'line-through text-gray-500' : 'text-gray-900'
                        }`}
                      >
                        {item.description}
                      </p>
                      <div className="mt-2 flex flex-wrap gap-4 text-sm text-gray-600">
                        {item.owner && (
                          <span>
                            👤 <strong>Owner:</strong> {item.owner}
                          </span>
                        )}
                        {item.dueDate && (
                          <span>
                            📅 <strong>Due:</strong>{' '}
                            {new Date(item.dueDate).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                      {item.tags.length > 0 && (
                        <div className="mt-2 flex gap-2">
                          {item.tags.map((tag, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-1 bg-gray-200 text-gray-700 text-xs rounded"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="mt-3 flex gap-2">
                    <button
                      onClick={() => startEdit(item)}
                      className="text-sm text-blue-600 hover:text-blue-800"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="text-sm text-red-600 hover:text-red-800"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
