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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 select-none">
      <div className="w-full max-w-lg bg-[#11151F] border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col text-slate-200">
        {/* Header */}
        <div className="px-5 py-4 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-indigo-600/20 text-indigo-400">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-white text-sm">FocusDeck Settings</h3>
              <p className="text-xs text-slate-400">Customize study metrics, timers, and preferences</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="flex border-b border-white/10 px-5 gap-4 text-xs font-medium">
          <button
            onClick={() => setActiveTab('general')}
            className={`py-2.5 border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'general'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5" /> General
          </button>
          <button
            onClick={() => setActiveTab('study')}
            className={`py-2.5 border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'study'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Clock className="w-3.5 h-3.5" /> Study & Timer
          </button>
          <button
            onClick={() => setActiveTab('shortcuts')}
            className={`py-2.5 border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'shortcuts'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
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
                <label className="font-medium text-slate-200 block mb-1">
                  Cognitive Study Time Estimate per Pruned Page
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={formState.minutesSavedPerPage}
                    onChange={(e) => setFormState({ ...formState, minutesSavedPerPage: Number(e.target.value) })}
                    className="flex-1 accent-indigo-500 cursor-pointer"
                  />
                  <span className="font-mono text-indigo-400 font-semibold w-16 text-right">
                    {formState.minutesSavedPerPage} mins/p
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  Adjusts how many minutes of study burden you save for each pruned slide or page.
                </p>
              </div>

              <div>
                <label className="font-medium text-slate-200 block mb-1">
                  Default Paper Tone Mode
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['dark', 'sepia', 'night'] as PaperTone[]).map((tone) => (
                    <button
                      type="button"
                      key={tone}
                      onClick={() => setFormState({ ...formState, defaultPaperTone: tone })}
                      className={`py-2 px-3 rounded-lg border text-center font-medium capitalize transition-all ${
                        formState.defaultPaperTone === tone
                          ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300'
                          : 'bg-[#171C29] border-white/10 text-slate-400 hover:text-white'
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
                  <label className="text-slate-400 block mb-1">Study (mins)</label>
                  <input
                    type="number"
                    min="5"
                    max="120"
                    value={formState.pomodoroStudyMinutes}
                    onChange={(e) => setFormState({ ...formState, pomodoroStudyMinutes: Number(e.target.value) })}
                    className="w-full bg-[#171C29] border border-white/10 rounded-lg px-2.5 py-1.5 text-white outline-none focus:border-indigo-500 font-mono"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Short Break</label>
                  <input
                    type="number"
                    min="1"
                    max="30"
                    value={formState.pomodoroShortBreakMinutes}
                    onChange={(e) => setFormState({ ...formState, pomodoroShortBreakMinutes: Number(e.target.value) })}
                    className="w-full bg-[#171C29] border border-white/10 rounded-lg px-2.5 py-1.5 text-white outline-none focus:border-indigo-500 font-mono"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Long Break</label>
                  <input
                    type="number"
                    min="5"
                    max="60"
                    value={formState.pomodoroLongBreakMinutes}
                    onChange={(e) => setFormState({ ...formState, pomodoroLongBreakMinutes: Number(e.target.value) })}
                    className="w-full bg-[#171C29] border border-white/10 rounded-lg px-2.5 py-1.5 text-white outline-none focus:border-indigo-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="font-medium text-slate-200 block mb-1 flex items-center gap-2">
                  <Volume2 className="w-3.5 h-3.5 text-indigo-400" /> Acoustic Synthesizer Chime
                </label>
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formState.chimeEnabled}
                      onChange={(e) => setFormState({ ...formState, chimeEnabled: e.target.checked })}
                      className="accent-indigo-500"
                    />
                    <span className="text-slate-300">Play chime on interval end</span>
                  </label>
                </div>
              </div>

              <div className="pt-2 border-t border-white/10">
                <label className="font-medium text-slate-200 block mb-1 flex items-center gap-2">
                  <Calendar className="w-3.5 h-3.5 text-amber-400" /> Target Exam Countdown
                </label>
                <input
                  type="date"
                  value={formState.examDate || ''}
                  onChange={(e) => setFormState({ ...formState, examDate: e.target.value || null })}
                  className="w-full bg-[#171C29] border border-white/10 rounded-lg px-2.5 py-1.5 text-white outline-none focus:border-indigo-500 font-mono"
                />
                <p className="text-[11px] text-slate-500 mt-1">
                  Displays live days-to-go chip in the cognitive relief banner.
                </p>
              </div>
            </div>
          )}

          {/* Shortcuts Tab */}
          {activeTab === 'shortcuts' && (
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between p-2 rounded bg-[#171C29] text-slate-300">
                <span>Prune / Restore Page</span>
                <kbd className="font-mono bg-[#0A0D14] px-1.5 py-0.5 rounded border border-white/10 text-slate-400">Delete</kbd>
              </div>
              <div className="flex items-center justify-between p-2 rounded bg-[#171C29] text-slate-300">
                <span>Freehand Pen Tool</span>
                <kbd className="font-mono bg-[#0A0D14] px-1.5 py-0.5 rounded border border-white/10 text-slate-400">P</kbd>
              </div>
              <div className="flex items-center justify-between p-2 rounded bg-[#171C29] text-slate-300">
                <span>Smart Highlighter</span>
                <kbd className="font-mono bg-[#0A0D14] px-1.5 py-0.5 rounded border border-white/10 text-slate-400">H</kbd>
              </div>
              <div className="flex items-center justify-between p-2 rounded bg-[#171C29] text-slate-300">
                <span>Sticky Text Note</span>
                <kbd className="font-mono bg-[#0A0D14] px-1.5 py-0.5 rounded border border-white/10 text-slate-400">T</kbd>
              </div>
              <div className="flex items-center justify-between p-2 rounded bg-[#171C29] text-slate-300">
                <span>Geometric Shapes</span>
                <kbd className="font-mono bg-[#0A0D14] px-1.5 py-0.5 rounded border border-white/10 text-slate-400">S</kbd>
              </div>
              <div className="flex items-center justify-between p-2 rounded bg-[#171C29] text-slate-300">
                <span>Toggle Zen Cram Mode</span>
                <kbd className="font-mono bg-[#0A0D14] px-1.5 py-0.5 rounded border border-white/10 text-slate-400">Z or F11</kbd>
              </div>
              <div className="flex items-center justify-between p-2 rounded bg-[#171C29] text-slate-300">
                <span>Command Palette</span>
                <kbd className="font-mono bg-[#0A0D14] px-1.5 py-0.5 rounded border border-white/10 text-slate-400">Ctrl + K</kbd>
              </div>
            </div>
          )}

          {/* Footer Save Button */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/10">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 rounded-lg text-xs text-slate-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Check className="w-3.5 h-3.5" /> Save Preferences
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
