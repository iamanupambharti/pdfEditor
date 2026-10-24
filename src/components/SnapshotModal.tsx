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
  theme = 'dark',
}) => {
  const isLight = theme === 'light';
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 select-none">
      <div className={`w-full max-w-lg border rounded-2xl shadow-2xl overflow-hidden flex flex-col transition-colors ${
        isLight ? 'bg-white border-slate-200 text-slate-800' : 'bg-slate-900 border-slate-800 text-slate-200'
      }`}>
        {/* Header */}
        <div className={`px-5 py-4 border-b flex items-center justify-between ${
          isLight ? 'bg-slate-50 border-slate-200' : 'border-slate-800'
        }`}>
          <div className="flex items-center gap-2">
            <div className={`p-2 rounded-lg ${isLight ? 'bg-indigo-100 text-indigo-700' : 'bg-indigo-600/20 text-indigo-400'}`}>
              <History className="w-5 h-5" />
            </div>
            <div>
              <h3 className={`font-semibold text-sm ${isLight ? 'text-slate-900' : 'text-slate-100'}`}>
                Version History & Snapshots
              </h3>
              <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                Save states before pruning or revert back to any previous checkpoint
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
              isLight ? 'hover:bg-slate-200 text-slate-500 hover:text-slate-800' : 'hover:bg-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto max-h-[60vh] space-y-5">
          {/* Create New Snapshot Form */}
          <form onSubmit={handleCreate} className={`p-3.5 rounded-xl border space-y-2.5 ${
            isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/70 border-slate-800'
          }`}>
            <span className={`text-xs font-semibold flex items-center gap-1.5 ${isLight ? 'text-slate-800' : 'text-slate-200'}`}>
              <Sparkles className={`w-3.5 h-3.5 ${isLight ? 'text-indigo-600' : 'text-indigo-400'}`} /> Create New Safety Checkpoint
            </span>
            <input
              type="text"
              placeholder="e.g. Before Chapter 3 Page Prune"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={`w-full rounded-lg px-3 py-1.5 text-xs outline-none border focus:border-indigo-500 ${
                isLight ? 'bg-white border-slate-300 text-slate-900 placeholder-slate-400' : 'bg-slate-900 border-slate-700 text-white placeholder-slate-500'
              }`}
            />
            <input
              type="text"
              placeholder="Optional notes (e.g. keeping only CAP theorem)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className={`w-full rounded-lg px-3 py-1.5 text-xs outline-none border focus:border-indigo-500 ${
                isLight ? 'bg-white border-slate-300 text-slate-900 placeholder-slate-400' : 'bg-slate-900 border-slate-700 text-white placeholder-slate-500'
              }`}
            />
            <div className="flex justify-end pt-1">
              <button
                type="submit"
                disabled={!name.trim()}
                className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white text-xs font-medium flex items-center gap-1.5 transition-colors shadow-sm cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" /> Save Checkpoint
              </button>
            </div>
          </form>

          {/* History List */}
          <div className="space-y-2">
            <span className={`text-xs font-semibold block px-1 ${isLight ? 'text-slate-700' : 'text-slate-400'}`}>
              Previous Checkpoints ({snapshots.length})
            </span>

            {snapshots.length === 0 ? (
              <div className="text-center py-6 text-slate-500 text-xs">
                No checkpoints saved yet.
              </div>
            ) : (
              snapshots.map((snap) => (
                <div
                  key={snap.id}
                  className={`p-3 rounded-xl border flex items-center justify-between text-xs transition-colors ${
                    isLight ? 'bg-white border-slate-200 hover:border-slate-300 shadow-2xs' : 'bg-slate-950/40 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="space-y-0.5">
                    <div className={`font-semibold ${isLight ? 'text-slate-900' : 'text-slate-200'}`}>{snap.name}</div>
                    {snap.description && (
                      <div className={`text-[11px] ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>{snap.description}</div>
                    )}
                    <div className={`text-[10px] flex items-center gap-2 pt-1 font-mono ${isLight ? 'text-slate-500' : 'text-slate-500'}`}>
                      <span>{new Date(snap.timestamp).toLocaleString()}</span>
                      <span>•</span>
                      <span>{snap.excludedPages.length} pages pruned</span>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      onRollback(snap.id);
                      onClose();
                    }}
                    className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer border ${
                      isLight
                        ? 'bg-indigo-50 hover:bg-indigo-100 border-indigo-200 text-indigo-700'
                        : 'bg-indigo-600/20 hover:bg-indigo-600/40 border-indigo-500/30 text-indigo-300'
                    }`}
                  >
                    <RotateCcw className="w-3.5 h-3.5" /> Revert
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
