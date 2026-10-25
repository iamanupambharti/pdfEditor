import React, { useState } from 'react';
import type { Snapshot } from '../types/document';
import { 
  History, 
  Plus, 
  RotateCcw, 
  X, 
  Sparkles
} from 'lucide-react';

interface SnapshotModalProps {
  isOpen: boolean;
  onClose: () => void;
  snapshots: Snapshot[];
  onTakeSnapshot: (name: string, description: string) => void;
  onRollback: (snapshotId: string) => void;
  theme?: 'dark' | 'light';
}

export const SnapshotModal: React.FC<SnapshotModalProps> = ({
  isOpen,
  onClose,
  snapshots,
  onTakeSnapshot,
  onRollback,
}) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  if (!isOpen) return null;

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onTakeSnapshot(name.trim(), description.trim());
    setName('');
    setDescription('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4 select-none">
      <div 
        className="w-full max-w-lg border rounded-2xl shadow-2xl overflow-hidden flex flex-col"
        style={{
          background: '#1A1A1D',
          borderColor: 'rgba(255,255,255,.14)',
          color: '#F1EFEA'
        }}
      >
        {/* Header */}
        <div 
          className="px-5 py-4 border-b flex items-center justify-between"
          style={{
            background: '#131315',
            borderColor: 'rgba(255,255,255,.08)'
          }}
        >
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-white/10 text-[#F1EFEA]">
              <History className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-sm text-[#F1EFEA]">
                Version History & Snapshots
              </h3>
              <p className="text-xs text-[#A3A09A]">
                Save states before pruning or revert back to any previous checkpoint
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#A3A09A] hover:text-[#F1EFEA] hover:bg-white/5 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto max-h-[60vh] space-y-5">
          {/* Create New Snapshot Form */}
          <form 
            onSubmit={handleCreate} 
            className="p-3.5 rounded-xl border space-y-2.5"
            style={{
              background: '#131315',
              borderColor: 'rgba(255,255,255,.08)'
            }}
          >
            <span className="text-xs font-semibold flex items-center gap-1.5 text-[#F1EFEA]">
              <Sparkles className="w-3.5 h-3.5 text-[#DDD8CC]" /> Create New Safety Checkpoint
            </span>
            <input
              type="text"
              placeholder="e.g. Before Chapter 3 Page Prune"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-lg px-3 py-1.5 text-xs outline-none border border-white/10 bg-[#0B0B0D] text-[#F1EFEA] placeholder-[#A3A09A] focus:border-[#DDD8CC]"
            />
            <input
              type="text"
              placeholder="Optional notes (e.g. keeping only CAP theorem)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-lg px-3 py-1.5 text-xs outline-none border border-white/10 bg-[#0B0B0D] text-[#F1EFEA] placeholder-[#A3A09A] focus:border-[#DDD8CC]"
            />
            <div className="flex justify-end pt-1">
              <button
                type="submit"
                disabled={!name.trim()}
                className="btn primary"
                style={{ height: '30px', padding: '0 12px', fontSize: '12px' }}
              >
                <Plus className="w-3.5 h-3.5" /> Save Checkpoint
              </button>
            </div>
          </form>

          {/* History List */}
          <div className="space-y-2">
            <span className="text-xs font-semibold block px-1 text-[#A3A09A]">
              Previous Checkpoints ({snapshots.length})
            </span>

            {snapshots.length === 0 ? (
              <div className="text-center py-6 text-[#A3A09A] text-xs">
                No checkpoints saved yet.
              </div>
            ) : (
              snapshots.map((snap) => (
                <div
                  key={snap.id}
                  className="p-3 rounded-xl border flex items-center justify-between text-xs transition-colors"
                  style={{
                    background: '#131315',
                    borderColor: 'rgba(255,255,255,.08)'
                  }}
                >
                  <div className="space-y-0.5">
                    <div className="font-semibold text-[#F1EFEA]">{snap.name}</div>
                    {snap.description && (
                      <div className="text-[11px] text-[#A3A09A]">{snap.description}</div>
                    )}
                    <div className="text-[10px] flex items-center gap-2 pt-1 font-mono text-[#A3A09A]">
                      <span>{new Date(snap.timestamp).toLocaleString()}</span>
                      <span>•</span>
                      <span className="text-[#FDA4AF]">{snap.excludedPages.length} pages pruned</span>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      onRollback(snap.id);
                      onClose();
                    }}
                    style={{
                      height: '28px',
                      padding: '0 10px',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      borderRadius: '8px',
                      border: '1px solid rgba(251,113,133,.45)',
                      background: 'rgba(251,113,133,.08)',
                      color: '#FDA4AF',
                      font: "500 12px/1 'Geist',sans-serif",
                      cursor: 'pointer'
                    }}
                  >
                    <RotateCcw className="w-3.5 h-3.5" /> Rollback
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
