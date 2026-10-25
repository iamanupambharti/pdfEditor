import React, { useState } from 'react';
import type { SettingsState, PaperTone } from '../types/document';
import { 
  Settings, 
  X, 
  Clock, 
  Volume2, 
  Calendar, 
  Layers, 
  Keyboard, 
  Check
} from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: SettingsState;
  onSaveSettings: (newSettings: SettingsState) => void;
  theme?: 'dark' | 'light';
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onSaveSettings,
}) => {
  const [activeTab, setActiveTab] = useState<'general' | 'study' | 'shortcuts'>('general');
  const [formState, setFormState] = useState<SettingsState>({ ...settings });

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveSettings(formState);
    onClose();
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
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-sm text-[#F1EFEA]">FocusDeck Settings</h3>
              <p className="text-xs text-[#A3A09A]">Customize study metrics, timers, and preferences</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#A3A09A] hover:text-[#F1EFEA] hover:bg-white/5 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Selection */}
        <div 
          className="flex border-b px-5 gap-4 text-xs font-medium"
          style={{
            background: '#131315',
            borderColor: 'rgba(255,255,255,.08)'
          }}
        >
          <button
            onClick={() => setActiveTab('general')}
            className={`py-2.5 border-b-2 transition-colors flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'general'
                ? 'border-[#F1EFEA] text-[#F1EFEA] font-semibold'
                : 'border-transparent text-[#A3A09A] hover:text-[#F1EFEA]'
            }`}
          >
            <Layers className="w-3.5 h-3.5" /> General
          </button>
          <button
            onClick={() => setActiveTab('study')}
            className={`py-2.5 border-b-2 transition-colors flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'study'
                ? 'border-[#F1EFEA] text-[#F1EFEA] font-semibold'
                : 'border-transparent text-[#A3A09A] hover:text-[#F1EFEA]'
            }`}
          >
            <Clock className="w-3.5 h-3.5" /> Study & Timer
          </button>
          <button
            onClick={() => setActiveTab('shortcuts')}
            className={`py-2.5 border-b-2 transition-colors flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'shortcuts'
                ? 'border-[#F1EFEA] text-[#F1EFEA] font-semibold'
                : 'border-transparent text-[#A3A09A] hover:text-[#F1EFEA]'
            }`}
          >
            <Keyboard className="w-3.5 h-3.5" /> Shortcuts
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSave} className="p-5 overflow-y-auto max-h-[60vh] space-y-4">
          {/* General Tab */}
          {activeTab === 'general' && (
            <div className="space-y-4 text-xs">
              <div>
                <label className="font-medium block mb-1 text-[#F1EFEA]">
                  Cognitive Study Time Estimate per Pruned Page
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={formState.minutesSavedPerPage}
                    onChange={(e) => setFormState({ ...formState, minutesSavedPerPage: Number(e.target.value) })}
                    className="flex-1 accent-[#DDD8CC] cursor-pointer"
                  />
                  <span className="font-mono font-semibold w-16 text-right text-[#F1EFEA]">
                    {formState.minutesSavedPerPage} mins/p
                  </span>
                </div>
                <p className="text-[11px] mt-1 text-[#A3A09A]">
                  Adjusts how many minutes of study burden you save for each pruned slide or page.
                </p>
              </div>

              <div>
                <label className="font-medium block mb-1 text-[#F1EFEA]">
                  Default Paper Tone Mode
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['dark', 'sepia', 'night'] as PaperTone[]).map((tone) => (
                    <button
                      type="button"
                      key={tone}
                      onClick={() => setFormState({ ...formState, defaultPaperTone: tone })}
                      className={`py-2 px-3 rounded-lg border text-center font-medium capitalize transition-all cursor-pointer ${
                        formState.defaultPaperTone === tone
                          ? 'bg-white/10 border-[#F1EFEA] text-[#F1EFEA]'
                          : 'bg-[#131315] border-white/10 text-[#A3A09A] hover:text-[#F1EFEA]'
                      }`}
                    >
                      {tone}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Study & Timer Tab */}
          {activeTab === 'study' && (
            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block mb-1 text-[#A3A09A]">Study (mins)</label>
                  <input
                    type="number"
                    min="5"
                    max="120"
                    value={formState.pomodoroStudyMinutes}
                    onChange={(e) => setFormState({ ...formState, pomodoroStudyMinutes: Number(e.target.value) })}
                    className="w-full rounded-lg px-2.5 py-1.5 outline-none font-mono border border-white/10 bg-[#131315] text-[#F1EFEA] focus:border-[#DDD8CC]"
                  />
                </div>
                <div>
                  <label className="block mb-1 text-[#A3A09A]">Short Break</label>
                  <input
                    type="number"
                    min="1"
                    max="30"
                    value={formState.pomodoroShortBreakMinutes}
                    onChange={(e) => setFormState({ ...formState, pomodoroShortBreakMinutes: Number(e.target.value) })}
                    className="w-full rounded-lg px-2.5 py-1.5 outline-none font-mono border border-white/10 bg-[#131315] text-[#F1EFEA] focus:border-[#DDD8CC]"
                  />
                </div>
                <div>
                  <label className="block mb-1 text-[#A3A09A]">Long Break</label>
                  <input
                    type="number"
                    min="5"
                    max="60"
                    value={formState.pomodoroLongBreakMinutes}
                    onChange={(e) => setFormState({ ...formState, pomodoroLongBreakMinutes: Number(e.target.value) })}
                    className="w-full rounded-lg px-2.5 py-1.5 outline-none font-mono border border-white/10 bg-[#131315] text-[#F1EFEA] focus:border-[#DDD8CC]"
                  />
                </div>
              </div>

              <div>
                <label className="font-medium block mb-1 flex items-center gap-2 text-[#F1EFEA]">
                  <Volume2 className="w-3.5 h-3.5 text-[#DDD8CC]" /> Acoustic Synthesizer Chime
                </label>
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formState.chimeEnabled}
                      onChange={(e) => setFormState({ ...formState, chimeEnabled: e.target.checked })}
                      className="accent-[#DDD8CC] cursor-pointer"
                    />
                    <span className="text-[#A3A09A]">Play chime on interval end</span>
                  </label>
                </div>
              </div>

              <div className="pt-2 border-t border-white/10">
                <label className="font-medium block mb-1 flex items-center gap-2 text-[#F1EFEA]">
                  <Calendar className="w-3.5 h-3.5 text-amber-400" /> Target Exam Countdown
                </label>
                <input
                  type="date"
                  value={formState.examDate || ''}
                  onChange={(e) => setFormState({ ...formState, examDate: e.target.value || null })}
                  className="w-full rounded-lg px-2.5 py-1.5 outline-none font-mono border border-white/10 bg-[#131315] text-[#F1EFEA] focus:border-[#DDD8CC]"
                />
                <p className="text-[11px] mt-1 text-[#A3A09A]">
                  Displays live days-to-go chip in the cognitive relief banner.
                </p>
              </div>
            </div>
          )}

          {/* Shortcuts Tab */}
          {activeTab === 'shortcuts' && (
            <div className="space-y-2 text-xs">
              {[
                { label: 'Prune / Restore Page', key: 'Delete' },
                { label: 'Freehand Pen Tool', key: 'P' },
                { label: 'Smart Highlighter', key: 'H' },
                { label: 'Sticky Text Note', key: 'T' },
                { label: 'Geometric Shapes', key: 'S' },
                { label: 'Toggle Zen Cram Mode', key: 'Z or F11' },
                { label: 'Command Palette', key: 'Ctrl + K' },
              ].map((s) => (
                <div
                  key={s.label}
                  className="flex items-center justify-between p-2 rounded bg-[#131315] text-[#F1EFEA]"
                >
                  <span>{s.label}</span>
                  <kbd className="font-mono px-1.5 py-0.5 rounded border border-white/10 text-[11px] bg-[#0B0B0D] text-[#A3A09A]">
                    {s.key}
                  </kbd>
                </div>
              ))}
            </div>
          )}

          {/* Footer Save Button */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/10">
            <button
              type="button"
              onClick={onClose}
              className="btn ghost"
              style={{ height: '32px', padding: '0 12px' }}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn primary"
              style={{ height: '32px', padding: '0 16px', gap: '6px' }}
            >
              <Check className="w-3.5 h-3.5" /> Save Preferences
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
